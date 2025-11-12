<template>
  <div class="test-container">
    <h2>모달 테스트</h2>
    <button @click="showModal = true">회의실 등록 완료 모달 열기</button>

    <BaseModal
      v-if="showModal"
      :visible="showModal"
      title="회의실 등록 완료"
      message="회의실 등록이 완료되었습니다."
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'

const showModal = ref(false)

const handleConfirm = () => {
  alert('확인 클릭됨 ✅')
  showModal.value = false
}

const handleCancel = () => {
  alert('취소 클릭됨 ❌')
  showModal.value = false
}
</script>

<style scoped>
.test-container {
  padding: 40px;
  text-align: center;
}
</style>
