const { resolve } = require('path')
const themeConfig = require('@spiralbtc/vuepress-devkit-theme/config')

const title = 'Bitcoin Dev Kit Documentation'
const baseUrl = 'https://bitcoindevkit.org'
const githubUrl = 'https://github.com/bitcoindevkit'
const discordUrl = 'https://discord.gg/dstn4dQ'
const twitterUrl = 'https://twitter.com/intent/follow?screen_name=bitcoindevkit'
const themeColor = '#ffffff'

const docsSidebar = [
  {
    title: 'Documentation',
    collapsable: false,
    children: [
      ['/getting-started', 'Getting Started'],
      {
        title: "BDK-CLI",
        collapsable: true,
        children: [
          '/bdk-cli/introduction',
          '/bdk-cli/installation',
          '/bdk-cli/concept',
          '/bdk-cli/interface',
          '/bdk-cli/regtest',
          '/bdk-cli/compiler',
          '/bdk-cli/playground'
        ]
      },
      '/descriptors/',
      '/examples/',
    ]
  },
  {
    title: 'API Reference',
    collapsable: false,
    children: [
      ['https://docs.rs/bdk/', 'Rust Stable Docs'],
      ['https://bitcoindevkit.org/docs-rs/bdk/nightly/latest/bdk/', 'Rust Nightly Docs'],
      ['https://bitcoindevkit.org/android/', 'Android Docs'],
      ['https://bitcoindevkit.org/jvm/', 'Kotlin/JVM Docs'],
      ['https://bitcoindevkit.org/java/', 'Java Docs'],
    ],
  }
]

const tutorialSidebar = [
  {
    title: 'Tutorials',
    collapsable: false,
    children: [
      '/tutorials/hello-world',
      '/tutorials/Bitcoin_Core_RPC_Demo',
      '/tutorials/compact_filters_demo',
      '/tutorials/descriptors_in_the_wild',
      '/tutorials/hidden-power-of-bitcoin',
      '/tutorials/descriptor_based_paper_wallet',
      '/tutorials/spending_policy_demo',
      '/tutorials/exploring_bdk_rn',
      '/tutorials/using_bdk_with_hardware_wallets',
      '/tutorials/exploring_bdk_flutter',
    ],
  }
]

const blogSidebar = [
  {
    title: 'Blog',
    collapsable: false,
    children: [
      ['/blog/', 'Articles'],
      ['/blog/tags/', 'Tags'],
      ['/blog/author/', 'Authors']
    ]
  }
]

module.exports = {
  title,
  description: 'The Bitcoin Dev Kit (BDK) project (originally called Magical Bitcoin 🧙) aims to build a collection of tools and libraries that are designed to be a solid foundation for cross platform Bitcoin wallets, along with a fully working reference implementation wallet called Magical Bitcoin.',
  theme: resolve(__dirname, '../../node_modules/@spiralbtc/vuepress-devkit-theme'),
  ...themeConfig({
    baseUrl,
    title,
    themeColor,
    tags: ['Bitcoin', 'Bitcoin Dev Kit', 'BDK']
  }),
  themeConfig: {
    domain: baseUrl,
    logo: '/img/logo.svg',
    displayAllHeaders: false,
    repo: 'bitcoindevkit/bitcoindevkit.org',
    docsDir: 'docs',
    editLinks: true,
    sidebarDepth: 0,
    nav: [
      {
        text: 'Docs',
        link: '/getting-started/'
      },
      {
        text: 'Tutorials',
        link: '/tutorials/hello-world'
      },
      {
        text: 'Blog',
        link: '/blog/'
      },
      {
        text: 'Discord',
        link: discordUrl
      },
      {
        text: 'GitHub',
        link: githubUrl,
        rel: 'noopener noreferrer'
      }
    ],
    sidebar: {
      '/_blog/': blogSidebar,
      '/blog/': blogSidebar,
      '/tutorials/': tutorialSidebar,
      '/': docsSidebar,
    },
    footer: {
      links: [
        {
          title: 'Docs',
          children: [
            {
              text: 'Getting Started',
              link: '/getting-started/'
            },
            {
              text: 'BDK-CLI',
              link: '/bdk-cli/installation/'
            },
            {
              text: 'Descriptors',
              link: '/descriptors/'
            }
          ]
        },
        {
          title: 'Community',
          children: [
            {
              text: 'GitHub',
              link: githubUrl,
              rel: 'noopener noreferrer'
            },
            {
              text: 'Twitter',
              link: twitterUrl,
              rel: 'noopener noreferrer'
            },
            {
              text: 'Chat on Discord',
              link: discordUrl,
              rel: 'noopener noreferrer'
            }
          ]
        },
        {
          title: 'More',
          children: [
            {
              text: 'Blog',
              link: '/blog/'
            },
            {
              text: 'Supporters',
              link: '/supporters/'
            }
          ]
        }
      ],
      copyright: `Copyright © ${(new Date()).getUTCFullYear()} BDK Developers`
    }
  }
}
