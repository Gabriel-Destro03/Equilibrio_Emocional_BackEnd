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
                jornada_respostas_duplicate (
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
                jornada_respostas_duplicate (
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

    async verificarJornadaSemana(uid) {
        try {
            // Calcula a data de início da semana (segunda-feira)
            const hoje = new Date()
            const diaSemana = hoje.getDay() // 0 = domingo, 1 = segunda, etc.
            const diffDias = diaSemana === 0 ? 6 : diaSemana - 1 // Ajusta para segunda-feira
            const inicioSemana = new Date(hoje)
            inicioSemana.setDate(hoje.getDate() - diffDias)
            inicioSemana.setHours(0, 0, 0, 0)
            
            // Formata para ISO
            const inicioSemanaISO = inicioSemana.toISOString()
            
            console.log('=== DEBUG: Verificando jornada da semana ===')
            console.log('UID:', uid)
            console.log('Início da semana:', inicioSemanaISO)
            
            const { data, error } = await this.supabase
                .from('jornada')
                .select('id, created_at, emocao, reflexao')
                .eq('uid', uid)
                .gte('created_at', inicioSemanaISO)
                .order('created_at', { ascending: false })
            
            if (error) {
                console.error('Erro ao verificar jornada da semana:', error)
                throw new Error(error.message)
            }
            
            console.log('Jornadas encontradas nesta semana:', data?.length || 0)
            
            return {
                jaRespondeu: data && data.length > 0,
                totalBuscado: data?.length || 0,
                ultimaJornada: data && data.length > 0 ? data[0] : null
            }
        } catch (error) {
            console.error('Erro ao verificar jornada da semana:', error)
            throw error
        }
    }

    async createJornada(jornadaData) {
        try {
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

            // Tenta criar a jornada
            const { data: jornada, error: jornadaError } = await this.supabase
                .from('jornada')
                .insert([dadosParaInserir])
                .select()
                .single()


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
            if (!Array.isArray(respostas) || respostas.length === 0) {
                throw new Error('Respostas deve ser um array não vazio')
            }

            // Validação dos dados de cada resposta
            respostas.forEach((resposta, index) => {
                if (!resposta.id_jornada) {
                    throw new Error(`Resposta ${index}: id_jornada é obrigatório`)
                }
                if (!resposta.id_pergunta) {
                    throw new Error(`Resposta ${index}: id_pergunta é obrigatório`)
                }
                if (!resposta.id_resposta) {
                    throw new Error(`Resposta ${index}: id_resposta é obrigatório`)
                }
            })

            // Debug: Log dos dados antes de inserir
            console.log('=== DEBUG: Dados para inserir em jornada_respostas_duplicate ===')
            console.log('Respostas recebidas:', JSON.stringify(respostas, null, 2))
            
            // Ajusta o nome da coluna para o banco (mantém id_perguntas plural)
            const respostasParaInserir = respostas.map(r => ({
                id_jornada: r.id_jornada,
                id_pergunta: r.id_pergunta,  // Mantém plural conforme esperado
                id_resposta: r.id_resposta
            }))
            
            console.log('Respostas formatadas para inserir:', JSON.stringify(respostasParaInserir, null, 2))

            const { data, error } = await this.supabase
                .from('jornada_respostas_duplicate')
                .insert(respostasParaInserir)
                .select()
                
            console.log('=== DEBUG: Resultado da inserção ===')
            console.log('Data retornada:', JSON.stringify(data, null, 2))
            console.log('Erro:', error)

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
                jornada_respostas_duplicate (
                    id,
                    id_perguntas,
                    id_resposta
                )
            `)
            .single()

        if (error) throw new Error(error.message)
        return data
    }

    /**
     * Busca comentários de jornadas por departamento
     * Retorna emoção e reflexão dos questionários através da relação com avaliacoes_emocionais
     * @param {number} departamentoId - ID do departamento
     * @returns {Promise<Array>} Lista de comentários das jornadas
     */
    async getComentariosByDepartamentoId(departamentoId) {
        const { data, error } = await this.supabase
            .from('jornada')
            .select(`
                reflexaoGeneratedIA,
                avaliacoes_emocionais!inner(
                    id,
                    departamento_id
                )
            `)
            .eq('avaliacoes_emocionais.departamento_id', departamentoId)
            .neq('reflexaoGeneratedIA', "")
            .order('created_at', { ascending: false })

        if (error) throw new Error(error.message)
        return data
    }

    /**
     * Busca comentários de jornadas por departamento com filtros adicionais
     * @param {number} departamentoId - ID do departamento
     * @param {Object} filtros - Filtros opcionais (data_inicio, data_fim, limit, offset)
     * @returns {Promise<Array>} Lista de comentários filtrados
     */
    async getComentariosByDepartamentoIdComFiltros(departamentoId, filtros = {}) {
        // Monta a query base
        let query = this.supabase
            .from('jornada')
            .select(`
                id,
                emocao,
                reflexao,
                uid,
                created_at,
                avaliacoes_emocionais!inner(
                    id,
                    departamento_id
                ),
                usuario:usuarios(
                    id,
                    nome_completo,
                    email,
                    cargo
                )
            `)
            .eq('avaliacoes_emocionais.departamento_id', departamentoId)

        // Aplica filtro de data de início se fornecido
        if (filtros.data_inicio) {
            query = query.gte('created_at', filtros.data_inicio)
        }

        // Aplica filtro de data de fim se fornecido
        if (filtros.data_fim) {
            query = query.lte('created_at', filtros.data_fim)
        }

        // Ordena por data de criação (mais recente primeiro)
        query = query.order('created_at', { ascending: false })

        // Aplica limite se fornecido
        if (filtros.limit) {
            query = query.limit(filtros.limit)
        }

        // Aplica offset se fornecido
        if (filtros.offset) {
            query = query.range(filtros.offset, filtros.offset + (filtros.limit || 10) - 1)
        }

        const { data, error } = await query

        if (error) throw new Error(error.message)
        return data
    }
}

module.exports = JornadaRepository 