// 소셜 로그인 설정 파일
const authConfig = {
  // Google OAuth
  google: {
    clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
    redirectUri: `${window.location.origin}/auth/google/callback`,
    scope: 'email profile'
  },
  
  // Naver OAuth
  naver: {
    clientId: process.env.REACT_APP_NAVER_CLIENT_ID,
    redirectUri: `${window.location.origin}/auth/naver/callback`,
    state: 'RANDOM_STATE_STRING'
  },
  
  // Kakao OAuth
  kakao: {
    clientId: process.env.REACT_APP_KAKAO_CLIENT_ID,
    redirectUri: `${window.location.origin}/auth/kakao/callback`,
    scope: 'profile_nickname account_email'
  },
  
  // API 엔드포인트
  api: {
    baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',
    endpoints: {
      login: '/api/auth/login',
      callback: '/api/auth/callback',
      user: '/api/user/profile'
    }
  }
};

export default authConfig;

