'use strict'

const Route = use('Route')
const { specs, swaggerUi } = require('../Config/swagger')
const path = require('path')

Route.get('/docs', async ({ response }) => {
  response.header('Content-Type', 'text/html')
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>API Documentation</title>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@3.23.0/swagger-ui.css" />
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@3.23.0/swagger-ui-bundle.js"></script>
      <script>
        window.onload = () => {
          window.ui = SwaggerUIBundle({
            spec: ${JSON.stringify(specs)},
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
              SwaggerUIBundle.presets.apis,
              SwaggerUIBundle.SwaggerUIStandalonePreset
            ],
          })
        }
      </script>
    </body>
    </html>
  `
}) 