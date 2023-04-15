import { defineNitroConfig } from 'nitropack'

export default defineNitroConfig({
  routeRules: {
    '/tmdb/**': { swr: 3600 },
  },
  runtimeConfig: {
    tmdb: {
      apiKey: 'cc06d337ffde84712a0fe317144d2592',
    },
  },
})
