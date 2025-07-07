'use strict';

const DashboardRepository = require('../Repositories/DashboardRepository');
const UsuarioRepository = require('../Repositories/UsuarioRepository');

class DashboardService {
  constructor() {
    this.repository = new DashboardRepository();
    this.usuarioRepository = new UsuarioRepository();
  }

  async getDashboardData(uid, type) {
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

  getSemanaInfo(dia) {
    const qtnSemanaMes = ["primeira", "segunda", "terceira", "quarta", "quinta"];
    const index = Math.ceil(dia / 7) - 1;
    return {
      index,
      nome: qtnSemanaMes[index],
      semanasAteAgora: qtnSemanaMes.slice(0, index + 1)
    };
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

  async calcularMedia(data, offsetMes) {
    const agora = new Date();
    const dataBase = new Date(agora.getFullYear(), agora.getMonth() + offsetMes, 1);
    const mesFormatado = this.formatarMesAno(dataBase);

    const { semanasAteAgora } = this.getSemanaInfo(agora.getDate());

    const filtrado = data
      .filter(d => d.mes_ano_analise === mesFormatado)
      .filter(d => semanasAteAgora.includes(d.semana_nome));

    return this.calcularDados(filtrado);
  }

  async mediaDepartamentos(data, type = 'Mensal') {
    const agora = new Date();
    const { index: semanaAtualIndex, semanasAteAgora } = this.getSemanaInfo(agora.getDate());

    const mesAtualFormatado = this.formatarMesAno(agora);
    const mesAnteriorDate = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);
    const mesAnteriorFormatado = this.formatarMesAno(mesAnteriorDate);

    const departamentos = [...new Set(data.map(d => d.nome_departamento || 'Indefinido'))];
    const resultado = {};

    const filtrarDados = (dados, filtroMeses, semanas = null, semanaIndex = null) => {
      return dados.filter(d =>
        filtroMeses.includes(d.mes_ano_analise) &&
        (semanas ? semanas.includes(d.semana_nome) : true) &&
        (semanaIndex !== null ? d.semana_nome == semanaIndex : true)
      );
    };

    // Trimestres fixos
    const trimestres = [
      ['01', '02', '03'],
      ['04', '05', '06'],
      ['07', '08', '09'],
      ['10', '11', '12']
    ];
    const mesAtual = agora.getMonth(); // 0-11
    const anoAtual = agora.getFullYear();
    const indiceTrimestreAtual = Math.floor(mesAtual / 3);
    const mesesTrimestreAtual = trimestres[indiceTrimestreAtual].map(m => `${m}/${anoAtual}`);
    const indiceTrimestreAnterior = (indiceTrimestreAtual - 1 + 4) % 4;
    const anoAnterior = indiceTrimestreAtual === 0 ? anoAtual - 1 : anoAtual;
    const mesesTrimestreAnterior = trimestres[indiceTrimestreAnterior].map(m => `${m}/${anoAnterior}`);

    for (const depto of departamentos) {
      const dadosDepto = data.filter(d => d.nome_departamento === depto);
      let dadosAtuais = [];
      let dadosAnteriores = [];

      switch (type) {
        case 'Semanal':
          dadosAtuais = filtrarDados(dadosDepto, [mesAtualFormatado], null, semanaAtualIndex);
          dadosAnteriores = filtrarDados(dadosDepto, [mesAnteriorFormatado], null, semanaAtualIndex);
          break;
        case 'Mensal':
          dadosAtuais = filtrarDados(dadosDepto, [mesAtualFormatado], semanasAteAgora);
          dadosAnteriores = filtrarDados(dadosDepto, [mesAnteriorFormatado], semanasAteAgora);
          break;
        case 'Trimestral':
          dadosAtuais = filtrarDados(dadosDepto, mesesTrimestreAtual);
          dadosAnteriores = filtrarDados(dadosDepto, mesesTrimestreAnterior);
          break;
      }

      const fatores = [...new Set(
        dadosAtuais.map(d => (d.fator || '').trim()).filter(f => f.length > 0)
      )].join(', ');

      const atual = this.calcularDados(dadosAtuais);
      const anterior = this.calcularDados(dadosAnteriores);

      resultado[depto] = {
        media_geral: atual.mediaNota,
        media_anterior: anterior.mediaNota,
        variacao: (atual.mediaNota - anterior.mediaNota).toFixed(2),
        percentual_resposta_atual: atual.engajamento,
        percentual_resposta_anterior: anterior.engajamento,
        variacao_percentual_resposta: (atual.engajamento - anterior.engajamento).toFixed(2),
        fator: fatores
      };
    }

    return resultado;
  }
}

module.exports = DashboardService;
