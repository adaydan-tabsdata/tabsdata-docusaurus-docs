import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Tabsdata',
  tagline: 'Documentation',
  favicon: 'img/favicon.svg',

  future: {
    v4: true,
  },

  url: 'https://adaydan-tabsdata.github.io',
  baseUrl: '/tabsdata-docusaurus-docs/',
  organizationName: 'adaydan-tabsdata',
  projectName: 'tabsdata-docusaurus-docs',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          lastVersion: 'current',
          versions: {
            current: {
              label: '2.0.0',
              badge: true,
            },
          },
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Tabsdata',
      logo: {
        alt: 'Tabsdata Logo',
        src: 'img/logo-light.svg',
        srcDark: 'img/logo-dark.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'guideSidebar',
          position: 'left',
          label: 'Guide',
        },
        {
          type: 'docSidebar',
          sidebarId: 'tutorialsSidebar',
          position: 'left',
          label: 'Tutorials',
        },
        {
          type: 'docSidebar',
          sidebarId: 'apiSidebar',
          position: 'left',
          label: 'API Reference',
        },
        {
          type: 'docsVersionDropdown',
          position: 'right',
        },
        {
          href: 'https://github.com/tabsdata',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {label: 'Guide', to: '/docs/guide/intro/overview'},
            {label: 'Tutorials', to: '/docs/tutorials/index'},
            {label: 'API Reference', to: '/docs/api/alphabetical-index'},
          ],
        },
        {
          title: 'More',
          items: [
            {label: 'GitHub', href: 'https://github.com/tabsdata'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Tabsdata. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['python', 'bash', 'sql', 'yaml', 'toml'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
