module.exports = {
  title: 'Minorm',
  description: 'Minimal ORM for you node.js project',
  base: '/minorm/',

  themeConfig: {
    repo: 'Arilas/minorm',
    repoLabel: 'GitHub',
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
            // 'relations',
            // 'query-examples',
          ],
        },
      ],
    },
  },
}
