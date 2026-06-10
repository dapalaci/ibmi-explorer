import { useState, useEffect, useCallback } from 'react';
import ConnectionPanel from './components/ConnectionPanel';
import TableBrowser from './components/TableBrowser';
import QueryEditor from './components/QueryEditor';
import GraphView from './components/GraphView';
import MappingPanel from './components/MappingPanel';
import { rowsToElements, autoDetectMapping, resetColorCache } from './utils/graphMapper';

const DEFAULT_QUERY = `SELECT * FROM DAPALACI.TABLA FETCH FIRST 50 ROWS ONLY`;

export default function App() {
  const [connected, setConnected] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState({ host: 'pub400.com', user: '', library: 'DAPALACI' });
  const [tables, setTables] = useState([]);
  const [tablesLoading, setTablesLoading] = useState(false);
  const [selectedTable, setSelectedTable] = useState('');
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [result, setResult] = useState(null);
  const [graphElements, setGraphElements] = useState([]);
  const [mapping, setMapping] = useState({ nodeIdCol: '', nodeLabelCol: '', edgeSourceCol: '', edgeTargetCol: '', nodeType: 'row' });
  const [showMapping, setShowMapping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    fetch('/api/config')
      .then(r => r.json())
      .then(cfg => setConnectionInfo(cfg))
      .catch(() => {});
  }, []);

  async function handleConnect(form) {
    setConnectionInfo(form);
    setConnected(true);
    await loadTables();
  }

  async function loadTables() {
    setTablesLoading(true);
    try {
      const res = await fetch('/api/tables');
      const data = await res.json();
      if (Array.isArray(data)) setTables(data);
    } catch (err) {
      console.error('Error loading tables:', err);
    } finally {
      setTablesLoading(false);
    }
  }

  function handleSelectTable(tableName) {
    setSelectedTable(tableName);
    const lib = connectionInfo.library || 'DAPALACI';
    setQuery(`SELECT *\nFROM ${lib}.${tableName}\nFETCH FIRST 100 ROWS ONLY`);
  }

  async function handleExecute() {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setSelectedNode(null);

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: query }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResult(data);
      resetColorCache();

      const autoMapping = autoDetectMapping(data.columns);
      const nodeType = selectedTable || 'row';
      const finalMapping = { ...autoMapping, nodeType };
      setMapping(finalMapping);

      const elements = rowsToElements(data.rows, data.columns, finalMapping);
      setGraphElements(elements);
    } catch (err) {
      setError(err.message);
      setResult(null);
      setGraphElements([]);
    } finally {
      setLoading(false);
    }
  }

  function handleApplyMapping(newMapping) {
    setMapping(newMapping);
    resetColorCache();
    if (result) {
      const elements = rowsToElements(result.rows, result.columns, newMapping);
      setGraphElements(elements);
    }
  }

  const nodeCount = graphElements.filter(e => e.group === 'nodes').length;
  const edgeCount = graphElements.filter(e => e.group === 'edges').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Header */}
      <header style={{
        background: 'var(--bg-panel)',
        borderBottom: '1px solid var(--border)',
        padding: '0 16px',
        height: 52,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 8 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="6" cy="6" r="4" stroke="#0fb8ad" strokeWidth="1.5" />
            <circle cx="18" cy="6" r="4" stroke="#4A90E2" strokeWidth="1.5" />
            <circle cx="12" cy="18" r="4" stroke="#E27D60" strokeWidth="1.5" />
            <line x1="10" y1="6" x2="14" y2="6" stroke="#2a2f4a" strokeWidth="1.5" />
            <line x1="7.5" y1="9.5" x2="10" y2="14.5" stroke="#2a2f4a" strokeWidth="1.5" />
            <line x1="16.5" y1="9.5" x2="14" y2="14.5" stroke="#2a2f4a" strokeWidth="1.5" />
          </svg>
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', letterSpacing: -0.3 }}>
            IBM i Explorer
          </span>
          <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>·</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>pub400.com</span>
        </div>

        <div style={{ flex: 1 }}>
          <ConnectionPanel
            connected={connected}
            currentConfig={connectionInfo}
            onConnect={handleConnect}
          />
        </div>

        {graphElements.length > 0 && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="badge badge-green">{nodeCount} nodos</span>
            <span className="badge badge-blue">{edgeCount} aristas</span>
          </div>
        )}
      </header>

      {/* Main Layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar: Table Browser */}
        <aside style={{
          width: 220,
          flexShrink: 0,
          background: 'var(--bg-panel)',
          borderRight: '1px solid var(--border)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <TableBrowser
            tables={tables}
            loading={tablesLoading}
            onSelectTable={handleSelectTable}
            selectedTable={selectedTable}
          />
        </aside>

        {/* Center: Query Editor */}
        <section style={{
          width: 380,
          flexShrink: 0,
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-deep)',
          overflow: 'hidden',
        }}>
          <QueryEditor
            query={query}
            onChange={setQuery}
            onExecute={handleExecute}
            onOpenMapping={() => setShowMapping(true)}
            loading={loading}
            result={result}
            error={error}
            connected={connected}
          />
        </section>

        {/* Right: Graph View */}
        <section style={{ flex: 1, position: 'relative', overflow: 'hidden', background: 'var(--bg-deep)' }}>
          <GraphView
            elements={graphElements}
            onNodeClick={node => setSelectedNode(node)}
            onBgClick={() => setSelectedNode(null)}
          />

          {/* Node Detail Panel */}
          {selectedNode && (
            <NodeDetail node={selectedNode} onClose={() => setSelectedNode(null)} />
          )}

          {/* Graph stats overlay */}
          {graphElements.length > 0 && (
            <div style={{
              position: 'absolute', bottom: 12, left: 12,
              display: 'flex', gap: 6, pointerEvents: 'none',
            }}>
              <span className="badge badge-gray" style={{ backdropFilter: 'blur(4px)' }}>
                {mapping.nodeType || 'row'}
              </span>
              {mapping.edgeSourceCol && (
                <span className="tag" style={{ backdropFilter: 'blur(4px)' }}>
                  {mapping.edgeSourceCol} → {mapping.edgeTargetCol}
                </span>
              )}
            </div>
          )}
        </section>
      </div>

      {showMapping && result && (
        <MappingPanel
          columns={result.columns}
          mapping={mapping}
          onApply={handleApplyMapping}
          onClose={() => setShowMapping(false)}
        />
      )}
    </div>
  );
}

function NodeDetail({ node, onClose }) {
  const entries = Object.entries(node).filter(([k]) => !k.startsWith('_'));

  return (
    <div style={{
      position: 'absolute', top: 12, right: 12,
      width: 260,
      background: 'var(--bg-panel)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      overflow: 'hidden',
      maxHeight: 'calc(100% - 24px)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        padding: '10px 12px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-card)',
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>
            {node.label}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 1 }}>
            {node.nodeType} · id: {node.id}
          </div>
        </div>
        <button className="btn-ghost" onClick={onClose} style={{ fontSize: 16, padding: '0 6px' }}>×</button>
      </div>
      <div style={{ overflowY: 'auto', padding: 8 }}>
        {entries.map(([key, value]) => (
          <div key={key} style={{ padding: '4px 6px', borderRadius: 3, marginBottom: 2 }}>
            <span style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginRight: 6 }}>
              {key}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>
              {value || <span style={{ color: 'var(--text-dim)' }}>null</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
