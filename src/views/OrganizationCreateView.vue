<template>
  <div class="organization-create-container">
    <div class="form-card">
      <h2 class="title">조직 새로 생성하기</h2>
      <h3 class="suborg">조직</h3>
      <p class="subtitle">조직에 대한 정보를 입력해주세요</p>

      <div class="form-section">
        <div class="form-row">
          <label>조직명 <span class="required">*</span></label>
          <input
            v-model="form.name"
            type="text"
            placeholder="회사 또는 조직명을 입력해주세요"
          />
        </div>

        <div class="form-row">
          <label>조직 설명 <span class="required">*</span></label>
          <textarea
            v-model="form.description"
            placeholder="조직에 대한 설명을 입력해주세요"
          ></textarea>
        </div>

        <div class="form-row">
          <label>닉네임 <span class="required">*</span></label>
          <input
            v-model="form.nickname"
            type="text"
            placeholder="조직에서 사용할 닉네임을 입력해주세요"
          />
        </div>

        <div class="form-row">
          <label>조직 이미지</label>
          <input type="file" @change="handleFileChange" />
        </div>
      </div>

      <div class="button-group">
        <button class="btn-back" @click="goBack">이전</button>
        <button class="btn-submit" @click="handleSubmit">조직 생성하기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/api/axios'

const router = useRouter()

const form = ref({
  name: '',
  description: '',
  nickname: '',
  image: null,
})

const handleFileChange = (e) => {
  form.value.image = e.target.files[0]
}

const goBack = () => {
  router.push('/organization')
}

/**
 * ✅ 조직 생성 요청
 * 백엔드 API: POST /organizations (multipart/form-data)
 */
const handleSubmit = async () => {
  if (!form.value.name || !form.value.description || !form.value.nickname) {
    alert('필수 항목을 모두 입력해주세요.')
    return
  }

  try {
    // FormData 생성
    const formData = new FormData()

    // requestDTO를 JSON으로 변환하여 추가
    const requestDTO = {
      name: form.value.name,
      description: form.value.description,
      nickname: form.value.nickname
    }

    // JSON을 Blob으로 변환하여 추가
    const requestDTOBlob = new Blob([JSON.stringify(requestDTO)], {
      type: 'application/json'
    })
    formData.append('requestDTO', requestDTOBlob)

    // 이미지 파일이 있으면 추가
    if (form.value.image) {
      formData.append('image', form.value.image)
    }

    // 백엔드 API 호출: POST /organizations
    const res = await axios.post('/organizations', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    alert('조직이 성공적으로 생성되었습니다!')
    // 성공 후 조직 페이지로 이동
    router.push('/organization')
  } catch (err) {
    console.error(err)
    // 에러 메시지 처리
    if (err.response?.data?.message) {
      alert(err.response.data.message)
    } else if (err.response?.status === 404) {
      alert('회원 정보를 찾을 수 없습니다.')
    } else {
      alert('조직 생성에 실패했습니다.')
    }
  }
}
</script>

<style scoped>
.organization-create-container {
  background-color: #f8f9fb;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 50px 50px;
  width: 100%;
  max-width: 540px; /* 컴팩트하게 조정 */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

/* 타이틀 영역 */
.title {
  font-size: 25px;
  font-weight: bold;
  font-weight: 700;
  color: #0c1e3d; /* 네이비 */
  margin-bottom: 25px;
  text-align: left; /* 왼쪽 정렬 */
}
.suborg {
    font-weight: bold;
}
.subtitle {
  text-align: left;
  color: #555;
  font-size: 14px;
  margin-top: 10px;
  margin-bottom: 35px;
}

/* 폼 섹션 */
.form-section {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.form-row label {
  flex: 0 0 120px;
  font-weight: 600;
  color: #111;
}

.required {
  color: #ff4d4f;
  margin-left: 3px;
}

.form-row input,
.form-row textarea {
  flex: 1;
  border: 1px solid #dcdcdc;
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 14px;
}

.form-row textarea {
  resize: none;
  height: 80px;
}

/* 버튼 영역 */
.button-group {
  display: flex;
  justify-content: space-between;
  gap: 30px; /* 버튼 간격 좁게 */
  margin-top: 32px;
}

.btn-back{
  flex: 1;
  padding: 12px 0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 100;
  font-size: 14px;
}
.btn-submit {
  flex: 1;
  padding: 12px 0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
}

/* 버튼 개별 스타일 */
.btn-back {
  background: #e0e0e0;
  color: #333;
}

.btn-submit {
  background: #13294b;
  color: #fff;
}

.btn-submit:hover {
  background: #001f3f;
}

</style>
