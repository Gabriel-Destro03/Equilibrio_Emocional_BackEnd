'use strict'

const Route = use('Route')

// Rotas para logs de e-mail
Route.group(() => {
  // Lista todos os logs com paginação
  Route.get('/', 'Api/EmailLogController.index')
  
  // Estatísticas de e-mails
  Route.get('/stats', 'Api/EmailLogController.getStats')
  
  // Logs por status
  Route.get('/status/:status', 'Api/EmailLogController.getByStatus')
  
  // Logs por tipo
  Route.get('/type/:type', 'Api/EmailLogController.getByType')
  
  // Logs por usuário
  Route.get('/user/:userId', 'Api/EmailLogController.getByUser')
  
  // E-mails com falha
  Route.get('/failed', 'Api/EmailLogController.getFailedEmails')
  
  // E-mails pendentes
  Route.get('/pending', 'Api/EmailLogController.getPendingEmails')
  
  // Detalhes de um log específico
  Route.get('/:id', 'Api/EmailLogController.show')
}).prefix('/api/email-logs').middleware(['ensureJwt']) 