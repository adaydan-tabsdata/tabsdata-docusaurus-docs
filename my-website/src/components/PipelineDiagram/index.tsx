import React, { useState } from 'react';
import styles from './styles.module.css';

// ── Card icons ───────────────────────────────────────────────────────────────

function IconPublisher() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M5 3L19 12L5 21V3Z" fill="rgba(255,255,255,0.9)" />
    </svg>
  );
}

function IconTransformer() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <polyline points="4 17 10 11 4 5" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="12" y1="19" x2="20" y2="19" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function IconTable() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="rgba(255,255,255,0.9)" strokeWidth="1.6" />
      <line x1="3"  y1="9"  x2="21" y2="9"  stroke="rgba(255,255,255,0.9)" strokeWidth="1.6" />
      <line x1="3"  y1="15" x2="21" y2="15" stroke="rgba(255,255,255,0.9)" strokeWidth="1.6" />
      <line x1="9"  y1="9"  x2="9"  y2="21" stroke="rgba(255,255,255,0.9)" strokeWidth="1.6" />
    </svg>
  );
}

// ── Data ────────────────────────────────────────────────────────────────────

type NodeKind = 'publisher' | 'transformer' | 'table';
type TabKind = 'code' | 'schema' | 'info' | 'data';

interface NodeVersion {
  version: string;
  code?: string;
  schema?: Array<{ col: string; type: string; desc: string }>;
  rows?: Array<Record<string, string>>;
}

interface NodeDef {
  id: string;
  kind: NodeKind;
  label: string;
  subLabel: string;
  px: number;
  py: number;
  tabs: TabKind[];
  info?: Record<string, string>;
  versions?: NodeVersion[];
}

const NODES: NodeDef[] = [
  {
    id: 'pub', kind: 'publisher', label: 'pub', subLabel: 'Publisher',
    px: 130, py: 160,
    tabs: ['code', 'info'],
    info: { Path: 'tutorial/pub', Kind: 'Publisher', Status: 'Committed', 'Output table': 'tutorial/persons' },
    versions: [
      { version: 'v1', code:
`@td.publisher(
    source=td.LocalFileSource("data/*.csv"),
    tables=["persons"],
)
def pub(tf: td.TableFrame) -> td.TableFrame:
    return tf.rename({
        "First Name": "first_name",
        "Last Name":  "last_name",
        "Language":   "language",
    })` },
      { version: 'v2', code:
`@td.publisher(
    source=td.LocalFileSource("data/*.csv"),
    tables=["persons"],
)
def pub(tf: td.TableFrame) -> td.TableFrame:
    return tf.rename({
        "First Name": "first_name",
        "Last Name":  "last_name",
        "Language":   "language",
        "Email":      "email",      # added in v2
    })` },
      { version: 'v3', code:
`@td.publisher(
    source=td.LocalFileSource("data/*.csv"),
    tables=["persons"],
)
def pub(tf: td.TableFrame) -> td.TableFrame:
    return tf.rename({
        "First Name":   "first_name",
        "Last Name":    "last_name",
        "Language":     "language",
        "Email":        "email",
        "Country Code": "country",  # added in v3
    })` },
    ],
  },
  {
    id: 'persons', kind: 'table', label: 'persons', subLabel: '//tutorial',
    px: 315, py: 160,
    tabs: ['schema', 'data'],
    versions: [
      {
        version: 'v1',
        schema: [
          { col: 'first_name', type: 'Utf8', desc: 'Given name' },
          { col: 'last_name',  type: 'Utf8', desc: 'Family name' },
          { col: 'language',   type: 'Utf8', desc: 'Preferred language' },
        ],
        rows: [
          { FIRST_NAME: 'Alice',  LAST_NAME: 'Dupont',  LANGUAGE: 'French'  },
          { FIRST_NAME: 'Carlos', LAST_NAME: 'García',  LANGUAGE: 'Spanish' },
          { FIRST_NAME: 'Hans',   LAST_NAME: 'Müller',  LANGUAGE: 'German'  },
        ],
      },
      {
        version: 'v2',
        schema: [
          { col: 'first_name', type: 'Utf8', desc: 'Given name' },
          { col: 'last_name',  type: 'Utf8', desc: 'Family name' },
          { col: 'language',   type: 'Utf8', desc: 'Preferred language' },
          { col: 'email',      type: 'Utf8', desc: 'Contact email — added in v2' },
        ],
        rows: [
          { FIRST_NAME: 'Alice',   LAST_NAME: 'Dupont',    LANGUAGE: 'French',   EMAIL: 'alice@example.com'   },
          { FIRST_NAME: 'Carlos',  LAST_NAME: 'García',    LANGUAGE: 'Spanish',  EMAIL: 'carlos@example.com'  },
          { FIRST_NAME: 'Hans',    LAST_NAME: 'Müller',    LANGUAGE: 'German',   EMAIL: 'hans@example.com'    },
          { FIRST_NAME: 'Sophie',  LAST_NAME: 'Martin',    LANGUAGE: 'French',   EMAIL: 'sophie@example.com'  },
          { FIRST_NAME: 'Miguel',  LAST_NAME: 'Hernández', LANGUAGE: 'Spanish',  EMAIL: 'miguel@example.com'  },
        ],
      },
      {
        version: 'v3',
        schema: [
          { col: 'first_name', type: 'Utf8', desc: 'Given name' },
          { col: 'last_name',  type: 'Utf8', desc: 'Family name' },
          { col: 'language',   type: 'Utf8', desc: 'Preferred language' },
          { col: 'email',      type: 'Utf8', desc: 'Contact email' },
          { col: 'country',    type: 'Utf8', desc: 'ISO country code — added in v3' },
        ],
        rows: [
          { FIRST_NAME: 'Alice',   LAST_NAME: 'Dupont',    LANGUAGE: 'French',   EMAIL: 'alice@example.com',   COUNTRY: 'FR' },
          { FIRST_NAME: 'Carlos',  LAST_NAME: 'García',    LANGUAGE: 'Spanish',  EMAIL: 'carlos@example.com',  COUNTRY: 'ES' },
          { FIRST_NAME: 'Hans',    LAST_NAME: 'Müller',    LANGUAGE: 'German',   EMAIL: 'hans@example.com',    COUNTRY: 'DE' },
          { FIRST_NAME: 'Sophie',  LAST_NAME: 'Martin',    LANGUAGE: 'French',   EMAIL: 'sophie@example.com',  COUNTRY: 'FR' },
          { FIRST_NAME: 'Miguel',  LAST_NAME: 'Hernández', LANGUAGE: 'Spanish',  EMAIL: 'miguel@example.com',  COUNTRY: 'ES' },
          { FIRST_NAME: 'Emma',    LAST_NAME: 'Weber',     LANGUAGE: 'German',   EMAIL: 'emma@example.com',    COUNTRY: 'DE' },
          { FIRST_NAME: 'Juan',    LAST_NAME: 'López',     LANGUAGE: 'Spanish',  EMAIL: 'juan@example.com',    COUNTRY: 'ES' },
        ],
      },
    ],
  },
  {
    id: 'tfr', kind: 'transformer', label: 'tfr', subLabel: 'Transformer',
    px: 500, py: 160,
    tabs: ['code', 'info'],
    info: { Path: 'tutorial/tfr', Kind: 'Transformer', Status: 'Committed', Outputs: 'spanish, french, german' },
    versions: [
      { version: 'v1', code:
`@td.transformer(
    input_tables=["persons"],
    output_tables=["spanish", "french", "german"],
)
def tfr(
    persons: td.TableFrame,
) -> tuple[td.TableFrame, td.TableFrame, td.TableFrame]:
    spanish = persons.filter(td.col("language") == "Spanish")
    french  = persons.filter(td.col("language") == "French")
    german  = persons.filter(td.col("language") == "German")
    return spanish, french, german` },
      { version: 'v2', code:
`@td.transformer(
    input_tables=["persons"],
    output_tables=["spanish", "french", "german"],
)
def tfr(
    persons: td.TableFrame,
) -> tuple[td.TableFrame, td.TableFrame, td.TableFrame]:
    # Normalize email to lowercase
    persons = persons.with_columns(
        td.col("email").str.to_lowercase()
    )
    spanish = persons.filter(td.col("language") == "Spanish")
    french  = persons.filter(td.col("language") == "French")
    german  = persons.filter(td.col("language") == "German")
    return spanish, french, german` },
      { version: 'v3', code:
`@td.transformer(
    input_tables=["persons"],
    output_tables=["spanish", "french", "german"],
)
def tfr(
    persons: td.TableFrame,
) -> tuple[td.TableFrame, td.TableFrame, td.TableFrame]:
    # Normalize email; drop rows missing country
    persons = persons.with_columns(
        td.col("email").str.to_lowercase()
    ).filter(td.col("country").is_not_null())
    spanish = persons.filter(td.col("language") == "Spanish")
    french  = persons.filter(td.col("language") == "French")
    german  = persons.filter(td.col("language") == "German")
    return spanish, french, german` },
    ],
  },
  {
    id: 'spanish', kind: 'table', label: 'spanish', subLabel: '//tutorial',
    px: 700, py: 74,
    tabs: ['schema', 'data'],
    versions: [
      {
        version: 'v1',
        schema: [
          { col: 'first_name', type: 'Utf8', desc: 'Given name' },
          { col: 'last_name',  type: 'Utf8', desc: 'Family name' },
          { col: 'language',   type: 'Utf8', desc: 'Always "Spanish"' },
        ],
        rows: [
          { FIRST_NAME: 'Carlos', LAST_NAME: 'García',    LANGUAGE: 'Spanish' },
        ],
      },
      {
        version: 'v2',
        schema: [
          { col: 'first_name', type: 'Utf8', desc: 'Given name' },
          { col: 'last_name',  type: 'Utf8', desc: 'Family name' },
          { col: 'language',   type: 'Utf8', desc: 'Always "Spanish"' },
          { col: 'email',      type: 'Utf8', desc: 'Contact email — added in v2' },
        ],
        rows: [
          { FIRST_NAME: 'Carlos', LAST_NAME: 'García',    LANGUAGE: 'Spanish', EMAIL: 'carlos@example.com' },
          { FIRST_NAME: 'Miguel', LAST_NAME: 'Hernández', LANGUAGE: 'Spanish', EMAIL: 'miguel@example.com' },
        ],
      },
      {
        version: 'v3',
        schema: [
          { col: 'first_name', type: 'Utf8', desc: 'Given name' },
          { col: 'last_name',  type: 'Utf8', desc: 'Family name' },
          { col: 'language',   type: 'Utf8', desc: 'Always "Spanish"' },
          { col: 'email',      type: 'Utf8', desc: 'Contact email' },
          { col: 'country',    type: 'Utf8', desc: 'ISO country code — added in v3' },
        ],
        rows: [
          { FIRST_NAME: 'Carlos', LAST_NAME: 'García',    LANGUAGE: 'Spanish', EMAIL: 'carlos@example.com', COUNTRY: 'ES' },
          { FIRST_NAME: 'Miguel', LAST_NAME: 'Hernández', LANGUAGE: 'Spanish', EMAIL: 'miguel@example.com', COUNTRY: 'ES' },
          { FIRST_NAME: 'Juan',   LAST_NAME: 'López',     LANGUAGE: 'Spanish', EMAIL: 'juan@example.com',   COUNTRY: 'ES' },
        ],
      },
    ],
  },
  {
    id: 'french', kind: 'table', label: 'french', subLabel: '//tutorial',
    px: 700, py: 160,
    tabs: ['schema', 'data'],
    versions: [
      {
        version: 'v1',
        schema: [
          { col: 'first_name', type: 'Utf8', desc: 'Given name' },
          { col: 'last_name',  type: 'Utf8', desc: 'Family name' },
          { col: 'language',   type: 'Utf8', desc: 'Always "French"' },
        ],
        rows: [
          { FIRST_NAME: 'Alice', LAST_NAME: 'Dupont', LANGUAGE: 'French' },
        ],
      },
      {
        version: 'v2',
        schema: [
          { col: 'first_name', type: 'Utf8', desc: 'Given name' },
          { col: 'last_name',  type: 'Utf8', desc: 'Family name' },
          { col: 'language',   type: 'Utf8', desc: 'Always "French"' },
          { col: 'email',      type: 'Utf8', desc: 'Contact email — added in v2' },
        ],
        rows: [
          { FIRST_NAME: 'Alice',  LAST_NAME: 'Dupont', LANGUAGE: 'French', EMAIL: 'alice@example.com'  },
          { FIRST_NAME: 'Sophie', LAST_NAME: 'Martin', LANGUAGE: 'French', EMAIL: 'sophie@example.com' },
        ],
      },
      {
        version: 'v3',
        schema: [
          { col: 'first_name', type: 'Utf8', desc: 'Given name' },
          { col: 'last_name',  type: 'Utf8', desc: 'Family name' },
          { col: 'language',   type: 'Utf8', desc: 'Always "French"' },
          { col: 'email',      type: 'Utf8', desc: 'Contact email' },
          { col: 'country',    type: 'Utf8', desc: 'ISO country code — added in v3' },
        ],
        rows: [
          { FIRST_NAME: 'Alice',  LAST_NAME: 'Dupont', LANGUAGE: 'French', EMAIL: 'alice@example.com',  COUNTRY: 'FR' },
          { FIRST_NAME: 'Sophie', LAST_NAME: 'Martin', LANGUAGE: 'French', EMAIL: 'sophie@example.com', COUNTRY: 'FR' },
          { FIRST_NAME: 'Emma',   LAST_NAME: 'Weber',  LANGUAGE: 'French', EMAIL: 'emma@example.com',   COUNTRY: 'FR' },
        ],
      },
    ],
  },
  {
    id: 'german', kind: 'table', label: 'german', subLabel: '//tutorial',
    px: 700, py: 246,
    tabs: ['schema', 'data'],
    versions: [
      {
        version: 'v1',
        schema: [
          { col: 'first_name', type: 'Utf8', desc: 'Given name' },
          { col: 'last_name',  type: 'Utf8', desc: 'Family name' },
          { col: 'language',   type: 'Utf8', desc: 'Always "German"' },
        ],
        rows: [
          { FIRST_NAME: 'Hans', LAST_NAME: 'Müller', LANGUAGE: 'German' },
        ],
      },
      {
        version: 'v2',
        schema: [
          { col: 'first_name', type: 'Utf8', desc: 'Given name' },
          { col: 'last_name',  type: 'Utf8', desc: 'Family name' },
          { col: 'language',   type: 'Utf8', desc: 'Always "German"' },
          { col: 'email',      type: 'Utf8', desc: 'Contact email — added in v2' },
        ],
        rows: [
          { FIRST_NAME: 'Hans', LAST_NAME: 'Müller', LANGUAGE: 'German', EMAIL: 'hans@example.com' },
        ],
      },
      {
        version: 'v3',
        schema: [
          { col: 'first_name', type: 'Utf8', desc: 'Given name' },
          { col: 'last_name',  type: 'Utf8', desc: 'Family name' },
          { col: 'language',   type: 'Utf8', desc: 'Always "German"' },
          { col: 'email',      type: 'Utf8', desc: 'Contact email' },
          { col: 'country',    type: 'Utf8', desc: 'ISO country code — added in v3' },
        ],
        rows: [
          { FIRST_NAME: 'Hans', LAST_NAME: 'Müller', LANGUAGE: 'German', EMAIL: 'hans@example.com', COUNTRY: 'DE' },
          { FIRST_NAME: 'Emma', LAST_NAME: 'Weber',  LANGUAGE: 'German', EMAIL: 'emma@example.com', COUNTRY: 'DE' },
        ],
      },
    ],
  },
];

const EDGES: Array<{ from: string; to: string; dashed?: boolean }> = [
  { from: 'pub',     to: 'persons' },
  { from: 'persons', to: 'tfr',     dashed: true },
  { from: 'tfr',     to: 'spanish' },
  { from: 'tfr',     to: 'french' },
  { from: 'tfr',     to: 'german' },
];

// ── Minimal Python highlighter ───────────────────────────────────────────────

function HighlightedCode({ code }: { code: string }) {
  const lines = code.split('\n');
  return (
    <>
      {lines.map((line, li) => {
        const parts: React.ReactNode[] = [];
        const combined = /(\"(?:[^\"\\]|\\.)*\"|\'(?:[^\'\\]|\\.)*\')|(@\w+)|\b(def|return|import|from|as|tuple|None|True|False)\b|\b(td|pl|TableFrame|LocalFileSource|TableInput)\b|(#[^\n]*)/g;
        let last = 0;
        let m: RegExpExecArray | null;
        while ((m = combined.exec(line)) !== null) {
          if (m.index > last) parts.push(line.slice(last, m.index));
          if (m[1]) parts.push(<span key={parts.length} className={styles.st}>{m[1]}</span>);
          else if (m[2]) parts.push(<span key={parts.length} className={styles.dec}>{m[2]}</span>);
          else if (m[3]) parts.push(<span key={parts.length} className={styles.kw}>{m[3]}</span>);
          else if (m[4]) parts.push(<span key={parts.length} className={styles.fn}>{m[4]}</span>);
          else if (m[5]) parts.push(<span key={parts.length} className={styles.cm}>{m[5]}</span>);
          last = m.index + m[0].length;
        }
        if (last < line.length) parts.push(line.slice(last));
        return <React.Fragment key={li}>{parts}{'\n'}</React.Fragment>;
      })}
    </>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

export default function PipelineDiagram() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKind>('code');
  const [activeVersion, setActiveVersion] = useState<string>('v3');

  const activeNode = NODES.find(n => n.id === activeId) ?? null;

  function selectNode(node: NodeDef) {
    if (activeId === node.id) {
      setActiveId(null);
    } else {
      setActiveId(node.id);
      setActiveTab(node.tabs[0]);
      // Preserve current version if the new node supports it; otherwise use latest
      if (node.versions && !node.versions.find(v => v.version === activeVersion)) {
        setActiveVersion(node.versions[node.versions.length - 1].version);
      }
    }
  }

  const nodeMap = Object.fromEntries(NODES.map(n => [n.id, n]));

  // Current version snapshot for table nodes
  const currentVersion = activeNode?.versions
    ? (activeNode.versions.find(v => v.version === activeVersion) ?? activeNode.versions[activeNode.versions.length - 1])
    : null;

  return (
    <div className={styles.wrapper}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarDot} />
        <div className={styles.toolbarDot} />
        <div className={styles.toolbarDot} />
        <span className={styles.toolbarLabel}>Tabsdata · Tutorial Pipeline · Execution View</span>
      </div>

      {/* Canvas */}
      <div className={styles.canvasScroll}>
      <div className={styles.canvas} style={{ height: 320 }}>
        <svg
          className={styles.svgLayer}
          viewBox="0 0 860 320"
          preserveAspectRatio="none"
        >
          <defs>
            <marker id="arrowGray" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
              <path d="M0,0 L7,3.5 L0,7 Z" fill="var(--pd-arrow-gray)" />
            </marker>
            <marker id="arrowBlue" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
              <path d="M0,0 L7,3.5 L0,7 Z" fill="var(--pd-arrow-blue)" />
            </marker>
          </defs>
          {EDGES.map((e, i) => {
            const from = nodeMap[e.from];
            const to   = nodeMap[e.to];
            const mx   = (from.px + to.px) / 2;
            const isActive = e.from === activeId || e.to === activeId;
            const SY = -30;
            const fy = from.py + SY;
            const ty = to.py + SY;
            return (
              <path
                key={i}
                d={`M${from.px},${fy} C${mx},${fy} ${mx},${ty} ${to.px},${ty}`}
                stroke={e.dashed
                  ? (isActive ? 'var(--pd-edge-active-dashed)' : 'var(--pd-edge-dashed)')
                  : (isActive ? 'var(--pd-edge-active-solid)'  : 'var(--pd-edge-solid)')}
                strokeWidth={isActive ? 2 : 1.5}
                fill="none"
                strokeDasharray={e.dashed ? '5 3' : undefined}
                markerEnd={e.dashed ? 'url(#arrowBlue)' : 'url(#arrowGray)'}
                opacity={isActive ? 1 : 0.8}
              />
            );
          })}
        </svg>

        <div className={styles.nodes}>
          {NODES.map(node => {
            const isActive = activeId === node.id;
            const style: React.CSSProperties = {
              left: `${(node.px / 860) * 100}%`,
              top:  `${(node.py / 320) * 100}%`,
            };

            const cardClass =
              node.kind === 'publisher'   ? styles.cardPublisher :
              node.kind === 'transformer' ? styles.cardTransformer :
              styles.cardTable;

            const icon =
              node.kind === 'publisher'   ? <IconPublisher /> :
              node.kind === 'transformer' ? <IconTransformer /> :
              <IconTable />;

            const typeName =
              node.kind === 'publisher'   ? 'Publisher' :
              node.kind === 'transformer' ? 'Transformer' :
              'Table';

            const isCommitted = node.kind !== 'table';

            return (
              <div
                key={node.id}
                className={`${styles.node} ${isActive ? styles.active : ''}`}
                style={style}
                onClick={() => selectNode(node)}
                role="button"
                tabIndex={0}
                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && selectNode(node)}
                aria-pressed={isActive}
              >
                <div className={`${styles.card} ${cardClass}`}>
                  <div className={styles.cardIcon}>{icon}</div>
                  <div className={styles.cardBody}>
                    <div className={styles.cardType}>{typeName}</div>
                    <div className={styles.cardName}>{node.label}</div>
                  </div>
                </div>
                <div className={styles.nodeLabel}>{node.label}</div>
                {node.subLabel && <div className={styles.nodeSubLabel}>{node.subLabel}</div>}
                <div className={styles.statusRow}>
                  {isCommitted ? (
                    <>
                      <span className={`${styles.statusDot} ${styles.statusCommittedDot}`} />
                      <span className={styles.statusCommittedText}>Committed</span>
                    </>
                  ) : (
                    <>
                      <span className={styles.statusAvailableCheck}>✓</span>
                      <span className={styles.statusAvailableText}>Data Available</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {!activeId && <div className={styles.hint}>Click any node to inspect code or schema</div>}
      </div>
      </div>

      {/* Detail panel */}
      {activeNode && (
        <div className={styles.detailPanel}>
          <div className={styles.detailHeader}>
            <span className={`${styles.detailBadge} ${
              activeNode.kind === 'publisher'   ? styles.detailBadgePublisher :
              activeNode.kind === 'transformer' ? styles.detailBadgeTransformer :
              styles.detailBadgeTable
            }`}>
              {activeNode.kind}
            </span>
            <span className={styles.detailName}>{activeNode.label}</span>
            <button
              className={styles.detailClose}
              onClick={() => setActiveId(null)}
              aria-label="Close"
            >×</button>
          </div>

          <div className={styles.detailBodyRow}>
            {/* Main: tabs + content */}
            <div className={styles.detailMain}>
              <div className={styles.detailTabs}>
                {activeNode.tabs.map(tab => (
                  <button
                    key={tab}
                    className={`${styles.detailTab} ${activeTab === tab ? styles.detailTabActive : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              <div className={styles.detailBody}>
                {activeTab === 'code' && currentVersion?.code && (
                  <div className={styles.codeBlock}>
                    <pre><HighlightedCode code={currentVersion.code} /></pre>
                  </div>
                )}

                {activeTab === 'schema' && currentVersion?.schema && (
                  <>
                    <h1 className={styles.sectionHeading}>Schema</h1>
                    <p className={styles.sectionDesc}>Table schema defines the structure of a table by listing its columns and their data types.</p>
                    <div className={styles.tableBox}>
                      <table className={styles.schemaTable}>
                        <thead>
                          <tr>
                            <th>Column</th>
                            <th>Type</th>
                            <th>Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentVersion.schema.map(row => (
                            <tr key={row.col}>
                              <td><code>{row.col}</code></td>
                              <td><span className={styles.typeChip}>{row.type}</span></td>
                              <td>{row.desc}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                {activeTab === 'info' && activeNode.info && (
                  <div className={styles.infoGrid}>
                    {Object.entries(activeNode.info).map(([k, v]) => (
                      <div key={k} className={styles.infoRow}>
                        <span className={styles.infoKey}>{k}</span>
                        <span className={styles.infoVal}>{v}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'data' && currentVersion?.rows && (() => {
                  const cols = Object.keys(currentVersion.rows[0] ?? {});
                  return (
                    <div className={styles.sampleWrap}>
                      <h1 className={styles.sectionHeading}>Sample</h1>
                      <p className={styles.sectionDesc}>Table sample data CSV provides example rows for a dataset, illustrating values for each column. It helps validate parsing, demonstrate queries, and document formats.</p>
                      <div className={styles.tableBox}>
                        <table className={styles.sampleTable}>
                          <thead>
                            <tr>{cols.map(c => <th key={c}>{c}</th>)}</tr>
                          </thead>
                          <tbody>
                            {currentVersion.rows.map((row, i) => (
                              <tr key={i}>
                                {cols.map(c => <td key={c}>{row[c]}</td>)}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className={styles.sampleFooter}>
                        {currentVersion.rows.length} rows · {currentVersion.version}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Version sidebar — only for table nodes */}
            {activeNode.versions && (
              <div className={styles.versionSidebar}>
                {[...activeNode.versions].reverse().map(v => (
                  <button
                    key={v.version}
                    className={`${styles.versionSidebarBtn} ${v.version === activeVersion ? styles.versionSidebarBtnActive : ''}`}
                    onClick={() => setActiveVersion(v.version)}
                  >
                    {v.version}
                  </button>
                ))}
                <span className={styles.versionSidebarLabel}>version</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
