import type { ReactNode } from 'react';

/** Shared key/value rows for admin record preview dialogs. */
export function RecordDetailRows({
  rows,
}: {
  rows: Array<[string, ReactNode]>;
}) {
  const visible = rows.filter(([, v]) => {
    if (v == null || v === false) return false;
    if (typeof v === 'string' && !v.trim()) return false;
    return true;
  });

  if (!visible.length) return null;

  return (
    <div className="divide-y divide-gray-100">
      {visible.map(([label, value]) => (
        <div key={label} className="flex justify-between gap-3 py-2.5 text-sm">
          <span className="text-gray-500 shrink-0">{label}</span>
          <span className="text-gray-900 font-medium text-right break-words min-w-0">{value}</span>
        </div>
      ))}
    </div>
  );
}
