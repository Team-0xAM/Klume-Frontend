<template>
    <div class="license-page">
        <!-- 헤더 -->
        <header>
            <div class="container header-content" @click="goHome">
                <h1>오픈소스 라이선스</h1>
            </div>
        </header>

        <!-- 메인 내용 -->
        <main class="container">
            <el-card class="card" shadow="hover">
                <h2>사용된 오픈소스 목록</h2>
                <p class="desc">
                    Klume 서비스는 아래 오픈소스 소프트웨어를 사용하고 있으며,
                    각 라이선스 및 저작권을 준수합니다.
                </p>

                <el-scrollbar height="400px">
                    <pre class="license-text">{{ licenseText }}</pre>
                </el-scrollbar>
            </el-card>

            <el-card class="card" shadow="never">
                <footer>
                    <p>© 2025 OxAM. All rights reserved.</p>
                </footer>
            </el-card>
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
    --bg: #f7f8fb;
    --card: #fff;
    --accent: #0b57d0;
    --muted: #666;
}

body {
    font-family: Inter, Roboto, "Noto Sans KR", Arial, sans-serif;
    background: var(--bg);
    color: #111;
    margin: 0;
}

header {
    background: linear-gradient(90deg, #0b57d0 0%, #0c1c54 100%);
    color: #fff;
    padding: 24px 20px;
    cursor: pointer;
}

.header-content {
    display: flex;
    align-items: center;
    gap: 12px;
}

.logo-icon {
    width: 50px;
}

.container {
    max-width: 1000px;
    margin: 24px auto;
    padding: 0 20px;
}

.card {
    background: var(--card);
    border-radius: 12px;
    padding: 22px;
    box-shadow: 0 6px 20px rgba(18, 28, 49, 0.06);
    margin-bottom: 18px;
}

h1 {
    font-size: 20px;
    margin: 0;
}

h2 {
    font-size: 18px;
    color: var(--accent);
    margin-bottom: 8px;
}

.desc {
    font-size: 14px;
    color: #444;
    margin-bottom: 16px;
}

.license-text {
    white-space: pre-wrap;
    font-family: 'Courier New', monospace;
    font-size: 13px;
    color: #222;
    padding-right: 12px;
}

footer {
    font-size: 13px;
    color: var(--muted);
    text-align: center;
    padding: 12px 0;
}
</style>
