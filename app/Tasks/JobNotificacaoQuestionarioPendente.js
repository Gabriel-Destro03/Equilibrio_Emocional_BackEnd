'use strict'

const Task = use('Task')
const Config = use('Config')
const SendEmail = use('App/Services/Emails/SendEmail')

class JobNotificacaoQuestionarioPendente extends Task {
    static get schedule() {
        //return '0 10 * * 1' // Segunda-feira às 10:00
        //return '0 10 * * 2' // Terça-feira às 10:00
        return '0 10 * * 3' // Quarta-feira às 10:00
        // return '0 10 * * 4' // Quinta-feira às 10:00
        // return '0 10 * * 5' // Sexta-feira às 10:00
    }

    async handle() {
        const supabase = Config.get('supabase').client
        const { data, error } = await supabase
        .from('usuarios_com_status_resposta')
        .select('*')
        .eq('respondeu_na_semana', 'não')
        .order('id', { ascending: true })

        if (error) {
            console.error('Erro:', error)
            return
        }
    
		for (const user of data) {
			await SendEmail.sendEmail({
				to: user.email,
				subject: 'Notificação de Questionário Pendente',
				html: `
					<p>Olá <strong>${user.nome_completo}</strong>,</p>
					<p>Notamos que você ainda não respondeu ao seu questionário semanal.</p>
					<p>A semana já está quase terminando e sua participação é muito importante para acompanharmos seu progresso e bem-estar.</p>
					<p>Reserve alguns minutinhos e complete o questionário antes do fim da semana.</p>
					<a href="https://app.claraconecta.com.br" class="button">Responder agora</a>
					<p>
						Se você já respondeu e este e-mail foi enviado por engano, pode ignorá-lo.
					</p>
				`,
				title: 'Notificação de Questionário Pendente'
			});
			await new Promise(resolve => setTimeout(resolve, 1000));
		}
    }
}

module.exports = JobNotificacaoQuestionarioPendente