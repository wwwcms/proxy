export default defineEventHandler(async event => {
  try {
    const { path: id } = event.context.params || {}
    const response: any = await $fetch(`https://v.qq.com/x/cover/${id}.html`)
    const { coverInfo } = JSON.parse(response.match(/"global":([\s\S]+),"episodeClips":/)[1]) || {}
    const allData = JSON.parse(response.match(/"episodeMain":([\s\S]+),"episodeRecommendShort":/)[1]
      .replace('Array.prototype.slice.call(', '')
      .replace('),"listMeta":[]', ',"listMeta":[]')
      .replace('),"tabs":', ',"tabs":')
      .replace(/undefined/g, '0')) || {}
    const { listData, currentEpTabIndex } = allData
    const tabs = listData?.[0]?.tabs
    const video_ids = coverInfo?.video_ids || []
    const result: any = []
    tabs?.forEach((item: any) => {
      const query = new URLSearchParams(item.pageContext)
      const end_id = video_ids[query.get('episode_end')!]
      if (end_id) {
        const url = `https://v.qq.com/x/cover/${id}/${end_id}.html`
        result.push($fetch(url))
      }
    })
    let data = [...listData?.[currentEpTabIndex]?.list?.[0]]
    if (result.length) {
      const datas = await Promise.all(result)
      datas.forEach((item, index) => {
        const { listData }
        = JSON.parse(
          item
            .match(/"episodeMain":([\s\S]+),"episodeRecommendShort":/)[1]
            .replace('Array.prototype.slice.call(', '')
            .replace('),"listMeta":[]', ',"listMeta":[]')
            .replace('),"tabs":', ',"tabs":')
            .replace(/undefined/g, '0')
        ) || {}
        data = [...data, ...listData?.[currentEpTabIndex]?.list?.[index + 1]]
      })
    }
    console.log(data, 'data')
    const tag = { 2: '免费', 4: '预告', 7: '会员' }
    const html: string[] = []
    data.forEach(({ imgTag, title, vid, videoSubtitle }, index) => {
      if (videoSubtitle !== '预告片') {
        const isbr = index > data.length - 2
        const vip = imgTag === 0 ? 2 : imgTag.includes('VIP') ? 7 : 4
        html.push(`第${title}话${videoSubtitle ? ` ${videoSubtitle}` : ''}$//v.qq.com/x/cover/${id}/${vid}.html$${tag[vip]}${isbr ? '' : '\n'}`)
      }
    })
    return html
  }
  catch (e: any) {
    const status = e?.response?.status || 500
    setResponseStatus(event, status)
    return {
      error: e
    }
  }
})
