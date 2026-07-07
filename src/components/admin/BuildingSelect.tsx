import { Building2 } from 'lucide-react';
import type { BuildingOption } from '../../hooks/useBuildings';

interface BuildingSelectProps {
  buildings: BuildingOption[];
  loading?: boolean;
  value: BuildingOption | null;
  onChange: (building: BuildingOption | null) => void;
  label?: string;
  className?: string;
}

export function BuildingSelect({
  buildings,
  loading,
  value,
  onChange,
  label = 'Select society',
  className = '',
}: BuildingSelectProps) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-200 p-4 ${className}`}>
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
        <Building2 className="w-4 h-4 text-blue-600" />
        {label}
      </label>
      <select
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        value={value?.id ?? ''}
        disabled={loading}
        onChange={e => {
          const id = e.target.value;
          if (!id) {
            onChange(null);
            return;
          }
          const b = buildings.find(x => x.id === id) ?? null;
          onChange(b);
        }}
      >
        <option value="">{loading ? 'Loading societies…' : 'Choose a society…'}</option>
        {buildings.map(b => (
          <option key={b.id} value={b.id}>{b.name}</option>
        ))}
      </select>
      {value && (
        <p className="text-xs text-gray-500 mt-2">Managing: <span className="font-medium text-gray-700">{value.name}</span></p>
      )}
    </div>
  );
}

export function AdminBuildingPrompt() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-center p-8">
      <Building2 className="w-14 h-14 text-gray-300" />
      <p className="font-semibold text-gray-900">Select a society</p>
      <p className="text-sm text-gray-500 max-w-sm">Choose a building above to view and manage its data.</p>
    </div>
  );
}
