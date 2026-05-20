// ============================================================
// CONFIGURATION SUPABASE — thesouscote
// ============================================================
// Remplacez les valeurs ci-dessous par celles fournies dans les paramètres de votre projet Supabase :
// Projet Settings -> API -> Project URL & Project API Keys (anon public)

const SUPABASE_URL = "https://vbvffkrgzmahdghwbvlg.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_egWUtDTzJK2X6cOlOKVtUw_UR8scIOW";

// Initialisation du client Supabase
let supabase = null;
if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
