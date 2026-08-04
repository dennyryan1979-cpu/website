import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export default function PresetPicker({ onLoad }) {
  const [presets, setPresets] = useState([]);

  useEffect(() => {
    api.getPresets().then(setPresets);
  }, []);

  if (presets.length === 0) return null;

  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">Load preset</label>
      <div className="flex gap-2 flex-wrap">
        {presets.map((p) => (
          <button
            key={p.id}
            onClick={() => onLoad(p.items)}
            className="px-3 py-1.5 text-xs border border-gray-300 rounded-full hover:bg-gray-100 transition-colors"
          >
            {p.name}
          </button>
        ))}
      </div>
    </div>
  );
}
