"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";
import { signupSchema, type SignupInput } from "@/lib/auth-schema";
import { useAuth } from "@/hooks/useAuth";

export default function SignupPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [globalError, setGlobalError] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  // 이미 로그인된 경우 홈으로 리다이렉트
  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  const onSubmit = async (data: SignupInput) => {
    setGlobalError("");
    setIsSigningUp(true);

    try {
      // Supabase에 회원가입
      const { error: signUpError, data: signUpData } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.nickname,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (!signUpData.user) {
        throw new Error("회원가입에 실패했습니다");
      }

      // 회원가입 성공 → 이메일 확인 안내 페이지로 이동
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      let errorMessage = "회원가입에 실패했습니다";

      if (error instanceof Error) {
        const errorText = error.message.toLowerCase();

        // 이메일 Rate Limit 에러 (email rate limit exceeded)
        if (errorText.includes("email rate limit")) {
          errorMessage = "이 이메일로 가입 시도가 너무 많습니다. 다른 이메일을 사용하거나 15분 후 다시 시도해주세요.";
        }
        // 429 Rate Limit 에러
        else if (errorText.includes("429") || errorText.includes("too many")) {
          errorMessage = "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.";
        }
        // 이메일이 이미 가입됨
        else if (errorText.includes("already registered") || errorText.includes("already exists")) {
          errorMessage = "이미 가입된 이메일입니다. 다른 이메일을 사용하거나 로그인해주세요.";
        }
        // 유효하지 않은 이메일
        else if (errorText.includes("invalid email") || errorText.includes("email address")) {
          errorMessage = "유효하지 않은 이메일 형식입니다. 확인 후 다시 시도해주세요.";
        }
        // 기본 에러 메시지
        else {
          errorMessage = error.message;
        }
      }

      setGlobalError(errorMessage);
      console.error("Signup error:", error);
    } finally {
      setIsSigningUp(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="space-y-4">
          <div className="h-8 w-48 animate-pulse rounded bg-neutral-700" />
          <div className="h-10 w-64 animate-pulse rounded bg-neutral-700" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-8 rounded-2xl border border-neutral-800 bg-neutral-950 px-8 py-10 shadow-2xl">
      {/* 제목 */}
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-white">회원가입</h1>
        <p className="text-sm text-neutral-400">Youngflix 계정을 만드세요</p>
      </div>

      {/* 에러 메시지 */}
      {globalError && (
        <div className="rounded-md border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {globalError}
        </div>
      )}

      {/* 회원가입 폼 */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* 닉네임 */}
        <div className="space-y-2">
          <label htmlFor="nickname" className="block text-sm font-medium text-white">
            닉네임
          </label>
          <input
            id="nickname"
            placeholder="예: youngflix_user"
            {...register("nickname")}
            disabled={isSigningUp}
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2 text-white placeholder-neutral-500 transition focus:border-red-500 focus:outline-none disabled:opacity-50"
          />
          {errors.nickname && (
            <p className="text-xs text-red-400">{errors.nickname.message}</p>
          )}
        </div>

        {/* 이메일 */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-white">
            이메일
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register("email")}
            disabled={isSigningUp}
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2 text-white placeholder-neutral-500 transition focus:border-red-500 focus:outline-none disabled:opacity-50"
          />
          {errors.email && (
            <p className="text-xs text-red-400">{errors.email.message}</p>
          )}
        </div>

        {/* 비밀번호 */}
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-white">
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register("password")}
            disabled={isSigningUp}
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2 text-white placeholder-neutral-500 transition focus:border-red-500 focus:outline-none disabled:opacity-50"
          />
          {errors.password && (
            <p className="text-xs text-red-400">{errors.password.message}</p>
          )}
        </div>

        {/* 비밀번호 확인 */}
        <div className="space-y-2">
          <label htmlFor="passwordConfirm" className="block text-sm font-medium text-white">
            비밀번호 확인
          </label>
          <input
            id="passwordConfirm"
            type="password"
            placeholder="••••••••"
            {...register("passwordConfirm")}
            disabled={isSigningUp}
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2 text-white placeholder-neutral-500 transition focus:border-red-500 focus:outline-none disabled:opacity-50"
          />
          {errors.passwordConfirm && (
            <p className="text-xs text-red-400">{errors.passwordConfirm.message}</p>
          )}
        </div>

        {/* 회원가입 버튼 */}
        <button
          type="submit"
          disabled={isSigningUp}
          className="w-full rounded-md bg-red-600 px-4 py-2.5 font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
        >
          {isSigningUp ? "가입 중..." : "회원가입"}
        </button>
      </form>

      {/* 로그인 링크 */}
      <p className="text-center text-sm text-neutral-500">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="font-semibold text-red-500 hover:text-red-400">
          로그인하기
        </Link>
      </p>
    </div>
  );
}
