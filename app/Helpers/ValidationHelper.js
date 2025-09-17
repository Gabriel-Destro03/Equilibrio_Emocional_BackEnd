'use strict'

class ValidationHelper {
    // 🔹 Valida se é um e-mail válido
    static isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }

    // 🔹 Valida se é um telefone numérico (somente dígitos)
    static isValidTelefone(telefone) {
        return /^\d+$/.test(telefone)
    }

    static requireField(value, message) {
        if (!value) throw new Error(message)
    }

}

module.exports = ValidationHelper