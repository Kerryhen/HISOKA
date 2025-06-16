<template>
  <UModal v-model:open="localOpen" title="Login" :dismissible="false">
    <template #content>
      <UForm class="flex flex-col gap-5 p-10">
        <UFormField :label="$t('username')" name="Username">
          <UInput
            v-model="localUsername"
            placeholder="Jhon@13"
            class="w-full"
          />
        </UFormField>
        <UFormField :label="$t('password')" name="Username">
          <UInput
            v-model="localPassword"
            type="password"
            placeholder="******"
            class="w-full"
          />
        </UFormField>
        <UButton
          :label="$t('login')"
          color="primary"
          class="w-full justify-center"
          @click="submit"
        />
      </UForm>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  open: boolean;
  username: string;
  password: string;
}>();
const emit = defineEmits([
  "update:open",
  "update:username",
  "update:password",
  "submit",
]);

const localUsername = ref(props.username);
const localPassword = ref(props.password);
const localOpen = ref(props.open);

watch(localUsername, (val) => emit("update:username", val));
watch(localPassword, (val) => emit("update:password", val));

function submit() {
  emit("submit", {
    username: localUsername.value,
    password: localPassword.value,
  });
  emit("update:open", false);
}
</script>
