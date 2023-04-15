import { createIPX, createIPXMiddleware } from 'ipx'

const ipx = createIPX({
  maxAge: 3600,
  alias: {
    '/tmdb': 'https://image.tmdb.org/t/p/original/',
    '/youtube': 'https://img.youtube.com/',
  },
  domains: [
    'image.tmdb.org',
    'img.youtube.com',
  ],
  fetchOptions: {
    headers: {
      "Content-Security-Policy": "default-src 'self' app.netlify.com; child-src 'self' app.netlify.com; script-src 'self' app.netlify.com netlify-cdp-loader.netlify.app;"
    }
  }
})

const ipxMiddleware = createIPXMiddleware(ipx)
const ipxHandler = fromNodeMiddleware(ipxMiddleware)

export default eventHandler((event) => {
  event.req.originalUrl = event.req.url = `/${event.context.params.path}`
  return ipxHandler(event)
})
