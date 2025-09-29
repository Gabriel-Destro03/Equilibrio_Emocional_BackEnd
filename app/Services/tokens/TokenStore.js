'use strict'

class TokenStore {
  constructor() {
    this.issuedTokens = new Set()
    this.tokenToUserId = new Map()
    this.userIdToTokens = new Map()
  }

  add(token, userId) {
    if (!token) return

    this.issuedTokens.add(token)

    if (userId) {
      this.tokenToUserId.set(token, userId)

      const existingSet = this.userIdToTokens.get(userId) || new Set()
      existingSet.add(token)
      this.userIdToTokens.set(userId, existingSet)
    }
  }

  has(token) {
    return this.issuedTokens.has(token)
  }

  remove(token) {
    if (!token) return

    this.issuedTokens.delete(token)

    const userId = this.tokenToUserId.get(token)
    if (userId) {
      this.tokenToUserId.delete(token)

      const tokenSet = this.userIdToTokens.get(userId)
      if (tokenSet) {
        tokenSet.delete(token)
        if (tokenSet.size === 0) {
          this.userIdToTokens.delete(userId)
        } else {
          this.userIdToTokens.set(userId, tokenSet)
        }
      }
    }
  }

  removeByUserId(userId) {
    if (!userId) return

    const tokenSet = this.userIdToTokens.get(userId)
    if (!tokenSet) return

    for (const token of tokenSet) {
      this.issuedTokens.delete(token)
      this.tokenToUserId.delete(token)
    }

    this.userIdToTokens.delete(userId)
  }

  getUserIdByToken(token) {
    return this.tokenToUserId.get(token)
  }

  clear() {
    this.issuedTokens.clear()
    this.tokenToUserId.clear()
    this.userIdToTokens.clear()
  }
}

module.exports = new TokenStore()


