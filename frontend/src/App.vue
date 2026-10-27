<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAppStore } from '@/stores/votos'

const store = useAppStore()

onMounted(() => {
  store.connect()
})
</script>

<template>
  <v-app>
    <header>
      <div class="wrapper">
        <nav>
          <v-btn to="/">Login</v-btn>
          <v-btn to="/votacions">Votacions</v-btn>
        </nav>
      </div>
    </header>

    <RouterView />
  </v-app>
</template>

<style scoped>
.wrapper {
  padding: 16px;
}

nav {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
