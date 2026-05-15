"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema, type LoginInput } from "@/lib/auth-schema";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, signInWithEmail, signInWithGoogle } = useAuth();
  const [globalError, setGlobalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  // 이미 로그인된 경우 홈으로 리다이렉트
  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  const onSubmit = async (data: LoginInput) => {
    setGlobalError("");
    setIsSubmitting(true);

    try {
      await signInWithEmail(data.email, data.password);
      router.push("/");
    } catch (err) {
      const error = err as Error;
      setGlobalError(error.message || "로그인에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGlobalError("");
    try {
      await signInWithGoogle();
      // Google OAuth는 자동으로 리다이렉트됨
    } catch (err) {
      const error = err as Error;
      setGlobalError(error.message || "Google 로그인에 실패했습니다.");
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
        <h1 className="text-3xl font-bold text-white">로그인</h1>
        <p className="text-sm text-neutral-400">Youngflix에 로그인하세요</p>
      </div>

      {/* 에러 메시지 */}
      {globalError && (
        <div className="rounded-md border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {globalError}
        </div>
      )}

      {/* 이메일 로그인 폼 */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-white">
            이메일
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register("email")}
            disabled={isSubmitting}
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2 text-white placeholder-neutral-500 transition focus:border-red-500 focus:outline-none disabled:opacity-50"
          />
          {errors.email && (
            <p className="text-xs text-red-400">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-white">
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register("password")}
            disabled={isSubmitting}
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2 text-white placeholder-neutral-500 transition focus:border-red-500 focus:outline-none disabled:opacity-50"
          />
          {errors.password && (
            <p className="text-xs text-red-400">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-red-600 px-4 py-2.5 font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
        >
          {isSubmitting ? "로그인 중..." : "로그인"}
        </button>
      </form>

      {/* 구분선 */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-neutral-950 px-2 text-neutral-500">또는</span>
        </div>
      </div>

      {/* Google OAuth 버튼 */}
      <button
        onClick={handleGoogleSignIn}
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2.5 font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Google로 시작하기
      </button>

      {/* 하단 링크 */}
      <p className="text-center text-sm text-neutral-500">
        계정이 없으신가요?{" "}
        <Link href="/signup" className="font-semibold text-red-500 hover:text-red-400">
          가입하기
        </Link>
      </p>
    </div>
  );
}
