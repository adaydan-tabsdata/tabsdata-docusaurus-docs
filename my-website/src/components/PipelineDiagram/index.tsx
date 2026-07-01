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

interface DataVersion {
  version: string;
  rows: Array<Record<string, string>>;
}

interface NodeDef {
  id: string;
  kind: NodeKind;
  label: string;
  subLabel: string;
  px: number;
  py: number;
  tabs: TabKind[];
  code?: string;
  schema?: Array<{ col: string; type: string; desc: string }>;
  info?: Record<string, string>;
  dataVersions?: DataVersion[];
}

const NODES: NodeDef[] = [
  {
    id: 'pub', kind: 'publisher', label: 'pub', subLabel: 'Publisher',
    px: 130, py: 160,
    tabs: ['code', 'info'],
    code:
`@td.publisher(tables=["//tabsdata/tutorial/persons"])
def pub(
    source: td.LocalFileSource = td.LocalFileSource(
        path="data/*.csv"
    ),
) -> td.TableFrame:
    tf = source.read()
    tf = tf.rename({
        "First Name": "first_name",
        "Last Name":  "last_name",
        "Language":   "language",
    })
    return tf`,
    info: { Path: '//tabsdata/tutorial/pub', Kind: 'Publisher', Status: 'Committed', 'Output table': '//tabsdata/tutorial/persons' },
  },
  {
    id: 'persons', kind: 'table', label: 'persons', subLabel: '//tutorial',
    px: 315, py: 160,
    tabs: ['schema', 'data'],
    schema: [
      { col: 'first_name', type: 'Utf8', desc: 'Given name' },
      { col: 'last_name',  type: 'Utf8', desc: 'Family name' },
      { col: 'language',   type: 'Utf8', desc: 'Preferred language' },
    ],
    dataVersions: [
      { version: 'v1', rows: [
        { first_name: 'Alice',  last_name: 'Dupont',  language: 'French'  },
        { first_name: 'Carlos', last_name: 'García',  language: 'Spanish' },
        { first_name: 'Hans',   last_name: 'Müller',  language: 'German'  },
      ]},
      { version: 'v2', rows: [
        { first_name: 'Alice',   last_name: 'Dupont',    language: 'French'  },
        { first_name: 'Carlos',  last_name: 'García',    language: 'Spanish' },
        { first_name: 'Hans',    last_name: 'Müller',    language: 'German'  },
        { first_name: 'Sophie',  last_name: 'Martin',    language: 'French'  },
        { first_name: 'Miguel',  last_name: 'Hernández', language: 'Spanish' },
      ]},
      { version: 'v3', rows: [
        { first_name: 'Alice',   last_name: 'Dupont',    language: 'French'  },
        { first_name: 'Carlos',  last_name: 'García',    language: 'Spanish' },
        { first_name: 'Hans',    last_name: 'Müller',    language: 'German'  },
        { first_name: 'Sophie',  last_name: 'Martin',    language: 'French'  },
        { first_name: 'Miguel',  last_name: 'Hernández', language: 'Spanish' },
        { first_name: 'Emma',    last_name: 'Weber',     language: 'German'  },
        { first_name: 'Juan',    last_name: 'López',     language: 'Spanish' },
      ]},
    ],
  },
  {
    id: 'tfr', kind: 'transformer', label: 'tfr', subLabel: 'Transformer',
    px: 500, py: 160,
    tabs: ['code', 'info'],
    code:
`@td.transformer(
    tables=[
        "//tabsdata/tutorial/spanish",
        "//tabsdata/tutorial/french",
        "//tabsdata/tutorial/german",
    ]
)
def tfr(
    persons: td.TableFrame = td.TableInput(
        "//tabsdata/tutorial/persons"
    ),
) -> tuple[td.TableFrame, td.TableFrame, td.TableFrame]:
    spanish = persons.filter(pl.col("language") == "Spanish")
    french  = persons.filter(pl.col("language") == "French")
    german  = persons.filter(pl.col("language") == "German")
    return spanish, french, german`,
    info: { Path: '//tabsdata/tutorial/tfr', Kind: 'Transformer', Status: 'Committed', Outputs: 'spanish, french, german' },
  },
  {
    id: 'spanish', kind: 'table', label: 'spanish', subLabel: '//tutorial',
    px: 700, py: 74,
    tabs: ['schema', 'data'],
    schema: [
      { col: 'first_name', type: 'Utf8', desc: 'Given name' },
      { col: 'last_name',  type: 'Utf8', desc: 'Family name' },
      { col: 'language',   type: 'Utf8', desc: 'Always "Spanish"' },
    ],
    dataVersions: [
      { version: 'v1', rows: [
        { first_name: 'Carlos', last_name: 'García',    language: 'Spanish' },
      ]},
      { version: 'v2', rows: [
        { first_name: 'Carlos', last_name: 'García',    language: 'Spanish' },
        { first_name: 'Miguel', last_name: 'Hernández', language: 'Spanish' },
      ]},
      { version: 'v3', rows: [
        { first_name: 'Carlos', last_name: 'García',    language: 'Spanish' },
        { first_name: 'Miguel', last_name: 'Hernández', language: 'Spanish' },
        { first_name: 'Juan',   last_name: 'López',     language: 'Spanish' },
      ]},
    ],
  },
  {
    id: 'french', kind: 'table', label: 'french', subLabel: '//tutorial',
    px: 700, py: 160,
    tabs: ['schema', 'data'],
    schema: [
      { col: 'first_name', type: 'Utf8', desc: 'Given name' },
      { col: 'last_name',  type: 'Utf8', desc: 'Family name' },
      { col: 'language',   type: 'Utf8', desc: 'Always "French"' },
    ],
    dataVersions: [
      { version: 'v1', rows: [
        { first_name: 'Alice',  last_name: 'Dupont',  language: 'French' },
      ]},
      { version: 'v2', rows: [
        { first_name: 'Alice',  last_name: 'Dupont',  language: 'French' },
        { first_name: 'Sophie', last_name: 'Martin',  language: 'French' },
      ]},
      { version: 'v3', rows: [
        { first_name: 'Alice',  last_name: 'Dupont',  language: 'French' },
        { first_name: 'Sophie', last_name: 'Martin',  language: 'French' },
        { first_name: 'Emma',   last_name: 'Weber',   language: 'French' },
      ]},
    ],
  },
  {
    id: 'german', kind: 'table', label: 'german', subLabel: '//tutorial',
    px: 700, py: 246,
    tabs: ['schema', 'data'],
    schema: [
      { col: 'first_name', type: 'Utf8', desc: 'Given name' },
      { col: 'last_name',  type: 'Utf8', desc: 'Family name' },
      { col: 'language',   type: 'Utf8', desc: 'Always "German"' },
    ],
    dataVersions: [
      { version: 'v1', rows: [
        { first_name: 'Hans', last_name: 'Müller',  language: 'German' },
      ]},
      { version: 'v2', rows: [
        { first_name: 'Hans', last_name: 'Müller',  language: 'German' },
      ]},
      { version: 'v3', rows: [
        { first_name: 'Hans', last_name: 'Müller',  language: 'German' },
        { first_name: 'Emma', last_name: 'Weber',   language: 'German' },
      ]},
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
      setActiveVersion('v3');
    }
  }

  const nodeMap = Object.fromEntries(NODES.map(n => [n.id, n]));

  return (
    <div className={styles.wrapper}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarDot} />
        <div className={styles.toolbarDot} />
        <div className={styles.toolbarDot} />
        <span className={styles.toolbarLabel}>Tabsdata · Tutorial Pipeline · Execution View</span>
      </div>

      {/* Canvas — scrollable wrapper enables horizontal scroll on mobile */}
      <div className={styles.canvasScroll}>
      <div className={styles.canvas} style={{ height: 320 }}>
        {/* SVG edge layer — viewBox matches node px coordinates */}
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
            // Shapes sit above the node div center (labels/badge are below the shape).
            // Offset edges up so they connect to the visual shape center, not the div center.
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

        {/* Nodes */}
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
      </div>{/* end canvasScroll */}

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
            {activeTab === 'code' && activeNode.code && (
              <div className={styles.codeBlock}>
                <pre><HighlightedCode code={activeNode.code} /></pre>
              </div>
            )}

            {activeTab === 'schema' && activeNode.schema && (
              <table className={styles.schemaTable}>
                <thead>
                  <tr>
                    <th>Column</th>
                    <th>Type</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {activeNode.schema.map(row => (
                    <tr key={row.col}>
                      <td><code>{row.col}</code></td>
                      <td><span className={styles.typeChip}>{row.type}</span></td>
                      <td>{row.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

            {activeTab === 'data' && activeNode.dataVersions && (() => {
              const versionData = activeNode.dataVersions.find(v => v.version === activeVersion)
                ?? activeNode.dataVersions[activeNode.dataVersions.length - 1];
              const cols = Object.keys(versionData.rows[0] ?? {});
              return (
                <div className={styles.sampleWrap}>
                  <div className={styles.versionBar}>
                    {activeNode.dataVersions.map(v => (
                      <button
                        key={v.version}
                        className={`${styles.versionBtn} ${v.version === versionData.version ? styles.versionBtnActive : ''}`}
                        onClick={() => setActiveVersion(v.version)}
                      >
                        {v.version}
                      </button>
                    ))}
                    <span className={styles.versionLabel}>data version</span>
                  </div>
                  <table className={styles.sampleTable}>
                    <thead>
                      <tr>{cols.map(c => <th key={c}>{c}</th>)}</tr>
                    </thead>
                    <tbody>
                      {versionData.rows.map((row, i) => (
                        <tr key={i}>
                          {cols.map(c => <td key={c}>{row[c]}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className={styles.sampleFooter}>
                    {versionData.rows.length} rows · {versionData.version}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
