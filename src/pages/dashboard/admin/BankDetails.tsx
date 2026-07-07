import { useEffect, useState } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import { BuildingSelect, AdminBuildingPrompt } from '../../../components/admin/BuildingSelect';
import { useAdminBuilding } from '../../../hooks/useAdminBuilding';
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
  const {
    buildings,
    buildingsLoading,
    selectedBuilding,
    selectBuilding,
    buildingId,
    needsBuilding,
  } = useAdminBuilding();
  const [details, setDetails] = useState<BankDetailsData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (needsBuilding || !buildingId) {
      setDetails({});
      setLoading(false);
      return;
    }
    setLoading(true);
    api.get<BankDetailsData>('/buildings/bank-details', { building_id: buildingId })
      .then(setDetails).catch(() => setDetails({})).finally(() => setLoading(false));
  }, [buildingId, needsBuilding]);

  const handleSave = async () => {
    if (!buildingId) return;
    setSaving(true);
    try {
      await api.post('/buildings/bank-details', { ...details, building_id: buildingId });
      toast({ title: 'Bank details saved' });
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

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
      <PageHeader title="Bank Details" subtitle={selectedBuilding ? selectedBuilding.name : 'Society payout account'} />
      <BuildingSelect
        className="mb-4"
        buildings={buildings}
        loading={buildingsLoading}
        value={selectedBuilding}
        onChange={selectBuilding}
      />
      {needsBuilding ? (
        <AdminBuildingPrompt />
      ) : loading ? (
        <LoadingSkeleton rows={4} />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          {fields.map(f => (
            <div key={f.key} className="space-y-1.5">
              <Label>{f.label}</Label>
              <Input
                placeholder={f.placeholder}
                value={details[f.key] ?? ''}
                onChange={e => setDetails(d => ({ ...d, [f.key]: e.target.value }))}
              />
            </div>
          ))}
          <Button className="w-full" disabled={saving} onClick={handleSave}>
            {saving ? 'Saving...' : 'Save Bank Details'}
          </Button>
        </div>
      )}
    </div>
  );
}
