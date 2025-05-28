"use strict";
class BaseRepository {
  constructor(db) {
    this.db = db;
  }

  /**
   * findById
   * @description Retorna um registro pelo identificador(primary key).
   */
  async findById(id) {
    return await this.db.find(id);
  }
}

module.exports = BaseRepository;
