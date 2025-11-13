import api from '../axios'

// 로그인한 사용자의 조직 내 정보 조회
export const getMyInfoInOrganization = (organizationId) => {
    return api.get(`/organizations/${organizationId}/members/me`);
};

// 조직 멤버 목록 조회
export const getOrganizationMembers = (organizationId) => {
    return api.get(`/organizations/${organizationId}/members`);
};

// 패널티 0으로 초기화
export const updatePenalty = (organizationId, organizationMemberId) => {
    return api.put(`/organizations/${organizationId}/members/${organizationMemberId}/penalty`);
};

// 권한 변경
export const updateRole = (organizationId, organizationMemberId, data) => {
    return api.put(`/organizations/${organizationId}/members/${organizationMemberId}/role`, data);
};

// 조직 맴버 강퇴
export const kickMember = (organizationId, organizationMemberId) => {
    return api.delete(`/organizations/${organizationId}/members/${organizationMemberId}`);
};

// 초대 코드 발급
export const getinvitationCode = (organizationId) => {
    return api.post(`/organizations/${organizationId}/invitations`);
};