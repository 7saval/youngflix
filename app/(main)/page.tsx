import React from "react";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-black text-white">
      <h1 className="text-6xl font-bold text-red-600">YOUNGFLIX</h1>
      <p className="mt-4 text-xl">Young한 콘텐츠만 모아놨다! Young플릭스</p>
      <div className="mt-8 flex gap-4">
        <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded">
          로그인
        </button>
        <button className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded">
          자세히 보기
        </button>
      </div>
    </main>
  );
}
