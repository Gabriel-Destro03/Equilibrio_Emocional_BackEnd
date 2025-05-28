'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/guides/routing
|
*/
/** @type {import('@adonisjs/framework/src/Route/Manager'} */
const Route = use('Route')

Route.get('/', ({ request }) => {
  return { greeting: 'Hello world in JSON' }
})

// Supabase Auth Routes
const supabaseAuth = require('../app/Routes/supabaseAuth')
Route.get('/auth/users', supabaseAuth.getUsers)
Route.get('/auth/users/:id', supabaseAuth.getUserById)

use('require-all')(`${use('Helpers').appRoot()}/app/Routes`)
