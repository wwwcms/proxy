import { load } from 'cheerio'
import puppeteer from 'puppeteer'

function transformUrl(url: string): string | null {
  const regex = /(tos-[^/]+\/[^/?]+)/
  const matches = url.match(regex)
  if (matches) {
    const pathWithId = matches[1] // 例如: tos-alisg-v-0051c001-sg/owmUpzRIRibiSEVEvCLOAMxGAvgGDDpjeGqGff
    const newBaseUrl = 'https://sf16-cgfe-sg.ibytedtos.com/obj/'
    const finalUrl = newBaseUrl + pathWithId
    return finalUrl
  }
  return null
}

export default defineEventHandler(async event => {
  const query = getQuery(event)
  try {
    const { path: id } = event.context.params || {}
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    const urls: string[] = []
    const nid = Number.parseInt(query.nid as string)
    const num = Number.parseInt(query.num as string) || 1
    if (query.nid) {
      for (let i = num; i <= nid + num - 1; i++)
        urls.push(`/dongmanplay/${id}-${query.sid}-${i}.html`)
    }

    if (id.includes('-')) {
      await page.goto(`https://www.mxdm6.com/dongmanplay/${id}.html`, { waitUntil: 'networkidle0', timeout: 60000000 })
      const html = await page.content()
      const match = /var player_aaaa=(\{[^}]+\})/.exec(html)
      const json = JSON.parse(match![1])
      const src = `https://danmu.yhdmjx.com/m3u8.php?url=${json.url}`
      await page.goto(src!, { waitUntil: 'networkidle0', timeout: 60000000 })
      const playHtml = await page.content()
      const $play = load(playHtml)
      const playUrl = `${transformUrl($play('#lelevideo').attr('src')!)}?filename=1.mp4&type=m6`

      console.log(playUrl, 'playUrl')

      await page.close()
      await browser.close()

      return playUrl
    }
    else {
      const play: string[] = []
      console.log(urls, 'urls')
      for await (const url of urls) {
        const u = url.split(/-|.html/)
        const n = +u[u.length - 2]
        await page.goto(`https://www.mxdm6.com${url}`, { waitUntil: 'networkidle0', timeout: 60000000 })
        const html = await page.content()
        const match = /var player_aaaa=(\{[^}]+\})/.exec(html)
        const json = JSON.parse(match![1])
        const src = `https://danmu.yhdmjx.com/m3u8.php?url=${json.url}`
        await page.goto(src!, { waitUntil: 'networkidle0', timeout: 60000000 })
        const playHtml = await page.content()
        const $play = load(playHtml)
        const playUrl = transformUrl($play('#lelevideo').attr('src')!)
        console.log(playUrl, 'playUrl')
        play.push(`第${n}集$${playUrl?.includes('.mp4') ? playUrl : `${playUrl}?filename=1.mp4&type=m6`}${urls.length === n ? '' : '\n'}`)
      }
      console.log(play, 'play')

      await page.close()
      await browser.close()

      return play
    }
  }
  catch (e: any) {
    const status = e?.response?.status || 500
    setResponseStatus(event, status)
    return {
      error: e
    }
  }
})
