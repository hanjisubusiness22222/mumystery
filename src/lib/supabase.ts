import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://tdmtdkgfpvejxawqzvsx.supabase.co';

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_cs_es59_cViLkMspIRNMBg_h6uD6ioH';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
