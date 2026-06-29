import React, { useState } from 'react';
import styles from './styles.module.css';

interface ApiEntryProps {
  id?: string;
  kind?: 'class' | 'function' | 'method' | 'property' | 'attribute';
  name?: string;
  signature: string;
  bases?: string;
  source?: string;
  children?: React.ReactNode;
}

export function ApiEntry({ id, kind = 'function', signature, bases, source, children }: ApiEntryProps) {
  const [open, setOpen] = useState(false);
  const keyword = kind === 'class' ? 'class ' : kind === 'property' ? 'property ' : '';

  return (
    <div id={id} className={styles.entry}>
      <button
        className={`${styles.entryHeader} ${open ? styles.entryOpen : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className={styles.entryArrow}>{open ? '▾' : '▸'}</span>
        <code className={styles.entrySignature}>
          {keyword && <span className={styles.entryKeyword}>{keyword}</span>}
          {signature}
        </code>
      </button>
      {open && (
        <div className={styles.entryBody}>
          {(source || bases) && (
            <div className={styles.entryMeta}>
              {bases && <span className={styles.bases}>Bases: <code>{bases}</code></span>}
              {source && (
                <a className={styles.sourceLink} href={source} target="_blank" rel="noopener noreferrer">
                  View source ↗
                </a>
              )}
            </div>
          )}
          <div className={styles.entryContent}>{children}</div>
        </div>
      )}
    </div>
  );
}

interface ParamFieldProps {
  path?: string;
  query?: string;
  body?: string;
  header?: string;
  type?: string;
  required?: boolean;
  default?: string;
  children?: React.ReactNode;
}

interface ResponseFieldProps {
  name?: string;
  type?: string;
  required?: boolean;
  kind?: 'variable' | 'property' | 'parameter' | 'attribute';
  children?: React.ReactNode;
}

export function ParamField({ path, query, body, header, type, required, default: defaultVal, children }: ParamFieldProps) {
  const name = path ?? query ?? body ?? header ?? '';
  return (
    <div className={styles.field}>
      <div className={`${styles.fieldKindBadge} ${styles.kindParameter}`}>parameter</div>
      <div className={styles.fieldHeader}>
        <code className={styles.fieldName}>{name}</code>
        {type && <span className={styles.fieldType}>{type}</span>}
        {required && <span className={`${styles.badge} ${styles.required}`}>required</span>}
        {defaultVal !== undefined && (
          <span className={`${styles.badge} ${styles.defaultBadge}`}>default: {defaultVal}</span>
        )}
      </div>
      {children && <div className={styles.fieldDesc}>{children}</div>}
    </div>
  );
}

export function ResponseField({ name, type, required, kind = 'property', children }: ResponseFieldProps) {
  const kindClass = styles[`kind${kind.charAt(0).toUpperCase()}${kind.slice(1)}`] ?? styles.kindProperty;
  return (
    <div className={styles.field}>
      <div className={`${styles.fieldKindBadge} ${kindClass}`}>{kind}</div>
      <div className={styles.fieldHeader}>
        <code className={styles.fieldName}>{name}</code>
        {type && <span className={styles.fieldType}>{type}</span>}
        {required && <span className={`${styles.badge} ${styles.required}`}>required</span>}
      </div>
      {children && <div className={styles.fieldDesc}>{children}</div>}
    </div>
  );
}
