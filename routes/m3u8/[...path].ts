import https from 'node:https'
import { getUrlParams2, js_decrypt } from '~/utils'

export default defineEventHandler(async event => {
  const query = getQuery(event)
  const getUrl = (path: string) => {
    return new Promise<string>((resolve, reject) => {
      https.get(path, res => {
        let data = ''

        res.on('data', chunk => {
          data += chunk
        })

        res.on('end', () => {
          resolve(data)
        })
      }).on('error', err => {
        console.log(`Error: ${err.message}`)
        reject(err)
      })
    })
  }

  function ffzy(ps: string[], i: number) {
    if (ps[i].includes('6.466667')) {
      const t1 = ps[i + 2].includes('1.833333') && ps[i + 4].includes('6.666667') && ps[i + 6].includes('3.033333')
      if (t1) {
        return true
      }
      return false
    }
    return false
  }

  function ffzy2(ps: string[], i: number) {
    if (ps[i].includes('6.600000') || ps[i].includes('5.800000') || ps[i].includes('4.666667') || ps[i].includes('5.466667')) {
      const t1 = ps[i + 2].includes('3.333333') && ps[i + 4].includes('3.200000') && ps[i + 6].includes('3.333333') && ps[i + 8].includes('1.800000')
      const t2 = ps[i + 2].includes('3.333333') && ps[i + 4].includes('3.333333') && ps[i + 6].includes('3.333333') && ps[i + 8].includes('1.400000')
      const t3 = ps[i + 2].includes('3.333333') && ps[i + 4].includes('4.300000') && ps[i + 6].includes('3.333333') && ps[i + 8].includes('1.333333')
      const t4 = ps[i + 2].includes('5.433333') && ps[i + 4].includes('3.333333') && ps[i + 6].includes('3.900000') && ps[i + 8].includes('3.233333')
      const t5 = ps[i + 2].includes('3.333333') && ps[i + 4].includes('3.333333') && ps[i + 6].includes('6.666667') && ps[i + 8].includes('1.766667')
      const t6 = ps[i + 2].includes('3.333333') && ps[i + 4].includes('3.333333') && ps[i + 6].includes('3.933333') && ps[i + 8].includes('2.733333')
      if (t1 || t2 || t3 || t4 || t5 || t6) {
        return true
      }
      return false
    }
    return false
  }

  const formatData = (play: string, url: string) => {
    const ps = play.split('\n')
    const findOneTs = ps.find(item => item.includes('.ts'))
    const useStr = findOneTs?.substring(0, 13)
    if (useStr) {
      ps.forEach((item, i) => {
        const str = item.includes('.ts') ? item.split('.ts')[0] || '' : ''
        const max = item.includes('.ts') ? Number.parseInt(str.substring(str.length - 6) || '0') : 0
        // const time = item.includes('6.666667') || item.includes('3.333333')
        const ffzy20241115 = ffzy(ps, i)
        const ffzy20241015 = ffzy2(ps, i)
        if ((ffzy20241015) && url.includes('ffzy')) {
          // console.log(ffzy20241011, 'ffzy20241011')
          ps.splice(i, 1, 'ziye')
          ps.splice(i - 1, 1, 'ziye')
          ps.splice(i + 1, 1, 'ziye')
          ps.splice(i + 2, 1, 'ziye')
          ps.splice(i + 3, 1, 'ziye')
          ps.splice(i + 4, 1, 'ziye')
          ps.splice(i + 5, 1, 'ziye')
          ps.splice(i + 6, 1, 'ziye')
          ps.splice(i + 7, 1, 'ziye')
          ps.splice(i + 8, 1, 'ziye')
          ps.splice(i + 9, 1, 'ziye')
        }

        if (ffzy20241115 && url.includes('ffzy')) {
          ps.splice(i, 1, 'ziye')
          ps.splice(i - 1, 1, 'ziye')
          ps.splice(i + 1, 1, 'ziye')
          ps.splice(i + 2, 1, 'ziye')
          ps.splice(i + 3, 1, 'ziye')
          ps.splice(i + 4, 1, 'ziye')
          ps.splice(i + 5, 1, 'ziye')
          ps.splice(i + 6, 1, 'ziye')
          ps.splice(i + 7, 1, 'ziye')
        }
        // if (time && url.includes('ffzy')) {
        //   if (ps[i - 1] === '#EXT-X-DISCONTINUITY') {
        //     ps.splice(i + 1, 1, 'ziye')
        //     ps.splice(i, 1, 'ziye')
        //     ps.splice(i - 1, 1, 'ziye')
        //   }
        //   if (ps[i].includes('#EXTINF')) {
        //     ps.splice(i, 1, 'ziye')
        //     ps.splice(i + 1, 1, 'ziye')
        //   }
        // }
        if (((!item.includes(useStr) || max > 10000 || item.length > 20) && item.includes('.ts') && str.length !== 32) || (str.length === 32 && item.includes('.ts') && (url.includes('lz') || url.includes('yzzy') || ((url.includes('play-') || url.includes('-play')) && !url.includes('ffzy'))))) {
          if (ps[i - 2] === '#EXT-X-DISCONTINUITY') {
            ps.splice(i, 1, 'ziye')
            ps.splice(i - 1, 1, 'ziye')
            ps.splice(i - 2, 1, 'ziye')
          }
          if (ps[i - 1].includes('#EXTINF')) {
            ps.splice(i, 1, 'ziye')
            ps.splice(i - 1, 1, 'ziye')
          }
        }
      })
    }
    return ps.filter(item => item !== 'ziye')
  }

  const getM3u8Url = () => {
    const params = getUrlParams2(query.play as string)
    const { key, iv, url } = params
    const data = url.replace(/ /g, '+')
    const http = js_decrypt(data, key, iv)
    // console.log(http, 'http222', params)
    return http
  }

  try {
    const link = query.link as string
    const http = link || getM3u8Url()
    const data = await getUrl(http)
    const isVzcdn = http.includes('vzcdn.net')
    if (data && (http.includes('index.m3u8') || http.includes('playlist.m3u8'))) {
      const ids = isVzcdn ? http.split('playlist.m3u8') : http.split('index.m3u8')
      const datas = data.split('\n').filter(item => item.includes('.m3u8'))
      const url = ids[0] + (isVzcdn ? datas[datas.length - 1].replace('\r', '') : datas[0])
      const play = await getUrl(url)
      const arr = isVzcdn ? play.split('\n') : formatData(play, url)
      const m3u8 = arr.map(item => {
        if (item.includes('.ts'))
          return isVzcdn ? `${ids[0]}${datas[datas.length - 1].replace('\r', '').split('video.m3u8')[0]}${item}` : `${ids[0]}${datas[0].split(/mixed.m3u8|index.m3u8/)[0]}${item}`
        else
          return item
      }).filter(item => item).join('\n')
      return m3u8
    }
    else {
      return data
    }
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
