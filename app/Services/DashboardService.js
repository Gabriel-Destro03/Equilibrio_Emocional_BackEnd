'use strict';

const DashboardRepository = require('../Repositories/DashboardRepository');
const UsuarioRepository = require('../Repositories/UsuarioRepository');

class DashboardService {
  constructor() {
    this.repository = new DashboardRepository();
    this.usuarioRepository = new UsuarioRepository();
  }

  async getDashboardData(uid, type) {
    //return this.getEngajamento(uid)
    //return this.getTendencias(uid, 'geral')
    try {
      let usuarioFiltro = await this.usuarioRepository.getUsuariosFiliaisDepartamento(uid);

      let data = await this.repository.getDashboardData();
      if(usuarioFiltro.id_filial){
        data = data.filter(d => usuarioFiltro.id_filial?.includes(d.filial_id));
      }
      if(usuarioFiltro.id_departamento){
        data = data.filter(d => usuarioFiltro.id_departamento?.includes(d.departamento_id));
      }

      const [mediaAtual, mediaMesAnterior, mediaDepartamento] = await Promise.all([
        this.calcularMedia(data, 0),
        this.calcularMedia(data, -1),
        this.mediaDepartamentos(data, type)
      ]);

      const mediaGeral = {
        media_geral: mediaAtual.mediaNota,
        media_anterior: mediaMesAnterior.mediaNota,
        variacao: (mediaAtual.mediaNota - mediaMesAnterior.mediaNota).toFixed(2),
        percentual_resposta_atual: mediaAtual.engajamento,
        percentual_resposta_anterior: mediaMesAnterior.engajamento,
        variacao_percentual_resposta: (mediaAtual.engajamento - mediaMesAnterior.engajamento).toFixed(2),
      };

      return {
        mediaGeral,
        mediaDepartamento
      };
    } catch (error) {
      throw new Error(error.message || 'Erro ao buscar dados do dashboard');
    }
  }

  formatarMesAno(date) {
    return `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  }

  calcularDados(data) {
    const respondentes = data.filter(d => d.respondeu_na_semana === "sim");
    const total = data.length;
    const totalRespondentes = respondentes.length;
    const somaAvaliar = respondentes.reduce((acc, item) => acc + Number(item.avaliar), 0);

    const mediaNota = (totalRespondentes > 0 ? somaAvaliar / totalRespondentes : 0).toFixed(2);
    const engajamento = (total > 0 ? (totalRespondentes / total) * 100 : 0).toFixed(2);

    return { mediaNota, engajamento };
  }

  formatarDiaMes(date) {
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    return `${dia}/${mes}`;
  }

  async calcularMedia(data, offsetMes) {
    const agora = new Date();
    const dataBase = new Date(agora.getFullYear(), agora.getMonth() + offsetMes, 1);
    const mesFormatado = this.formatarMesAno(dataBase);

    let filtrado = data
      .filter(d => d.mes_ano_analise === mesFormatado)

    if(offsetMes === 0) {
      const primeiroDiaSemana = new Date(agora);
      primeiroDiaSemana.setDate(agora.getDate() - agora.getDay()); // domingo da semana atual

      const ultimoDiaSemana = new Date(primeiroDiaSemana);
      ultimoDiaSemana.setDate(primeiroDiaSemana.getDate() + 6); // sábado da semana atual
      
      var semana_texto = `${this.formatarDiaMes(primeiroDiaSemana)} a ${this.formatarDiaMes(ultimoDiaSemana)}`
      filtrado = filtrado.filter(d => d.semana_texto == semana_texto);
    }
    return this.calcularDados(filtrado);
  }

  async mediaDepartamentos(data, type = 'Mensal') {
    const agora = new Date();
    
    const mesAtualFormatado = this.formatarMesAno(agora);
    const mesAnteriorDate = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);
    const mesAnteriorFormatado = this.formatarMesAno(mesAnteriorDate);
  
    // Obter departamentos únicos com nome + id
    const departamentosUnicos = [
      ...new Map(
        data.map(d => [d.departamento_id, {
          id: d.departamento_id,
          nome: d.nome_departamento || 'Indefinido'
        }])
      ).values()
    ];
  
    const filtrarDados = (dados, filtroMeses, semanas = null) => {
      return dados.filter(d =>
        filtroMeses.includes(d.mes_ano_analise) &&
        (semanas ? d => d.semana_texto == semana_texto : true)
      );
    };
  
    const trimestres = [
      ['01', '02', '03'],
      ['04', '05', '06'],
      ['07', '08', '09'],
      ['10', '11', '12']
    ];
    const mesAtual = agora.getMonth();
    const anoAtual = agora.getFullYear();
    const indiceTrimestreAtual = Math.floor(mesAtual / 3);
    const mesesTrimestreAtual = trimestres[indiceTrimestreAtual].map(m => `${m}/${anoAtual}`);
    const indiceTrimestreAnterior = (indiceTrimestreAtual - 1 + 4) % 4;
    const anoAnterior = indiceTrimestreAtual === 0 ? anoAtual - 1 : anoAtual;
    const mesesTrimestreAnterior = trimestres[indiceTrimestreAnterior].map(m => `${m}/${anoAnterior}`);
  
    const resultado = [];
  
    for (const departamento of departamentosUnicos) {
      const dadosDepto = data.filter(d => d.departamento_id === departamento.id);
      let dadosAtuais = [];
      let dadosAnteriores = [];
  
      switch (type.toLocaleLowerCase()) {
        case 'semanal':
          const primeiroDiaSemanaAtual = new Date(agora);
          primeiroDiaSemanaAtual.setDate(agora.getDate() - agora.getDay()); // domingo da semana atual
  
          const ultimoDiaSemanaAtual = new Date(primeiroDiaSemanaAtual);
            ultimoDiaSemanaAtual.setDate(primeiroDiaSemanaAtual.getDate() + 6); // sábado da semana atual
          
          var semana_atual = `${this.formatarDiaMes(primeiroDiaSemanaAtual)} a ${this.formatarDiaMes(ultimoDiaSemanaAtual)}`
          
          const primeiroDiaSemanaPassada = new Date(primeiroDiaSemanaAtual);
            primeiroDiaSemanaPassada.setDate(primeiroDiaSemanaAtual.getDate() - 7); // domingo da semana passada

          const ultimoDiaSemanaPassada = new Date(primeiroDiaSemanaPassada);
            ultimoDiaSemanaPassada.setDate(primeiroDiaSemanaPassada.getDate() + 6); // sábado da semana passada

          var semana_passada = `${this.formatarDiaMes(primeiroDiaSemanaPassada)} a ${this.formatarDiaMes(ultimoDiaSemanaPassada)}`

          dadosAtuais = filtrarDados(dadosDepto, [mesAtualFormatado], semana_atual);
          dadosAnteriores = filtrarDados(dadosDepto, [mesAnteriorFormatado], semana_passada);
          break;
        case 'mensal':
          dadosAtuais = filtrarDados(dadosDepto, [mesAtualFormatado]);
          dadosAnteriores = filtrarDados(dadosDepto, [mesAnteriorFormatado]);
          break;
        case 'trimestral':
          dadosAtuais = filtrarDados(dadosDepto, mesesTrimestreAtual);
          dadosAnteriores = filtrarDados(dadosDepto, mesesTrimestreAnterior);
          break;
      }
  
      const fatores = [...new Set(
        dadosAtuais.map(d => (d.fator || '').trim()).filter(f => f.length > 0)
      )].join(', ');
  
      const atual = this.calcularDados(dadosAtuais);
      const anterior = this.calcularDados(dadosAnteriores);
  
      resultado.push({
        id_departamento: departamento.id,
        nome_departamento: departamento.nome,
        media_atual: Number(atual.mediaNota),
        media_anterior: Number(anterior.mediaNota),
        variacao: Number((atual.mediaNota - anterior.mediaNota).toFixed(2)),
        percentual_resposta: Number(atual.engajamento),
        fatores_resposta: fatores
      });
    }
  
    return resultado;
  }

  async getEngajamento(uid){
    try {
      let usuarioFiltro = await this.usuarioRepository.getUsuariosFiliaisDepartamento(uid);

      let data = await this.repository.getDashboardData();
      if(usuarioFiltro.id_filial){
        data = data.filter(d => usuarioFiltro.id_filial?.includes(d.filial_id));
      }
      if(usuarioFiltro.id_departamento){
        data = data.filter(d => usuarioFiltro.id_departamento?.includes(d.departamento_id));
      }

      data = data.filter(d => d.respondeu_na_semana == "sim")
      let grupos = await this.agruparPorSemana(data);
      return grupos;
    } catch (error) {
      throw new Error(error.message || 'Erro ao buscar dados do engajamento');
    }

  }

  async agruparPorSemana(dados) {
    const resultado = {};
  
    dados.forEach((item) => {
      if (item.respondeu_na_semana !== 'sim') return;
  
      const [inicioSemana] = item.semana_texto.split(' a ');
      const semanaChave = `Semana ${inicioSemana}`;
      const departamento = item.nome_departamento;
  
      if (!resultado[semanaChave]) {
        resultado[semanaChave] = {};
      }
  
      if (!resultado[semanaChave][departamento]) {
        resultado[semanaChave][departamento] = 0;
      }
  
      resultado[semanaChave][departamento]++;
    });
  
    // Transformar objetos de contagem em array de objetos { Departamento: total }
    const resultadoFinal = {};
  
    for (const semana in resultado) {
      resultadoFinal[semana] = Object.entries(resultado[semana]).map(
        ([departamento, total]) => ({ [departamento]: total })
      );
    }
  
    return resultadoFinal;
  }
  
  async getTendencias(uid, type){
    try {
      let usuarioFiltro = await this.usuarioRepository.getUsuariosFiliaisDepartamento(uid);

      let data = await this.repository.getDashboardData();
      if(usuarioFiltro.id_filial){
        data = data.filter(d => usuarioFiltro.id_filial?.includes(d.filial_id));
      }
      if(usuarioFiltro.id_departamento){
        data = data.filter(d => usuarioFiltro.id_departamento?.includes(d.departamento_id));
      }

      let tedencias = []
      switch (type) {
        case 'geral':
          tedencias = await this.agruparPorMesEAgrupamento(data)
          break;
        case 'departamento':
          tedencias = await this.agruparPorMesEAgrupamento(data, true)
          break;
        default:
          break;
      }

      return tedencias;
    } catch (error) {
      throw new Error(error.message || 'Erro ao buscar dados das tendências');
    }
  }

  async agruparPorMesEAgrupamento(dados, agruparPorDepartamento = false, calcularMedia = true) {
    const resultado = {};
  
    dados.forEach(item => {
      if (item.respondeu_na_semana !== 'sim') return;
  
      const chaveMes = item.mes_ano_analise;
      const chaveDepartamento = agruparPorDepartamento ? item.nome_departamento : null;
  
      if (!resultado[chaveMes]) {
        resultado[chaveMes] = agruparPorDepartamento ? {} : [];
      }
  
      const nota = parseFloat(item.avaliar);
      if (isNaN(nota)) return;
  
      if (agruparPorDepartamento) {
        if (!resultado[chaveMes][chaveDepartamento]) {
          resultado[chaveMes][chaveDepartamento] = [];
        }
  
        resultado[chaveMes][chaveDepartamento].push(nota);
      } else {
        resultado[chaveMes].push(nota);
      }
    });
  
    // Calcular médias se necessário
    if (calcularMedia) {
      const medias = {};
  
      Object.entries(resultado).forEach(([mes, dadosMes]) => {
        if (agruparPorDepartamento) {
          medias[mes] = {};
          Object.entries(dadosMes).forEach(([departamento, notas]) => {
            const soma = notas.reduce((acc, val) => acc + val, 0);
            const media = soma / notas.length;
            medias[mes][departamento] = parseFloat(media.toFixed(2));
          });
        } else {
          const soma = dadosMes.reduce((acc, val) => acc + val, 0);
          const media = soma / dadosMes.length;
          medias[mes] = parseFloat(media.toFixed(2));
        }
      });
  
      return medias;
    }
  
    return resultado;
  }
  

  
}

module.exports = DashboardService;
