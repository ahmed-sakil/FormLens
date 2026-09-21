import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL || process.env.VERCEL_PUBLIC_SUPABASE_URL || 'https://xrrfnothrmzjhzehchyt.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VERCEL_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_0H0n11UsDIA2USKIgmjYOg_pNtU5nQm';
const apiUrl = process.env.API_URL || process.env.VERCEL_PUBLIC_API_URL || 'http://localhost:3001/api';

const content = `// FormLens Frontend Configuration
// Auto-generated during build
window.ENV = {
  SUPABASE_URL: ${JSON.stringify(supabaseUrl)},
  SUPABASE_ANON_KEY: ${JSON.stringify(supabaseAnonKey)},
  API_URL: ${JSON.stringify(apiUrl)}
};
`;

fs.writeFileSync(path.join(__dirname, 'env.js'), content);
console.log('Generated env.js with API_URL:', apiUrl);
