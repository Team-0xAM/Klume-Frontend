// src/utils/auth.js
import { ref } from 'vue'

// 반응형 로그인 상태
export const isLoggedIn = ref(!!localStorage.getItem('accessToken'))

// 토큰 저장
export const setAccessToken = (token) => {
  localStorage.setItem('accessToken', token)
  isLoggedIn.value = true
}

// 토큰 가져오기
export const getAccessToken = () => {
  return localStorage.getItem('accessToken')
}

// 토큰 삭제
export const removeAccessToken = () => {
  localStorage.removeItem('accessToken')
  isLoggedIn.value = false
}

// 사용자 이메일 저장
export const setUserEmail = (email) => {
  localStorage.setItem('userEmail', email)
}

// 사용자 이메일 가져오기
export const getUserEmail = () => {
  return localStorage.getItem('userEmail')
}

// 사용자 이메일 삭제
export const removeUserEmail = () => {
  localStorage.removeItem('userEmail')
}

// 프로필 이미지 저장
export const setProfileImage = (imageUrl) => {
  localStorage.setItem('profileImage', imageUrl)
}

// 프로필 이미지 가져오기
export const getProfileImage = () => {
  return localStorage.getItem('profileImage')
}

// 프로필 이미지 삭제
export const removeProfileImage = () => {
  localStorage.removeItem('profileImage')
}

// 로그인 상태 확인
export const isAuthenticated = () => {
  return !!getAccessToken()
}

// 로그아웃
export const logout = () => {
  removeAccessToken()
  removeUserEmail()
  removeProfileImage()
  isLoggedIn.value = false
}
