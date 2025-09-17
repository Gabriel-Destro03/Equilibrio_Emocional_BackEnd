'use strict'

const Route = use('Route')

/**
 * @swagger
 * tags:
 *   name: Empresas
 *   description: Endpoints para gerenciamento de empresas
 */

Route.group(() => {
  Route.get('/', 'Api/EmpresaController.index')
  // Route.get('/hierarquia', 'Api/EmpresaController.getEmpresaFiliaisDepartamentos')
  Route.get('/hierarquia/:id', 'Api/EmpresaController.getEmpresaFiliaisDepartamentosByEmpresaId')
  Route.get('/:id', 'Api/EmpresaController.show')
  Route.get('/responsaveis/:id', 'Api/EmpresaController.getRepresentantesByEmpresaId')
  Route.post('/', 'Api/EmpresaController.store')
  Route.put('/:id', 'Api/EmpresaController.update')
  Route.delete('/:id', 'Api/EmpresaController.destroy')
  Route.put('/:id/status', 'Api/EmpresaController.changeStatus')
}).prefix('/api/empresa').middleware(['ensureJwt'])  