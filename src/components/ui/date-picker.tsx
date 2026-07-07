import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { parseExpenseDateParts } from '@/lib/dateUtils';

interface DatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  disableFuture?: boolean;
}

function parseValue(value?: string): Date | undefined {
  const parts = parseExpenseDateParts(value);
  if (!parts) return undefined;
  return new Date(parts.year, parts.month, parts.day);
}

function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  className,
  disabled,
  disableFuture = true,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selected = parseValue(value);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal h-11 rounded-xl border-gray-200 bg-gray-50 hover:bg-white',
            !value && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-blue-600" />
          {selected ? format(selected, 'dd MMM yyyy') : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          onSelect={d => {
            if (!d) return;
            onChange(toDateString(d));
            setOpen(false);
          }}
          disabled={disableFuture ? date => date > today : undefined}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
