const express = require('express');
const ibmi = require('../ibmi');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { library } = ibmi.getConfig();
    const rows = await ibmi.query(
      `SELECT TABLE_NAME, COALESCE(TABLE_TEXT, '') AS TABLE_TEXT
       FROM QSYS2.SYSTABLES
       WHERE TABLE_SCHEMA = ?
         AND TABLE_TYPE = 'T'
       ORDER BY TABLE_NAME`,
      [library]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
