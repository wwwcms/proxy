import { defineNitroConfig } from 'nitropack'

export default defineNitroConfig({
  routeRules: {
    '/**': { cors: true, headers: { 'access-control-allow-methods': '*', 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-max-age': '0' } },
    '/tmdb/**': { swr: 3600, cors: true, headers: { 'access-control-allow-methods': '*', 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-max-age': '0' } },
  },
  runtimeConfig: {
    tmdb: {
      apiKey: 'cc06d337ffde84712a0fe317144d2592',
    },
  },
})
