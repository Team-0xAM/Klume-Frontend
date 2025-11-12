<template>
    <div class="org-info-manage">
        <h2 class="section-title">조직 정보 관리</h2>
        <p class="section-subtitle">조직 정보를 확인하고 수정할 수 있는 공간입니다.</p>

        <div class="content-box">
            <div class="image-section">
                <div class="image-preview" @click="isEditing && onUploadClick()">
                    <img v-if="previewUrl" :src="previewUrl" alt="Organization Image" />
                    <div v-else class="placeholder">
                        <p>Drag file to upload</p>
                    </div>
                    <input ref="fileInput" type="file" accept="image/*" @change="onFileChange" hidden />
                </div>

                <div class="image-buttons" v-if="isEditing">
                    <button class="btn-upload" @click="onUploadClick">사진 업로드</button>
                    <button class="btn-delete" @click="removeImage" :disabled="!previewUrl">사진 삭제</button>
                </div>
            </div>

            <div class="form-section">
                <div class="form-group">
                    <label>조직명</label>
                    <input v-model="form.name" type="text" :readonly="!isEditing" />
                </div>

                <div class="form-group">
                    <label>설명</label>
                    <textarea v-model="form.description" :readonly="!isEditing"></textarea>
                </div>

                <div class="btn-area">
                    <button v-if="!isEditing" class="btn-edit" @click="toggleEdit(true)">수정하기</button>
                    <div v-else class="edit-buttons">
                        <button class="btn-cancel" @click="cancelEdit">취소</button>
                        <button class="btn-save" @click="onSubmit">저장하기</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import axios from '@/api/axios'
import { useRoute } from 'vue-router'

const route = useRoute()
const organizationId = route.params.organizationId

const form = reactive({
    name: '',
    description: '',
})
const original = reactive({
    name: '',
    description: '',
    imageUrl: '',
})
const previewUrl = ref('')
const imageFile = ref(null)
const fileInput = ref(null)
const isEditing = ref(false)

// 조직 정보 조회
onMounted(async () => {
    try {
        const res = await axios.get(`/organizations/${organizationId}`)
        form.name = res.data.name
        form.description = res.data.description
        previewUrl.value = res.data.imageUrl || ''
        Object.assign(original, res.data)
    } catch (e) {
        console.error('조직 정보 조회 실패:', e)
    }
})

// 수정 모드 전환
const toggleEdit = (value) => {
    isEditing.value = value
}

// 파일 업로드
const onUploadClick = () => fileInput.value.click()
const onFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    imageFile.value = file
    previewUrl.value = URL.createObjectURL(file)
}

// 이미지 제거
const removeImage = () => {
    imageFile.value = null
    previewUrl.value = ''
    fileInput.value.value = ''
}

// 수정 취소
const cancelEdit = () => {
    form.name = original.name
    form.description = original.description
    previewUrl.value = original.imageUrl || ''
    imageFile.value = null
    toggleEdit(false)
}

// 수정 저장
const onSubmit = async () => {
    if (!form.name.trim()) {
        alert('조직명을 입력해주세요.')
        return
    }

    const formData = new FormData()

    if (imageFile.value) formData.append('image', imageFile.value)

    // 조직 정보 DTO
    formData.append(
        'requestDTO',
        new Blob([JSON.stringify({ name: form.name, description: form.description })], {
            type: 'application/json',
        })
    )

    try {
        const res = await axios.put(`/organizations/${organizationId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        alert('조직 정보가 수정되었습니다.')
        Object.assign(original, res.data)
        toggleEdit(false)
    } catch (e) {
        console.error('조직 정보 수정 실패:', e)
        alert('수정 중 오류가 발생했습니다.')
    }
}

</script>

<style scoped>
.org-info-manage {
    padding: 10px;
    font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
}

.section-title {
    font-size: 22px;
    font-weight: 700;
    color: #1b3b8b;
    margin-bottom: 4px;
}

.section-subtitle {
    font-size: 14px;
    color: #777;
    margin-bottom: 24px;
}

/* 콘텐츠 레이아웃 */
.content-box {
    display: flex;
    gap: 50px;
    background: #fff;
    border-radius: 12px;
    padding: 36px;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
}

/* 이미지 업로드 섹션 */
.image-section {
    flex: 0 0 260px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.image-preview {
    width: 220px;
    height: 220px;
    border: 1px dashed #ccc;
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.image-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.placeholder {
    color: #999;
    text-align: center;
    font-size: 14px;
}

.image-buttons {
    display: flex;
    gap: 10px;
    margin-top: 14px;
}

.btn-upload,
.btn-delete {
    border: 1px solid #ccc;
    border-radius: 6px;
    background: white;
    padding: 6px 14px;
    font-size: 14px;
    cursor: pointer;
}

.btn-upload:hover {
    border-color: #1b3b8b;
    color: #1b3b8b;
}

.btn-delete:hover:not(:disabled) {
    border-color: #c00;
    color: #c00;
}

/* 폼 */
.form-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.form-group label {
    display: block;
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 8px;
}

.form-group input,
.form-group textarea {
    width: 100%;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 14px;
}

.form-group textarea {
    min-height: 100px;
    resize: none;
}

/* 버튼 영역 */
.btn-area {
    display: flex;
    justify-content: flex-end;
}

.btn-edit,
.btn-save,
.btn-cancel {
    border: none;
    border-radius: 8px;
    padding: 10px 24px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
}

.btn-edit {
    background-color: #1b3b8b;
    color: #fff;
}

.edit-buttons {
    display: flex;
    gap: 10px;
}

.btn-save {
    background-color: #1b3b8b;
    color: #fff;
}

.btn-cancel {
    background-color: #ddd;
    color: #333;
}

.btn-save:hover {
    background-color: #0f2970;
}

.btn-cancel:hover {
    background-color: #bbb;
}
</style>
