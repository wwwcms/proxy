export default defineEventHandler(async event => {
  const query = getQuery(event)
  try {
    const { path: id } = event.context.params || {}
    let seasonid = query.seasonid
    const type = query.type
    const vip = query.vip
    if (id) {
      const ids = id.split('md')[1] || id
      console.log(ids, 'ids')
      const response: any = await $fetch(`https://api.bilibili.com/pgc/review/user?media_id=${ids}`)
      seasonid = response.result.media.season_id
    }
    const response: any = await $fetch(`https://api.bilibili.com/pgc/web/season/section?season_id=${seasonid}`)
    const { episodes = [] } = response.result.main_section
    const tag = { 2: '免费', 13: '会员', 8: '付费' } as any
    const html = episodes.map(({ title, long_title, share_url, status }: any) => {
      const isbr = +title > episodes.length - 1
      if (type === 'ep')
        return `第${title}话@@${long_title}@@暂无内容${isbr ? '' : '||\n'}`

      return `第${title}话${long_title ? ` ${long_title}$` : '$'}${share_url.replace('http:', '')}${vip ? `$${tag[status]}` : ''}${isbr ? '' : '\n'}`
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
