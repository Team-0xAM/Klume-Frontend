<template>
  <div class="org-card" @click="goToOrganization">
    <!-- 이미지 영역 -->
    <div class="org-image-wrapper">
      <img
        :src="imageUrl || defaultImage"
        alt="조직 이미지"
        class="org-image"
        @error="onImageError"
      />
    </div>

    <!-- 내용 영역 -->
    <div class="org-info">
      <h3 class="org-title">{{ title }}</h3>
      <p class="org-desc">{{ description }}</p>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import defaultImage from '@/assets/images/no_image.png'

const props = defineProps({
  id: { type: [String, Number], required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, default: null }
})

const router = useRouter()

const onImageError = (event) => {
  event.target.src = defaultImage
}

const goToOrganization = () => {
  router.push(`/organization/${props.id}`)
}
</script>

<style scoped>
.org-card {
  width: 260px;
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.org-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
}

/* ✅ 이미지가 카드 상단을 꽉 채우게 */
.org-image-wrapper {
  width: 100%;
  height: 180px; /* 이미지 영역 고정 높이 */
  background-color: #f8f9fb;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.org-image {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 이미지가 영역을 가득 채우되 비율 유지 */
}

/* ✅ 텍스트 영역 */
.org-info {
  padding: 14px 16px 18px;
  background-color: #fff;
  text-align: left;
  border-top: 1px solid #e6e8f0;
  flex-shrink: 0;
}

.org-title {
  font-size: 15px;
  font-weight: 700;
  color: #0c1c54;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.org-desc {
  font-size: 13px;
  color: #555e7b;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
