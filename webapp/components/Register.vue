<template>  
    <div class="w-screen h-screen grid grid-cols-2 form">
        <div class="text-center justify-center pr-50 pl-50">
            <div class=" h-6/8 bg-neutral-50 rounded-b-[10rem] drop-shadow-2xl">
              <div class="p-15">
                <div class="form bg-neutral rounded-xl">
                  <p class="p-2 text-9xl">H.I.S.O.K.A</p>
                </div>
              </div>
                <HisokaBoard class="w-9/6 -translate-x-20 -translate-y-20" ></HisokaBoard>  
            </div>
          </div>
        <div class="p-20 flex flex-col">
            <div class="text-center text-6xl p-10" ><p >{{$t('singin-title')}}</p></div>
              <UForm :validate="validate" :state="state" @submit="onSubmit" @error="onError" class="space-y-5" >
                <div class="text-3xl">
                  <p>{{ $t('fullname') }}</p>
                  <UFormGroup name="fullname">
                    <UInput
                    v-model="state.fullname"
                    placeholder="Jhon brown"
                    class="w-full"
                    size="xl"
                    />
                  </UFormGroup>
                </div>
                <div class="text-3xl">
                <p>{{ $t('username') }}</p>
                <UFormGroup name="username">
                  <UInput
                  v-model="state.username"
                  placeholder="Jhon@13"
                  class="w-full"
                  size="xl"
                  />
                </UFormGroup>
                </div>
                <div class="text-3xl">
                  <p>{{ $t('email') }}</p>
                  <UFormGroup name="email">
                    <UInput
                    v-model="state.email"
                    placeholder="Jhon@gmai.com"
                    class="w-full"
                    size="xl"
                    />
                  </UFormGroup>
                </div>
                <div class="text-3xl">
                  <p>{{ $t('password') }}</p>
                  <UFormGroup :label="$t('password')" name="password">
                    <UInput
                    type="password"
                    placeholder="******"
                    class="w-full"
                    size="xl"
                    />
                  </UFormGroup>
                </div>
                <div class="text-3xl">
                  <p>{{ $t('confirm_password') }}</p>
                  <UFormGroup name="confirm_password">
                    <UInput    
                    v-model="state.confirm_password"
                    type="password"
                    placeholder="******"
                    class="w-full"
                    size="xl"
                    />
                  </UFormGroup>
                </div>
                <div class="text-center">
                  <UButton
                  :label="$t('singup')"
                  type="submit"
                  color="neutral"
                  class="justify-center text-3xl uppercase w-1/2"
                  />
                  <p class="p-2 text-3xl">{{ $t('singin-text') }} <span class="text-emerald-400">{{ $t('singin') }}!</span></p>
                  <UIcon name="logos:facebook" class="text-3xl pl-10" />
                  <UIcon name="logos:google-icon" class="text-3xl pr-10" />
                </div>
              </UForm>
            
          </div>
    </div>
</template>

<script setup lang="ts">
  import type { FormError, FormErrorEvent, FormSubmitEvent } from '#ui/types'

  const state = reactive({
    fullname: undefined,
    username: undefined,
    email: undefined,
    password: undefined,
    confirm_password: undefined
  })

  const validate = (state: any): FormError[] => {
    const errors = []
    if (!state.email) errors.push({ path: 'email', message: 'Required' })
    if (!state.password) errors.push({ path: 'password', message: 'Required' })
    return errors
  }

  async function onSubmit(event: FormSubmitEvent<any>) {
    // Do something with data
    console.log(event.data)
  }

  async function onError(event: FormErrorEvent) {
    const element = document.getElementById(event.errors[0].id)
    element?.focus()
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
</script>

<style scoped>
.form {
  font-family: 'League Gothic';
}
</style>
