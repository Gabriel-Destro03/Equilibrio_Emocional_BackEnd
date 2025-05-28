'use strict'

const BaseValidator = require('./BaseValidator')

class StoreUnity extends BaseValidator {
  get rules () {
    return {
      number: 'required|',
      tower: `required|min:1`,
      users: 'required|min:1|unique:unities, unities.users._id',
      // rg:'unique:users,rg',
      // cpf: `regex:[0-9]{3}\.?[0-9]{3}\.?[0-9]{3}\-?[0-9]{2}|unique:users,cpf`,
      // unity:'required',
      // is_resident:'required', 
      // ramal:'required|min:6'
    }
  }
  get messages () {
    return {
      'number.required': 'Você deve fornecer um número.',
      'tower.required': 'Você deve fornecer uma torre.',
      'users.required': 'Você deve fornecer morador(es).',
      
    }
  }
  }

module.exports = StoreUnity
