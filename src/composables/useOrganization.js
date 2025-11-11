import { ref } from 'vue'
import api from '@/api/axios'

export const organizationName = ref('')
export const organizationId = ref(null)
export const organizationImage = ref(null)
export const userNickname = ref('')
export const organizationRole = ref(null)

export async function fetchOrganizationInfo(orgId) {
    console.log('조직 정보 조회 시작:', orgId)

    // 1. 조직 내 사용자 역할 조회
    try {
        const roleRes = await api.get(`/organizations/${orgId}/role`)
        console.log('역할 조회 응답:', roleRes.data)
        organizationRole.value = roleRes.data.role // 'ADMIN' or 'MEMBER'
    } catch (err) {
        console.error('역할 조회 실패:', err)
        console.error('에러 상세:', err.response?.data)
        organizationRole.value = 'MEMBER'
    }

    // 2. 조직 상세 정보 조회
    try {
        const orgRes = await api.get(`/organizations/${orgId}`)
        console.log('조직 정보 조회 응답:', orgRes.data)
        organizationName.value = orgRes.data.name || '조직명'
        organizationImage.value = orgRes.data.imageUrl || null
    } catch (err) {
        console.error('조직 정보 조회 실패:', err)
        console.error('에러 상세:', err.response?.data)
        organizationName.value = '조직'
        organizationImage.value = null
    }

    // 3. 현재 사용자 정보 조회 (선택적)
    try {
        const userRes = await api.get(`/members/me`)
        console.log('사용자 정보 조회 응답:', userRes.data)
        userNickname.value = userRes.data.nickname || '사용자'
    } catch (err) {
        console.error('사용자 정보 조회 실패 (선택적):', err)
        console.error('에러 상세:', err.response?.data)
        userNickname.value = '사용자'
    }

    organizationId.value = orgId

    console.log('Organization Info Loaded:', {
        role: organizationRole.value,
        name: organizationName.value,
        image: organizationImage.value,
        user: userNickname.value
    })
}
