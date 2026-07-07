import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { BuildingSelect, AdminBuildingPrompt } from '../../components/admin/BuildingSelect';
import { useAdminBuilding } from '../../hooks/useAdminBuilding';
import { Home, ChevronRight, Info } from 'lucide-react';
import api from '../../lib/apiClient';

interface WingRow {
  wing: string;
}

export default function Expenses() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    isAdmin,
    buildings,
    buildingsLoading,
    selectedBuilding,
    selectBuilding,
    buildingId,
    needsBuilding,
  } = useAdminBuilding();

  useEffect(() => {
    if (!isAdmin || buildingsLoading || buildings.length === 0) return;
    const id = searchParams.get('building_id');
    if (!id || selectedBuilding?.id === id) return;
    const match = buildings.find(b => b.id === id);
    if (match) selectBuilding(match);
  }, [isAdmin, buildings, buildingsLoading, searchParams, selectedBuilding?.id, selectBuilding]);

  const [wings, setWings] = useState<WingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (needsBuilding) {
      setWings([]);
      setLoading(false);
      return;
    }
    if (!buildingId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    api.get<WingRow[]>('/expenses/wings', { building_id: buildingId })
      .then(setWings)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [buildingId, needsBuilding]);

  const openWing = (wing: string) => {
    const wingSlug = encodeURIComponent(wing || 'Building-Wide');
    const qs = isAdmin && selectedBuilding
      ? `?building_id=${selectedBuilding.id}&building_name=${encodeURIComponent(selectedBuilding.name)}`
      : '';
    navigate(`/dashboard/expenses/${wingSlug}${qs}`);
  };

  return (
    <div>
      <PageHeader
        title="Expenses & Fund"
        subtitle={isAdmin && selectedBuilding ? selectedBuilding.name : 'Select a wing to manage expenses'}
      />

      {isAdmin && (
        <BuildingSelect
          className="mb-4"
          buildings={buildings}
          loading={buildingsLoading}
          value={selectedBuilding}
          onChange={selectBuilding}
        />
      )}

      {needsBuilding ? (
        <AdminBuildingPrompt />
      ) : !buildingId ? (
        <EmptyState
          icon={<Home className="w-12 h-12 text-gray-300" />}
          title="No building assigned"
          description="Your account is not linked to a society."
        />
      ) : loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={() => {
          if (!buildingId) return;
          setLoading(true);
          api.get<WingRow[]>('/expenses/wings', { building_id: buildingId })
            .then(setWings)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
        }} />
      ) : wings.length === 0 ? (
        <EmptyState
          icon={<Home className="w-12 h-12 text-gray-300" />}
          title="No wings configured"
          description="Configure wings in building settings, or use Building-Wide."
        />
      ) : (
        <>
          <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4 text-sm text-blue-800">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <p>Select a wing to view and manage its expenses separately.</p>
          </div>
          <div className="space-y-3">
            {wings.map((w, idx) => {
              const label = w.wing || 'Building-Wide';
              return (
                <button
                  key={`${label}-${idx}`}
                  onClick={() => openWing(label)}
                  className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all text-left"
                >
                  <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <Home className="w-7 h-7 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Wing</p>
                    <p className="font-bold text-gray-900 text-lg truncate">{label}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
