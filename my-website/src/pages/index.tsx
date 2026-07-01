import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import styles from './index.module.css';

// Lucide-style SVGs — stroke="currentColor" inherits light/dark text color
const Icons = {
  rocket: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
    </svg>
  ),
  laptop: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m14 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/>
    </svg>
  ),
  book: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>
    </svg>
  ),
  upload: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>
    </svg>
  ),
  arrowRight: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
    </svg>
  ),
  download: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>
    </svg>
  ),
  code: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/>
    </svg>
  ),
  radio: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/>
      <circle cx="12" cy="12" r="2"/>
      <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1"/>
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
    </svg>
  ),
  database: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/>
      <path d="M3 12A9 3 0 0 0 21 12"/>
    </svg>
  ),
  bot: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/>
      <path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>
    </svg>
  ),
  plug: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
      <path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>
    </svg>
  ),
  lock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  terminal: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/>
    </svg>
  ),
  monitor: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/>
      <line x1="12" x2="12" y1="17" y2="21"/>
    </svg>
  ),
  key: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/>
      <path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/>
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  wrench: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  ),
  globe: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
      <path d="M2 12h20"/>
    </svg>
  ),
};

interface CardItem {
  title: string;
  description: string;
  to: string;
  icon: React.ReactNode;
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
    icon: Icons.rocket,
  },
];

const EXPLORE: CardItem[] = [
  { title: 'Installation', description: 'Install Tabsdata on your machine or server.', to: '/docs/guide/intro/getting-started', icon: Icons.laptop },
  { title: 'Core concepts', description: 'Learn the pub/sub model, collections, tables, and functions.', to: '/docs/guide/intro/key-concepts', icon: Icons.book },
  { title: 'Publishers', description: 'Read data from external systems into Tabsdata tables.', to: '/docs/guide/publishers', icon: Icons.upload },
  { title: 'Transformers', description: 'Transform data with Python and the TableFrame API.', to: '/docs/guide/transformers/working-with-transformers', icon: Icons.arrowRight },
  { title: 'Subscribers', description: 'Write data from tables to external destinations.', to: '/docs/guide/subscribers', icon: Icons.download },
  { title: 'TableFrame API', description: 'Master data transformations with lazy evaluation.', to: '/docs/guide/tables/table-frame', icon: Icons.code },
];

const ADVANCED: CardItem[] = [
  { title: 'Kafka streaming', description: 'Stream data from Kafka topics in real-time.', to: '/docs/guide/kafka/working-with-kafka', icon: Icons.radio },
  { title: 'Data quality', description: 'Validate data and route invalid rows to quarantine tables.', to: '/docs/guide/data-quality/data-quality', icon: Icons.shield },
  { title: 'Catalogs', description: 'Sync metadata to AWS Glue and Databricks Unity Catalog.', to: '/docs/guide/catalogs', icon: Icons.database },
  { title: 'AI agent', description: 'Interact with Tabsdata using natural language.', to: '/docs/guide/platform/ai-agent', icon: Icons.bot },
  { title: 'Custom plugins', description: 'Connect to systems without native support.', to: '/docs/guide/plugins/working-with-connector-plugins', icon: Icons.plug },
  { title: 'Security', description: 'Configure HTTPS and SSL/TLS for secure communication.', to: '/docs/guide/platform/security', icon: Icons.lock },
];

const OPERATIONS: CardItem[] = [
  { title: 'CLI reference', description: 'Complete command reference for td and tdserver.', to: '/docs/guide/operations/cli-commands', icon: Icons.terminal },
  { title: 'User interface', description: 'Manage functions, tables, and executions via the web UI.', to: '/docs/guide/platform/user-interface', icon: Icons.monitor },
  { title: 'Secrets', description: 'Store credentials securely with environment variables or Vault.', to: '/docs/guide/platform/secrets-management', icon: Icons.key },
  { title: 'Permissions', description: 'Manage user roles and access control.', to: '/docs/guide/platform/permissioning', icon: Icons.users },
  { title: 'Troubleshooting', description: 'Common issues and how to resolve them.', to: '/docs/guide/operations/troubleshooting', icon: Icons.wrench },
  { title: 'Connectors', description: '20+ supported data sources and destinations.', to: '/docs/guide/publishers', icon: Icons.globe },
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
