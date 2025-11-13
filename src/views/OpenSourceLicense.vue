<template>
  <div class="license-wrapper">
    <!-- 상단 헤더 -->
    <header class="header" @click="goHome">
      <div class="header-inner">
        <h1>오픈소스 라이선스</h1>
        <p class="header-sub">Klume 서비스에서 사용된 오픈소스 목록입니다.</p>
      </div>
    </header>

    <!-- 본문 카드 -->
    <main class="content">
      <section class="card">
        <h2>사용된 오픈소스 목록</h2>
        <p class="desc">
          Klume 서비스는 다음 오픈소스 소프트웨어를 활용하며, 각 라이선스 및 저작권을 준수합니다.
        </p>

        <div class="scroll-area">
          <pre class="license-text">{{ licenseText }}</pre>
        </div>
      </section>

      <section class="footer-card">
        <p>© 2025 ThreeGo. All rights reserved.</p>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const licenseText = ref('')

const goHome = () => router.push('/')

onMounted(async () => {
  try {
    const res = await fetch('/license.txt')
    licenseText.value = await res.text()
  } catch (err) {
    licenseText.value = '라이선스 정보를 불러올 수 없습니다.'
  }
})
</script>

<style scoped>
:root {
  --primary: #0c1c54;
  --accent: #3a7afe;
  --bg: #f4f6fb;
  --card-bg: #ffffff;
  --border: #e6e8f0;
}

.license-wrapper {
  background: var(--bg);
  min-height: 100vh;
  font-family: "Noto Sans KR", sans-serif;
}

/* Header */
.header {
  background: linear-gradient(90deg, #0c1c54, #09317a);
  padding: 30px;
  color: white;
  cursor: pointer;
}

.header-inner {
  max-width: 1000px;
  margin: 0 auto;
}

.header h1 {
  font-size: 26px;
  margin: 0;
  font-weight: 700;
}

.header-sub {
  margin-top: 6px;
  font-size: 14px;
  opacity: 0.85;
}

/* Content */
.content {
  max-width: 1000px;
  margin: 30px auto;
  padding: 0 20px;
}

.card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border);
  margin-bottom: 20px;
}

.card h2 {
  margin: 0 0 10px;
  font-size: 20px;
  color: var(--primary);
}

.desc {
  font-size: 14px;
  color: #555;
  margin-bottom: 16px;
}

/* Scroll Area */
.scroll-area {
  max-height: 420px;
  overflow-y: auto;
  border-radius: 8px;
  border: 1px solid var(--border);
  padding: 14px;
  background: #fafbff;
}

.license-text {
  white-space: pre-wrap;
  font-family: "Courier New", monospace;
  font-size: 13px;
  color: #222;
}

/* Footer */
.footer-card {
  text-align: center;
  padding: 16px;
  font-size: 13px;
  color: #777;
}
</style>
