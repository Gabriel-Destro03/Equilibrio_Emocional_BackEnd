'use strict'
/** @type {typeof import('lucid-mongo/src/LucidMongo/Model')} */
const Model = use('Model')

class Token extends Model {
  user () {
    return this.belongsTo('App/Models/User')
  }

  admin () {
    return this.belongsTo('App/Models/Admin')
  }
}

module.exports = Token
