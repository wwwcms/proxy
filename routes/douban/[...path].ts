export default defineEventHandler(async event => {
  try {
    const { path: id } = event.context.params || {}

    const link = `https://m.douban.com/movie/subject/${id}/`
    const channel: any = await $fetch(`https://m.douban.com/rexxar/api/v2/elessar/channel/${id}`, {
      headers: {
        Referer: link
      }
    })
    const type = channel?.uri.split('=')?.[1] || 'tv'
    const detail = await $fetch(`https://m.douban.com/rexxar/api/v2/${type}/${id}?ck=kBgD&for_mobile=1`, {
      headers: {
        Referer: link
      }
    })
    return detail
  }
  catch (e: any) {
    const status = e?.response?.status || 500
    setResponseStatus(event, status)
    return {
      error: e
    }
  }
})
