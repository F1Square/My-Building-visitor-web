import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  /** Show back button (mobile web). Pass false to hide. */
  showBack?: boolean;
  onBack?: () => void;
  backLabel?: string;
}

export function PageHeader({
  title,
  subtitle,
  action,
  showBack = false,
  onBack,
  backLabel = 'Go back',
}: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  return (
    <div className="mb-6">
      <div className="flex items-start gap-3">
        {showBack && (
          <button
            type="button"
            onClick={handleBack}
            className="md:hidden shrink-0 mt-0.5 w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50"
            aria-label={backLabel}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="flex-1 min-w-0 flex items-start justify-between gap-3">
          <div className="min-w-0 text-left">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">{title}</h1>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
        </div>
      </div>
    </div>
  );
}
