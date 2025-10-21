import {defineConfig} from '@rsbuild/core'
import {pluginPreact} from '@rsbuild/plugin-preact'

export default defineConfig({
  plugins: [pluginPreact()],
  html: {
    title: 'expeditio',
    meta: {
      charset: {charset: 'UTF-8'},
      viewport:
        'width=device-width, initial-scale=1.0, interactive-widget=resizes-content',
    },
  },
})
