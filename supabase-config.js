// ============================================================
// CONFIGURATION SUPABASE — thesouscote
// ============================================================
// Remplacez les valeurs ci-dessous par celles fournies dans les paramètres de votre projet Supabase :
// Projet Settings -> API -> Project URL & Project API Keys (anon public)

const SUPABASE_URL = "https://vbvffkrgzmahdghwbvlg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZidmZma3Jnem1haGRnaHdidmxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyODY3MzAsImV4cCI6MjA5NDg2MjczMH0.wvDG6eye9CHkocDXqtFNrUbCpLuUPG6NagsVn4vUrW0";

// Initialisation du client Supabase
let supabase = null;
if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
