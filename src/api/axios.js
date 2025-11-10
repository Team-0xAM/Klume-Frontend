// src/api/axios.js
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
})

// JWT 토큰 자동 첨부
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 응답 인터셉터 - 에러 처리
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // 에러 응답 처리
    if (error.response) {
      const { status } = error.response

      // 401 Unauthorized - 로그인 필요
      if (status === 401) {
        localStorage.removeItem('accessToken')
        // 현재 페이지가 로그인/회원가입 페이지가 아닐 때만 리다이렉트
        const currentPath = window.location.pathname
        if (!currentPath.startsWith('/auth/')) {
          window.location.href = '/auth/login'
        }
      }
    }

    return Promise.reject(error)
  }
)

export default api
