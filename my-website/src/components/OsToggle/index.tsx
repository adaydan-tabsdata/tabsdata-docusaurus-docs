import React, { useState, useRef, useEffect } from 'react';
import { useStorageSlot } from '@docusaurus/theme-common';
import styles from './styles.module.css';

const STORAGE_KEY = 'docusaurus.tab.os';

const OPTIONS = [
  { value: 'mac', label: 'macOS' },
  { value: 'windows', label: 'Windows' },
];

export default function OsToggle(): JSX.Element {
  const [storedOs, storageSlot] = useStorageSlot(STORAGE_KEY);
  const current = storedOs ?? 'mac';
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const currentLabel = OPTIONS.find(o => o.value === current)?.label ?? 'macOS';

  return (
    <div ref={ref} className={styles.dropdown}>
      <button
        className={styles.trigger}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {currentLabel}
        <svg className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
          width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <ul className={styles.menu} role="listbox">
          {OPTIONS.map(opt => (
            <li
              key={opt.value}
              role="option"
              aria-selected={current === opt.value}
              className={`${styles.menuItem} ${current === opt.value ? styles.menuItemActive : ''}`}
              onClick={() => { storageSlot.set(opt.value); setOpen(false); }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
