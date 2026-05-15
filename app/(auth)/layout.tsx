import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen w-full bg-black">
      {/* 헤더: 로고 */}
      <div className="flex items-center justify-between px-6 py-6 md:px-10 md:py-8">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-red-500 hover:text-red-400 transition"
        >
          Youngflix
        </Link>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-8">
        {children}
      </div>
    </div>
  );
}
