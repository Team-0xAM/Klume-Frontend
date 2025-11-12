<template>
  <div class="modal-overlay">
    <div class="modal">
      <h2>회의실 추가</h2>

      <form @submit.prevent="submit">
        <div class="form-group">
          <label>회의실 이름<span class="required">*</span></label>
          <input v-model="form.name" type="text" placeholder="회의실 이름을 입력해주세요" required />
        </div>

        <div class="form-group">
          <label>회의실 이미지</label>
          <input type="file" @change="onFileChange" />
        </div>

        <div class="form-group">
          <label>수용 가능 인원<span class="required">*</span></label>
          <input v-model="form.capacity" type="number" placeholder="수용 가능 인원을 입력해주세요 (ex. 6)" required />
        </div>

        <div class="form-group">
          <label>설명</label>
          <textarea v-model="form.description" placeholder="회의실 내 물품, 사용 시 주의사항 등의 설명을 입력해주세요"></textarea>
        </div>

        <div class="button-group">
          <button type="button" class="cancel-btn" @click="$emit('close')">이전</button>
          <button type="submit" class="submit-btn">회의실 추가하기</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { createRoom } from '@/api/room/roomApi.js'
import { useRouter } from 'vue-router'

const props = defineProps({
  organizationId: { type: Number, required: true }
})
const emit = defineEmits(['close', 'saved'])

const form = ref({
  name: '',
  description: '',
  capacity: 0
})
const imageFile = ref(null)
const router = useRouter()

function onFileChange(e) {
  imageFile.value = e.target.files[0] || null
}

async function submit() {
  if (!form.value.name) return alert("회의실 이름을 입력하세요.")

  try {
    const { data } = await createRoom(props.organizationId, form.value, imageFile.value)
    router.push(`/organization/${props.organizationId}/admin/rooms/${data.id}`)
  } catch (e) {
    console.error(e)
    alert("회의실 등록 실패")
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.modal {
  background: #fff;
  padding: 40px;
  border-radius: 10px;
  width: 600px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

h2 {
  font-size: 20px;
  font-weight: 700;
  color: #002b87;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 18px;
}

label {
  display: block;
  font-weight: 600;
  margin-bottom: 6px;
  color: #222;
}

.required {
  color: red;
  margin-left: 2px;
}

input,
textarea {
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 10px;
  font-size: 14px;
  box-sizing: border-box;
}

textarea {
  resize: none;
  height: 80px;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.cancel-btn,
.submit-btn {
  padding: 10px 18px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
}

.cancel-btn {
  background-color: #e5e5e5;
  color: #333;
  margin-right: 10px;
}

.submit-btn {
  background-color: #002b87;
  color: #fff;
}

.submit-btn:hover {
  background-color: #0044cc;
}
</style>
