import api from '@/api/axios'

// 회의실 목록 조회
export const getRooms = (organizationId, memberId) => {
    return api.get(`/organizations/${organizationId}/rooms`, {
        params: { memberId }
    })
}

// 회의실 상세 조회
export const getRoomDetail = (organizationId, roomId, memberId) => {
    return api.get(`/organizations/${organizationId}/rooms/${roomId}`, {
        params: { memberId }
    })
}

// 회의실 등록 (이미지 포함)
export const createRoom = (organizationId, roomData, imageFile) => {
    const formData = new FormData()
    formData.append('dto', new Blob([JSON.stringify(roomData)], { type: 'application/json' }))

    if (imageFile) {
        formData.append('image', imageFile)
    }

    return api.post(`/organizations/${organizationId}/rooms`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
}

// 회의실 수정
export const updateRoom = (organizationId, roomId, roomData) => {
    return api.put(`/organizations/${organizationId}/rooms/${roomId}`, roomData)
}

// 회의실 삭제
export const deleteRoom = (organizationId, roomId) => {
    return api.delete(`/organizations/${organizationId}/rooms/${roomId}`)
}

// 이용 가능 시간 등록
export const createAvailableTime = (organizationId, roomId, payload) => {
    return api.post(`/organizations/${organizationId}/rooms/${roomId}/available-times`, payload)
}

// 이용 가능 시간 목록 조회
export const getAvailableTimes = (organizationId, roomId) => {
    return api.get(`/organizations/${organizationId}/rooms/${roomId}/available-times`)
}

// 이용 가능 시간 수정
export const updateAvailableTime = (organizationId, roomId, availableTimeId, payload) => {
    return api.put(`/organizations/${organizationId}/rooms/${roomId}/available-times/${availableTimeId}`, payload)
}

// 이용 가능 시간 삭제
export const deleteAvailableTime = (organizationId, roomId, availableTimeId) => {
    return api.delete(`/organizations/${organizationId}/rooms/${roomId}/available-times/${availableTimeId}`)
}
