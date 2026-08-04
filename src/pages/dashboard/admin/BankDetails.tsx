import { useEffect, useState } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import { BuildingSelect, AdminBuildingPrompt } from '../../../components/admin/BuildingSelect';
import { useAdminBuilding } from '../../../hooks/useAdminBuilding';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { useToast } from '../../../components/ui/use-toast';
import { Home, ChevronRight, ChevronLeft, Info } from 'lucide-react';
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
  razorpay_account_id?: string;
  wing?: string;
}

interface WingRow {
  wing: string;
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
  const [wings, setWings] = useState<WingRow[]>([]);
  const [wingsLoading, setWingsLoading] = useState(false);
  const [selectedWing, setSelectedWing] = useState<string | null>(null);
  const [details, setDetails] = useState<BankDetailsData>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSelectedWing(null);
    setDetails({});
    if (needsBuilding || !buildingId) {
      setWings([]);
      return;
    }
    setWingsLoading(true);
    api.get<WingRow[]>('/expenses/wings', { building_id: buildingId })
      .then((data) => setWings((data || []).filter((w) => w.wing && w.wing !== 'Building-Wide')))
      .catch(() => setWings([]))
      .finally(() => setWingsLoading(false));
  }, [buildingId, needsBuilding]);

  useEffect(() => {
    if (!buildingId || !selectedWing) {
      setDetails({});
      return;
    }
    setLoading(true);
    api.get<BankDetailsData>('/buildings/bank-details', { building_id: buildingId, wing: selectedWing })
      .then(setDetails)
      .catch(() => setDetails({}))
      .finally(() => setLoading(false));
  }, [buildingId, selectedWing]);

  const handleSave = async () => {
    if (!buildingId || !selectedWing) return;
    setSaving(true);
    try {
      await api.post('/buildings/bank-details', {
        ...details,
        building_id: buildingId,
        wing: selectedWing,
      });
      toast({ title: `Bank details saved for wing ${selectedWing}` });
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const fields: { key: keyof BankDetailsData; label: string; placeholder?: string }[] = [
    { key: 'beneficiary_name', label: 'Beneficiary Name' },
    { key: 'bank_name', label: 'Bank Name' },
    { key: 'bank_branch', label: 'Branch' },
    { key: 'bank_account', label: 'Account Number', placeholder: '9-18 digits' },
    { key: 'bank_ifsc', label: 'IFSC Code', placeholder: 'e.g. SBIN0001234' },
    { key: 'razorpay_account_id', label: 'Easebuzz Merchant ID (optional)', placeholder: 'Sub-merchant / merchant id' },
    { key: 'contact_name', label: 'Contact Name (optional)' },
    { key: 'contact_email', label: 'Contact Email (optional)' },
    { key: 'contact_mobile', label: 'Contact Mobile (optional)' },
  ];

  return (
    <div>
      <PageHeader
        title="Bank Details"
        subtitle={
          selectedWing
            ? `${selectedBuilding?.name || 'Society'} · Wing ${selectedWing}`
            : selectedBuilding
              ? `${selectedBuilding.name} — select a wing`
              : 'Society wing payout accounts'
        }
      />
      <BuildingSelect
        className="mb-4"
        buildings={buildings}
        loading={buildingsLoading}
        value={selectedBuilding}
        onChange={(b) => {
          selectBuilding(b);
          setSelectedWing(null);
        }}
      />
      {needsBuilding ? (
        <AdminBuildingPrompt />
      ) : !selectedWing ? (
        wingsLoading ? (
          <LoadingSkeleton rows={3} />
        ) : (
          <>
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4 text-sm text-blue-800">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <p>
                Select a wing to add its bank account. Maintenance payments from that wing
                (e.g. A-102 → Wing A) settle to that wing&apos;s account.
              </p>
            </div>
            <div className="space-y-3">
              {wings.map((w) => {
                const label = w.wing;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setSelectedWing(label)}
                    className="w-full flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-4 text-left hover:border-blue-200 hover:shadow-sm transition"
                  >
                    <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Home className="w-5 h-5 text-blue-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-500">Wing</p>
                      <p className="text-base font-bold text-gray-900">{label}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                );
              })}
            </div>
          </>
        )
      ) : loading ? (
        <LoadingSkeleton rows={4} />
      ) : (
        <div className="space-y-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => setSelectedWing(null)}
          >
            <ChevronLeft className="w-4 h-4" />
            All wings
          </Button>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            {fields.map((f) => (
              <div key={f.key} className="space-y-1.5">
                <Label>{f.label}</Label>
                <Input
                  placeholder={f.placeholder}
                  value={details[f.key] ?? ''}
                  onChange={(e) => setDetails((d) => ({ ...d, [f.key]: e.target.value }))}
                />
              </div>
            ))}
            <Button className="w-full" disabled={saving} onClick={handleSave}>
              {saving ? 'Saving...' : `Save Wing ${selectedWing} Bank Details`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
