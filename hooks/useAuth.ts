import { useEffect, useRef, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { apiClient } from "@/app/api/client";
import { supabase } from "@/lib/supabase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const syncedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const syncUserProfile = async () => {
      if (!session?.access_token || !user?.id) {
        syncedUserIdRef.current = null;
        return;
      }

      if (syncedUserIdRef.current === user.id) {
        return;
      }

      try {
        await apiClient.userProfile.sync(session.access_token);
        syncedUserIdRef.current = user.id;
      } catch (error) {
        console.error("사용자 프로필 동기화에 실패했습니다.", error);
      }
    };

    void syncUserProfile();
  }, [session, user]);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo:
          typeof window !== "undefined" ? `${window.location.origin}/` : undefined,
      },
    });

    if (error) {
      console.error("구글 로그인 오류:", error.message);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("로그아웃 오류:", error.message);
    }
  };

  return {
    user,
    session,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signOut,
  };
}
