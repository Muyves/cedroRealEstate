import React from 'react';
import { Trees, Building2 } from 'lucide-react';

export default function CategoryBadge({ category, className = '' }) {
  const isLand = (category || '').toLowerCase() === 'land';

  if (isLand) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-emerald-100/90 text-emerald-800 backdrop-blur-sm ${className}`}
      >
      <Trees className="w-3.5 h-3.5" />
      <span>Ubutaka (Land)</span>
    </span>
  );
}

return (
  <span
    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-sky-100/90 text-sky-800 backdrop-blur-sm ${className}`}
  >
    <Building2 className="w-3.5 h-3.5" />
    <span>Inzu (Building)</span>
  </span>
);
}
