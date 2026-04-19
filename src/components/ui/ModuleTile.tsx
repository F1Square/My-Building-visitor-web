import React from 'react';
import { Lock } from 'lucide-react';

interface ModuleTileProps {
  moduleKey: string;
  label: string;
  icon: React.ReactNode;
  badgeCount?: number;
  locked?: boolean;
  onClick: () => void;
}

export function ModuleTile({ moduleKey, label, icon, badgeCount, locked, onClick }: ModuleTileProps) {
  return (
    <button
      data-testid="module-tile"
      data-module={moduleKey}
      onClick={onClick}
      className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all active:scale-95 ${locked ? 'opacity-60' : ''}`}
    >
      <div className="relative">
        <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
          {icon}
        </div>
        {(badgeCount ?? 0) > 0 && !locked && (
          <span
            data-testid={`badge-${moduleKey}`}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
          >
            {(badgeCount ?? 0) > 99 ? '99+' : badgeCount}
          </span>
        )}
        {locked && (
          <span
            data-testid={`lock-${moduleKey}`}
            className="absolute -top-1 -right-1 bg-gray-400 rounded-full w-5 h-5 flex items-center justify-center"
          >
            <Lock className="w-3 h-3 text-white" />
          </span>
        )}
      </div>
      <span className="text-xs font-semibold text-gray-700 text-center leading-tight">{label}</span>
    </button>
  );
}
