import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

// 웹앱용 Firebase 구성
const firebaseConfig = {
  apiKey: "AIzaSyCLwR5Tkj93OKUp4nVfwBOOUvJxfho-tcs",
  authDomain: "youngflix-9e284.firebaseapp.com",
  projectId: "youngflix-9e284",
  storageBucket: "youngflix-9e284.firebasestorage.app",
  messagingSenderId: "707627290542",
  appId: "1:707627290542:web:dfedae30167575ecfa023f",
  measurementId: "G-FNX5X6KYR2"
};

// Next.js SSR (서버 사이드 렌더링) 환경에서 Firebase 중복 초기화를 방지합니다.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let analytics: ReturnType<typeof getAnalytics> | null = null;

// Analytics 측정을 브라우저 환경에서만(window 가 있을 때만) 초기화합니다.
if (typeof window !== "undefined") {
  isSupported().then((yes) => {
    if (yes) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, analytics };
