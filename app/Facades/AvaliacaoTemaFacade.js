'use strict'

const IAvaliacaoTemaService = require('../Interfaces/IAvaliacaoTemaService')
const N8nClient = require('../Services/n8n/N8nClient')

/**
 * Facade para operações complexas relacionadas a Avaliações de Temas
 * Centraliza a lógica de negócio que envolve múltiplos services
 */
class AvaliacaoTemaFacade {
    constructor() {
        this.avaliacaoTemaService = null
        this.n8nClient = new N8nClient()
    }

    /**
     * Inicializa os services necessários
     * @param {IAvaliacaoTemaService} avaliacaoTemaService
     */
    initializeServices(avaliacaoTemaService) {
        this.avaliacaoTemaService = avaliacaoTemaService
    }

    /**
     * Busca avaliações de temas por departamentoId
     * @param {number} departamentoId - ID do departamento
     * @returns {Promise<Array>} Lista de avaliações de temas
     */
    async buscarAvaliacoesTemasPorDepartamento(departamentoId) {
        this._validateServices()

        try {
            return await this.avaliacaoTemaService.getAvaliacoesTemasByDepartamentoId(departamentoId)
        } catch (error) {
            throw new Error(`Erro ao buscar avaliações de temas por departamento: ${error.message}`)
        }
    }

    /**
     * Busca avaliações de temas por departamentoId com filtro de data (mais de 5 dias)
     * Se a atualização via n8n falhar, retorna o último relatório disponível
     * @param {number} departamentoId - ID do departamento
     * @returns {Promise<Object>} Objeto com avaliações e informações sobre a origem dos dados
     */
    async buscarAvaliacoesTemasPorDepartamentoComFiltroData(departamentoId) {
        this._validateServices()

        try {
            const avaliacoes = await this.avaliacaoTemaService.getAvaliacoesTemasByDepartamentoIdWithDateFilter(departamentoId)
            
            // Se encontrou avaliações com mais de 5 dias, tenta atualizar via n8n
            if (avaliacoes.length === 0) {
                const resultadoN8n = await this.n8nClient.atualizarAvaliacoesTemasPorDepartamento(departamentoId, avaliacoes)
                
                // Verifica se a atualização foi bem-sucedida
                const atualizacaoBemSucedida = resultadoN8n && 
                                               resultadoN8n.status !== 'erro' && 
                                               resultadoN8n.n8n_executado !== false
                
                if (!atualizacaoBemSucedida) {
                    console.log('Atualização via n8n falhou, buscando último relatório disponível')
                    
                    // Busca o último relatório disponível (sem filtro de data)
                    const ultimoRelatorio = await this.avaliacaoTemaService.getAvaliacoesTemasByDepartamentoId(departamentoId)
                    return ultimoRelatorio
                }
                return resultadoN8n
            }
            
            // Se não encontrou avaliações com mais de 5 dias, retorna vazio
            return avaliacoes
        } catch (error) {
            console.error('Erro ao buscar avaliações:', error.message)
            
            // Em caso de erro, tenta buscar o último relatório disponível como fallback
            try {
                const ultimoRelatorio = await this.avaliacaoTemaService.getAvaliacoesTemasByDepartamentoId(departamentoId)
                
                return ultimoRelatorio
            } catch (fallbackError) {
                throw new Error(`Erro ao buscar avaliações de temas por departamento com filtro de data: ${error.message}`)
            }
        }
    }

    /**
     * Processo completo de busca de avaliações de temas com validações
     * @param {number} departamentoId - ID do departamento
     * @param {boolean} aplicarFiltroData - Se deve aplicar filtro de data (mais de 5 dias)
     * @returns {Promise<Object>} Resultado da busca com metadados
     */
    async buscarAvaliacoesTemasCompleto(departamentoId, aplicarFiltroData = false) {
        this._validateServices()

        try {
            let avaliacoes
            let resultadoN8n = null
            
            if (aplicarFiltroData) {
                avaliacoes = await this.avaliacaoTemaService.getAvaliacoesTemasByDepartamentoIdWithDateFilter(departamentoId)
                
                // Se encontrou avaliações com mais de 5 dias, tenta atualizar via n8n
                if (avaliacoes && avaliacoes.length > 0) {
                    resultadoN8n = await this.n8nClient.atualizarAvaliacoesTemasPorDepartamento(departamentoId, avaliacoes)
                    
                    // Verifica se a atualização foi bem-sucedida
                    const atualizacaoBemSucedida = resultadoN8n && 
                                                   resultadoN8n.status !== 'erro' && 
                                                   resultadoN8n.n8n_executado !== false
                    
                    if (!atualizacaoBemSucedida) {
                        console.log('Atualização via n8n falhou, buscando último relatório disponível')
                        
                        // Busca o último relatório disponível (sem filtro de data)
                        const ultimoRelatorio = await this.avaliacaoTemaService.getAvaliacoesTemasByDepartamentoId(departamentoId)
                        
                        if (ultimoRelatorio && ultimoRelatorio.length > 0) {
                            console.log(`Retornando último relatório disponível com ${ultimoRelatorio.length} avaliações`)
                            avaliacoes = ultimoRelatorio
                        }
                    }
                }
            } else {
                avaliacoes = await this.avaliacaoTemaService.getAvaliacoesTemasByDepartamentoId(departamentoId)
            }

            // Adiciona informações adicionais
            const resultado = {
                departamento_id: departamentoId,
                total_avaliacoes: avaliacoes.length,
                filtro_aplicado: aplicarFiltroData,
                avaliacoes: avaliacoes,
                data_busca: new Date().toISOString(),
                n8n_atualizado: resultadoN8n ? resultadoN8n.n8n_executado : false,
                resultado_n8n: resultadoN8n
            }

            // Se aplicou filtro de data, adiciona informações sobre o filtro
            if (aplicarFiltroData) {
                const cincoDiasAtras = new Date()
                cincoDiasAtras.setDate(cincoDiasAtras.getDate() - 5)
                
                resultado.filtro_data = {
                    descricao: 'Avaliações com mais de 5 dias',
                    data_limite: cincoDiasAtras.toISOString(),
                    avaliacoes_filtradas: avaliacoes.length,
                    integracao_n8n_executada: resultadoN8n ? resultadoN8n.n8n_executado : false
                }
            }

            return resultado
        } catch (error) {
            throw new Error(`Erro ao buscar avaliações de temas completo: ${error.message}`)
        }
    }

    /**
     * Cria avaliação de tema com validações completas
     * @param {Object} avaliacaoData - Dados da avaliação
     * @returns {Promise<Object>} Avaliação criada
     */
    async criarAvaliacaoTemaCompleto(avaliacaoData) {
        this._validateServices()

        try {
            // Valida dados da avaliação
            await this.avaliacaoTemaService.validateAvaliacaoTemaData(avaliacaoData, false)

            // Cria avaliação usando o service
            const avaliacao = await this.avaliacaoTemaService.createAvaliacaoTema(avaliacaoData)

            return {
                ...avaliacao,
                status: 'criada',
                data_criacao: new Date().toISOString()
            }
        } catch (error) {
            throw new Error(`Erro ao criar avaliação de tema completo: ${error.message}`)
        }
    }

    /**
     * Atualiza avaliação de tema com validações completas
     * @param {number} id - ID da avaliação
     * @param {Object} avaliacaoData - Dados para atualização
     * @returns {Promise<Object>} Avaliação atualizada
     */
    async atualizarAvaliacaoTemaCompleto(id, avaliacaoData) {
        this._validateServices()

        try {
            // Valida dados da avaliação
            await this.avaliacaoTemaService.validateAvaliacaoTemaData(avaliacaoData, true)

            // Atualiza avaliação usando o service
            const avaliacao = await this.avaliacaoTemaService.updateAvaliacaoTema(id, avaliacaoData)

            return {
                ...avaliacao,
                status: 'atualizada',
                data_atualizacao: new Date().toISOString()
            }
        } catch (error) {
            throw new Error(`Erro ao atualizar avaliação de tema completo: ${error.message}`)
        }
    }

    /**
     * Remove avaliação de tema com validações completas
     * @param {number} id - ID da avaliação
     * @returns {Promise<Object>} Resultado da remoção
     */
    async removerAvaliacaoTemaCompleto(id) {
        this._validateServices()

        try {
            // Verifica se a avaliação existe antes de remover
            const avaliacao = await this.avaliacaoTemaService.getAvaliacaoTemaById(id)
            
            // Remove avaliação usando o service
            await this.avaliacaoTemaService.deleteAvaliacaoTema(id)

            return {
                id: id,
                status: 'removida',
                data_remocao: new Date().toISOString(),
                avaliacao_removida: {
                    tema: avaliacao.tema,
                    departamento_id: avaliacao.departamento_id
                }
            }
        } catch (error) {
            throw new Error(`Erro ao remover avaliação de tema completo: ${error.message}`)
        }
    }

    /**
     * Força atualização de avaliações via n8n para um departamento específico
     * @param {number} departamentoId - ID do departamento
     * @returns {Promise<Object>} Resultado da atualização
     */
    async forcarAtualizacaoN8n(departamentoId) {
        this._validateServices()

        try {
            console.log(`Forçando atualização via n8n para departamento ${departamentoId}`)
            
            const resultado = await this.n8nClient.forcarAtualizacaoAvaliacoesTemas(departamentoId)
            
            return {
                departamento_id: departamentoId,
                status: 'atualizado',
                data_atualizacao: new Date().toISOString(),
                resultado_n8n: resultado,
                tipo_operacao: 'forcada'
            }
        } catch (error) {
            throw new Error(`Erro ao forçar atualização via n8n: ${error.message}`)
        }
    }

    /**
     * Valida se os services foram inicializados
     * @private
     */
    _validateServices() {
        if (!this.avaliacaoTemaService) {
            throw new Error('Services não foram inicializados. Chame initializeServices() primeiro.')
        }
    }
}

module.exports = AvaliacaoTemaFacade
