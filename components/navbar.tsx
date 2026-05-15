"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <nav
      className={`fixed top-0 z-50 w-full transition-colors duration-300 ${
        isScrolled ? "bg-black/80 backdrop-blur" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4 md:px-10">
        {/* 좌: 브랜드명 */}
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-red-500 hover:text-red-400 transition"
        >
          Youngflix
        </Link>

        {/* 우: 로그인/사용자 정보 */}
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="h-10 w-24 animate-pulse rounded bg-neutral-700" />
          ) : user ? (
            <>
              <div className="flex flex-col items-end">
                <p className="text-sm font-semibold text-white">{user.email}</p>
                <p className="text-xs text-neutral-400">
                  {user.user_metadata?.name ?? "사용자"}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
