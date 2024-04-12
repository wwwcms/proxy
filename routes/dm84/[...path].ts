import { load } from 'cheerio'

export default defineEventHandler(async event => {
  try {
    const { path: id } = event.context.params || {}
    try {
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
      const plays: any[] = await Promise.all(urls.map(url => $fetch(`https://dm84.tv${url}`)))
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
        return playArr[item].reverse()
      })

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
