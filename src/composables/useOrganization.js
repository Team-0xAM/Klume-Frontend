import { ref } from 'vue'
import axios from 'axios'

// export const organizationRole = ref(null)
export const organizationName = ref('')
export const organizationId = ref(null)
export const userNickname = ref('')
export const organizationRole = ref("ADMIN")
export async function fetchOrganizationInfo(orgId) {
    try {
        const res = await axios.get(`/organizations/${orgId}/role`, {
        params: { memberId: 7 }, // TODO: 실제 로그인 사용자 ID
    })
    organizationRole.value = res.data.role // 'ADMIN' or 'MEMBER'

    // 추가 정보 (조직명, 닉네임 등)도 불러올 수 있음
    // const info = await axios.get(`/organizations/${orgId}/me`)
    organizationName.value = '한화시스템 BEYOND SW캠프'
    organizationId.value = orgId
    userNickname.value = '민지 매니저'
    } catch (err) {
        console.error('조직 정보 로딩 실패', err)
    }
}
