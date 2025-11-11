<template>
  <div class="organization-join-container">
    <div class="form-card">
      <h2 class="title">초대코드로 조직 가입하기</h2>
      <h3 class="suborg">조직</h3>
      <p class="subtitle">받은 초대코드를 입력해 팀의 공간에 참여해보세요</p>

      <div class="form-section">
        <!-- 초대 코드 -->
        <div class="form-row">
          <label>초대 코드 <span class="required">*</span></label>
          <div class="input-inline">
            <input
              v-model="form.inviteCode"
              type="text"
              placeholder="초대 코드를 입력해주세요"
            />
            <button class="btn-check" @click="checkCode">확인</button>
          </div>
          <p class="input-hint">관리자에게 30분 이내 공유받은 초대코드를 입력해주세요</p>

          <!-- ✅ 코드 확인 후 조직명 표시 -->
          <p v-if="organizationName" class="valid-code">
            ✅ {{ organizationName }} 조직 코드가 확인되었습니다.
          </p>
          <p v-if="codeError" class="error-message">
            ❌ {{ codeError }}
          </p>
        </div>

        <!-- 닉네임 -->
        <div class="form-row">
          <label>닉네임 <span class="required">*</span></label>
          <input
            v-model="form.nickname"
            type="text"
            placeholder="조직에서 사용할 닉네임을 입력해주세요"
          />
        </div>

        <!-- 그룹 선택 -->
        <div class="form-row" v-if="availableGroups.length > 0">
          <label>그룹 선택</label>
          <select v-model="form.group">
            <option disabled value="">그룹을 선택해주세요</option>
            <option v-for="group in availableGroups" :key="group.organizationGroupId" :value="group.organizationGroupId">
              {{ group.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- 하단 버튼 -->
      <div class="button-group">
        <button class="btn-back" @click="goBack">이전</button>
        <button class="btn-submit" @click="handleJoin">조직 가입하기</button>
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
  inviteCode: '',
  nickname: '',
  group: '',
})

const availableGroups = ref([])
const organizationName = ref('')
const organizationId = ref(null)
const organizationDescription = ref('')
const organizationImageUrl = ref('')
const codeChecked = ref(false)
const codeError = ref('')

const goBack = () => {
  router.push('/organization')
}

/**
 * ✅ 초대 코드 확인 요청
 * 백엔드 API: POST /organizations/invitations/validation
 */
const checkCode = async () => {
  if (!form.value.inviteCode.trim()) {
    alert('초대 코드를 입력해주세요.')
    return
  }

  codeError.value = ''
  organizationName.value = ''
  organizationId.value = null
  availableGroups.value = []

  try {
    // 1. 백엔드 API 호출: POST /organizations/invitations/validation
    const res = await axios.post('/organizations/invitations/validation', {
      code: form.value.inviteCode
    })

    // 응답 형식: { organizationId, name, description, imageUrl }
    organizationId.value = res.data.organizationId
    organizationName.value = res.data.name
    organizationDescription.value = res.data.description
    organizationImageUrl.value = res.data.imageUrl
    codeChecked.value = true

    // 2. 조직 그룹 목록 가져오기 (선택적)
    try {
      const groupsRes = await axios.get(`/organizations/${organizationId.value}/groups`)
      // 응답 형식: [{ organizationGroupId, name, organizationId }, ...]
      availableGroups.value = groupsRes.data || []
    } catch (groupErr) {
      console.warn('그룹 목록을 가져오는데 실패했습니다:', groupErr)
      // 그룹 목록을 못 가져와도 코드 검증은 성공으로 처리
      availableGroups.value = []
    }
  } catch (err) {
    console.error(err)
    // 에러 메시지 처리
    if (err.response?.data?.message) {
      codeError.value = err.response.data.message
    } else if (err.response?.status === 400) {
      codeError.value = '초대 코드가 만료되었거나 유효하지 않습니다.'
    } else if (err.response?.status === 409) {
      codeError.value = '이미 해당 조직의 멤버입니다.'
    } else {
      codeError.value = '유효하지 않은 초대 코드입니다.'
    }
    organizationId.value = null
    availableGroups.value = []
    codeChecked.value = false
  }
}

/**
 * ✅ 실제 조직 가입 요청
 * 백엔드 API: POST /organizations/{organizationId}
 */
const handleJoin = async () => {
  if (!form.value.inviteCode || !form.value.nickname) {
    alert('필수 항목을 모두 입력해주세요.')
    return
  }

  if (!codeChecked.value) {
    alert('먼저 초대 코드를 확인해주세요.')
    return
  }

  if (!organizationId.value) {
    alert('조직 정보를 찾을 수 없습니다. 초대 코드를 다시 확인해주세요.')
    return
  }

  try {
    // 백엔드 API 호출: POST /organizations/{organizationId}
    const requestBody = {
      nickname: form.value.nickname
    }

    // organizationGroupId가 있으면 추가
    if (form.value.group) {
      requestBody.organizationGroupId = parseInt(form.value.group)
    }

    const res = await axios.post(`/organizations/${organizationId.value}`, requestBody)

    alert('조직에 성공적으로 가입했습니다!')
    // 성공 후 조직 페이지로 이동
    router.push('/organization')
  } catch (err) {
    console.error(err)
    // 에러 메시지 처리
    if (err.response?.data?.message) {
      alert(err.response.data.message)
    } else if (err.response?.status === 400) {
      alert('초대 코드가 만료되었거나 유효하지 않습니다.')
    } else if (err.response?.status === 409) {
      alert('이미 해당 조직의 멤버입니다.')
    } else {
      alert('조직 가입에 실패했습니다.')
    }
  }
}
</script>

<style scoped>
.organization-join-container {
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
  max-width: 540px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

/* 제목 */
.title {
  font-size: 25px;
  font-weight: 700;
  color: #0c1e3d;
  margin-bottom: 25px;
  text-align: left;
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

/* 폼 전체 */
.form-section {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-row label {
  font-weight: 600;
  color: #111;
  margin-bottom: 4px;
}

.required {
  color: #ff4d4f;
  margin-left: 3px;
}

/* 인풋 & 버튼 정렬 */
.input-inline {
  display: flex;
  align-items: stretch; /* 높이 맞춤 */
  gap: 10px;
}

.form-row input,
.form-row select {
  border: 1px solid #dcdcdc;
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 14px;
  flex: 1;
}

.btn-check {
  background: #13294b;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0 24px;
  min-width: 90px;
  font-weight: 600;
  cursor: pointer;
}
.btn-check:hover {
  background: #001f3f;
}

/* 안내문 */
.input-hint {
  margin-left: 2px;
  font-size: 12px;
  color: #9c9c9c;
}

.valid-code {
  color: #0c1e3d;
  font-size: 13px;
  font-weight: 600;
  margin-top: 4px;
}

.error-message {
  color: #d93025;
  font-size: 13px;
  margin-top: 4px;
}

/* 하단 버튼 */
.button-group {
  display: flex;
  justify-content: space-between;
  gap: 30px;
  margin-top: 32px;
}

.btn-back {
  flex: 1;
  padding: 12px 0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 100;
  font-size: 14px;
  background: #e0e0e0;
  color: #333;
}

.btn-submit {
  flex: 1;
  padding: 12px 0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  background: #13294b;
  color: #fff;
}

.btn-submit:hover {
  background: #001f3f;
}
</style>
