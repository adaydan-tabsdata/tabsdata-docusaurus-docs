import React from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

interface CardProps {
  title: string;
  icon?: string;
  href?: string;
  children?: React.ReactNode;
}

interface CardGroupProps {
  cols?: number;
  children: React.ReactNode;
}

export function Card({ title, icon, href, children }: CardProps) {
  const inner = (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        {icon && <span className={styles.cardIcon}>{icon}</span>}
        <span className={styles.cardTitle}>{title}</span>
      </div>
      {children && <div className={styles.cardBody}>{children}</div>}
    </div>
  );

  if (href) {
    return (
      <Link to={href} className={styles.cardLink}>
        {inner}
      </Link>
    );
  }

  return inner;
}

export function CardGroup({ cols = 2, children }: CardGroupProps) {
  return (
    <div
      className={styles.cardGroup}
      style={{ '--card-cols': cols } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
