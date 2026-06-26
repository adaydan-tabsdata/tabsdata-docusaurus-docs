import React from 'react';
import { useStorageSlot } from '@docusaurus/theme-common';
import styles from './styles.module.css';

const STORAGE_KEY = 'docusaurus.tab.os';

export default function OsToggle(): JSX.Element {
  const [storedOs, storageSlot] = useStorageSlot(STORAGE_KEY);
  const current = storedOs ?? 'mac';

  return (
    <div className={styles.toggle} aria-label="Select operating system">
      <button
        className={`${styles.option} ${current === 'mac' ? styles.active : ''}`}
        onClick={() => storageSlot.set('mac')}
        aria-pressed={current === 'mac'}
      >
        macOS
      </button>
      <button
        className={`${styles.option} ${current === 'windows' ? styles.active : ''}`}
        onClick={() => storageSlot.set('windows')}
        aria-pressed={current === 'windows'}
      >
        Windows
      </button>
    </div>
  );
}
