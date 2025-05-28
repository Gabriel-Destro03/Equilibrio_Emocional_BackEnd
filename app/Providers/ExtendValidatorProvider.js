"use strict";

const { ServiceProvider } = require("@adonisjs/fold");

class ExtendValidatorProvider extends ServiceProvider {
  async existValidator(data, field, message, args, get) {
    const InvalidArgumentException = use(
      "App/Exceptions/InvalidArgumentException"
    );
    const Database = use("Database");
    /**
     * skip if value is empty, required validation will
     * take care of empty values
     */
    const fieldValue = get(data, field);
    if (!fieldValue) {
      return true;
    }
    const collectionName = args[0];
    const databaseField = args[1] || field;
    if (!collectionName) {
      throw new InvalidArgumentException("Unique rule require collection name");
    }
    const database = Database.collection(collectionName);
    database.where(databaseField).eq(fieldValue);
    /**
     * if args[2] and args[3] are available inside the array
     * take them as whereNot key/value pair to limit scope
     */
    if (args[2] && args[3]) {
      database.where(args[2]).eq(args[3]);
    }

    const exists = await database.findOne();
    if (!exists) {
      throw message;
    }
  }

  async digitValidator(data, field, message, args, get) {
    const fieldValue = get(data, field);
    if (!fieldValue) {
      return true;
    }
    if (!/^\d+/i.test(fieldValue)) {
      throw message;
    }
  }

  async numericValidator(data, field, message, args, get) {
    let fieldValue = get(data, field);
    if (!fieldValue) {
      return true;
    }
    if (isNaN(fieldValue)) {
      throw message;
    }
  }

  async lengthValidator(data, field, message, args, get) {
    const fieldValue = get(data, field);
    if (!fieldValue) {
      return true;
    }
    if (fieldValue.length !== parseInt(args[0])) {
      throw message;
    }
  }

  async objectIdValidator(data, field, message, args, get) {
    const fieldValue = get(data, field);
    if (!fieldValue) {
      return true;
    }
    if (!/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i.test(fieldValue)) {
      throw message;
    }
  }

  async minValueValidator(data, field, message, args, get) {
    const fieldValue = get(data, field);
    if (fieldValue < args[0]) {
      throw message;
    }
  }

  async maxValueValidator(data, field, message, args, get) {
    const fieldValue = get(data, field);
    if (fieldValue > args[0]) {
      throw message;
    }
  }

  async uniqueWithValidator(data, field, message, args, get) {
    /**
     * uniqueWithValidator
     * @description Validar se um valor é único de acordo com um model e um dado extra, levando em conta se é um update ou não
     * @param {args} array com argumentos, sendo que a ordem é:
     *   [0] - Model
     *   [1] - Campo a ser validado
     *   [2] - Nome do campo extra do model a ser levado em consideração
     *   [3] - Valor do campo extra
     *   [4] - Se o valor é um ObjectId
     *   [5] - No caso de ser uma atualização passar o _id do model a ser atualizado para validar
     */
    const Database = use("Database");
    const { ObjectId } = require("mongodb");

    let value = args[3];
    const fieldValue = get(data, field);
    if (args[4] === "true") {
      value = ObjectId(args[3]);
    }

    if (args[5]) {
      const rowUpdate = await Database.collection(args[0])
        .where({ [field]: fieldValue, _id: ObjectId(args[5]) })
        .first();

      if (rowUpdate) {
        return true;
      }
    }

    const row = await Database.collection(args[0])
      .where({ [field]: fieldValue, removed: false, [args[2]]: value })
      .first();

    if (row) {
      throw new Error(`This ${field} is already registered`);
    }
  }

  async boot() {
    // register bindings
    const Validator = use("Adonis/Addons/Validator");
    Validator.extend("exist", this.existValidator, "{{field}} is not exists");
    Validator.extend(
      "objectId",
      this.objectIdValidator,
      "{{field}} is not valid ObjectID"
    );
    Validator.extend(
      "digit",
      this.digitValidator,
      "{{field}} is not valid digit"
    );
    Validator.extend(
      "numeric",
      this.numericValidator,
      "{{field}} is not valid numeric"
    );
    Validator.extend(
      "length",
      this.lengthValidator,
      "{{field}} is not valid length"
    );
    Validator.extend(
      "minValue",
      this.minValueValidator,
      "{{field}} is not valid minValue"
    );
    Validator.extend(
      "maxValue",
      this.maxValueValidator,
      "{{field}} is not valid maxValue"
    );
    Validator.extend(
      "uniqueWith",
      this.uniqueWithValidator,
      "this {{field}} is already registered"
    );
  }
}

module.exports = ExtendValidatorProvider;
