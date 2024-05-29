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
    const urls: { name: string, url: string }[] = []
    for (let i = 0; i < play_list.length; i++) {
      const item = $(`${play_list.eq(i)} li`)
      for (let j = 0; j < item.length; j++) {
        for (let k = 0; k < item.eq(j).find('a').length; k++) {
          const url = item.eq(j).find('a').eq(k).attr('href')!
          const name = item.eq(j).find('a').eq(k).text()
          urls.push({ name, url })
        }
      }
    }

    try {
      const start = (+query.start! || 0) as number
      const end = (+query.end! || 0) as number
      const n = (+query.num! || 0) as number // 从第几集开始
      const data = start !== -1 && end ? urls.slice(start, end) : start !== -1 ? urls.slice(start) : urls

      console.log(data, 'urls', start, 'start', end, 'end')
      const plays: any[] = await Promise.all(data.map(url => $fetch(`https://dm84.tv${url.url}`)))
      const playArr = plays.reduce((prev: any, cur: any, i) => {
        const url = urls[i].url
        const arr = url.split(/-|\.html|\//)
        const num = +arr[arr.length - 2]
        const sid = +arr[arr.length - 3]
        const $ = load(cur)
        const src = $('iframe').attr('src')
        const urli = `${!Number(urls[i].name) ? urls[i].name : `第${+num + n}集`}$${src}\n`
        prev[sid] = prev[sid] ? [...prev[sid], urli] : [urli]
        return prev
      }, {})
      const play = Object.keys(playArr).map(item => {
        return query.sort ? playArr[item] : playArr[item].reverse()
      })

      console.log(play[2], 'play')
      // end 等-1 第2个资源，end 等-2 第3个资源，end 无值 第1个资源
      if (start === -1 || end === -1 || end === -2 || (start === -1 && end)) {
        const urlArr = []
        let n = 1
        for await (const url of play[end === -1 ? 1 : end === -2 ? 2 : 0]) {
          const arr = url.replace(/\n/g, '').split('$')
          const name = arr[0]
          const d = arr[1]
          await page.goto(d, { waitUntil: 'networkidle0', timeout: 60000000 })
          const html = await page.content()
          const $ = load(html)
          const src = $('video').attr('src')
          urlArr.push(`${name}$${src}${urls.length === n ? '' : '\n'}`)
          n++
        }
        console.log('ok', urlArr)
        return [urlArr]
      }

      console.log('ok', play)
      return play
    }
    catch (error) {
      console.log(error)
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
