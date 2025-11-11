import { ref } from 'vue'

// 전역 상태 (싱글톤 패턴)
const isPanelOpen = ref(false)
const selectedOrganization = ref(null)

/**
 * 채팅 패널 전역 상태 관리 Composable
 * @returns {object} 채팅 패널 상태 및 메서드
 */
export function useChatPanel() {
  // 패널 열기
  const openPanel = () => {
    isPanelOpen.value = true
  }

  // 패널 닫기
  const closePanel = () => {
    isPanelOpen.value = false
    // 패널이 닫힐 때 선택된 조직 초기화는 ChatSidePanel에서 처리
  }

  // 패널 토글
  const togglePanel = () => {
    isPanelOpen.value = !isPanelOpen.value
  }

  // 조직 선택 (패널 열면서 바로 채팅 화면으로 이동)
  const openChatWithOrganization = (organization) => {
    selectedOrganization.value = organization
    isPanelOpen.value = true
  }

  return {
    // 상태
    isPanelOpen,
    selectedOrganization,

    // 메서드
    openPanel,
    closePanel,
    togglePanel,
    openChatWithOrganization
  }
}
