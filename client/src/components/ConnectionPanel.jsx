import { useState } from 'react';

export default function ConnectionPanel({ onConnect, connected, currentConfig }) {
  const [form, setForm] = useState({
    host: currentConfig?.host || 'pub400.com',
    user: currentConfig?.user || '',
    password: '',
    library: currentConfig?.library || 'DAPALACI',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(!connected);

  async function handleConnect(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onConnect(form);
      setOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="badge badge-green">● Conectado</span>
        <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>
          {form.user}@{form.host} / {form.library}
        </span>
        <button className="btn-ghost" style={{ fontSize: 11 }} onClick={() => setOpen(true)}>
          Cambiar
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleConnect}
      style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border)',
        borderRadius: 6,
        padding: '12px 16px',
        display: 'flex',
        gap: 8,
        alignItems: 'flex-end',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ flex: '0 0 130px' }}>
        <label style={labelStyle}>Host</label>
        <input
          value={form.host}
          onChange={e => setForm(f => ({ ...f, host: e.target.value }))}
          placeholder="pub400.com"
          required
        />
      </div>
      <div style={{ flex: '0 0 110px' }}>
        <label style={labelStyle}>Usuario</label>
        <input
          value={form.user}
          onChange={e => setForm(f => ({ ...f, user: e.target.value.toUpperCase() }))}
          placeholder="DAPALACI"
          required
        />
      </div>
      <div style={{ flex: '0 0 120px' }}>
        <label style={labelStyle}>Contraseña</label>
        <input
          type="password"
          value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          placeholder="••••••"
          required
        />
      </div>
      <div style={{ flex: '0 0 100px' }}>
        <label style={labelStyle}>Biblioteca</label>
        <input
          value={form.library}
          onChange={e => setForm(f => ({ ...f, library: e.target.value.toUpperCase() }))}
          placeholder="DAPALACI"
          required
        />
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button className="btn-primary" type="submit" disabled={loading} style={{ whiteSpace: 'nowrap' }}>
          {loading ? 'Conectando…' : 'Conectar'}
        </button>
        {connected && (
          <button className="btn-ghost" type="button" onClick={() => setOpen(false)}>
            Cancelar
          </button>
        )}
      </div>
      {error && (
        <div style={{ width: '100%', color: 'var(--danger)', fontSize: 11, marginTop: 4 }}>
          ⚠ {error}
        </div>
      )}
    </form>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: 10,
  color: 'var(--text-secondary)',
  marginBottom: 3,
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
};
