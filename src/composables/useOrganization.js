import { ref } from 'vue'
import api from '@/api/axios'

export const organizationName = ref('')
export const organizationId = ref(null)
export const organizationImage = ref(null)
export const userNickname = ref('')
export const organizationRole = ref(null)

export async function fetchOrganizationInfo(orgId) {

    // 1. 조직 상세 정보 조회
    try {
        const orgRes = await api.get(`/organizations/${orgId}`)
        organizationName.value = orgRes.data.name || '조직명'
        organizationImage.value = orgRes.data.imageUrl || null
    } catch (err) {
        organizationName.value = '조직'
        organizationImage.value = null
    }

    // 2. 조직 내 역할 조회
    try {
        const roleRes = await api.get(`/organizations/${orgId}/role`)
        organizationRole.value = roleRes.data.role
    } catch (err) {
        organizationRole.value = 'MEMBER'
    }

    // 3. 조직 멤버 닉네임 조회 (새로운 API 사용)
    try {
        const memberRes = await api.get(`/organizations/${orgId}/members/me`)
        userNickname.value = memberRes.data.nickname || '사용자'
    } catch (err) {
        userNickname.value = '사용자'
    }

    organizationId.value = orgId

    console.log('Organization Info Loaded:', {
        role: organizationRole.value,
        name: organizationName.value,
        image: organizationImage.value,
        nickname: userNickname.value
    })
}
