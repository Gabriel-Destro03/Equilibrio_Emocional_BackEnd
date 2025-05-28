'use strict'

/** @type {import('@adonisjs/framework/src/Hash')} */
const Hash = use('Hash')

/** @type {typeof import('lucid-mongo/src/LucidMongo/Model')} */
const Model = use('Model')
const helper = use('App/Controllers/Http/Helpers/Index');
const Config = use('Config')



/**
 * @swagger
 * components:
 *   schemas:
 *     NewUser:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - profile
 *         - cellPhone
 *         - rg
 *         - cpf
 *         - is_resident
 *         - unity
 *         - status
 *         - verificationToken
 *         - verified
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         password:
 *           type: string
 *           format: password
 *         profile:
 *           type: string
 *         cellPhone:
 *           type: number
 *         cpf:
 *           type: number
 *         is_resident:
 *           type: number
 *         unity:
 *           type: string
 *         status:
 *           type: number
 *         verificationToken:
 *           type: string
 *         verified:
 *           type: boolean
 *     UpdateUser:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         password:
 *           type: string
 *           format: password
 *         profile:
 *           type: string
 *         cellPhone:
 *           type: number
 *         cpf:
 *           type: number
 *         is_resident:
 *           type: number
 *         unity:
 *           type: string
 *         status:
 *           type: number
 *     User:
 *       allOf:
 *         - $ref: '#/components/schemas/NewUser'
 *         - type: object
 *           properties:
 *             _id:
 *               type: string
 */

class User extends Model {
  static boot () {
    super.boot()

    /**
    * Add column removed before saving
    * it to the database.
    */
    this.addHook('beforeSave', async (userInstance) => {
      if (userInstance.dirty.password) {
        userInstance.password = await Hash.make(userInstance.password)
      }
    });

    this.addHook('beforeCreate', async (userInstance) =>{
      userInstance.allowedNotificationSms = true
      userInstance.allowedNotificationEmail = true
      userInstance.verified = false;
    })
   this.addHook('beforeCreate', 'App/Models/Hooks/Removed.addColumnRemoved')
   this.addHook("beforeSave", "App/Models/Hooks/logs.logCreateOrUpdate");

  }



  /**
   * A relationship on tokens is required for auth to
   * work. Since features like `refreshTokens` or
   * `rememberToken` will be saved inside the
   * tokens table.
   *
   * @method tokens
   *
   * @return {Object}
   */
  tokens () {
    return this.hasMany('App/Models/Token')
  }

  condo () {
    return this.referMany('App/Models/Condominium', '_id', 'condominiums')
  }

  images () {
    return this.morphMany('App/Models/Image', 'imageable_type', 'imageable_id')
  }

  person () {
    return this.hasOne('App/Models/Person', '_id', 'userId')
  }

}

module.exports = User
