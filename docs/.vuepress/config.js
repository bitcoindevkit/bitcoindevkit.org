const { resolve } = require('path')
const themeConfig = require('@spiralbtc/vuepress-devkit-theme/config')

const title = 'Bitcoin Dev Kit Documentation'
const baseUrl = 'https://bitcoindevkit.org'
const githubUrl = 'https://github.com/bitcoindevkit'
const discordUrl = 'https://discord.gg/dstn4dQ'
const twitterUrl = 'https://twitter.com/intent/follow?screen_name=bitcoindevkit'
const nostrUrl = 'nostr:npub13dk3dke4zm9vdkucm7f6vv7vhqgkevgg3gju9kr2wzumz7nrykdq0dgnvc'
const themeColor = '#ffffff'

const builtWithBdkSidebar = [
  {
    title: 'Built With BDK',
    collapsable: false,
    children: [
      ["/adoption/all.md", "All"],
      ["/adoption/mobile.md", "Mobile"],
      ["/adoption/desktop.md", "Desktop"],
      ["/adoption/hardware.md", "Hardware"],
      ["/adoption/web.md", "Web"],
      ["/adoption/custodial.md", "Custodial"],
      ["/adoption/exchange.md", "Exchange"],
      ["/adoption/infrastructure.md", "Infrastructure"],
    ]
  }
]

const foundationSidebar = [
  {
    title: 'Foundation',
    collapsable: false,
    children: [
      ['/foundation/about.md', 'About Us'],
      ['/foundation/members.md', 'Members'],
      ['/foundation/grantees.md', 'Grantees'],
      ['/foundation/grants.md', 'Grants'],
      ['/foundation/pgp.md', 'PGP Keys'],
    ]
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
        text: 'Github',
        link: 'https://github.com/bitcoindevkit'
      },
      {
        text: 'Docs',
        link: '/docs/'
      },
      {
        text: 'Adoption',
        link: '/adoption/all.md'
      },
      {
        text: 'Foundation',
        link: '/foundation/about.md'
      },
      {
        text: 'Blog',
        link: '/blog/'
      },
    ],
    sidebar: {
      '/adoption/': builtWithBdkSidebar,
      '/_blog/': blogSidebar,
      '/blog/': blogSidebar,
      '/foundation/': foundationSidebar,
    },
    footer: {
      links: [
        {
          title: 'Docs',
          children: [
            {
              text: 'Book',
              link: '/docs/#book'
            },
            {
              text: 'Rust APIs',
              link: '/docs/#rust-apis'
            },
            {
              text: 'Other APIs',
              link: '/docs/#other-apis'
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
              text: 'Nostr',
              link: nostrUrl,
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
              link: '/foundation/supporters/'
            },
            {
              text: 'BDK Foundation',
              link: '/foundation/'
            }
          ]
        }
      ],
      copyright: `Copyright © ${(new Date()).getUTCFullYear()} BDK Developers`
    }
  }
}
