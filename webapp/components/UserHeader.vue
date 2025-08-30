<template>
  <div class="p-4 flex items-center justify-between">
    <div v-if="user.loggedIn" class="flex items-center gap-4">
      <span>{{ $t("hello") }}, {{ user.username }}</span>
      <UButton class="sm" @click="logout">{{ $t("logout") }}</UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
const user = useAuthUserStore();

async function logout() {
  await user.logout();
  navigateTo("/");
}
</script>

<style scoped></style>
