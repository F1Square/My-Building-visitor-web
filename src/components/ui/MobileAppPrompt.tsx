import { useState } from 'react';
import { Smartphone, Download } from 'lucide-react';
import { Button } from './button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { PLAY_STORE_URL, MOBILE_FEATURE_COPY, type MobileFeature } from '../../lib/appLinks';

interface MobileAppPromptProps {
  feature?: MobileFeature;
  title?: string;
  message?: string;
  /** banner = highlighted strip, card = bordered box, compact = inline hint */
  variant?: 'banner' | 'card' | 'compact';
  className?: string;
  /** Hide the download button (message only) */
  hideDownload?: boolean;
}

export function PlayStoreButton({ className = '', label = 'Get on Google Play' }: { className?: string; label?: string }) {
  return (
    <a
      href={PLAY_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 hover:bg-gray-800 transition-colors shadow-sm ${className}`}
    >
      <Download className="w-4 h-4" />
      {label}
    </a>
  );
}

export function MobileAppPrompt({
  feature = 'generic',
  title,
  message,
  variant = 'card',
  className = '',
  hideDownload = false,
}: MobileAppPromptProps) {
  const copy = MOBILE_FEATURE_COPY[feature];
  const heading = title ?? copy.title;
  const body = message ?? copy.message;

  if (variant === 'compact') {
    return (
      <div className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 ${className}`}>
        <Smartphone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
        <span className="flex-1 min-w-[200px]">{body}</span>
        {!hideDownload && (
          <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold hover:underline whitespace-nowrap">
            Google Play →
          </a>
        )}
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">{heading}</p>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">{body}</p>
              <p className="text-xs text-slate-400 mt-1.5">Available on Android · Google Play</p>
            </div>
          </div>
          {!hideDownload && <PlayStoreButton className="shrink-0 w-full sm:w-auto" />}
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <div className="flex items-start gap-3 mb-4">
        <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
          <Smartphone className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="font-semibold text-slate-900">{heading}</p>
          <p className="text-sm text-slate-500 mt-1 leading-relaxed">{body}</p>
        </div>
      </div>
      {!hideDownload && <PlayStoreButton className="w-full sm:w-auto" />}
    </div>
  );
}

interface MobileAppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: MobileFeature;
  title?: string;
  message?: string;
}

export function MobileAppDialog({
  open,
  onOpenChange,
  feature = 'generic',
  title,
  message,
}: MobileAppDialogProps) {
  const copy = MOBILE_FEATURE_COPY[feature];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <span className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-blue-600" />
            </span>
            {title ?? copy.title}
          </DialogTitle>
          <DialogDescription className="text-left pt-2 text-slate-500 leading-relaxed">
            {message ?? copy.message}
          </DialogDescription>
        </DialogHeader>
        <p className="text-xs text-center text-slate-400 -mt-1">Free on Google Play · Android</p>
        <PlayStoreButton className="w-full" label="Download MyBuilding" />
        <Button variant="ghost" className="w-full text-slate-500" onClick={() => onOpenChange(false)}>
          Continue on web
        </Button>
      </DialogContent>
    </Dialog>
  );
}

/** Button that opens the mobile-app download dialog instead of performing a mobile-only action. */
export function MobileOnlyButton({
  children,
  feature = 'generic',
  title,
  message,
  className,
  style,
  disabled,
  variant,
}: {
  children: React.ReactNode;
  feature?: MobileFeature;
  title?: string;
  message?: string;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive' | 'link';
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        className={className}
        style={style}
        disabled={disabled}
        variant={variant}
        onClick={() => setOpen(true)}
      >
        {children}
      </Button>
      <MobileAppDialog open={open} onOpenChange={setOpen} feature={feature} title={title} message={message} />
    </>
  );
}

// Backward-compatible alias
export const StoreButtons = PlayStoreButton;
