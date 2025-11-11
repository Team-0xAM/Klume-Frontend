<template>
  <div class="modal-overlay">
    <div class="modal">
      <h2>회의실 수정</h2>

      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label>회의실 이름<span class="required">*</span></label>
          <input v-model="editForm.name" type="text" required />
        </div>

        <div class="form-group">
          <label>수용 가능 인원<span class="required">*</span></label>
          <input v-model="editForm.capacity" type="number" required />
        </div>

        <div class="form-group">
          <label>설명</label>
          <textarea v-model="editForm.description"></textarea>
        </div>

        <div class="button-group">
          <button type="button" class="cancel-btn" @click="$emit('close')">이전</button>
          <button type="submit" class="submit-btn">수정 완료</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue"
import { updateRoom } from "@/api/room/roomApi.js"
import { useRoute } from "vue-router"

const props = defineProps({
  name: String,
  description: String,
  capacity: Number
})

const emit = defineEmits(["close", "save"])

const route = useRoute()
const organizationId = Number(route.params.organizationId)
const roomId = Number(route.params.roomId)

const editForm = ref({
  name: "",
  description: "",
  capacity: 0
})

// 기존 데이터 세팅
watch(
  () => props,
  () => {
    editForm.value.name = props.name
    editForm.value.description = props.description
    editForm.value.capacity = props.capacity
  },
  { immediate: true }
)

async function submitForm() {
  await updateRoom(organizationId, roomId, editForm.value)
  emit("save")   // 부모가 refetch 실행
  emit("close")
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
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
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

h2 {
  font-size: 20px;
  font-weight: 700;
  color: #002b87;
  margin-bottom: 30px;
}

.form-group { margin-bottom: 18px; }

label {
  display: block;
  font-weight: 600;
  margin-bottom: 6px;
}

input,
textarea {
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 10px;
  font-size: 14px;
}

textarea { height: 80px; resize: none; }

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

.required {
  color: red;
  margin-left: 2px;
}
</style>
