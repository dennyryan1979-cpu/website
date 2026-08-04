import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { calculateQuote, formatCurrency } from '../lib/calculations';

export default function QuoteHistory() {
  const [quotes, setQuotes] = useState([]);
  const [details, setDetails] = useState({});

  useEffect(() => {
    loadQuotes();
  }, []);

  async function loadQuotes() {
    const list = await api.getQuotes();
    setQuotes(list);
    const detailMap = {};
    for (const q of list) {
      const full = await api.getQuote(q.id);
      const totals = calculateQuote(full.lineItems, q.day_multiplier, q.gst_enabled);
      detailMap[q.id] = { itemCount: full.lineItems.length, total: totals.total };
    }
    setDetails(detailMap);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this quote?')) return;
    await api.deleteQuote(id);
    loadQuotes();
  }

  async function handleDuplicate(id) {
    const full = await api.getQuote(id);
    const { id: newId } = await api.createQuote({
      client_name: full.client_name,
      project_name: full.project_name,
      quote_ref: '',
      quote_date: new Date().toISOString().slice(0, 10),
      day_multiplier: full.day_multiplier,
      gst_enabled: full.gst_enabled,
      notes: full.notes,
      lineItems: full.lineItems,
    });
    loadQuotes();
  }

  if (quotes.length === 0) {
    return <p className="text-gray-500 text-sm">No saved quotes yet.</p>;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <th className="px-4 py-2">Ref</th>
            <th className="px-4 py-2">Client</th>
            <th className="px-4 py-2">Project</th>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2 text-right">Items</th>
            <th className="px-4 py-2 text-right">Total</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {quotes.map((q) => (
            <tr key={q.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 font-medium">
                <Link to={`/quote/${q.id}`} className="text-blue-600 hover:underline">
                  {q.quote_ref || `#${q.id}`}
                </Link>
              </td>
              <td className="px-4 py-2">{q.client_name || '—'}</td>
              <td className="px-4 py-2">{q.project_name || '—'}</td>
              <td className="px-4 py-2">{q.quote_date}</td>
              <td className="px-4 py-2 text-right">{details[q.id]?.itemCount ?? '…'}</td>
              <td className="px-4 py-2 text-right font-medium">{details[q.id] ? formatCurrency(details[q.id].total) : '…'}</td>
              <td className="px-4 py-2 text-right space-x-2">
                <button onClick={() => handleDuplicate(q.id)} className="text-xs text-gray-500 hover:text-gray-800">Duplicate</button>
                <button onClick={() => handleDelete(q.id)} className="text-xs text-gray-500 hover:text-red-600">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
