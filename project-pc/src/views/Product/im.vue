<script setup lang="ts">
import { ref } from 'vue'


const count = ref('im')
</script>

<template>
  <h1>{{ count }}</h1>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
