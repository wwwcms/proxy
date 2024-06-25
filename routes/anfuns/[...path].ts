import { Buffer } from 'node:buffer'
import fs from 'node:fs'
import https from 'node:https'
import path from 'node:path'
import { load } from 'cheerio'

// 发请求下载图片并保存到本地
async function downLoadImage(fileURL: string, downloadPath: string) {
  const file = fs.createWriteStream(downloadPath, { flags: 'w' })
  return new Promise((resolve, reject) => {
    https.get(fileURL, response => {
      response.pipe(file)
      file
        .on('finish', (res: unknown) => {
          console.log('文件已经下载到本地')
          resolve(res)
          file.close()
        })
        .on('error', error => {
          reject(error)
        })
    })
  })
}

export default defineEventHandler(async event => {
  const query = getQuery(event)
  const { name, q } = query
  try {
    const { path: id } = event.context.params || {}
    const html: any = await $fetch(`https://www.anfuns.cc/anime/${id}.html`, {
      headers: {
        Referer: `https://www.anfuns.cc/anime/${id}.html`
      }
    })
    const $ = load(html)
    const play_list = $('.hl-tabs-box')
    const urls: { name: string, url: string }[] = []
    for (let i = 0; i < play_list.length; i++) {
      const item = $(`${play_list.eq(i)} li`)
      for (let j = 0; j < item.length; j++) {
        for (let k = 0; k < item.eq(j).find('a').length; k++) {
          const url = item.eq(j).find('a').eq(k).attr('href')!
          const name = item.eq(j).find('a').eq(k).text()
          !url?.includes('javascrip') && url.includes('/play') && urls.push({ name, url })
        }
      }
    }

    const plays: any[] = await Promise.all(urls.map(url => $fetch(`https://www.anfuns.cc${url.url}`, {
      headers: {
        Referer: `https://www.anfuns.cc${url.url}`
      }
    })))
    const playArr = plays.reduce((prev: any, cur: any, i) => {
      const play_aaa = cur.match(/var player_aaaa=(.*?)<\/script>/g)
      const playobj = play_aaa[0].replace(/var player_aaaa=/g, '').replace(/<\/script>/g, '')
      const { encrypt, url: playurl } = JSON.parse(playobj)
      const src = +encrypt === 2 ? decodeURIComponent(Buffer.from(playurl, 'base64').toString('ascii')) : decodeURIComponent(playurl)
      const url = urls[i].url
      const arr = url.split(/-|\.html|\//)
      const sid = +arr[arr.length - 3]
      const num = arr[arr.length - 2]
      if (name) {
        const filePath = `D:/web/static/static/player/m3u8/ziyuan/${name}/${sid || 1}/${num}.m3u8`
        const dirPath = path.dirname(filePath)
        if (!fs.existsSync(dirPath))
          fs.mkdirSync(dirPath, { recursive: true })
        downLoadImage(src, filePath)
      }
      // const urli = `${urls[i].name}$${src}\n`
      const urli = `${urls[i].name}$https://static-a6e.pages.dev/static/player/m3u8/ziyuan/${name}/${sid || 1}/${num}.m3u8${q ? `?q=${q}` : ''}\n`
      prev[sid] = prev[sid] ? [...prev[sid], urli] : [urli]
      return prev
    }, {})

    const play = Object.keys(playArr).map(item => {
      return playArr[item]
    })

    console.log('ok', play)
    return play
  }
  catch (e: any) {
    console.log(e)
    const status = e?.response?.status || 500
    setResponseStatus(event, status)
    return {
      error: e
    }
  }
})
