<template>
    <div class="group-manage">
        <h2 class="section-title">회원 관리</h2>
        <p class="section-subtitle">조직 내 회원의 정보를 확인하고 권한을 관리할 수 있습니다.</p>

        <div class="content-box">
            <!-- 그룹 목록 -->
            <div class="group-list">
                <p class="total-count">총 {{ members.length }}명</p>
                <table v-if="members.length > 0" class="group-table">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>닉네임</th>
                            <th>소속 그룹</th>
                            <th>패널티 수</th>
                            <th>정지 여부</th>
                            <th>정지 일자</th>
                            <th>권한</th>
                            <th>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(member, index) in members" :key="member.organizationMemberId">
                            <td>{{ index + 1 }}</td>
                            <td>{{ member.nickname }}</td>
                            <td>{{ member.organizationGroupName || '-' }}</td>
                            <td>{{ member.penaltyCount }}</td>
                            <td>
                                <template v-if="member.isBanned == true">
                                    Y
                                </template>
                                <template v-else>
                                    N
                                </template>
                            </td>
                            <td>
                                {{ member.bannedAt || '-' }}
                            </td>
                            <td>
                                <template v-if="member.organizationRole == 'MEMBER'">
                                    사용자
                                </template>
                                <template v-else>
                                    관리자
                                </template>
                            </td>
                            <td>
                                <button class="btn-action" @click="openEditModal(member)">수정</button>
                                <button class="btn-action danger" @click="removeMember(member)">삭제</button>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div v-else class="empty-state">
                    등록된 그룹이 없습니다.
                </div>
            </div>
        </div>

        <!-- 회원 수정 모달 -->
        <div v-if="showModal" class="modal-overlay">
            <div class="modal">
                <h3>회원 정보 수정</h3>

                <div class="modal-field">
                    <label>닉네임</label>
                    <input type="text" :value="selectedMember.nickname" disabled class="input" />
                </div>

                <div class="modal-field">
                    <label>소속 권한</label>
                    <input type="text" :value="selectedMember.organizationGroupName || '-'" disabled class="input" />
                </div>

                <div class="modal-field">
                    <label>패널티 수</label>
                    <div style="display: flex; gap: 10px;">
                        <input type="number" :value="selectedMember.penaltyCount" disabled class="input" />
                        <button class="btn-reset" @click="resetPenalty">0으로 초기화</button>
                    </div>
                    <p class="desc">패널티를 0으로 설정하면 정지 기록이 초기화됩니다.</p>
                </div>

                <div class="modal-field">
                    <label>정지 일자</label>
                    <input type="text" :value="selectedMember.bannedAt || '-'" disabled class="input" />
                </div>

                <div class="modal-field">
                    <label>권한</label>
                    <select v-model="selectedRole" class="input">
                        <option value="MEMBER">사용자</option>
                        <option value="ADMIN">관리자</option>
                    </select>
                </div>

                <div class="modal-actions">
                    <button class="btn-cancel" @click="closeModal">취소</button>
                    <button class="btn-save" @click="saveRole">저장</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getOrganizationMembers, updatePenalty, updateRole, kickMember } from '@/api/organization/organizationMember';

const props = defineProps({
    organizationId: {
        type: Number,
        required: true
    }
});

const route = useRoute();
const organizationId = Number(route.params.organizationId);
const members = ref([]);

const showModal = ref(false);

function closeModal() {
    showModal.value = false
}

async function fetchMembers() {
    try {
        const { data } = await getOrganizationMembers(organizationId);

        members.value = data.map(member => ({
            organizationMemberId: member.organizationMemberId,
            penaltyCount: member.penaltyCount,
            isBanned: member.isBanned ?? member.banned,
            organizationRole: member.organizationRole,
            bannedAt: member.bannedAt,
            organizationRole: member.organizationRole,
            nickname: member.nickname,
            organizationGroupId: member.organizationGroupId,
            organizationGroupName: member.organizationGroupName
        }));
    } catch (err) {
        console.error('조직 멤버 목록 조회 실패:', err);
    }
}

const selectedMember = ref(null);
const selectedRole = ref('MEMBER');

function openEditModal(member) {
    selectedMember.value = { ...member };
    selectedRole.value = member.organizationRole;
    showModal.value = true;
}

async function resetPenalty() {
    if (!confirm('패널티를 0으로 초기화하시겠습니까?')) return

    try {
        await updatePenalty(organizationId, selectedMember.value.organizationMemberId);

        alert('패널티가 초기화되었습니다.');

        await fetchMembers();

        const updated = members.value.find(m =>
            m.organizationMemberId === selectedMember.value.organizationMemberId
        );

        if (updated) selectedMember.value = { ...updated };
    } catch (err) {
        console.error('패널티 초기화 실패:', err);
        alert('초기화 실패');
    }
}

async function saveRole() {
    try {
        await updateRole(organizationId, selectedMember.value.organizationMemberId, { organizationRole: selectedRole.value });

        alert('권한이 수정되었습니다.');

        await fetchMembers()

        const updated = members.value.find(m =>
            m.organizationMemberId === selectedMember.value.organizationMemberId
        );

        if (updated) selectedMember.value = { ...updated };
    } catch (err) {
        console.error('권한 수정 실패:', err);
        alert('권한 수정 실패');
    }
}

async function removeMember(member) {
    console.log(organizationId);
    if (!confirm(`${member.organizationGroupName ?? ''} ${member.nickname}을(를) 삭제하시겠습니까?`)) return

    try {
        await kickMember(organizationId, member.organizationMemberId);

        await fetchMembers();
    } catch (err) {
        console.error('조직 멤버 삭제 실패:', err);
        alert('삭제 실패: 이미 연결된 멤버가 있거나 권한이 없습니다.');
    }
}

onMounted(fetchMembers);

watch(() => props.organizationId, fetchMembers);
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

.total-count {
    font-size: 14px;
    color: #0B174E;
    font-weight: 500;
    margin-bottom: 16px;
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
    padding: 10px;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal {
    position: absolute;
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

.input{
    width: 100%;
    padding: 10px 12px;
    border-radius: 8px;
    border: 1px solid #ddd;
    font-size: 14px;
    margin-bottom: 12px;
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

.modal-field {
    margin-bottom: 16px;
}

.modal-field label {
    display: block;
    font-size: 14px;
    margin-bottom: 6px;
    color: #333;
    font-weight: 500;
}

.btn-reset {
    background: #f6c343;
    border: none;
    padding: 8px 14px;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
    width: 300px;
}

.btn-reset:hover {
    background: #e8b231;
}

.desc {
    font-size: 12px;
    color: #777;
}
</style>
