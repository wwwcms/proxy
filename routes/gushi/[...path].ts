import { load } from 'cheerio'

function getParams(str: string) {
  const inputString = str
  const regexForNumber = /\((\d+)\,/
  const regexForHex = /\'([A-F0-9]+)\'/

  const matchNumber = inputString.match(regexForNumber)
  const matchHex = inputString.match(regexForHex)

  const number = matchNumber && matchNumber[1]
  const hex = matchHex && matchHex[1]

  return { number, hex }
}

export default defineEventHandler(async event => {
  // const query = getQuery(event)
  try {
    const { path: id } = event.context.params || {}
    try {
      const html: any = await $fetch(`https://so.gushiwen.cn/shiwenv_${id}.aspx`)
      const $ = load(html)
      const sons = $('.contyishang')
      const list = []
      for (let i = 0; i < sons.length; i++) {
        const item = $(sons.eq(i))
        const a = item.find('a')
        const title = item.find('h2').text()
        item.find('h2').remove()
        // 移除所有html标签, p标的替换成 \n\n
        const content = item.html()?.replace(/<br>/g, '\n').replace(/<p>/g, '\n\n').replace(/<\/p>/g, '\n\n').replace(/<[^>]+>/g, '').replace(/▲/g, '').trim().split(/\n|\n\n|\n\n\n/).map(item => item.trim()).join('\n')
        const cankao = $('.cankao')
        cankao.find('p').eq(0).remove()
        const literature = cankao.html()?.replace(/<[^>]+>/g, '').replace(/▲/g, '').trim().split('\n\n\n').map(item => item.replace(/\n/g, '')).join('\n\n')
        list.push({ title, content, literature })
        // fanyiShow(972,'FFDD9992C473C3C4') 取出中间的 792 和 FFDD9992C473C3C4 的正则

        const fanyiShow = async (url: string) => {
          const { number, hex } = getParams(url)
          const name = url.includes('fanyi') ? 'fanyi' : 'shangxi'
          const res: any = await $fetch(`https://so.gushiwen.cn/nocdn/ajax${name}.aspx?id=${number}&idjm=${hex}`)
          const $ = load(res)
          const conty = $('.contyishang')
          const title = conty.find('h2').text()
          conty.find('h2').remove()
          const content = $('.contyishang').html()?.replace(/<br>/g, '\n').replace(/<p>/g, '\n').replace(/<\/p>/g, '\n').replace(/<[^>]+>/g, '').replace(/▲/g, '').trim().split(/\n|\n\n|\n\n\n/).map(item => item.trim()).join('\n')
          const cankao = $('.cankao')
          cankao.find('p').eq(0).remove()
          const literature = cankao.html()?.replace(/<[^>]+>/g, '').replace(/▲/g, '').trim().split('\n\n\n').map(item => item.replace(/\n/g, '')).join('\n\n')
          return { title, content, literature }
        }

        for (let j = 0; j < a.length; j++) {
          const ad = a.eq(j)
          if (ad.text() === '展开阅读全文 ∨') {
            const url = ad.attr('href')
            const data = await fanyiShow(url!)
            list.splice(i, 1, data)
          }
        }
      }

      console.log(list, 'list')
      return list
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
