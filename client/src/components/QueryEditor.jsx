export default function QueryEditor({
  query, onChange, onExecute, onOpenMapping,
  loading, result, error, connected,
}) {
  function handleKey(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (connected && !loading) onExecute();
    }
  }

  const rowCount = result?.rowCount ?? 0;
  const colCount = result?.columns?.length ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 0 }}>
      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
          Editor SQL
        </span>
        <span style={{ fontSize: 10, color: 'var(--text-dim)', marginLeft: 'auto' }}>
          Ctrl+Enter para ejecutar
        </span>
      </div>

      <div style={{ flex: 1, padding: 10, position: 'relative' }}>
        <textarea
          value={query}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKey}
          spellCheck={false}
          placeholder={`-- Escribe tu consulta SQL\nSELECT * FROM DAPALACI.TABLA FETCH FIRST 50 ROWS ONLY`}
          style={{
            width: '100%',
            height: '100%',
            resize: 'none',
            background: 'var(--bg-deep)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            padding: '10px 12px',
            lineHeight: 1.7,
            fontSize: 12,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
          }}
        />
      </div>

      <div style={{
        padding: '8px 12px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        background: 'var(--bg-panel)',
      }}>
        <button
          className="btn-primary"
          onClick={onExecute}
          disabled={!connected || loading || !query.trim()}
          style={{ minWidth: 90 }}
        >
          {loading ? '⟳ Ejecutando…' : '▶ Ejecutar'}
        </button>

        {result && (
          <button
            className="btn-secondary"
            onClick={onOpenMapping}
            style={{ fontSize: 11 }}
          >
            ⬡ Configurar grafo
          </button>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {result && !error && (
            <>
              <span className="badge badge-green">{rowCount} filas</span>
              <span className="badge badge-blue">{colCount} cols</span>
            </>
          )}
          {error && (
            <span style={{ color: 'var(--danger)', fontSize: 11, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              ⚠ {error}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
