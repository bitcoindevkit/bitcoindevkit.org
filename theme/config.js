const { resolve } = require('path')
const footnotes = require('markdown-it-footnote')
const implicitFigures = require('markdown-it-implicit-figures')
const slugify = require('./slugify')
const preprocessMarkdown = resolve(__dirname, './preprocessMarkdown')

const extractDescription = text => {
  if (!text) return
  const paragraph = text.match(/^[A-Za-z].*(?:\n[A-Za-z].*)*/m)
  return paragraph ? paragraph.toString().replace(/[\*\_\(\)\[\]]/g, '') : null
}

module.exports = opts => {
  const { baseUrl, title, themeColor, pageSuffix = '/' } = opts
  const sitemap = {
    hostname: baseUrl,
    exclude: ['/404.html']
  }
  return {
    chainWebpack(config) {
      config.module
        .rule('md')
        .test(/\.md$/)
        .use(preprocessMarkdown)
        .loader(preprocessMarkdown)
        .end()
    },
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
    markdown: {
      extendMarkdown(md) {
        md.use(footnotes)
        md.use(implicitFigures)
      },
      pageSuffix,
      slugify
    },
    plugins: [
      ['seo', {
        siteTitle: (_, $site) => $site.title,
        title: $page => $page.title,
        description: $page => $page.frontmatter.description || extractDescription($page._strippedContent),
        author: (_, $site) => { name: title },
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
    ]
  }
}
