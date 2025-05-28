const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-dist')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'API documentation using Swagger',
    },
    servers: [
      {
        url: 'http://localhost:3333',
        description: 'Development server',
      },
    ],
  },
  apis: ['./app/Controllers/**/*.js', './app/Routes/**/*.js'], // Path to the API docs
}

const specs = swaggerJsdoc(options)

module.exports = {
  specs,
  swaggerUi
} 