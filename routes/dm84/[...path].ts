import puppeteer from 'puppeteer'
import { load } from 'cheerio'

export default defineEventHandler(async event => {
  const query = getQuery(event)
  try {
    const { path: id } = event.context.params || {}
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    const html: any = await $fetch(`https://dm84.tv/v/${id}.html`)
    const $ = load(html)
    const play_list = $('.play_list')
    const urls: string[] = []
    for (let i = 0; i < play_list.length; i++) {
      const item = $(`${play_list.eq(i)} li`)
      for (let j = 0; j < item.length; j++) {
        for (let k = 0; k < item.eq(j).find('a').length; k++) {
          const url = item.eq(j).find('a').eq(k).attr('href')
          urls.push(url!)
        }
      }
    }
    const start = (+query.start! || 0) as number
    const end = (+query.end! || 0) as number
    const data = start && start !== -1 && end ? urls.slice(start, end) : start && start !== -1 ? urls.slice(start) : urls
    const plays: any[] = await Promise.all(data.map(url => $fetch(`https://dm84.tv${url}`)))
    const playArr = plays.reduce((prev: any, cur: any, i) => {
      const url = urls[i]
      const arr = url.split(/-|\.html|\//)
      const num = +arr[arr.length - 2]
      const sid = +arr[arr.length - 3]
      const $ = load(cur)
      const src = $('iframe').attr('src')
      const urli = `第${num}集$${src}\n`
      prev[sid] = prev[sid] ? [...prev[sid], urli] : [urli]
      return prev
    }, {})
    const play = Object.keys(playArr).map(item => {
      return query.sort ? playArr[item] : playArr[item].reverse()
    })

    if (start === -1 || end === -1) {
      const urlArr = []
      let n = 1
      for await (const url of end === -1 ? play[1] : play[0]) {
        const d = url.replace(/\n/g, '').split('$')[1]
        await page.goto(d, { waitUntil: 'networkidle0', timeout: 60000000 })
        const html = await page.content()
        const $ = load(html)
        const src = $('video').attr('src')
        urlArr.push(`第${n}集$${src}${urls.length === n ? '' : '\n'}`)
        n++
      }
      console.log('ok', urlArr)
      return [urlArr]
    }

    console.log('ok', play)
    return play
  }
  catch (e: any) {
    const status = e?.response?.status || 500
    setResponseStatus(event, status)
    return {
      error: e
    }
  }
})
