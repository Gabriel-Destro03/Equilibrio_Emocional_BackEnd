'use strict'

class PasswordGenerator {
    /**
     * Gera uma senha aleatória com 8 caracteres
     * A senha contém letras maiúsculas, minúsculas, números e caracteres especiais
     * @returns {string} Senha gerada
     */
    static generatePassword() {
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        const lowercase = 'abcdefghijklmnopqrstuvwxyz'
        const numbers = '0123456789'
        const special = '!@#$%^&*()_+-=[]{}|;:,.<>?'
        
        const allChars = uppercase + lowercase + numbers + special
        let password = ''
        
        // Garante pelo menos um caractere de cada tipo
        password += uppercase[Math.floor(Math.random() * uppercase.length)]
        password += lowercase[Math.floor(Math.random() * lowercase.length)]
        password += numbers[Math.floor(Math.random() * numbers.length)]
        password += special[Math.floor(Math.random() * special.length)]
        
        // Completa a senha com caracteres aleatórios
        for (let i = 4; i < 8; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)]
        }
        
        // Embaralha a senha
        return password.split('').sort(() => Math.random() - 0.5).join('')
    }
}

module.exports = PasswordGenerator 