const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  return res.json();
}

export const api = {
  getCatalogue: () => request('/catalogue'),
  getAllCatalogue: () => request('/catalogue/all'),
  createCatalogueItem: (item) => request('/catalogue', { method: 'POST', body: JSON.stringify(item) }),
  updateCatalogueItem: (id, item) => request(`/catalogue/${id}`, { method: 'PUT', body: JSON.stringify(item) }),
  archiveCatalogueItem: (id) => request(`/catalogue/${id}`, { method: 'DELETE' }),

  getQuotes: () => request('/quotes'),
  getQuote: (id) => request(`/quotes/${id}`),
  createQuote: (quote) => request('/quotes', { method: 'POST', body: JSON.stringify(quote) }),
  updateQuote: (id, quote) => request(`/quotes/${id}`, { method: 'PUT', body: JSON.stringify(quote) }),
  deleteQuote: (id) => request(`/quotes/${id}`, { method: 'DELETE' }),

  getPresets: () => request('/presets'),
};
