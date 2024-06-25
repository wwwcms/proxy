export default defineEventHandler(async event => {
  function buildVideos(str: string) {
    return str.split('\n').map((v, i) => {
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
  try {
    const { path: id } = event.context.params || {}
    const body: any = await $fetch(`https://www.clicli.cc/post/${id}/`)
    // const videos = body.result.videos || ''
    const json = JSON.parse(body)
    const videos = json.result.videos || ''
    const regex = /^\d|^.\d/
    const v1 = buildVideos(videos).filter(i => regex.test(i[0]))
    const v2 = buildVideos(videos).filter(i => i[0] === '二')
    const v3 = buildVideos(videos).filter(i => i[0] === '三')
    const video = [v1, v2, v3]
    const videoList = video.map((i, l) => {
      return i.map((j, k) => {
        return `第${k + 1}集 ${removeDigitsInFirstTwoChars(l === 0 ? j[0] : video[0][k][0]).trim()}$${j[1]}?filename=1.mp4\n`
      })
    })
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
