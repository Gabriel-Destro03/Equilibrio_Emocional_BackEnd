'use strict'

class TokenStore {
  constructor() {
    this.issuedTokens = new Set()
  }

  add(token) {
    if (token) this.issuedTokens.add(token)
  }

  has(token) {
    return this.issuedTokens.has(token)
  }

  remove(token) {
    this.issuedTokens.delete(token)
  }

  clear() {
    this.issuedTokens.clear()
  }
}

module.exports = new TokenStore()


