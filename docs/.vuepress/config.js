module.exports = {
  title: 'Minorm',
  description: 'Minimal ORM for you node.js project',
  base: '/minorm/',

  themeConfig: {
    repo: 'Arilas/minorm',
    repoLabel: 'GitHub',
    sidebarDepth: 3,
    nav: [
      {
        text: 'Guide',
        link: '/guide/',
      },
    ],

    sidebar: {
      '/guide/': [
        {
          title: 'Guide',
          collapsable: false,
          children: [
            'installation',
            'getting-started',
            'repositories',
            'models',
            'query-builder',
            // 'relations',
            // 'query-examples',
          ],
        },
      ],
    },
  },
}
