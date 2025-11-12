<template>
  <component
    :is="to ? 'router-link' : 'button'"
    :to="to"
    class="nav-button"
    :class="[{ active: isActive || isRouteActive }, variant]"
    @click="handleClick"
  >
    <img
      v-if="icon"
      :src="`/src/assets/icons/${icon}`"
      alt="icon"
      class="icon"
    />
    <span>{{ label }}</span>
  </component>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  label: { type: String, required: true },
  icon: { type: String, default: null },
  variant: {
    type: String,
    default: 'white',
    validator: (v) => ['white', 'gray', 'navy'].includes(v),
  },
  isActive: { type: Boolean, default: false },
  to: { type: [String, Object], default: null },
})

const emit = defineEmits(['click'])
const route = useRoute()

const isRouteActive = computed(() => {
  if (!props.to) return false
  if (typeof props.to === 'string') {
    return route.path === props.to
  }
  if (props.to.name) {
    return route.name === props.to.name
  }
  return false
})

const handleClick = (e) => {
  if (!props.to) {
    emit('click', e)
  }
}
</script>

<style scoped>
.nav-button {
  display: flex;
  align-items: center;
  gap: 10px;
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 15px;
  cursor: pointer;
  transition: background-color 0.25s ease, color 0.25s ease;
  width: 100%;
  text-align: left;
}

.icon {
  width: 20px;
  height: 20px;
}

/* 기본 색상 */
.white {
  background-color: #ffffff;
  color: #000;
}

/* hover */
.white:hover {
  background-color: #f2f3f7;
}

.gray {
  background-color: #c3c5ca;
  color: #000;
}

.gray:hover {
  background-color: #d7dae0;
}

.navy {
  background-color: #0c1c54;
  color: #fff;
}

.navy img {
  filter: brightness(0) invert(1);
}

/* active 상태 */
.active {
  background-color: #0c1c54 !important;
  color: #fff !important;
}

.active img {
  filter: brightness(0) invert(1);
}
</style>
