import React from 'react';
import styles from './styles.module.css';

interface StepsProps {
  children: React.ReactNode;
}

export default function Steps({ children }: StepsProps) {
  return <div className={styles.steps}>{children}</div>;
}
