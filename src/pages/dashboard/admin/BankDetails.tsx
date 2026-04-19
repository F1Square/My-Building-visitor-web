import { useEffect, useState } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { useToast } from '../../../components/ui/use-toast';
import api from '../../../lib/apiClient';

interface BankDetailsData {
  bank_name?: string;
  bank_branch?: string;
  bank_ifsc?: string;
  bank_account?: string;
  beneficiary_name?: string;
  contact_name?: string;
  contact_email?: string;
  contact_mobile?: string;
}

export default function BankDetailsPage() {
  const { toast } = useToast();
  const [details, setDetails] = useState<BankDetailsData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<BankDetailsData>('/buildings/bank-details')
      .then(setDetails).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/buildings/bank-details', details);
      toast({ title: 'Bank details saved' });
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  if (loading) return <div><LoadingSkeleton rows={4} /></div>;

  const fields: { key: keyof BankDetailsData; label: string; placeholder?: string }[] = [
    { key: 'beneficiary_name', label: 'Beneficiary Name' },
    { key: 'bank_name', label: 'Bank Name' },
    { key: 'bank_branch', label: 'Branch' },
    { key: 'bank_account', label: 'Account Number', placeholder: '9-18 digits' },
    { key: 'bank_ifsc', label: 'IFSC Code', placeholder: 'e.g. SBIN0001234' },
    { key: 'contact_name', label: 'Contact Name (optional)' },
    { key: 'contact_email', label: 'Contact Email (optional)' },
    { key: 'contact_mobile', label: 'Contact Mobile (optional)' },
  ];

  return (
    <div>
      <PageHeader title="Bank Details" />
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
        {fields.map(f => (
          <div key={f.key} className="space-y-2">
            <Label>{f.label}</Label>
            <Input
              value={details[f.key] ?? ''}
              onChange={e => setDetails(d => ({ ...d, [f.key]: e.target.value }))}
              placeholder={f.placeholder ?? f.label}
            />
          </div>
        ))}
        <Button className="w-full" disabled={saving} onClick={handleSave}>{saving ? 'Saving...' : 'Save Details'}</Button>
      </div>
    </div>
  );
}
