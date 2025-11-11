<template>
    <div class="base-input">
    <input
        :type="type"
        :placeholder="placeholder"
        :style="{ height: height + 'px', fontSize: fontSize + 'px' }"
        v-model="model"
        @keydown.enter.prevent
    />
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    modelValue: String,
    placeholder: String,
    type: { type: String, default: 'text' },
    height: { type: Number, default: 44 },
    fontSize: { type: Number, default: 15 },
});

const emit = defineEmits(['update:modelValue']);

const model = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});
</script>

<style scoped>
.base-input input {
    width: 100%;
    border: 1px solid #ddd;
    border-radius: 10px;
    padding: 0 14px;
    font-family: 'Noto Sans KR', sans-serif;
    outline: none;
    transition: border-color 0.2s ease;
}
.base-input input:focus {
    border-color: #0c1c54;
}
</style>
