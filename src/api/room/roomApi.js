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
export const createRoom = (organizationId, memberId, roomData, imageFile) => {
    const formData = new FormData()
    formData.append('request', new Blob([JSON.stringify(roomData)], { type: 'application/json' }))
    if (imageFile) {
        formData.append('image', imageFile)
    }

    return api.post(`/organizations/${organizationId}/rooms`, formData, {
        params: { memberId },
        headers: { 'Content-Type': 'multipart/form-data' }
    })
}

// 회의실 수정
export const updateRoom = (organizationId, roomId, memberId, roomData) => {
    return api.put(`/organizations/${organizationId}/rooms/${roomId}`, roomData, {
        params: { memberId }
    })
}

// 회의실 삭제
export const deleteRoom = (organizationId, roomId, memberId) => {
    return api.delete(`/organizations/${organizationId}/rooms/${roomId}`, {
        params: { memberId }
    })
}
