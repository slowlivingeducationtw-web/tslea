import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: '2lbk0ta8',
    dataset: 'production',
  },
  // 後台部署到 https://tslea.sanity.studio（Sanity 免費託管）
  studioHost: 'tslea',
  deployment: {
    appId: 'wd7ruy3koicfdjm7frj6vvbn',
  },
})
