import { useEffect, useState } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { CreditCard } from 'lucide-react';
import api from '../../../lib/apiClient';
import type { Subscription } from '../../../types';

export default function AdminSubscriptions() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Subscription[]>('/subscriptions').then(setSubs).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div><LoadingSkeleton /></div>;

  const byStatus = (s: string) => subs.filter(sub => sub.status === s);

  return (
    <div>
      <PageHeader title="Subscriptions" />
      <Tabs defaultValue="active">
        <TabsList className="mb-4">
          {['active','expired','cancelled'].map(s => (
            <TabsTrigger key={s} value={s} className="capitalize">{s} ({byStatus(s).length})</TabsTrigger>
          ))}
        </TabsList>
        {['active','expired','cancelled'].map(s => (
          <TabsContent key={s} value={s}>
            {byStatus(s).length === 0 ? (
              <EmptyState icon={<CreditCard className="w-10 h-10 text-gray-300" />} title={`No ${s} subscriptions`} />
            ) : (
              <div className="space-y-3">
                {byStatus(s).map(sub => (
                  <div key={sub.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900 capitalize">{sub.plan}</p>
                        {sub.start_date && <p className="text-xs text-gray-400">Started: {new Date(sub.start_date).toLocaleDateString('en-IN')}</p>}
                        {sub.expires_at && <p className="text-xs text-gray-400">Expires: {new Date(sub.expires_at).toLocaleDateString('en-IN')}</p>}
                      </div>
                      <Badge variant={sub.status === 'active' ? 'default' : 'secondary'} className="capitalize">{sub.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
