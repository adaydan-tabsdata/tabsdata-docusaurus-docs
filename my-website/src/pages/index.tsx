import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import styles from './index.module.css';

interface CardItem {
  title: string;
  description: string;
  to: string;
  icon: string;
}

function DocCard({ title, description, to, icon }: CardItem) {
  return (
    <Link to={to} className={styles.card}>
      <div className={styles.cardIcon}>{icon}</div>
      <div className={styles.cardBody}>
        <div className={styles.cardTitle}>{title}</div>
        <div className={styles.cardDesc}>{description}</div>
      </div>
      <span className={styles.cardArrow}>↗</span>
    </Link>
  );
}

function Section({ title, items }: { title: string; items: CardItem[] }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <div className={styles.grid}>
        {items.map(item => <DocCard key={item.to} {...item} />)}
      </div>
    </section>
  );
}

const START: CardItem[] = [
  {
    title: 'Quick start',
    description: 'Get Tabsdata running and execute your first data flow in 10 minutes.',
    to: '/docs/guide/intro/getting-started',
    icon: '🚀',
  },
];

const EXPLORE: CardItem[] = [
  {
    title: 'Installation',
    description: 'Install Tabsdata on your machine or server.',
    to: '/docs/guide/intro/getting-started',
    icon: '⬇️',
  },
  {
    title: 'Core concepts',
    description: 'Learn the pub/sub model, collections, tables, and functions.',
    to: '/docs/guide/intro/key-concepts',
    icon: '🔵',
  },
  {
    title: 'Publishers',
    description: 'Read data from external systems into Tabsdata tables.',
    to: '/docs/guide/publishers/index',
    icon: '⬆️',
  },
  {
    title: 'Transformers',
    description: 'Transform data with Python and the TableFrame API.',
    to: '/docs/guide/transformers/working-with-transformers',
    icon: '→',
  },
  {
    title: 'Subscribers',
    description: 'Write data from tables to external destinations.',
    to: '/docs/guide/subscribers/index',
    icon: '⬇️',
  },
  {
    title: 'TableFrame API',
    description: 'Master data transformations with lazy evaluation.',
    to: '/docs/guide/tables/table-frame',
    icon: '</>',
  },
];

const ADVANCED: CardItem[] = [
  {
    title: 'Kafka streaming',
    description: 'Stream data from Kafka topics in real-time.',
    to: '/docs/guide/kafka/working-with-kafka',
    icon: '📡',
  },
  {
    title: 'Data quality',
    description: 'Validate data and route invalid rows to quarantine tables.',
    to: '/docs/guide/data-quality/data-quality',
    icon: '🛡️',
  },
  {
    title: 'Catalogs',
    description: 'Sync metadata to AWS Glue and Databricks Unity Catalog.',
    to: '/docs/guide/catalogs/index',
    icon: '🗄️',
  },
  {
    title: 'AI agent',
    description: 'Interact with Tabsdata using natural language.',
    to: '/docs/guide/platform/ai-agent',
    icon: '🤖',
  },
  {
    title: 'Custom plugins',
    description: 'Connect to systems without native support.',
    to: '/docs/guide/plugins/working-with-connector-plugins',
    icon: '🔌',
  },
  {
    title: 'Security',
    description: 'Configure HTTPS and SSL/TLS for secure communication.',
    to: '/docs/guide/platform/security',
    icon: '🔒',
  },
];

const OPERATIONS: CardItem[] = [
  {
    title: 'CLI reference',
    description: 'Complete command reference for td and tdserver.',
    to: '/docs/guide/operations/cli-commands',
    icon: '>_',
  },
  {
    title: 'User interface',
    description: 'Manage functions, tables, and executions via the web UI.',
    to: '/docs/guide/platform/user-interface',
    icon: '👁️',
  },
  {
    title: 'Secrets',
    description: 'Store credentials securely with environment variables or Vault.',
    to: '/docs/guide/platform/secrets-management/index',
    icon: '🔑',
  },
  {
    title: 'Permissions',
    description: 'Manage user roles and access control.',
    to: '/docs/guide/platform/permissioning',
    icon: '🛡️',
  },
  {
    title: 'Troubleshooting',
    description: 'Common issues and how to resolve them.',
    to: '/docs/guide/operations/troubleshooting',
    icon: '🔧',
  },
  {
    title: 'Connectors',
    description: '20+ supported data sources and destinations.',
    to: '/docs/guide/publishers/index',
    icon: '🌐',
  },
];

export default function Home(): JSX.Element {
  return (
    <Layout title="Welcome" description="Real-time ETL built on Pub/Sub for Tables.">
      <main className={styles.main}>
        <div className={styles.hero}>
          <p className={styles.eyebrow}>WELCOME TO TABSDATA</p>
          <h1 className={styles.heroTitle}>Tabsdata</h1>
          <p className={styles.heroTagline}>
            Real-time ETL built on Pub/Sub for Tables. Publish data from any source, transform it with Python, and subscribe to fresh, consistent data across your organization.
          </p>
          <p className={styles.heroBody}>
            Tabsdata removes the complexity of traditional ETL pipelines. Define publishers to read data, transformers to modify it, and subscribers to write it. Tabsdata manages dependencies automatically and triggers functions in real-time.
          </p>
        </div>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Start here</h2>
          <div className={styles.startCard}>
            <DocCard {...START[0]} />
          </div>
        </section>

        <Section title="Explore the docs" items={EXPLORE} />
        <Section title="Advanced features" items={ADVANCED} />
        <Section title="Operations" items={OPERATIONS} />
      </main>
    </Layout>
  );
}
