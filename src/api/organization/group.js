import api from '../axios'

// 그룹 목록 조회
export const getGroups = (organizationId) => {
    return api.get(`/organizations/${organizationId}/groups`)
}

// 그룹 생성
export const createGroup = (organizationId, groupData) => {
    return api.post(`/organizations/${organizationId}/groups`, groupData)
}

// 그룹 수정
export const updateGroup = (organizationId, groupId, data) => {
    return api.put(`/organizations/${organizationId}/groups/${groupId}`, data)
}

// 그룹 삭제
export const deleteGroup = (organizationId, groupId) => {
    return api.delete(`/organizations/${organizationId}/groups/${groupId}`)
}
