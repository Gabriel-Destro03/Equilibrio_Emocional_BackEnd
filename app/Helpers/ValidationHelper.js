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

    // 🔹 Valida e lança erro se email inválido
    static validateEmail(email) {
        if (!this.isValidEmail(email)) {
            throw new Error('Formato de email inválido')
        }
    }

    // 🔹 Valida e lança erro se telefone inválido
    static validateTelefone(telefone) {
        if (!this.isValidTelefone(telefone)) {
            throw new Error('Formato de telefone inválido')
        }
    }

}

module.exports = ValidationHelper