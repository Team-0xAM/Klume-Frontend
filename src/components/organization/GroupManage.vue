<template>
    <div class="group-manage">
        <h2 class="section-title">그룹 관리</h2>
        <p class="section-subtitle">조직 내 그룹을 생성하고 관리할 수 있습니다.</p>

        <div class="content-box">
        <!-- 그룹 목록 -->
        <div class="group-list">
            <div class="list-header">
            <button class="btn-add" @click="openAddModal">+ 그룹 추가</button>
            </div>

            <table v-if="groups.length > 0" class="group-table">
            <thead>
                <tr>
                <th>No</th>
                <th>그룹명</th>
                <th>설명</th>
                <th>멤버 수</th>
                <th>관리</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(group, i) in groups" :key="group.organizationGroupId">
                <td>{{ i + 1 }}</td>
                <td>{{ group.name }}</td>
                <td>{{ group.description || '-' }}</td>
                <td>{{ group.memberCount ?? 0 }}</td>
                <td>
                    <button class="btn-action" @click="openEditModal(group)">수정</button>
                    <button class="btn-action danger" @click="removeGroup(group)">삭제</button>
                </td>
                </tr>
            </tbody>
            </table>

            <div v-else class="empty-state">
            등록된 그룹이 없습니다.
            </div>
        </div>
        </div>

        <!-- 그룹 추가/수정 모달 -->
        <div v-if="showModal" class="modal-overlay">
        <div class="modal">
            <h3>{{ editMode ? '그룹 수정' : '그룹 추가' }}</h3>
            <input v-model="form.name" placeholder="그룹명" class="input" />
            <textarea v-model="form.description" placeholder="그룹 설명" class="textarea"></textarea>
            <div class="modal-actions">
            <button @click="saveGroup" class="btn-save">저장</button>
            <button @click="closeModal" class="btn-cancel">취소</button>
            </div>
        </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getGroups, createGroup, updateGroup, deleteGroup } from '@/api/organization/group'

const props = defineProps({
    organizationId: {
        type: Number,
        required: true
    }
})

const route = useRoute()
const organizationId = Number(route.params.organizationId)
const groups = ref([])

const showModal = ref(false)
const editMode = ref(false)
const form = ref({ name: '', description: '', organizationGroupId: null })

async function fetchGroups() {
    try {
        const { data } = await getGroups(organizationId)
        groups.value = data.map(g => ({
        organizationGroupId: g.organizationGroupId ?? g.organization_group_id,
        name: g.name,
        description: g.description,
        memberCount: g.memberCount ?? g.member_count
        }))
    } catch (err) {
        console.error('그룹 목록 조회 실패:', err)
    }
}

function openAddModal() {
    editMode.value = false
    form.value = { name: '', description: '' }
    showModal.value = true
}

function openEditModal(group) {
    editMode.value = true
    form.value = {
        organizationGroupId: group.organizationGroupId ?? group.organization_group_id ?? group.id,
        name: group.name,
        description: group.description || ''
    }
    showModal.value = true
}

function closeModal() {
    showModal.value = false
}

async function saveGroup() {
    try {
        if (!form.value.name.trim()) {
        alert('그룹명을 입력해주세요.')
        return
    }

    const orgId = props.organizationId
    console.log('🧩 수정 요청')
    console.log('organizationId:', orgId)
    console.log('organizationGroupId:', form.value.organizationGroupId)
    console.log('요청 URL:', `/organizations/${orgId}/groups/${form.value.organizationGroupId}`)

    if (editMode.value) {
            console.log('PUT URL:', `/organizations/${organizationId}/groups/${form.value.organizationGroupId}`)
        await updateGroup(organizationId, form.value.organizationGroupId, {
            name: form.value.name,
            description: form.value.description
        })
        } else {
        await createGroup(organizationId, {
            name: form.value.name,
            description: form.value.description
        })
        }

        await fetchGroups()
        closeModal()
    } catch (err) {
        console.error('그룹 저장 실패:', err)
        alert('그룹 저장 중 오류가 발생했습니다.')
    }
}

async function removeGroup(group) {
    if (!confirm(`그룹 "${group.name}"을(를) 삭제하시겠습니까?`)) return
    try {
        await deleteGroup(organizationId, group.organizationGroupId)
        await fetchGroups()
    } catch (err) {
        console.error('그룹 삭제 실패:', err)
        alert('삭제 실패: 이미 연결된 멤버가 있거나 권한이 없습니다.')
    }
}

onMounted(fetchGroups)
watch(() => props.organizationId, fetchGroups)
</script>

<style scoped>
.group-manage {
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

/* 콘텐츠 박스 */
.content-box {
    background: #fff;
    border-radius: 12px;
    padding: 36px;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
    min-height: 500px;
}

/* 리스트 헤더 */
.list-header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 20px;
}

.btn-add {
    background-color: #1b3b8b;
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 8px 20px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
}
.btn-add:hover {
    background-color: #0f2970;
}

/* 테이블 */
.group-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
}
.group-table th {
    background: #f8f9fb;
    border-bottom: 1px solid #ddd;
    padding: 12px;
    text-align: center;
    font-weight: 600;
}
.group-table td {
    border-bottom: 1px solid #eee;
    padding: 12px;
    text-align: center;
    color: #333;
}

/* 버튼 */
.btn-action {
    border: 1px solid #1b3b8b;
    color: #1b3b8b;
    background: #fff;
    border-radius: 6px;
    padding: 6px 12px;
    font-size: 13px;
    cursor: pointer;
    margin-right: 6px;
    transition: 0.2s ease;
}
.btn-action:hover {
    background: #1b3b8b;
    color: #fff;
}
.btn-action.danger {
    border-color: #c00;
    color: #c00;
}
.btn-action.danger:hover {
    background: #c00;
    color: #fff;
}

/* 빈 상태 */
.empty-state {
    text-align: center;
    color: #888;
    font-size: 15px;
    padding: 100px 0;
}

/* 모달 */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
}
.modal {
    background: #fff;
    padding: 30px;
    border-radius: 12px;
    width: 400px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
.modal h3 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #1b3b8b;
}
.input,
.textarea {
    width: 100%;
    padding: 10px 12px;
    border-radius: 8px;
    border: 1px solid #ddd;
    font-size: 14px;
    margin-bottom: 12px;
}
.textarea {
    resize: none;
    height: 80px;
}
.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
}
.btn-save {
    background-color: #1b3b8b;
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
}
.btn-cancel {
    background-color: #ddd;
    color: #333;
    border: none;
    border-radius: 8px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
}
.btn-save:hover {
    background-color: #0f2970;
}
.btn-cancel:hover {
    background-color: #bbb;
}
</style>
