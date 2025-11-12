<template>
  <div v-if="visible" class="modal-overlay" @click.self="onCancel">
    <div class="modal-content">
      <div class="modal-body">
        <h2 class="modal-title">{{ title }}</h2>
        <p class="modal-message">{{ message }}</p>
      </div>

      <div class="modal-actions">
        <button class="btn-cancel" @click="onCancel">취소</button>
        <button class="btn-confirm" @click="onConfirm">확인</button>
      </div>
    </div>
  </div>
</template>


<script setup>
defineProps({
  visible: { type: Boolean, required: true },
  title: { type: String, default: '알림' },
  message: { type: String, default: '' },
})
const emit = defineEmits(['confirm', 'cancel'])

const onConfirm = () => emit('confirm')
const onCancel = () => emit('cancel')
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

/* 본체 */
.modal-content {
  width: 360px;
  background-color: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  text-align: center;
  font-family: 'Noto Sans KR', sans-serif;
  display: flex;
  flex-direction: column;
}

/* 상단 내용부 */
.modal-body {
  padding: 24px 24px 0 24px;
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 16px;
}

.modal-message {
  font-size: 15px;
  color: #666;
  margin-bottom: 32px;
  line-height: 1.5;
}

/* 버튼 영역 (꽉 차게) */
.modal-actions {
  display: flex;
  width: 100%;
  border-top: 1px solid #e9e9e9;
}

.modal-actions button {
  flex: 1;
  height: 48px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-cancel {
  background-color: #f4f4f4;
  color: #222;
}

.btn-cancel:hover {
  background-color: #e4e4e4;
}

.btn-confirm {
  background-color: #f5c843;
  color: #000;
}

.btn-confirm:hover {
  background-color: #e7b932;
}
</style>
