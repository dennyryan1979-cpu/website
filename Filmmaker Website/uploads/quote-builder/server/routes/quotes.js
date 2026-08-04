const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  const quotes = db.prepare(
    'SELECT * FROM quotes ORDER BY created_at DESC'
  ).all();
  res.json(quotes);
});

router.get('/:id', (req, res) => {
  const quote = db.prepare('SELECT * FROM quotes WHERE id = ?').get(req.params.id);
  if (!quote) return res.status(404).json({ error: 'Not found' });
  const lineItems = db.prepare(
    'SELECT * FROM quote_line_items WHERE quote_id = ? ORDER BY id'
  ).all(req.params.id);
  res.json({ ...quote, lineItems });
});

router.post('/', (req, res) => {
  const { client_name, project_name, quote_ref, quote_date, day_multiplier, gst_enabled, notes, lineItems } = req.body;
  const now = new Date().toISOString();

  const insertQuote = db.prepare(`
    INSERT INTO quotes (client_name, project_name, quote_ref, quote_date, day_multiplier, gst_enabled, notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertItem = db.prepare(`
    INSERT INTO quote_line_items (quote_id, catalogue_id, name, category, rate, unit, qty, days)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = db.transaction(() => {
    const info = insertQuote.run(
      client_name || '', project_name || '', quote_ref || '',
      quote_date || now.slice(0, 10), day_multiplier ?? 1, gst_enabled ?? 1, notes || '', now, now
    );
    const quoteId = info.lastInsertRowid;
    for (const item of (lineItems || [])) {
      insertItem.run(quoteId, item.catalogue_id || null, item.name, item.category, item.rate, item.unit || 'day', item.qty ?? 1, item.days ?? 1);
    }
    return quoteId;
  })();

  res.json({ id: result });
});

router.put('/:id', (req, res) => {
  const { client_name, project_name, quote_ref, quote_date, day_multiplier, gst_enabled, notes, lineItems } = req.body;
  const now = new Date().toISOString();

  const updateQuote = db.prepare(`
    UPDATE quotes SET client_name=?, project_name=?, quote_ref=?, quote_date=?, day_multiplier=?, gst_enabled=?, notes=?, updated_at=?
    WHERE id=?
  `);

  const deleteItems = db.prepare('DELETE FROM quote_line_items WHERE quote_id = ?');
  const insertItem = db.prepare(`
    INSERT INTO quote_line_items (quote_id, catalogue_id, name, category, rate, unit, qty, days)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  db.transaction(() => {
    updateQuote.run(
      client_name || '', project_name || '', quote_ref || '',
      quote_date || now.slice(0, 10), day_multiplier ?? 1, gst_enabled ?? 1, notes || '', now, req.params.id
    );
    deleteItems.run(req.params.id);
    for (const item of (lineItems || [])) {
      insertItem.run(req.params.id, item.catalogue_id || null, item.name, item.category, item.rate, item.unit || 'day', item.qty ?? 1, item.days ?? 1);
    }
  })();

  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM quotes WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
