import api from '@/api/axios'

// 회의실 목록 조회
export const getRooms = (organizationId, memberId) => {
  return api.get(`/organizations/${organizationId}/rooms`, {
      params: { memberId }
  })
}

// 날짜별 예약 가능 시간 조회
export const getAvailableTimes = (organizationId, date) => {
  return api.get(`/organizations/${organizationId}/reservations/status/day`, {
      params: { date }
  })
}

// 예약
export const createReservation = (organizationId, roomId, dailyAvailableTimeId) => {
  return api.post(`organizations/${organizationId}/rooms/${roomId}/reservations/${dailyAvailableTimeId}`, {
      params: { organizationId, roomId, dailyAvailableTimeId}
  })
}



