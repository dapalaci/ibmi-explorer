import { useState } from 'react';

export default function TableBrowser({ tables, loading, onSelectTable, selectedTable }) {
  const [filter, setFilter] = useState('');

  const filtered = tables.filter(t =>
    t.TABLE_NAME.includes(filter.toUpperCase()) ||
    (t.TABLE_TEXT || '').toUpperCase().includes(filter.toUpperCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
          Tablas · {tables.length}
        </div>
        <input
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Filtrar…"
          style={{ fontSize: 11, padding: '4px 8px' }}
        />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
        {loading && (
          <div style={{ padding: '20px 12px', color: 'var(--text-dim)', fontSize: 12, textAlign: 'center' }}>
            Cargando tablas…
          </div>
        )}
        {!loading && tables.length === 0 && (
          <div style={{ padding: '20px 12px', color: 'var(--text-dim)', fontSize: 11, textAlign: 'center' }}>
            Conéctate para ver las tablas
          </div>
        )}
        {filtered.map(table => (
          <button
            key={table.TABLE_NAME}
            onClick={() => onSelectTable(table.TABLE_NAME)}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: '7px 12px',
              background: selectedTable === table.TABLE_NAME ? 'var(--accent-dim)' : 'transparent',
              color: selectedTable === table.TABLE_NAME ? 'var(--accent)' : 'var(--text-primary)',
              border: 'none',
              borderLeft: selectedTable === table.TABLE_NAME ? '2px solid var(--accent)' : '2px solid transparent',
              borderRadius: 0,
              cursor: 'pointer',
              transition: 'all 0.1s',
              fontSize: 12,
            }}
            onMouseEnter={e => {
              if (selectedTable !== table.TABLE_NAME) {
                e.currentTarget.style.background = 'var(--bg-hover)';
              }
            }}
            onMouseLeave={e => {
              if (selectedTable !== table.TABLE_NAME) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600 }}>
              {table.TABLE_NAME}
            </div>
            {table.TABLE_TEXT && (
              <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 1, fontFamily: 'var(--font-ui)' }}>
                {table.TABLE_TEXT}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
