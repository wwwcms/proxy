import { load } from 'cheerio'
import puppeteer from 'puppeteer'

export default defineEventHandler(async event => {
  const query = getQuery(event)
  try {
    const { path: id } = event.context.params || {}
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    const urls: string[] = []
    const nid = Number.parseInt(query.nid as string)
    if (query.nid) {
      for (let i = 1; i <= nid; i++)
        urls.push(`/Comicplay/${id}-${query.sid}-${i}.html`)
    }
    else {
      await page.goto(`https://k9dm.com/index.php/vod/play/id/${id}/sid/${query.sid}/nid/1.html`, { waitUntil: 'networkidle0', timeout: 60000000 })
      const html = await page.content()
      const $ = load(html)

      const play_list = $('.fed-play-item.fed-drop-item.fed-visible').find('.fed-part-rows')
      for (let i = 0; i < play_list.length; i++) {
        const item = $(`${play_list.eq(i)} li`)
        for (let j = 0; j < item.length; j++) {
          for (let k = 0; k < item.eq(j).find('a').length; k++) {
            const url = item.eq(j).find('a').eq(k).attr('href')
            url?.includes('.html') && urls.push(url!)
          }
        }
      }
    }

    const play: string[] = []
    console.log(urls, 'urls')
    for await (const url of urls) {
      const u = url.split(/-|.html/)
      const n = +u[u.length - 2]
      await page.goto(`https://www.eacg1.com/${url}`, { waitUntil: 'networkidle0', timeout: 60000000 })
      const html = await page.content()
      const $ = load(html)
      const src = $('#fed-play-iframe').attr('src')
      const h = src?.split('url=')
      const http = h?.[1]?.replace(/sf16-sg.larksuitecdn.com|lf16-fe.resso.me|sf16-sg-default.akamaized.net/, 'sf-gs-frontend-sg.fanchenstatic.com')
      if (src?.includes('eacg')) {
        const html: any = await $fetch(`https://www.eacg1.com${src}`, {
          referrer: `https://www.eacg1.com${src}`
        })
        const iframeSrc = html.match(/https:\/\/xx\.cos1234\.com\/eacg\.php\?url=[^'"]+/)[0]
        const htmlAcg: any = await $fetch(iframeSrc, {
          referrer: 'https://www.eacg1.com/'
        })
        const s = htmlAcg.match(/var\s+vid="(https:\/\/[^"]+)"/)?.[1]
        play.push(`第${n}集$${s}${urls.length === n ? '' : '\n'}`)
      }
      else {
        play.push(`第${n}集$${http?.includes('mp4') ? http : `${http}@@mp4`}${urls.length === n ? '' : '\n'}`)
      }
    }

    console.log(play, 'play')

    await page.close()
    await browser.close()

    return play
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
