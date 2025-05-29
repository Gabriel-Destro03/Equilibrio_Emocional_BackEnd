'use strict'

const JornadaRepository = use('App/Repositories/JornadaRepository')
const AvaliacaoEmocionalService = use('App/Services/AvaliacaoEmocionalService')
const N8nClient = use('App/Services/n8n/N8nClient')

class JornadaService {
    constructor() {
        this.repository = new JornadaRepository()
        this.avaliacaoService = new AvaliacaoEmocionalService()
        this.n8nClient = new N8nClient()
    }

    async getAllJornadas() {
        try {
            return await this.repository.getAllJornadas()
        } catch (error) {
            console.error('Erro ao buscar jornadas:', error)
            throw new Error(`Erro ao buscar jornadas: ${error.message}`)
        }
    }

    async getJornadaById(id) {
        if (!id) {
            throw new Error('ID da jornada é obrigatório')
        }

        try {
            const jornada = await this.repository.getJornadaById(id)
            if (!jornada) {
                throw new Error('Jornada não encontrada')
            }
            return jornada
        } catch (error) {
            console.error('Erro ao buscar jornada:', error)
            throw new Error(`Erro ao buscar jornada: ${error.message}`)
        }
    }

    async createJornada(jornadaData) {
        try {
            console.log('Iniciando criação da jornada com dados:', jornadaData)

            // Validação dos dados da jornada
            if (!jornadaData.emocao) {
                throw new Error('Campo emocao é obrigatório')
            }
            if (!jornadaData.uid) {
                throw new Error('Campo uid é obrigatório')
            }

            // Cria a jornada
            const jornada = await this.repository.createJornada(jornadaData)
            console.log('Jornada criada com sucesso:', jornada)

            // Se houver respostas, cria as respostas da jornada
            if (jornadaData.respostas && Array.isArray(jornadaData.respostas) && jornadaData.respostas.length > 0) {
                console.log('Iniciando criação das respostas da jornada:', jornadaData.respostas)

                // Prepara os dados das respostas
                const respostasParaCriar = jornadaData.respostas.map(resposta => {
                    if (!resposta.id_pergunta) {
                        throw new Error(`Resposta inválida: id_pergunta é obrigatório`)
                    }
                    if (!resposta.id_resposta) {
                        throw new Error(`Resposta inválida: id_resposta é obrigatório`)
                    }

                    return {
                        id_jornada: jornada.id,
                        id_perguntas: resposta.id_pergunta,
                        id_resposta: resposta.id_resposta
                    }
                })

                console.log('Dados das respostas preparados:', respostasParaCriar)

                // Cria as respostas
                const respostas = await this.repository.createJornadaRespostas(respostasParaCriar)
                console.log('Respostas criadas com sucesso:', respostas)

                // Adiciona as respostas ao objeto da jornada
                jornada.respostas = respostas
            }

            // Envia para análise de feedback
            try {
                console.log('Enviando para análise de feedback...')
                const analiseFeedback = await this.n8nClient.sendAnaliseFeedback(jornada)
                console.log('Análise de feedback recebida:', analiseFeedback)

                // Salva a avaliação emocional
                if (analiseFeedback.avaliacao_emocional) {
                    console.log('Salvando avaliação emocional...')
                    await this.avaliacaoService.createAvaliacaoEmocional({
                        uid: jornada.uid,
                        ...analiseFeedback.avaliacao_emocional
                    })
                }

                // Salva as atividades emocionais
                if (analiseFeedback.atividades_emocionais && analiseFeedback.atividades_emocionais.length > 0) {
                    console.log('Salvando atividades emocionais...')
                    await this.avaliacaoService.createAtividadesEmocionais(
                        analiseFeedback.atividades_emocionais.map(atividade => ({
                            uid: jornada.uid,
                            ...atividade
                        }))
                    )
                }

                // Adiciona a análise ao objeto da jornada
                jornada.analise_feedback = analiseFeedback
            } catch (analiseError) {
                console.error('Erro ao processar análise de feedback:', analiseError)
                // Não propaga o erro para não impedir a criação da jornada
            }

            return jornada
        } catch (error) {
            console.error('Erro ao criar jornada:', error)
            throw error
        }
    }

    async updateJornada(id, jornadaData) {
        if (!id) {
            throw new Error('ID da jornada é obrigatório')
        }

        const { emocao, reflexao, respostas } = jornadaData

        if (!emocao && !reflexao && !respostas) {
            throw new Error('Pelo menos um campo deve ser fornecido para atualização')
        }

        try {
            const jornada = await this.repository.getJornadaById(id)
            if (!jornada) {
                throw new Error('Jornada não encontrada')
            }

            // Se houver novas respostas, atualiza-as
            if (respostas && Array.isArray(respostas) && respostas.length > 0) {
                const respostasFormatadas = respostas.map(resposta => ({
                    id_jornada: id,
                    id_perguntas: resposta.id_pergunta,
                    id_resposta: resposta.id_resposta
                }))

                await this.repository.createJornadaRespostas(respostasFormatadas)
            }

            // Atualiza os dados básicos da jornada
            return await this.repository.updateJornada(id, {
                emocao,
                reflexao
            })
        } catch (error) {
            console.error('Erro ao atualizar jornada:', error)
            throw new Error(`Erro ao atualizar jornada: ${error.message}`)
        }
    }
}

module.exports = JornadaService 