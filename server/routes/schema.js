const express = require('express');
const ibmi = require('../ibmi');

const router = express.Router();

router.get('/:tableName', async (req, res) => {
  try {
    const { library } = ibmi.getConfig();
    const tableName = req.params.tableName.toUpperCase();

    const columns = await ibmi.query(
      `SELECT COLUMN_NAME,
              DATA_TYPE,
              COALESCE(CHARACTER_MAXIMUM_LENGTH, NUMERIC_PRECISION, 0) AS COL_LENGTH,
              IS_NULLABLE,
              COALESCE(COLUMN_TEXT, '') AS COLUMN_TEXT
       FROM QSYS2.SYSCOLUMNS2
       WHERE TABLE_SCHEMA = ?
         AND TABLE_NAME = ?
       ORDER BY ORDINAL_POSITION`,
      [library, tableName]
    );

    if (columns.length === 0) {
      return res.status(404).json({ error: `Tabla ${tableName} no encontrada en ${library}` });
    }

    res.json(columns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
