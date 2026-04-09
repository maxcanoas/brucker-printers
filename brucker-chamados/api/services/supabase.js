const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  }
);

// Client isolado para operações de login (signInWithPassword)
// Evita contaminar a sessão do client principal (service_role)
function createAuthClient() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    }
  );
}

module.exports = supabase;
module.exports.createAuthClient = createAuthClient;
