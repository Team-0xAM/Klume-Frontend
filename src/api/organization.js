import apiClient from './axios'

// 사용자가 속한 조직 목록 조회
export const getMyOrganizations = () => {
  return apiClient.get('/my/organizations')
}

// 특정 조직 상세 조회
export const getOrganizationById = (organizationId) => {
  return apiClient.get(`/organizations/${organizationId}`)
}

// 조직 생성
export const createOrganization = (organizationData) => {
  return apiClient.post('/api/organizations', organizationData)
}

// 조직 코드로 가입
export const joinOrganizationByCode = (code) => {
  return apiClient.post('/api/organizations/join', { code })
}