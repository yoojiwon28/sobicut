type KakaoAuthObj = { access_token: string };

interface KakaoSDK {
  init: (key: string) => void;
  isInitialized: () => boolean;
  Auth: {
    login: (options: {
      success: (authObj: KakaoAuthObj) => void;
      fail: (err: unknown) => void;
    }) => void;
  };
}

declare global {
  interface Window {
    Kakao?: KakaoSDK;
  }
}

const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY;
const KAKAO_SDK_SRC = 'https://developers.kakao.com/sdk/js/kakao.min.js';

let loadPromise: Promise<void> | null = null;

function loadKakaoSdk(): Promise<void> {
  if (window.Kakao) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = KAKAO_SDK_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('카카오 SDK를 불러오지 못했어요.'));
    document.head.appendChild(script);
  });

  return loadPromise;
}

// 카카오 로그인 팝업을 띄우고 access_token 을 받아온다.
export async function getKakaoAccessToken(): Promise<string> {
  if (!KAKAO_JS_KEY) {
    throw new Error('카카오 JavaScript 키가 설정되지 않았어요.');
  }
  await loadKakaoSdk();
  if (!window.Kakao!.isInitialized()) {
    window.Kakao!.init(KAKAO_JS_KEY);
  }
  return new Promise((resolve, reject) => {
    window.Kakao!.Auth.login({
      success: (authObj) => resolve(authObj.access_token),
      fail: (err) => reject(err),
    });
  });
}