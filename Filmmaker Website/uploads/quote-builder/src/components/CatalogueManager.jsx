import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { formatCurrency } from '../lib/calculations';

const CATEGORIES = ['crew', 'camera', 'lens', 'audio', 'lighting', 'grip', 'post'];

export default function CatalogueManager() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showArchived, setShowArchived] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ category: 'crew', name: '', rate: '', unit: 'day' });

  useEffect(() => { load(); }, [showArchived]);

  async function load() {
    const data = showArchived ? await api.getAllCatalogue() : await api.getCatalogue();
    setItems(data);
  }

  const filtered = filter === 'all' ? items : items.filter((i) => i.category === filter);

  async function handleSave() {
    const payload = { ...form, rate: Number(form.rate), active: 1 };
    if (editing) {
      await api.updateCatalogueItem(editing, payload);
    } else {
      await api.createCatalogueItem(payload);
    }
    setEditing(null);
    setForm({ category: 'crew', name: '', rate: '', unit: 'day' });
    load();
  }

  function startEdit(item) {
    setEditing(item.id);
    setForm({ category: item.category, name: item.name, rate: item.rate, unit: item.unit });
  }

  async function handleArchive(id) {
    await api.archiveCatalogueItem(id);
    load();
  }

  async function handleRestore(item) {
    await api.updateCatalogueItem(item.id, { ...item, active: 1 });
    load();
  }

  return (
    <div className="space-y-4">
      {/* Add / Edit form */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="text-sm font-medium text-gray-700 mb-3">{editing ? 'Edit Item' : 'Add Item'}</h2>
        <div className="flex items-end gap-2 flex-wrap">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Category</label>
            <select className="border border-gray-300 rounded px-3 py-1.5 text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-gray-500 mb-1">Name</label>
            <input className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="w-28">
            <label className="block text-xs text-gray-500 mb-1">Rate ($)</label>
            <input type="number" className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Unit</label>
            <select className="border border-gray-300 rounded px-3 py-1.5 text-sm" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
              <option value="day">day</option>
              <option value="hour">hour</option>
            </select>
          </div>
          <button onClick={handleSave} disabled={!form.name || !form.rate} className="px-4 py-1.5 text-sm bg-gray-900 text-white rounded hover:bg-gray-800 disabled:opacity-40">
            {editing ? 'Update' : 'Add'}
          </button>
          {editing && (
            <button onClick={() => { setEditing(null); setForm({ category: 'crew', name: '', rate: '', unit: 'day' }); }} className="px-4 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50">
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <select className="border border-gray-300 rounded px-3 py-1.5 text-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
        <label className="flex items-center gap-1.5 text-sm text-gray-600">
          <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} className="rounded" />
          Show archived
        </label>
        <span className="text-xs text-gray-400">{filtered.length} items</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Rate</th>
              <th className="px-4 py-2">Unit</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((item) => (
              <tr key={item.id} className={`hover:bg-gray-50 ${!item.active ? 'opacity-50' : ''}`}>
                <td className="px-4 py-2">{item.category}</td>
                <td className="px-4 py-2">{item.name}</td>
                <td className="px-4 py-2">{formatCurrency(item.rate)}</td>
                <td className="px-4 py-2">{item.unit}</td>
                <td className="px-4 py-2 text-right space-x-2">
                  <button onClick={() => startEdit(item)} className="text-xs text-gray-500 hover:text-gray-800">Edit</button>
                  {item.active ? (
                    <button onClick={() => handleArchive(item.id)} className="text-xs text-gray-500 hover:text-red-600">Archive</button>
                  ) : (
                    <button onClick={() => handleRestore(item)} className="text-xs text-green-600 hover:text-green-800">Restore</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
