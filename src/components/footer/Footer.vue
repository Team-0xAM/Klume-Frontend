<template>
    <footer class="footer-container">
        <div class="footer-grid">
        
        <!-- 왼쪽: 로고 + 링크 -->
        <div class="footer-column">

            <div class="footer-logo-text">
            KL<span class="footer-logo-umlaut">Ü</span>ME
            </div>

            <div class="footer-links">
            <a href="#" @click.prevent="openTerms">이용약관 및 개인정보처리방침</a>
            <a href="#" @click.prevent="openLicense">오픈소스 라이선스</a>
            <a href="#" @click.prevent="goFAQ">FAQ</a>
            </div>

            <p class="footer-copyright">
            © 2025 OxAM All rights reserved.
            </p>
            <p class="footer-icons">
            Icons by <a href="https://icons8.com" target="_blank">Icons8</a>
            </p>
        </div>

        <!-- Contact -->
        <div class="footer-column">
            <h4>Contact</h4>
            <p class="footer-contact">team.OxAM@gmail.com</p>
        </div>

        <!-- Socials -->
        <div class="footer-column">
            <h4>Socials</h4>
            <ul class="footer-team-list">
            <li v-for="(member, index) in teamMembers" :key="index" class="team-member">
                <a :href="member.github" target="_blank">{{ member.name }}</a>
            </li>
            </ul>
        </div>

        </div>
    </footer>
</template>

<script setup>
import { reactive } from 'vue'

const teamMembers = reactive([
    { name: 'rosieisor', github: 'https://github.com/rosieisor' },
    { name: 'pilltong', github: 'https://github.com/pilltong22' },
    { name: 'ghi512', github: 'https://github.com/ghi512' },
    { name: 'HoodRyan', github: 'https://github.com/HoodRyan' },
    { name: 'YujinJeong1006', github: 'https://github.com/YujinJeong1006' },
    { name: 'huni2', github: 'https://github.com/huni2' },
])

const openTerms = () => {
    window.open('/algo-terms', '_blank')
}

const openLicense = () => {
    window.open('/open-source-license', '_blank')
}

const goFAQ = () => {
    window.open('/faq', '_blank')
}
</script>

<style scoped>
.footer-container {
    background-color: #f1efee;
    padding: 40px;
    color: #383838;
    font-family: 'Noto Sans KR', sans-serif;
}

.footer-grid {
    max-width: 1280px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 40px;
}

.footer-column {
    display: flex;
    flex-direction: column;
    font-size: 11px;
}

.footer-logo-text {
    font-size: 28px;
    font-weight: 700;
    color: #0c1c54;
    margin-bottom: 15px;
    user-select: none;
    cursor: default;
}

.footer-logo-umlaut {
    color: #f5c843;
}

/* Links */
.footer-links a,
.footer-contact,
.footer-team-list a {
    font-size: 11px;
    color: #383838;
    text-decoration: none;
    transition: color 0.2s;
}

.footer-links a:hover,
.footer-team-list a:hover {
    color: #0aa2eb;
}

.footer-links a {
    margin-right: 15px;
}

.footer-team-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.team-member {
    margin-bottom: 4px;
}
</style>
