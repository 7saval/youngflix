"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "등록된 이메일";

  return (
    <div className="w-full max-w-md space-y-8 rounded-2xl border border-neutral-800 bg-neutral-950 px-8 py-10 shadow-2xl">
      {/* 아이콘 */}
      <div className="flex justify-center">
        <div className="rounded-full bg-red-500/20 p-4">
          <svg
            className="h-12 w-12 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>

      {/* 제목 */}
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-white">이메일 확인 필요</h1>
        <p className="text-sm text-neutral-400">회원가입을 완료하려면 이메일을 확인해주세요</p>
      </div>

      {/* 안내 메시지 */}
      <div className="space-y-4 rounded-lg bg-neutral-900/50 p-4">
        <p className="text-sm text-neutral-200">
          <strong>{email}</strong>로 보낸 확인 이메일을 열어주세요.
        </p>

        <ul className="space-y-2 text-sm text-neutral-300">
          <li className="flex items-start gap-2">
            <span className="mt-1 inline-block h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
            <span>받은 편지함에서 확인 이메일을 찾아주세요</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 inline-block h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
            <span>스팸 폴더도 확인해보세요</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 inline-block h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
            <span>이메일 내 링크를 클릭하여 계정을 활성화합니다</span>
          </li>
        </ul>
      </div>

      {/* 다음 단계 */}
      <div className="space-y-3">
        <p className="text-center text-xs text-neutral-500">
          이메일을 확인했나요?
        </p>
        <Link
          href="/login"
          className="block w-full rounded-md bg-red-600 px-4 py-2.5 text-center font-semibold text-white transition hover:bg-red-700"
        >
          로그인으로 이동
        </Link>
      </div>

      {/* 문제가 있는 경우 */}
      <div className="space-y-2 border-t border-neutral-800 pt-6">
        <p className="text-center text-xs text-neutral-500">이메일을 받지 못했나요?</p>
        <button
          type="button"
          disabled
          className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-400 transition disabled:cursor-not-allowed"
        >
          재전송 (준비 중)
        </button>
        <p className="text-center text-xs text-neutral-600">
          또는{" "}
          <Link href="/signup" className="text-red-500 hover:text-red-400">
            다시 가입하기
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="text-white">로딩 중...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
