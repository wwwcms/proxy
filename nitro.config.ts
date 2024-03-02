import { defineNitroConfig } from 'nitropack/config'

export default defineNitroConfig({
  routeRules: {
    '/**': { cors: true }
    // '/tmdb/**': { swr: true },
  },
  runtimeConfig: {
    tmdb: {
      apiKey: 'cc06d337ffde84712a0fe317144d2592'
    }
  }
})
