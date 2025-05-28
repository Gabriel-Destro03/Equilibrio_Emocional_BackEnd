'use strict'
const BaseValidator = require('./BaseValidator')

class StorePerson extends BaseValidator {
  get rules () {
    return {
      name: 'required|min:2|max:100',
    //  rg:'unique:users,rg',
     // cpf: `regex:[0-9]{3}\.?[0-9]{3}\.?[0-9]{3}\-?[0-9]{2}|unique:users,cpf`,
     // unity:'required',
      profile:'required',
      is_resident:'required', 
    //  ramal:'required|min:6',
      ownerZipcode :  "required_if:profile,'Proprietário'",
    //   ownerAddress,
    //   ownerNumber,
    //   ownerComplement,
    //   ownerNeighborhood,
    //   ownerCity,
    //   ownerUf,
    //   ownerComercialPhone,
    //   ownerHomePhone,
    //   ownerPhone,
    }
  }
}

module.exports = StorePerson
