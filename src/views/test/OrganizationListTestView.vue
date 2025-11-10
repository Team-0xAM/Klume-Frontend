<template>
  <div class="org-list-container">
    <h2>내가 가입한 조직</h2>
    <div class="org-list">
      <OrganizationCard
        v-for="org in organizations"
        :key="org.id"
        :id="org.id"
        :title="org.title"
        :description="org.description"
        :imageUrl="org.imageUrl"
      />
    </div>
  </div>
</template>

<script setup>
import OrganizationCard from '@/components/common/OrganizationCard.vue'

const organizations = [
  {
    id: 1,
    title: '한화시스템 BEYOND SW캠프',
    description: '한화시스템 오프라인 백엔드 개발 부트캠프',
    imageUrl: '' // 이미지 없음
  },
  {
    id: 2,
    title: 'KLÜME DevOps 팀',
    description: 'CI/CD 및 서버 인프라 관리 조직',
    imageUrl: 'https://your-bucket.s3.ap-northeast-2.amazonaws.com/klume_devops.png'
  }
]
</script>

<style scoped>
.org-list-container {
  padding: 40px 60px;
  background-color: #f6f6f6;
  min-height: 100vh;
}

.org-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 20px;
}
</style>
