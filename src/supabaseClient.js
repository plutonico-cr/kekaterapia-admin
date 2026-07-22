import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ciddpvkcdoevfprlzhtg.supabase.co'
const SUPABASE_KEY = 'sb_publishable_F10DXS9eoGkfmLuzf5J2lQ_T8jf2oLJ'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)