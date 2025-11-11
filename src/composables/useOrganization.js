import { ref } from 'vue'
import axios from 'axios'

export const organizationName = ref('')
export const organizationId = ref(null)
export const organizationImage = ref(null)
export const userNickname = ref('')
export const organizationRole = ref(null)

export async function fetchOrganizationInfo(orgId) {
    try {
        // 1. 조직 내 사용자 역할 조회
        const roleRes = await axios.get(`/api/organizations/${orgId}/role`)
        organizationRole.value = roleRes.data.role // 'ADMIN' or 'MEMBER'

        // 2. 조직 상세 정보 조회
        const orgRes = await axios.get(`/api/organizations/${orgId}`)
        organizationName.value = orgRes.data.name || '조직명'
        organizationImage.value = orgRes.data.profileImage || null

        // 3. 현재 사용자 정보 조회
        const userRes = await axios.get(`/api/members/me`)
        userNickname.value = userRes.data.nickname || '사용자'

        organizationId.value = orgId

        console.log('Organization Info Loaded:', {
            role: organizationRole.value,
            name: organizationName.value,
            image: organizationImage.value,
            user: userNickname.value
        })
    } catch (err) {
        console.error('조직 정보 로딩 실패', err)
        // 에러 발생 시 기본값 설정
        organizationRole.value = 'MEMBER'
        organizationName.value = '조직'
        userNickname.value = '사용자'
    }
}
