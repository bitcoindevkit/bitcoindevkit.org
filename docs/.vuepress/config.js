const { resolve } = require('path')
const footnotes = require('markdown-it-footnote')
const implicitFigures = require('markdown-it-implicit-figures')
const slugify = require('../../theme/slugify')
const preprocessMarkdown = resolve(__dirname, '../../theme/preprocessMarkdown')

const title = 'Bitcoin Dev Kit Documentation'
const baseUrl = 'https://bitcoindevkit.org'
const githubUrl = 'https://github.com/bitcoindevkit'
const discordUrl = 'https://discord.gg/dstn4dQ'
const twitterUrl = 'https://twitter.com/intent/follow?screen_name=bitcoindevkit'
const themeColor = '#ffffff'
const pageSuffix = '/'
const info = { name: title }
const extractDescription = text => {
  if (!text) return
  const paragraph = text.match(/^[A-Za-z].*(?:\n[A-Za-z].*)*/m)
  return paragraph ? paragraph.toString().replace(/[\*\_\(\)\[\]]/g, '') : null
}
const sitemap = {
  hostname: baseUrl,
  exclude: ['/404.html']
}
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
  head: [
    ['meta', { name: 'viewport', content: 'width=device-width,initial-scale=1.0' }],
    ['link', { rel: 'preload', href: '/fonts/manrope-400.woff2', as: 'font', crossorigin: true }],
    ['link', { rel: 'preload', href: '/fonts/manrope-600.woff2', as: 'font', crossorigin: true }],
    ['link', { rel: 'preload', href: '/fonts/ibm-plex-mono-400.woff2', as: 'font', crossorigin: true }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/img/favicon/apple-touch-icon.png' }],
    ['link', { rel: 'manifest', href: '/site.webmanifest' }],
    ['link', { rel: 'stylesheet', href: '/css/variables.css' }],
    ['link', { name: 'msapplication-config', content: '/browserconfig.xml' }],
    ['link', { name: 'msapplication-TileColor', content: themeColor }],
    ['link', { name: 'theme-color', content: themeColor }]
  ],
  chainWebpack (config) {
    config.module
      .rule('md')
      .test(/\.md$/)
      .use(preprocessMarkdown)
        .loader(preprocessMarkdown)
        .end()
  },
  plugins: [
    ['seo', {
      siteTitle: (_, $site) => $site.title,
      title: $page => $page.title,
      description: $page => $page.frontmatter.description || extractDescription($page._strippedContent),
      author: (_, $site) => info,
      tags: $page => ($page.frontmatter.tags || ['Bitcoin', 'Bitcoin Dev Kit', 'BDK']),
      twitterCard: _ => 'summary',
      type: $page => 'article',
      url: (_, $site, path) => `${baseUrl}${path.replace('.html', pageSuffix)}`,
      image: ($page, $site) => `${baseUrl}/card.png`
    }],
    ['clean-urls', {
      normalSuffix: pageSuffix,
      indexSuffix: pageSuffix,
      notFoundPath: '/404.html',
    }],
    ['code-copy', {
      color: '#8F979E',
      backgroundTransition: false,
      staticIcon: true
    }],
    ['mermaidjs'],
    ['sitemap', sitemap],
    ['tabs', {
      tabsAttributes: {
        options: { useUrlFragment: false }
      }
    }],
    ['@vuepress/medium-zoom'],
    ['@vuepress/blog', {
      sitemap,
      directories: [
        {
          id: 'blog',
          dirname: '_blog',
          path: '/blog/',
          itemPermalink: '/blog/:slug',
          pagination: {
            lengthPerPage: 10,
            getPaginationPageTitle(pageNumber) {
              return `Page ${pageNumber}`
            }
          }
        },
      ],
      frontmatters: [
        {
          id: 'tags',
          keys: ['tags'],
          path: '/blog/tags/',
          title: '',
          frontmatter: {
            title: 'Tags'
          },
          pagination: {
            getPaginationPageTitle(pageNumber, key) {
              return `${capitalize(key)} - Page ${pageNumber}`
            }
          }
        },
        {
          id: 'author',
          keys: ['author', 'authors'],
          path: '/blog/author/',
          title: '',
          frontmatter: {
            title: 'Authors'
          },
          pagination: {
            getPaginationPageTitle(pageNumber, key) {
              return `${key} - Page ${pageNumber}`
            }
          }
        },
      ],
    }]
  ],
  markdown: {
    extendMarkdown(md) {
      md.use(footnotes)
      md.use(implicitFigures)
    },
    pageSuffix,
    slugify
  },
  theme: resolve(__dirname, '../../theme'),
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
