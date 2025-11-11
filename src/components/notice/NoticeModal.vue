<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-box">
      <h3>{{ notice ? '공지사항 수정' : '공지사항 등록' }}</h3>

      <div class="form-group">
        <label>제목</label>
        <input type="text" v-model="form.title" placeholder="제목을 입력하세요" />
      </div>

      <div class="form-group">
        <label>내용</label>
        <textarea v-model="form.content" rows="5" placeholder="내용을 입력하세요"></textarea>
      </div>

      <div class="button-group">
        <button class="btn" @click="close">취소</button>
        <button class="btn primary" @click="save">저장</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({ notice: Object })
const emits = defineEmits(['close', 'save'])

const form = ref({ id: null, title: '', content: '' })

watch(
  () => props.notice,
  (val) => {
    if (val) form.value = { id: val.id, title: val.title, content: val.content }
    else form.value = { id: null, title: '', content: '' }
  },
  { immediate: true }
)

const close = () => emits('close')
const save = () => {
  if (!form.value.title.trim()) return alert('제목을 입력해주세요.')
  emits('save', { ...form.value })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99;
}
.modal-box {
  background: white;
  border-radius: 12px;
  width: 480px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}
.form-group {
  margin-bottom: 16px;
}
label {
  display: block;
  font-weight: 600;
  margin-bottom: 4px;
}
input,
textarea {
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 8px;
  font-size: 14px;
  box-sizing: border-box;
}
.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
}
.btn {
  padding: 8px 14px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}
.btn.primary {
  background-color: #1b3b8b;
  color: white;
}
</style>
