// src/api/auth.js
import api from './axios';

// ✅ 로그인 상태 확인 (OAuth, 세션 기반)
export const getAuthStatus = () => api.get('/auth/status')

// 이메일 인증 관련
export const sendVerificationCode = (email) => api.post('/auth/mail/send', { email });
export const verifyCode = (email, code) => api.post('/auth/mail/verify', { email, code });

// 회원가입 / 로그인
export const signup = (data) => api.post('/auth/signup', data);
export const login = (data) => api.post('/auth/login', data);
export const logout = () => api.post('/auth/logout');
