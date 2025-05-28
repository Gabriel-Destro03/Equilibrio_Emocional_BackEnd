'use strict'

const Env = use('Env')

module.exports = {
  url: Env.get('VITE_SUPABASE_URL'),
  key: Env.get('VITE_SUPABASE_KEY'),
  
  get client() {
    const { createClient } = require('@supabase/supabase-js')
    return createClient(this.url, this.key)
  }
} 