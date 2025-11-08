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

    <!-- 구분선 -->
    <div class="divider"></div>

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
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.org-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
}

.org-image-wrapper {
  width: 100%;
  aspect-ratio: 4 / 3; 
  background-color: #f8f8f8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.org-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 구분선 */
.divider {
  height: 1px;
  background-color: #e0e0e0;
  width: 100%;
}

/* 텍스트 */
.org-info {
  padding: 16px;
  text-align: left;
}

.org-title {
  font-size: 16px;
  font-weight: 700;
  color: #0c1c54;
  margin-bottom: 8px;
}

/* 한 줄로 고정하고 ... 처리 */
.org-desc {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
