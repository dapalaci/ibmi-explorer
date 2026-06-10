import { useState } from 'react';
import { detectFkColumns } from '../utils/graphMapper';

const overlayStyle = {
  position: 'fixed', inset: 0, zIndex: 100,
  background: 'rgba(0,0,0,0.65)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

const panelStyle = {
  background: 'var(--bg-panel)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: 24,
  width: 400,
  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
};

export default function MappingPanel({ columns, mapping, onApply, onClose }) {
  const [local, setLocal] = useState({ ...mapping });

  const fkSuggestions = detectFkColumns(columns);

  function set(field, value) {
    setLocal(prev => ({ ...prev, [field]: value }));
  }

  const ColSelect = ({ label, field, required, hint }) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4, fontWeight: 500 }}>
        {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        {hint && <span style={{ color: 'var(--text-dim)', marginLeft: 6, fontWeight: 400 }}>{hint}</span>}
      </label>
      <select value={local[field]} onChange={e => set(field, e.target.value)}>
        {!required && <option value="">— ninguna —</option>}
        {columns.map(c => (
          <option key={c} value={c}>
            {c}{fkSuggestions.includes(c) ? ' 🔗' : ''}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={panelStyle} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)' }}>
            Configurar mapeo del grafo
          </h3>
          <button className="btn-ghost" onClick={onClose} style={{ fontSize: 16, padding: '2px 8px' }}>×</button>
        </div>

        <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 18, lineHeight: 1.6 }}>
          Elige qué columnas representan los nodos y las relaciones del grafo.
          Las columnas con 🔗 son candidatas a llaves foráneas.
        </p>

        <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: 'var(--accent)', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
            Nodos
          </div>
          <ColSelect label="Columna ID del nodo" field="nodeIdCol" required hint="identificador único" />
          <ColSelect label="Columna etiqueta" field="nodeLabelCol" required hint="texto visible en el círculo" />
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4, fontWeight: 500 }}>
              Tipo / Color del nodo <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>(agrupa por color)</span>
            </label>
            <input
              type="text"
              value={local.nodeType || ''}
              onChange={e => set('nodeType', e.target.value)}
              placeholder="ej: CLIENTE, PEDIDO, FACTURA"
            />
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: 'var(--accent2)', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
            Aristas (relaciones)
          </div>
          <ColSelect label="Columna origen de arista" field="edgeSourceCol" hint="ID del nodo fuente" />
          <ColSelect label="Columna destino de arista" field="edgeTargetCol" hint="ID del nodo destino" />
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button
            className="btn-primary"
            onClick={() => { onApply(local); onClose(); }}
            disabled={!local.nodeIdCol || !local.nodeLabelCol}
          >
            Aplicar mapeo
          </button>
        </div>
      </div>
    </div>
  );
}
