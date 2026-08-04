const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  const presets = db.prepare('SELECT * FROM presets ORDER BY id').all();
  const items = db.prepare(`
    SELECT pi.*, c.name, c.category, c.rate, c.unit
    FROM preset_items pi
    JOIN catalogue c ON c.id = pi.catalogue_id
    ORDER BY pi.preset_id, pi.id
  `).all();

  const result = presets.map(p => ({
    ...p,
    items: items.filter(i => i.preset_id === p.id),
  }));
  res.json(result);
});

module.exports = router;
