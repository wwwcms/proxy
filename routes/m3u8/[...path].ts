export default defineEventHandler(async event => {
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

  try {
    const { path: m3u8url } = event.context.params || {}
    const play: any = await $fetch(decodeURIComponent(m3u8url))
    if (play) {
      const arr = formatData(play)
      const m3u8 = arr.filter(item => item).join('\n')
      return m3u8
    }
    else {
      return ''
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
