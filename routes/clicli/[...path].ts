export default defineEventHandler(async event => {
  function buildVideos(str: string) {
    return str.split('\n').map(v => {
      const [title, content] = v.split('$')
      return [title, content]
    }).filter(i => i.length > 0 && i[1] != null)
  }
  function removeDigitsInFirstTwoChars(str: string) {
    // 提取前两位
    const firstTwoChars = str.slice(0, 2)
    // 移除前两位中的数字
    const filteredFirstTwoChars = firstTwoChars.replace(/\d/g, '')
    // 返回处理后的字符串
    return filteredFirstTwoChars + str.slice(2)
  }
  function transformUrl(url: string): string | null {
    // 定义正则表达式
    const regex = /(tos-[^/]+\/[^/?]+)/
    // 使用正则表达式进行匹配
    const matches = url.match(regex)

    if (matches) {
      // 获取匹配到的路径
      const pathWithId = matches[1]
      // 定义新的基础 URL
      const newBaseUrl = 'https://sf-gs-frontend-sg.fanchenstatic.com/obj/'
      // 拼接最终的 URL
      const finalUrl = newBaseUrl + pathWithId
      return finalUrl
    }

    // 如果没有匹配到，返回 null
    return null
  }

  try {
    const { path: id } = event.context.params || {}
    const body: any = await $fetch(`https://www.clicli.cc/post/${id}/`)
    // const videos = body.result.videos || ''
    const json = JSON.parse(body)
    const videos = json.data.videos || ''
    const regex = /^\d|^.\d/
    const v1 = buildVideos(videos).filter(i => regex.test(i[0]) || (i[0].includes('第') && i[0].includes('集')))
    const v2 = buildVideos(videos).filter(i => i[0] === '二')
    const v3 = buildVideos(videos).filter(i => i[0] === '三')
    const video = [v1, v2, v3]
    const videoList = video.map((i, l) => {
      return i.map((j, k) => {
        const u = j[1]
        const v = u.includes('http://v16m-default.akamaized.net') ? transformUrl(u) : u?.replace(/sf16-sg.larksuitecdn.com|lf16-secsdk.bitssec.com|sf16-secsdk.ibytedtos.com|lf16-box.feishucdn.com|sf19-sg.larksuitecdn.com|sf21-sg.larksuitecdn.com|sf16-sg-default.akamaized.net/, 'sf-gs-frontend-sg.fanchenstatic.com')
        const title = l === 0 ? j[0] : video[0][k][0].trim()
        const num = title.includes('第') && title.includes('集') ? title : ''
        const url = `${v}?filename=1.mp4`
        return num ? `${num}$${url}\n` : `第${k + 1}集${removeDigitsInFirstTwoChars(title)}$${url}\n`
      })
    })

    console.log(videoList.map(item => item.length), 'videoList')
    return videoList
  }
  catch (e: any) {
    console.log(e, 'eee')
    const status = e?.response?.status || 500
    setResponseStatus(event, status)
    return {
      error: e
    }
  }
})
