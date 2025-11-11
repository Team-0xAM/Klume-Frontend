// src/api/notice.js
import api from './axios'

// 조직의 공지사항 목록 조회
export const getNotices = (organizationId) => {
  return api.get(`/organizations/${organizationId}/notices`)
}

// 공지사항 상세 조회
export const getNoticeById = (organizationId, noticeId) => {
  return api.get(`/organizations/${organizationId}/notices/${noticeId}`)
}

// 공지사항 생성
export const createNotice = (organizationId, noticeData) => {
  return api.post(`/organizations/${organizationId}/notices`, noticeData)
}

// 공지사항 수정
export const updateNotice = (organizationId, noticeId, noticeData) => {
  return api.put(`/organizations/${organizationId}/notices/${noticeId}`, noticeData)
}

// 공지사항 삭제
export const deleteNotice = (organizationId, noticeId) => {
  return api.delete(`/organizations/${organizationId}/notices/${noticeId}`)
}
