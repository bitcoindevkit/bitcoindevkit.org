const { resolve } = require('path')
const themeConfig = require('../../theme/config')

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
          '/bdk-cli/installation',
          '/bdk-cli/concept',
          '/bdk-cli/interface',
          '/bdk-cli/regtest',
          '/bdk-cli/compiler',
          '/bdk-cli/playground'
        ]
      },
      '/descriptors/',
    ]
  },
  {
    title: 'API Reference',
    collapsable: false,
    children: [
      ['https://docs.rs/bdk/0.11.0/bdk/', 'Stable Docs'],
      ['https://bitcoindevkit.org/docs-rs/bdk/nightly/latest/bdk/', 'Nightliy Docs']
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
  theme: resolve(__dirname, '../../theme'),
  ...themeConfig({
    baseUrl,
    title,
    themeColor
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
        text: 'BDK-CLI',
        link: '/bdk-cli/'
      },
      {
        text: 'Descriptors',
        link: '/descriptors/'
      },
      {
        text: 'Blog',
        link: '/blog/'
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
      '/': docsSidebar,
    },
    footer: {
      links: [
        {
          title: 'Docs',
          children: [
            {
              text: 'Getting Started',
              link: '/use_cases/'
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
