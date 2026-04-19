import { AlertCircle } from 'lucide-react';
import { Button } from './button';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'Something went wrong', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <AlertCircle className="w-12 h-12 text-red-400" />
      <p className="text-gray-600 max-w-sm">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>Try again</Button>
      )}
    </div>
  );
}
