import https from 'node:https'
import fs from 'node:fs'
import path from 'node:path'

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

  const formatData = (play: string) => {
    const ps = play.split('\n')
    const findOneTs = ps.find(item => item.includes('.ts'))
    const useStr = findOneTs?.substring(0, 13)
    if (useStr) {
      ps.forEach((item, i) => {
        if (!item.includes(useStr) && item.includes('.ts')) {
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

  // async function checkFileExistence(path: string) {
  //   return new Promise(resolve => {
  //     fs.access(path, err => {
  //       if (err)
  //         resolve(false)
  //       resolve(true)
  //     })
  //   })
  // }

  try {
    const { path: m3u8url } = event.context.params || {}
    const http = await getUrl(decodeURIComponent(m3u8url))
    const data = await getUrl(http)
    if (data && http.includes('index.m3u8')) {
      const ids = http.split('index.m3u8')
      const datas = data.split('\n').filter(item => item.includes('.m3u8'))
      const url = ids[0] + datas[0]
      console.log(url, 'url')
      const play = await getUrl(url)

      const arr = formatData(play)
      const m3u8 = arr.map(item => {
        if (item.includes('.ts'))
          return `${ids[0]}${datas[0].split(/mixed.m3u8|index.m3u8/)[0]}${item}`
        else
          return item
      }).filter(item => item).join('\n')
      try {
        const { name, nid, sid } = query
        const filePath = `${path.join(process.cwd(), `/ziyuan/${name}/${sid || 1}/${nid}.m3u8`)}`
        // const exist = await checkFileExistence(filePath)
        // if (exist)
        //   return m3u8
        const dirPath = path.dirname(filePath)
        if (!fs.existsSync(dirPath))
          fs.mkdirSync(dirPath, { recursive: true })

        fs.writeFileSync(filePath, m3u8, { flag: 'w' })
        console.log('写入成功', filePath)
      }
      catch (err) {
        console.error(err)
      }
      return m3u8
    }
    else {
      return data
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
