import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. 처음 앱 로드 시 현재 떠있는 세션을 확인합니다.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 2. 인증 상태 변화 이벤트 리스너 등록 (로그인, 로그아웃 등 감지)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 구글 소셜 로그인 함수
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined,
      }
    });
    if (error) console.error("구글 로그인 에러:", error.message);
  };

  // 일반 이메일/비밀번호 로그인 함수
  const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  // 로그아웃 함수
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("로그아웃 에러:", error.message);
  };

  return { 
    user, 
    session, 
    loading, 
    signInWithGoogle, 
    signInWithEmail, 
    signOut 
  };
}
