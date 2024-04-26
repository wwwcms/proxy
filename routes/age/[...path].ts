export default defineEventHandler(async event => {
  const query = getQuery(event)
  try {
    const { path: id } = event.context.params || {}
    const type = query.type
    try {
      const response: any = await $fetch('http://test.gqyy8.com:8077/ne2/s23425.js?1696594868', { responseType: 'blob', parseResponse: txt => txt })
      console.log(response, 'sss', `https://www.acgfans.org/cj.php?type=${type}&vid=${id}`)
    }
    catch (error) {
      console.log(error, 'error')
    }
    const response: any = await $fetch(`https://www.acgfans.org/cj.php?type=${type}&vid=${id}`)

    console.log(response, 'sss', `https://www.acgfans.org/cj.php?type=${type}&vid=${id}`)

    // const { episodes = [] } = response.result.main_section
    // const tag = { 2: '免费', 13: '会员', 8: '付费' } as any
    // const html = episodes.map(({ title, long_title, share_url, status }: any) => {
    //   const isbr = +title > episodes.length - 1
    //   if (type === 'ep')
    //     return `第${title}话@@${long_title}@@暂无内容${isbr ? '' : '||\n'}`

    //   return `第${title}话${long_title ? ` ${long_title}$` : '$'}${share_url.replace('http:', '')}$${vip ? tag[status] : ''}${isbr ? '' : '\n'}`
    // })

    // return html
  }
  catch (e: any) {
    const status = e?.response?.status || 500
    setResponseStatus(event, status)
    return {
      error: e
    }
  }
})
