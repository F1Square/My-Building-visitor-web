import { getDateLabel } from '../lib/dateUtils';

interface DateSeparatorProps {
  date: Date;
}

export function DateSeparator({ date }: DateSeparatorProps) {
  return (
    <div className="flex items-center gap-3 my-3" role="separator">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-xs text-gray-400 font-medium px-2 shrink-0">
        {getDateLabel(date)}
      </span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}
