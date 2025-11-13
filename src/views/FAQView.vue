<template>
    <div class="faq-container">
    <h2 class="faq-title">FAQ</h2>
    <p class="faq-subtitle">자주 묻는 질문을 확인해보세요.</p>

    <div class="faq-list">
        <div
            v-for="(item, index) in faqs"
            :key="index"
            class="faq-item"
        >
            <div class="faq-question" @click="toggle(index)">
            <strong>Q.</strong> {{ item.question }}
            <span class="arrow" :class="{ open: opened[index] }">▼</span>
            </div>

            <div
            class="faq-answer"
            v-if="opened[index]"
            >
            <strong>A.</strong> {{ item.answer }}
            </div>
        </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

const opened = reactive({})

const toggle = (i) => {
    opened[i] = !opened[i]
}

const faqs = ref([
    {
        question: "예약은 어떻게 진행하나요?",
        answer: "원하는 회의실과 날짜를 선택한 뒤, 예약 가능한 시간대를 선택하여 예약하실 수 있습니다."
    },
    {
        question: "예약을 취소하고 싶어요.",
        answer: "내 예약 페이지에서 취소 버튼을 눌러 예약을 취소할 수 있습니다."
    },
    {
        question: "예약 오픈 시간이란 무엇인가요?",
        answer: "회의실 또는 조직마다 예약이 가능한 시간이 정해져 있으며, 해당 시간이 되면 예약이 가능합니다."
    },
    {
        question: "조직 관리자만 이용 가능한 메뉴가 있나요?",
        answer: "네. 회의실 관리, 조직 관리, 공지사항 관리는 관리자만 접근 가능합니다."
    },
    {
        question: "인증 사진은 필수인가요?",
        answer: "필수는 아니지만, 회의실 이용 규칙에 따라 필요할 수 있습니다."
    }
])
</script>

<style scoped>
.faq-container {
    max-width: 750px;
    margin: 60px auto;
    padding: 0 20px;
    font-family: 'Noto Sans KR', sans-serif;
}

.faq-title {
    font-size: 28px;
    font-weight: 700;
    color: #0c1c54;
    text-align: center;
}

.faq-subtitle {
    font-size: 14px;
    color: #555;
    text-align: center;
    margin-bottom: 35px;
}

.faq-list {
    margin-top: 20px;
}

.faq-item {
    border-bottom: 1px solid #ddd;
    padding: 18px 0;
}

.faq-question {
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    font-size: 15px;
    font-weight: 600;
    color: #333;
}

.faq-question:hover {
    color: #0aa2eb;
}

.arrow {
    transition: 0.2s ease;
    font-size: 14px;
}

.arrow.open {
    transform: rotate(180deg);
}

.faq-answer {
    margin-top: 10px;
    padding-left: 5px;
    font-size: 14px;
    color: #666;
    line-height: 1.6;
    white-space: pre-wrap;
}
</style>
