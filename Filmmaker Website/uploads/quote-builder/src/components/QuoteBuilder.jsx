import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { DAY_MULTIPLIERS, calculateQuote, formatCurrency, lineTotal } from '../lib/calculations';
import QuoteTotals from './QuoteTotals';
import PresetPicker from './PresetPicker';
import PdfExportButton from './PdfExportButton';

const CATEGORY_COLORS = {
  crew: 'bg-blue-100 text-blue-800',
  camera: 'bg-purple-100 text-purple-800',
  lens: 'bg-indigo-100 text-indigo-800',
  audio: 'bg-green-100 text-green-800',
  lighting: 'bg-yellow-100 text-yellow-800',
  grip: 'bg-orange-100 text-orange-800',
  post: 'bg-pink-100 text-pink-800',
  custom: 'bg-gray-100 text-gray-800',
};

const CATEGORIES = ['crew', 'camera', 'lens', 'audio', 'lighting', 'grip', 'post'];

export default function QuoteBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [catalogue, setCatalogue] = useState([]);
  const [lineItems, setLineItems] = useState([]);
  const [dayMultiplier, setDayMultiplier] = useState(1);
  const [gstEnabled, setGstEnabled] = useState(true);
  const [clientName, setClientName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [quoteRef, setQuoteRef] = useState('');
  const [quoteDate, setQuoteDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState(id ? Number(id) : null);

  const [selectedCategory, setSelectedCategory] = useState('crew');
  const [selectedItemId, setSelectedItemId] = useState('');

  useEffect(() => {
    api.getCatalogue().then(setCatalogue);
  }, []);

  useEffect(() => {
    if (id) {
      api.getQuote(id).then((q) => {
        setClientName(q.client_name);
        setProjectName(q.project_name);
        setQuoteRef(q.quote_ref);
        setQuoteDate(q.quote_date);
        setDayMultiplier(q.day_multiplier);
        setGstEnabled(!!q.gst_enabled);
        setNotes(q.notes);
        setLineItems(q.lineItems.map((li, i) => ({ ...li, key: Date.now() + i })));
        setSavedId(Number(id));
      });
    }
  }, [id]);

  const filteredItems = catalogue.filter((c) => c.category === selectedCategory);

  const addItem = useCallback(() => {
    const item = catalogue.find((c) => c.id === Number(selectedItemId));
    if (!item) return;
    setLineItems((prev) => [
      ...prev,
      {
        key: Date.now(),
        catalogue_id: item.id,
        name: item.name,
        category: item.category,
        rate: item.rate,
        unit: item.unit,
        qty: 1,
        days: 1,
      },
    ]);
    setSelectedItemId('');
  }, [catalogue, selectedItemId]);

  const addCustomRow = () => {
    setLineItems((prev) => [
      ...prev,
      {
        key: Date.now(),
        catalogue_id: null,
        name: '',
        category: 'custom',
        rate: 0,
        unit: 'day',
        qty: 1,
        days: 1,
      },
    ]);
  };

  const updateItem = (key, field, value) => {
    setLineItems((prev) =>
      prev.map((li) => (li.key === key ? { ...li, [field]: value } : li))
    );
  };

  const removeItem = (key) => {
    setLineItems((prev) => prev.filter((li) => li.key !== key));
  };

  const loadPreset = (presetItems) => {
    const items = presetItems.map((pi, i) => ({
      key: Date.now() + i,
      catalogue_id: pi.catalogue_id,
      name: pi.name,
      category: pi.category,
      rate: pi.rate,
      unit: pi.unit,
      qty: pi.qty,
      days: pi.days,
    }));
    setLineItems(items);
  };

  const totals = calculateQuote(lineItems, dayMultiplier, gstEnabled);

  const saveQuote = async () => {
    setSaving(true);
    const payload = {
      client_name: clientName,
      project_name: projectName,
      quote_ref: quoteRef,
      quote_date: quoteDate,
      day_multiplier: dayMultiplier,
      gst_enabled: gstEnabled ? 1 : 0,
      notes,
      lineItems,
    };
    try {
      if (savedId) {
        await api.updateQuote(savedId, payload);
      } else {
        const { id: newId } = await api.createQuote(payload);
        setSavedId(newId);
        navigate(`/quote/${newId}`, { replace: true });
      }
    } finally {
      setSaving(false);
    }
  };

  const duplicateQuote = () => {
    setSavedId(null);
    setQuoteRef('');
    navigate('/', { replace: true });
  };

  return (
    <div className="space-y-6">
      {/* Header fields */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Client</label>
            <input className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Client name" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Project</label>
            <input className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Project name" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Quote Ref</label>
            <input className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" value={quoteRef} onChange={(e) => setQuoteRef(e.target.value)} placeholder="e.g. Q-001" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
            <input type="date" className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" value={quoteDate} onChange={(e) => setQuoteDate(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Presets + Add item */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <PresetPicker onLoad={loadPreset} />

        <div className="flex items-end gap-2 flex-wrap">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
            <select className="border border-gray-300 rounded px-3 py-1.5 text-sm" value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setSelectedItemId(''); }}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Item</label>
            <select className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" value={selectedItemId} onChange={(e) => setSelectedItemId(e.target.value)}>
              <option value="">Select item…</option>
              {filteredItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} — {formatCurrency(item.rate)}/{item.unit}
                </option>
              ))}
            </select>
          </div>
          <button onClick={addItem} disabled={!selectedItemId} className="px-4 py-1.5 text-sm bg-gray-900 text-white rounded hover:bg-gray-800 disabled:opacity-40">
            Add
          </button>
          <button onClick={addCustomRow} className="px-4 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50">
            + Custom row
          </button>
        </div>
      </div>

      {/* Line items table */}
      {lineItems.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Item</th>
                <th className="px-4 py-2 w-24">Rate</th>
                <th className="px-4 py-2 w-16">Unit</th>
                <th className="px-4 py-2 w-20">Qty</th>
                <th className="px-4 py-2 w-20">Days</th>
                <th className="px-4 py-2 w-28 text-right">Line Total</th>
                <th className="px-4 py-2 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lineItems.map((li) => (
                <tr key={li.key} className="hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLORS[li.category] || CATEGORY_COLORS.custom}`}>
                      {li.category}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {li.catalogue_id ? (
                      li.name
                    ) : (
                      <input className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={li.name} onChange={(e) => updateItem(li.key, 'name', e.target.value)} placeholder="Custom item" />
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {li.catalogue_id ? (
                      formatCurrency(li.rate)
                    ) : (
                      <input type="number" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={li.rate} onChange={(e) => updateItem(li.key, 'rate', Number(e.target.value))} />
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {li.catalogue_id ? (
                      li.unit
                    ) : (
                      <select className="border border-gray-300 rounded px-1 py-1 text-sm" value={li.unit} onChange={(e) => updateItem(li.key, 'unit', e.target.value)}>
                        <option value="day">day</option>
                        <option value="hour">hour</option>
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <input type="number" min="0" step="1" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={li.qty} onChange={(e) => updateItem(li.key, 'qty', Number(e.target.value))} />
                  </td>
                  <td className="px-4 py-2">
                    {li.unit === 'hour' ? (
                      <span className="text-gray-400">—</span>
                    ) : (
                      <input type="number" min="0" step="1" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={li.days} onChange={(e) => updateItem(li.key, 'days', Number(e.target.value))} />
                    )}
                  </td>
                  <td className="px-4 py-2 text-right font-medium">
                    {formatCurrency(lineTotal(li, dayMultiplier))}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button onClick={() => removeItem(li.key)} className="text-gray-400 hover:text-red-500 text-lg leading-none">&times;</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bottom controls + totals */}
      <div className="flex flex-col md:flex-row gap-4 items-start justify-between">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Day-rate multiplier</label>
              <select className="border border-gray-300 rounded px-3 py-1.5 text-sm" value={dayMultiplier} onChange={(e) => setDayMultiplier(Number(e.target.value))}>
                {DAY_MULTIPLIERS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 pt-4">
              <input type="checkbox" id="gst" checked={gstEnabled} onChange={(e) => setGstEnabled(e.target.checked)} className="rounded" />
              <label htmlFor="gst" className="text-sm text-gray-700">Include GST (10%)</label>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
            <textarea className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes…" />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={saveQuote} disabled={saving} className="px-4 py-2 text-sm bg-gray-900 text-white rounded hover:bg-gray-800 disabled:opacity-40">
              {saving ? 'Saving…' : savedId ? 'Update Quote' : 'Save Quote'}
            </button>
            {savedId && (
              <button onClick={duplicateQuote} className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
                Duplicate
              </button>
            )}
            {savedId && lineItems.length > 0 && (
              <PdfExportButton
                quote={{ client_name: clientName, project_name: projectName, quote_ref: quoteRef, quote_date: quoteDate, day_multiplier: dayMultiplier, gst_enabled: gstEnabled, notes }}
                lineItems={lineItems}
                totals={totals}
              />
            )}
          </div>
        </div>

        {lineItems.length > 0 && (
          <QuoteTotals totals={totals} dayMultiplier={dayMultiplier} />
        )}
      </div>
    </div>
  );
}
