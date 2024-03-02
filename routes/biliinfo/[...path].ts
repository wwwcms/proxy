export default defineEventHandler(async event => {
  try {
    const { path: id } = event.context.params || {}
    const body: any = await $fetch(`https://www.bilibili.com/bangumi/media/${id}/`)
    const html = body.match(/window.__INITIAL_STATE__=([\s\S]+);\(function\(\)/)[1]
    return JSON.parse(html)?.mediaInfo
  }
  catch (e: any) {
    const status = e?.response?.status || 500
    setResponseStatus(event, status)
    return {
      error: e
    }
  }
})
