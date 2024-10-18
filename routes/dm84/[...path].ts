import { load } from 'cheerio'
import puppeteer from 'puppeteer'

// id|sort|start|end|n|ep

export default defineEventHandler(async event => {
  const query = getQuery(event)
  const start = (+query.start! || 0) as number
  const end = (+query.end! || 0) as number
  const n = (+query.n! || 0) as number // 从第几集开始
  const sort = (+query.sort! || 0) as number // -1 正序 不填为倒
  const ep = (+query.ep! || 0) as number // 从第几集开始
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
      if (start || end || ep) {
        const playUrls = urls.reduce((prev, cur) => {
          const url = cur.url
          const arr = url.split(/-|\.html|\//)
          const sid = +arr[arr.length - 3]
          prev[sid] = prev[sid] ? [...prev[sid], cur] : [cur]
          return prev
        }, [] as { [key: number]: { name: string, url: string }[] })

        const play2 = Object.keys(playUrls).map(Number).map(item => {
          return sort === -1 ? playUrls[item] : playUrls[item].reverse()
        })

        const dataUrls = play2[ep || 0].slice(start >= 0 ? start : 0, end > 0 ? end : Infinity)
        console.log(JSON.stringify(dataUrls), 'playArr')
        const playHtmls: any[] = await Promise.all(dataUrls.map(url => $fetch(`https://dm84.tv${url.url}`)))
        const playArr = playHtmls.reduce((prev, cur, i) => {
          const url = dataUrls[i].url
          const arr = url.split(/-|\.html|\//)
          const num = +arr[arr.length - 2]
          const $ = load(cur)
          const src = $('iframe').attr('src')
          const urli = `${Number(dataUrls[i].name) ? `第${dataUrls[i].name}集` : !Number(dataUrls[i].name) ? dataUrls[i].name : `第${+num + n}集`}$${src}\n`
          return [...prev, urli]
        }, [] as string[])

        // end 等-1 第2个资源，end 等-2 第3个资源，end 无值 第1个资源
        const urlArr = []
        let i = 1
        for await (const url of playArr) {
          const arr = url.replace(/\n/g, '').split('$')
          const name = arr[0]
          const d = arr[1]
          await page.goto(d, { waitUntil: 'networkidle0', timeout: 60000000 })
          const html = await page.content()
          const $ = load(html)
          const src = $('video').attr('src')?.replace(/sf16-scmcdn.larksuitecdn.com|p16-hera-va.larksuitecdn.com/, 'lf16-fe.resso.me')
          urlArr.push(`${name}$${src}${playArr.length === i ? '' : '\n'}`)
          i++
        }
        console.log('ok', urlArr)
        return [urlArr]
      }
      else {
        const data = urls.filter(url => !url.name.includes('预告'))
        const plays: any[] = await Promise.all(data.map(url => $fetch(`https://dm84.tv${url.url}`)))
        const playArr = plays.reduce((prev: any, cur: any, i) => {
          const url = data[i].url
          const arr = url.split(/-|\.html|\//)
          const num = +arr[arr.length - 2]
          const sid = +arr[arr.length - 3]
          const $ = load(cur)
          const src = $('iframe').attr('src')
          const urli = `${Number(data[i].name) ? `第${+data[i].name + n}集` : !Number(data[i].name) ? data[i].name : `第${+num + n}集`}$${src}\n`
          prev[sid] = prev[sid] ? [...prev[sid], urli] : [urli]
          return prev
        }, {})
        const play = Object.keys(playArr).map(item => {
          return sort === -1 ? playArr[item] : playArr[item].reverse()
        })

        console.log('ok', play)
        return play
      }
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
