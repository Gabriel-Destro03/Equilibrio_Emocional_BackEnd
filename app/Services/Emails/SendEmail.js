class SendEmail {
  constructor() {
    this.resend = null
    this.initializeResend()
  }

  async initializeResend() {
    try {
      const { Resend } = await import('resend')
      this.resend = new Resend(process.env.VITE_SMTP_PASS)
    } catch (error) {
      console.error('Error initializing Resend:', error)
    }
  }

  /**
   * Send an email using Resend
   * @param {Object} options Email options
   * @param {string} options.to Recipient email address
   * @param {string} options.subject Email subject
   * @param {string} options.html Email content in HTML format
   * @returns {Promise} Resend API response
   */
  async sendEmail({ to, subject, html }) {
    try {
      if (!this.resend) {
        await this.initializeResend()
      }

      const data = await this.resend.emails.send({
        from: 'Equilibrio Emocional <noreply@claraconecta.com.br>',
        to,
        subject,
        html,
      })

      return { success: true, data }
    } catch (error) {
      console.error('Error sending email:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Send a welcome email to a new user
   * @param {string} email User's email address
   * @param {string} name User's name
   * @param {string} password User's password
   * @returns {Promise} Resend API response
   */
  async sendWelcomeEmail(email, name, password) {
    const html = `
      <h1>Bem-vindo(a) ao Equilibrio Emocional!</h1>
      <p>Olá ${name},</p>
      <p>Estamos muito felizes em ter você conosco. Aqui você encontrará ferramentas e recursos para ajudar no seu equilíbrio emocional.</p>
      <p>Suas credenciais de acesso são:</p>
      <p>Email: ${email}</p>
      <p>Senha: ${password}</p>
      <p>Por favor, guarde estas informações em um local seguro.</p>
      <p>Se precisar de ajuda, não hesite em nos contatar.</p>
      <p>Atenciosamente,<br>Equipe Equilibrio Emocional</p>
    `

    return this.sendEmail({
      to: email,
      subject: 'Bem-vindo ao Equilibrio Emocional',
      html,
    })
  }
}

module.exports = new SendEmail() 