import puppeteer from 'puppeteer'
import { load } from 'cheerio'

export default defineEventHandler(async event => {
  try {
    const { path: id } = event.context.params || {}
    try {
      const browser = await puppeteer.launch({ headless: true })
      const page = await browser.newPage()
      await page.setCookie({ name: 'BT_auth', value: 'e05bVo_PW6YXhrC4Gy5UMjKkIE70ptr1rAUNUvg5NOYNP8MY8DEl7wvI0o1vciDAnUgvmfaDFpG6EESliLEygxItfLZVs53aUEp39BNLl2x98yhh5KpbsPoO0_2v6oNuhhzcf1VNQCbPKc7IeNu94OwICMHg4Ewy2InLLXW49yLO', domain: 'www.btnull.org', path: '/', httpOnly: true, secure: true })
      await page.goto(`https://www.btnull.org/ajax/downurl/${id}_ac/`, { waitUntil: 'networkidle0', timeout: 60000 })
      const html = await page.content()
      console.log('ddddd', html)
      const $ = load(html)

      console.log($, 'ddddd', html)
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
