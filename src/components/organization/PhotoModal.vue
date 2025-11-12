<template>
  <div v-if="show" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <button class="close-btn" @click="closeModal">✕</button>
      <h2 class="modal-title">입장 인증 사진 업로드</h2>
      <p class="modal-description">회의실 입장 시 사진을 업로드해주세요.</p>

      <div class="file-input-wrapper">
        <input
          type="file"
          ref="fileInput"
          accept="image/*"
          @change="handleFileChange"
          class="file-input"
        />
        <div v-if="!previewUrl" class="file-placeholder">
          <span class="upload-text">사진 선택</span>
        </div>
        <div v-else class="preview-container">
          <img :src="previewUrl" alt="미리보기" class="preview-image" />
          <button @click="removeFile" class="remove-btn">✕</button>
        </div>
      </div>

      <div class="button-group">
        <button @click="closeModal" class="btn-cancel">취소</button>
        <button
          @click="handleSubmit"
          :disabled="!selectedFile || isSubmitting"
          class="btn-submit"
        >
          {{ isSubmitting ? '제출 중...' : '제출하기' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import api from '@/api/axios';

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  organizationId: {
    type: Number,
    required: true
  },
  reservationId: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['close', 'success']);

const fileInput = ref(null);
const selectedFile = ref(null);
const previewUrl = ref('');
const isSubmitting = ref(false);

watch(() => props.show, (newVal) => {
  if (!newVal) {
    resetModal();
  }
});

function handleFileChange(event) {
  const file = event.target.files[0];
  if (file) {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    selectedFile.value = file;
    previewUrl.value = URL.createObjectURL(file);
  }
}

function removeFile() {
  selectedFile.value = null;
  previewUrl.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}

async function handleSubmit() {
  if (!selectedFile.value || isSubmitting.value) return;

  isSubmitting.value = true;

  try {
    const formData = new FormData();
    formData.append('image', selectedFile.value);

    await api.post(
      `/organizations/${props.organizationId}/reservations/${props.reservationId}/photo`,
      formData,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    alert('입장 사진이 업로드되었습니다.');
    emit('success');
    closeModal();
  } catch (err) {
    console.error('사진 업로드 실패:', err);
    alert('사진 업로드 중 오류가 발생했습니다.');
  } finally {
    isSubmitting.value = false;
  }
}

function closeModal() {
  emit('close');
}

function resetModal() {
  selectedFile.value = null;
  previewUrl.value = '';
  isSubmitting.value = false;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 32px;
  max-width: 500px;
  width: 90%;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #f0f0f0;
}

.modal-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #1a1a1a;
}

.modal-description {
  color: #666;
  margin: 0 0 24px 0;
  font-size: 14px;
}

.file-input-wrapper {
  position: relative;
  margin-bottom: 24px;
}

.file-input {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 2;
}

.file-placeholder {
  border: 2px dashed #d0d0d0;
  border-radius: 8px;
  padding: 48px 24px;
  text-align: center;
  background: #fafafa;
  transition: all 0.2s;
  cursor: pointer;
}

.file-placeholder:hover {
  border-color: #4a90e2;
  background: #f0f7ff;
}

.upload-text {
  color: #666;
  font-size: 16px;
}

.preview-container {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: auto;
  max-height: 300px;
  object-fit: contain;
  display: block;
  background: #f5f5f5;
}

.remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.remove-btn:hover {
  background: rgba(0, 0, 0, 0.8);
}

.button-group {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-cancel,
.btn-submit {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-cancel {
  background: #f0f0f0;
  color: #666;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.btn-submit {
  background: #1e3a8a;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: #1e40af;
}

.btn-submit:disabled {
  background: #d0d0d0;
  cursor: not-allowed;
}
</style>