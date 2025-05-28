'use strict'

const Env = use('Env')

module.exports = {
  /*
  |--------------------------------------------------------------------------
  | Connection
  |--------------------------------------------------------------------------
  |
  | Connection to be used for sending emails. Each connection needs to
  | define a driver too.
  |
  */
  connection: Env.get('MAIL_CONNECTION', 'smtp'),

  /*
  |--------------------------------------------------------------------------
  | SMTP
  |--------------------------------------------------------------------------
  |
  | Here we define configuration for sending emails via SMTP.
  |
  */
  smtp: {
    driver: 'smtp',
    port: Env.get('MAIL_PORT'),
    host: Env.get('MAIL_HOST'),
    ssl: Env.get('MAIL_SSL'),
    //secure: Env.get('MAIL_SECURE'),
    auth: {
      user: Env.get('MAIL_USERNAME'),
      pass: Env.get('MAIL_PASSWORD')
    },
    maxConnections: 5,
    maxMessages: 100,
    rateLimit: 10
  },

  ses: {
    driver: 'ses',
    region: 'us-east-1',
    accessKeyId: Env.get('AWS_ACCESS_KEY'),
    secretAccessKey: Env.get('AWS_ACCESS_KEY_SECRET')
  }
}
