import puppeteer from 'puppeteer'
import { load } from 'cheerio'

export default defineEventHandler(async event => {
  const query = getQuery(event)
  try {
    const { path: id } = event.context.params || {}
    try {
      const browser = await puppeteer.launch({ headless: true })
      const page = await browser.newPage()
      await page.goto(`https://k9dm.com/index.php/vod/play/id/${id}/sid/${query.sid}/nid/1.html`, { waitUntil: 'networkidle0', timeout: 60000000 })
      const html = await page.content()
      const $ = load(html)

      const play_list = $('.fed-play-item.fed-drop-item.fed-visible').find('.fed-part-rows')
      const urls: string[] = []
      for (let i = 0; i < play_list.length; i++) {
        const item = $(`${play_list.eq(i)} li`)
        for (let j = 0; j < item.length; j++) {
          for (let k = 0; k < item.eq(j).find('a').length; k++) {
            const url = item.eq(j).find('a').eq(k).attr('href')
            url?.includes('.html') && urls.push(url!)
          }
        }
      }

      const play: string[] = []
      console.time('time')
      for await (const url of urls) {
        console.log(url, 'xxx')
        const u = url.split(/\/|.html/)
        const n = u[u.length - 2]
        await page.goto(`https://k9dm.com${url}`, { waitUntil: 'networkidle0', timeout: 60000000 })
        const html = await page.content()
        const $ = load(html)
        const src = $('#fed-play-iframe').attr('src')
        const h = src?.split('url=')
        play.push(`第${n}集$${h?.[1]}`)
      }

      console.timeEnd('time')
      console.log(play, 'urls2')

      await page.close()
      await browser.close()

      return play
    }
    catch (error) {
      console.log(error, 'error')
    }
    return ''
  }
  catch (e: any) {
    const status = e?.response?.status || 500
    setResponseStatus(event, status)
    return {
      error: e
    }
  }
})
