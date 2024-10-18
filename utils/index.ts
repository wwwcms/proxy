import CryptoJS from 'crypto-js'
/**
 * 接口数据加密函数
 * @param str string 需加密的json字符串
 * @param key string 加密key(16位)
 * @param iv string 加密向量(16位)
 * @return string 加密密文字符串
 */
export function js_encrypt(str: string, key: string, iv: string): string {
  // 密钥16位
  const keyBuffer = CryptoJS.enc.Utf8.parse(key)
  // 加密向量16位
  const ivBuffer = CryptoJS.enc.Utf8.parse(iv)
  const encrypted = CryptoJS.AES.encrypt(str, keyBuffer, {
    iv: ivBuffer,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  })

  return encrypted.toString()
}

/**
 * 接口数据解密函数
 * @param str string 已加密密文
 * @param key string 加密key(16位)
 * @param iv string 加密向量(16位)
 * @returns {*|string} 解密之后的json字符串
 */
export function js_decrypt(str: string, key: string, iv: string): string {
  // 密钥16位
  const keyBuffer = CryptoJS.enc.Utf8.parse(key)
  // 加密向量16位
  const ivBuffer = CryptoJS.enc.Utf8.parse(iv)
  const decrypted = CryptoJS.AES.decrypt(str, keyBuffer, {
    iv: ivBuffer,
    padding: CryptoJS.pad.Pkcs7
  }).toString(CryptoJS.enc.Utf8)

  return decrypted
}

export function getUrlParams2(url: string): { [key: string]: string } {
  const urlStr = url.split('?')[1]
  const urlSearchParams = new URLSearchParams(urlStr)
  const result = Object.fromEntries(urlSearchParams.entries())
  return result
}
