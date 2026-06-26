import React from 'react';
import styles from './styles.module.css';

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
  children?: React.ReactNode;
}

export function ParamField({ path, query, body, header, type, required, default: defaultVal, children }: ParamFieldProps) {
  const name = path ?? query ?? body ?? header ?? '';
  return (
    <div className={styles.field}>
      <div className={styles.fieldHeader}>
        <code className={styles.fieldName}>{name}</code>
        {type && <span className={styles.fieldType}>{type}</span>}
        {required && <span className={styles.badge + ' ' + styles.required}>required</span>}
        {defaultVal !== undefined && (
          <span className={styles.badge + ' ' + styles.defaultBadge}>default: {defaultVal}</span>
        )}
      </div>
      {children && <div className={styles.fieldDesc}>{children}</div>}
    </div>
  );
}

export function ResponseField({ name, type, required, children }: ResponseFieldProps) {
  return (
    <div className={styles.field}>
      <div className={styles.fieldHeader}>
        <code className={styles.fieldName}>{name}</code>
        {type && <span className={styles.fieldType}>{type}</span>}
        {required && <span className={styles.badge + ' ' + styles.required}>required</span>}
      </div>
      {children && <div className={styles.fieldDesc}>{children}</div>}
    </div>
  );
}
