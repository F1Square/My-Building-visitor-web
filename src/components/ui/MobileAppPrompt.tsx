import { useState } from 'react';
import { Smartphone, ExternalLink } from 'lucide-react';
import { Button } from './button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { APP_LINKS, MOBILE_FEATURE_COPY, type MobileFeature } from '../../lib/appLinks';

interface MobileAppPromptProps {
  feature?: MobileFeature;
  title?: string;
  message?: string;
  /** banner = full-width strip, card = bordered box, compact = single line */
  variant?: 'banner' | 'card' | 'compact';
  className?: string;
}

export function StoreButtons({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col sm:flex-row gap-2 ${className}`}>
      <a
        href={APP_LINKS.playStore}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 text-white text-sm font-semibold px-4 py-2.5 hover:bg-gray-800 transition-colors"
      >
        <Smartphone className="w-4 h-4" />
        Google Play
        <ExternalLink className="w-3.5 h-3.5 opacity-70" />
      </a>
      <a
        href={APP_LINKS.appStore}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm font-semibold px-4 py-2.5 hover:bg-gray-50 transition-colors"
      >
        <Smartphone className="w-4 h-4" />
        App Store
        <ExternalLink className="w-3.5 h-3.5 opacity-70" />
      </a>
    </div>
  );
}

export function MobileAppPrompt({
  feature = 'generic',
  title,
  message,
  variant = 'card',
  className = '',
}: MobileAppPromptProps) {
  const copy = MOBILE_FEATURE_COPY[feature];
  const heading = title ?? copy.title;
  const body = message ?? copy.message;

  if (variant === 'compact') {
    return (
      <p className={`text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 ${className}`}>
        📱 {body}
      </p>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{heading}</p>
              <p className="text-sm text-gray-600 mt-0.5">{body}</p>
            </div>
          </div>
          <StoreButtons className="shrink-0" />
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-gray-200 bg-white p-4 shadow-sm ${className}`}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
          <Smartphone className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">{heading}</p>
          <p className="text-sm text-gray-600 mt-1">{body}</p>
        </div>
      </div>
      <StoreButtons />
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
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-blue-600" />
            {title ?? copy.title}
          </DialogTitle>
          <DialogDescription className="text-left pt-1">
            {message ?? copy.message}
          </DialogDescription>
        </DialogHeader>
        <StoreButtons />
        <Button variant="ghost" className="w-full" onClick={() => onOpenChange(false)}>
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
