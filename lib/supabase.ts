import { createClient } from '@supabase/supabase-js';

// 환경 변수에서 Supabase 프로젝트 URL과 Anon Key를 가져옵니다.
// 이 값들은 Supabase 대시보드의 Project Settings -> API 메뉴에서 확인할 수 있습니다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
