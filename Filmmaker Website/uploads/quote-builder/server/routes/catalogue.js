const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  const items = db.prepare('SELECT * FROM catalogue WHERE active = 1 ORDER BY category, name').all();
  res.json(items);
});

router.get('/all', (req, res) => {
  const items = db.prepare('SELECT * FROM catalogue ORDER BY category, name').all();
  res.json(items);
});

router.post('/', (req, res) => {
  const { category, name, rate, unit } = req.body;
  const info = db.prepare(
    'INSERT INTO catalogue (category, name, rate, unit) VALUES (?, ?, ?, ?)'
  ).run(category, name, rate, unit || 'day');
  res.json({ id: info.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const { category, name, rate, unit, active } = req.body;
  db.prepare(
    'UPDATE catalogue SET category=?, name=?, rate=?, unit=?, active=? WHERE id=?'
  ).run(category, name, rate, unit, active ?? 1, req.params.id);
  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('UPDATE catalogue SET active = 0 WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
