// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: {
    enabled: true,
    timeline: {
      enabled: true,
    },
  },

  runtimeConfig: {
    apiSecret: "", // can be overridden by NUXT_API_SECRET environment variable
    public: {
      apiBase: "", // can be overridden by NUXT_PUBLIC_API_BASE environment variable
    },
  },

  experimental: {
    cookieStore: true,
  },

  modules: [
    "@nuxt/content",
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxt/scripts",
    "@nuxt/test-utils",
    "@nuxt/ui",
    "@vueuse/nuxt",
    "@nuxtjs/i18n",
    "nuxt-auth-utils",
    "@pinia/nuxt",
  ],
  css: ["~/assets/css/main.css"],
  plugins: [
    { src: "~/plugins/apexcharts.client.ts", mode: "client" },
    { src: "~/plugins/api.ts" },
    { src: "~/plugins/auth.client.ts", mode: "client" },
  ],
  i18n: {
    defaultLocale: "pt-BR",
    locales: [
      { code: "pt-BR", name: "Brasil", file: "br.json" },
      { code: "en", name: "English", file: "br.json" },
    ],
  },
});
