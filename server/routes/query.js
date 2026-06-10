const express = require('express');
const ibmi = require('../ibmi');

const router = express.Router();

router.post('/', async (req, res) => {
  const { sql } = req.body;

  if (!sql || typeof sql !== 'string') {
    return res.status(400).json({ error: 'Se requiere el campo "sql"' });
  }

  const trimmed = sql.trim();
  if (!trimmed) {
    return res.status(400).json({ error: 'La consulta SQL no puede estar vacía' });
  }

  try {
    const rows = await ibmi.query(trimmed);

    if (!rows || rows.length === 0) {
      return res.json({ columns: [], rows: [], rowCount: 0 });
    }

    const columns = Object.keys(rows[0]);
    res.json({ columns, rows, rowCount: rows.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/connect', async (req, res) => {
  const { host, user, password, library } = req.body;

  if (!user || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
  }

  const ibmiModule = require('../ibmi');
  ibmiModule.setConfig({ host, user, password, library });

  try {
    await ibmiModule.testConnection();
    res.json({ ok: true, message: 'Conexión establecida' });
  } catch (err) {
    res.status(500).json({ error: `No se pudo conectar: ${err.message}` });
  }
});

module.exports = router;
