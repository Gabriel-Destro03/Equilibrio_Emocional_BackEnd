'use strict'

const Config = use('Config')

class JornadaRepository {
    constructor() {
        this.supabase = Config.get('supabase').client
        if (!this.supabase) {
            throw new Error('Cliente Supabase não está configurado corretamente')
        }
    }

    async getAllJornada() {
        const { data, error } = await this.supabase
            .from('jornada')
            .select(`
                *,
                jornada_respostas (
                    id,
                    id_perguntas,
                    id_resposta
                )
            `)

        if (error) throw new Error(error.message)
        return data
    }

    async getJornadaById(id) {
        const { data, error } = await this.supabase
            .from('jornada')
            .select(`
                *,
                jornada_respostas (
                    id,
                    id_perguntas,
                    id_resposta
                )
            `)
            .eq('id', id)
            .single()

        if (error) throw new Error(error.message)
        return data
    }

    async createJornada(jornadaData) {
        try {
            console.log('Dados recebidos para criação da jornada:', JSON.stringify(jornadaData, null, 2))

            // Validação dos dados antes de inserir
            if (!jornadaData.emocao) {
                throw new Error('Campo emocao é obrigatório')
            }
            if (!jornadaData.uid) {
                throw new Error('Campo uid é obrigatório')
            }

            // Verifica se o cliente Supabase está configurado corretamente
            if (!this.supabase) {
                throw new Error('Cliente Supabase não está configurado')
            }

            // Verifica a conexão com o Supabase
            try {
                const { data: testData, error: testError } = await this.supabase
                    .from('jornada')
                    .select('count')
                    .limit(1)

                if (testError) {
                    console.error('Erro ao testar conexão com Supabase:', testError)
                    throw new Error(`Erro de conexão com Supabase: ${testError.message}`)
                }
            } catch (connectionError) {
                console.error('Erro ao verificar conexão com Supabase:', connectionError)
                throw new Error(`Erro de conexão com Supabase: ${connectionError.message}`)
            }

            // Prepara os dados para inserção
            const dadosParaInserir = {
                emocao: jornadaData.emocao,
                reflexao: jornadaData.reflexao || null,
                uid: jornadaData.uid
            }

            console.log('Dados preparados para inserção:', JSON.stringify(dadosParaInserir, null, 2))

            // Tenta criar a jornada
            const { data: jornada, error: jornadaError } = await this.supabase
                .from('jornada')
                .insert([dadosParaInserir])
                .select()
                .single()

            // Log detalhado do resultado
            console.log('Resposta do Supabase:', {
                data: jornada,
                error: jornadaError,
                status: jornadaError ? 'erro' : 'sucesso'
            })

            if (jornadaError) {
                console.error('Erro detalhado do Supabase:', {
                    message: jornadaError.message,
                    details: jornadaError.details,
                    hint: jornadaError.hint,
                    code: jornadaError.code,
                    error: jornadaError
                })
                throw new Error(`Erro ao criar jornada: ${jornadaError.message || 'Erro desconhecido'}`)
            }

            if (!jornada) {
                throw new Error('Jornada não foi criada corretamente - nenhum dado retornado')
            }

            console.log('Jornada criada com sucesso:', JSON.stringify(jornada, null, 2))
            return jornada
        } catch (error) {
            console.error('Erro detalhado ao criar jornada:', {
                message: error.message,
                stack: error.stack,
                name: error.name,
                error: error
            })
            throw error
        }
    }

    async createJornadaRespostas(respostas) {
        try {
            console.log('Dados recebidos para criação das respostas:', JSON.stringify(respostas, null, 2))

            if (!Array.isArray(respostas) || respostas.length === 0) {
                throw new Error('Respostas deve ser um array não vazio')
            }

            // Validação dos dados de cada resposta
            respostas.forEach((resposta, index) => {
                if (!resposta.id_jornada) {
                    throw new Error(`Resposta ${index}: id_jornada é obrigatório`)
                }
                if (!resposta.id_perguntas) {
                    throw new Error(`Resposta ${index}: id_pergunta é obrigatório`)
                }
                if (!resposta.id_resposta) {
                    throw new Error(`Resposta ${index}: id_resposta é obrigatório`)
                }
            })

            // Ajusta o nome da coluna para o banco
            const respostasParaInserir = respostas.map(r => ({
                id_jornada: r.id_jornada,
                id_pergunta: r.id_perguntas,
                id_resposta: r.id_resposta
            }))

            const { data, error } = await this.supabase
                .from('jornada_respostas')
                .insert(respostasParaInserir)
                .select()

            if (error) {
                console.error('Erro detalhado do Supabase ao criar respostas:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code,
                    error: error
                })
                throw new Error(`Erro ao criar respostas: ${error.message || 'Erro desconhecido'}`)
            }

            console.log('Respostas criadas com sucesso:', JSON.stringify(data, null, 2))
            return data
        } catch (error) {
            console.error('Erro detalhado ao criar respostas:', {
                message: error.message,
                stack: error.stack,
                name: error.name,
                error: error
            })
            throw error
        }
    }

    async updateJornada(id, jornadaData) {
        const { data, error } = await this.supabase
            .from('jornada')
            .update(jornadaData)
            .eq('id', id)
            .select(`
                *,
                jornada_respostas (
                    id,
                    id_perguntas,
                    id_resposta
                )
            `)
            .single()

        if (error) throw new Error(error.message)
        return data
    }
}

module.exports = JornadaRepository 