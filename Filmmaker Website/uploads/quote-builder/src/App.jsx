import { Routes, Route, NavLink } from 'react-router-dom';
import QuoteBuilder from './components/QuoteBuilder';
import QuoteHistory from './components/QuoteHistory';
import CatalogueManager from './components/CatalogueManager';

const navClass = ({ isActive }) =>
  `px-4 py-2 text-sm font-medium rounded-md transition-colors ${
    isActive ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
  }`;

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">Production Quote Builder</h1>
          <nav className="flex gap-1">
            <NavLink to="/" end className={navClass}>New Quote</NavLink>
            <NavLink to="/history" className={navClass}>History</NavLink>
            <NavLink to="/catalogue" className={navClass}>Catalogue</NavLink>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<QuoteBuilder />} />
          <Route path="/quote/:id" element={<QuoteBuilder />} />
          <Route path="/history" element={<QuoteHistory />} />
          <Route path="/catalogue" element={<CatalogueManager />} />
        </Routes>
      </main>
    </div>
  );
}
