// @ts-check
import dxhuii from '@dxhuii/eslint-config'
import antfu from '@antfu/eslint-config'

export default antfu({ formatters: true, typescript: true }, dxhuii({}), {
  ignores: [
    '**/public/**',
    '**/dist/**',
    '**/node_modules/**'
  ]
})
