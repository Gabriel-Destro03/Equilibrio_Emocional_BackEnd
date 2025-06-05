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
   * * @param {string} options.title title content in title format
   * @returns {Promise} Resend API response
   */
  async sendEmail({ to, subject, html, title }) {
    try {
      if (!this.resend) {
        await this.initializeResend()
      }
      const body = `
        <!DOCTYPE html>
  <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <style>
    body {
      font-family: 'Segoe UI', sans-serif;
      background-color: #f6f4ff;
      padding: 40px;
    }

    .container {
      background: #fff;
      max-width: 600px;
      margin: auto;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      border: 1px solid #e0d9fa;
    }

    .logo {
      text-align: center;
      margin-bottom: 20px;
    }

    .logo img {
      height: 120px;
    }

    h2 {
      color: #9b87f5;
      text-align: center;
    }

    .code {
      font-size: 24px;
      font-weight: bold;
      background: #f6f4ff;
      color: #9b87f5;
      padding: 12px;
      border-radius: 8px;
      text-align: center;
      margin: 20px 0;
      letter-spacing: 3px;
    }

    .button {
      display: block;
      background: #7e69ab;
      color: white;
      text-align: center;
      padding: 12px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: bold;
      margin-top: 20px;
    }

    .footer {
      text-align: center;
      font-size: 12px;
      color: #999;
      margin-top: 30px;
    }
  </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <img src="https://app.claraconecta.com.br/logo.png" alt="Logotipo da Plataforma Clara Conecta" />
        </div>
        <h2>${title}</h2>
        ${html}
        <div class="footer">© ${new Date().getFullYear()} Clara. Todos os direitos reservados.</div>
      </div>
    </body>
  </html>
      `
      const data = await this.resend.emails.send({
        from: 'Clara Equilibrio Emocional <cadastro@claraconecta.com.br>',
        to,
        subject,
        html: body,
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
  async sendWelcomeEmail(email, link, code) {
    const html = `
      <p style="color: #8779c5;">Estamos felizes em ter você com a gente.</p>

      <p style="color: #8779c5;">Use o código abaixo para validar seu acesso:</p>
      <div class="code">${code}</div>

      <p style="text-align: left; color: #8779c5;">
        Para ativar sua conta, defina sua senha clicando no botão abaixo:
      </p>

      <a href="${link}" 
        class="button" 
        style="text-align: center; display: inline-block; text-decoration: none;">
        Definir minha senha
      </a>

      <p style="color: #888; font-size: 12px; margin-top: 20px;">
        Este link expira em 24 horas. Se você não solicitou este acesso, ignore este e-mail.
      </p>

      <p style="margin-top: 30px; color: #8779c5;">Já tem uma conta?</p>
      <a href="https://app.claraconecta.com.br" 
        class="button" 
        style="background: #9b87f5;">
        Acessar a Plataforma Clara
      </a>
    `
    return this.sendEmail({
      to: email,
      subject: 'Bem-vindo ao Clara Equilibrio Emocional',
      html,
      title: "Bem-vindo(a) ao Clara Equilíbrio Emocional!"
    })
  }


  async sendResetPasswordEmail(email, name, codigo, link) {
    const html = `
      <p>Olá <strong>${name}</strong>,</p>
      <p>Recebemos uma solicitação para redefinir sua senha. Por segurança, geramos um código exclusivo que confirma que você é o titular da conta.</p>
      <p>Use o código abaixo para concluir o processo de redefinição:</p>
      <div class="code">${codigo}</div>
      <p>Se preferir, você também pode redefinir diretamente clicando no botão abaixo:</p>
      <a href="${link}" class="button">Redefinir Senha</a>
      <p>Se você não solicitou essa alteração, pode ignorar este e-mail com segurança.</p>
    `

    return this.sendEmail({
      to: email,
      subject: 'Redefinição de Senha da Clara Equilibrio Emocional',
      html,
      title: "Redefinição de Senha"
    })
  }
}

module.exports = new SendEmail() 