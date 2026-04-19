import { useEffect, useState } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Badge } from '../../../components/ui/badge';
import { Building2 } from 'lucide-react';
import api from '../../../lib/apiClient';
import type { Building } from '../../../types';

export default function AdminBuildings() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Building[]>('/buildings').then(setBuildings).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div><LoadingSkeleton /></div>;

  return (
    <div>
      <PageHeader title="Buildings" subtitle={`${buildings.length} registered`} />
      {buildings.length === 0 ? (
        <EmptyState icon={<Building2 className="w-12 h-12 text-gray-300" />} title="No buildings" />
      ) : (
        <div className="space-y-3">
          {buildings.map(b => (
            <div key={b.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-gray-900">{b.name}</p>
                  <p className="text-sm text-gray-500">{b.city}{b.state ? `, ${b.state}` : ''}</p>
                  {b.pramukh_name && <p className="text-xs text-gray-400 mt-0.5">Pramukh: {b.pramukh_name}</p>}
                </div>
                <div className="flex flex-col items-end gap-1">
                  {b.subscription_status && (
                    <Badge variant={b.subscription_status === 'active' ? 'default' : 'secondary'} className="text-xs">
                      {b.subscription_status}
                    </Badge>
                  )}
                  {b.member_count !== undefined && <p className="text-xs text-gray-400">{b.member_count} members</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
