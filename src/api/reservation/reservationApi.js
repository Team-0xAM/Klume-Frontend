import api from '@/api/axios'

// 회의실 목록 조회
export const getRooms = (organizationId, memberId) => {
  return api.get(`/organizations/${organizationId}/rooms`, {
      params: { memberId }
  })
}
