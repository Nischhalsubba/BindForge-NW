import type {SupabaseClient} from '@supabase/supabase-js';
export function emailAuth(client:SupabaseClient|null,input:{action:'signup'|'signin'|'reset';email:string;password?:string;redirectTo:string}):Promise<{session?:unknown}|undefined>;
