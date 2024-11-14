import { load } from 'cheerio'

export default defineEventHandler(async event => {
  try {
    const { path: id } = event.context.params || {}
    const html: any = await $fetch(`https://cn.xgcartoon.com/detail/${id}`)
    const $ = load(html)
    const urDomlist = $('.detail-right__volumes').find('a')
    const dataUrls: { name: string, url: string }[] = []
    urDomlist.each((i, item) => {
      // /user/page_direct?cartoon_id=cikewuliuqi_di1jiguoyu-hexiaofeng&chapter_id=4SVio2ez3e
      const query = getUrlParams2($(item).attr('href')!)
      dataUrls.push({
        name: $(item).text(),
        url: `https://www.lincartoon.com/video/${query.cartoon_id}/${query.chapter_id}.html`
      })
    })
    const playHtmls: any[] = await Promise.all(dataUrls.map(item => $fetch(item.url)))

    const playUrl = playHtmls.reduce((prev, cur, i) => {
      const name = dataUrls[i].name?.trim()
      const $ = load(cur)
      const src = $('#video_content iframe').attr('src')
      const playQuery = getUrlParams2(src!)
      const urli = `${name}$https://xgct-video.vzcdn.net/${playQuery.vid}/playlist.m3u8\n`
      return [...prev, urli]
    }, [] as string[])

    return playUrl
  }
  catch (e: any) {
    console.log(e, '333')
    const status = e?.response?.status || 500
    setResponseStatus(event, status)
    return {
      error: e
    }
  }
})
