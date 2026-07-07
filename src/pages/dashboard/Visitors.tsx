import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BuildingSelect, AdminBuildingPrompt } from '../../components/admin/BuildingSelect';
import { useAdminBuilding } from '../../hooks/useAdminBuilding';
import { PageHeader } from '../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { QrCode, ChevronLeft, ChevronRight, Users, Smartphone } from 'lucide-react';
import { MobileAppPrompt, MobileOnlyButton } from '../../components/ui/MobileAppPrompt';
import api from '../../lib/apiClient';
import type { Visitor } from '../../types';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}

export default function Visitors() {
  const { user } = useAuth();
  const {
    isAdmin,
    buildings,
    buildingsLoading,
    selectedBuilding,
    selectBuilding,
    buildingId,
    needsBuilding,
  } = useAdminBuilding();
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState(toDateStr(today.getFullYear(), today.getMonth() + 1, today.getDate()));
  const [markedDates, setMarkedDates] = useState<Set<string>>(new Set());
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [detail, setDetail] = useState<Visitor | null>(null);

  const effectiveBuildingId = buildingId ?? user?.building_id;

  useEffect(() => {
    if (needsBuilding || !effectiveBuildingId) return;
    api.get<{ dates: string[] }>('/visitors/dates', { month: calMonth, year: calYear, building_id: effectiveBuildingId })
      .then(d => setMarkedDates(new Set(d.dates)))
      .catch(() => {});
  }, [calMonth, calYear, effectiveBuildingId, needsBuilding]);

  useEffect(() => {
    if (needsBuilding || !effectiveBuildingId) {
      setVisitors([]);
      return;
    }
    setListLoading(true);
    api.get<Visitor[]>('/visitors', { date: selectedDate, building_id: effectiveBuildingId })
      .then(setVisitors).catch(() => setVisitors([]))
      .finally(() => setListLoading(false));
  }, [selectedDate, effectiveBuildingId, needsBuilding]);

  const shareQR = () => {
    const id = effectiveBuildingId;
    if (!id) return;
    const url = `${window.location.origin}/entry/${id}`;
    navigator.clipboard.writeText(url).then(() => alert('QR link copied!')).catch(() => window.open(url, '_blank'));
  };

  const firstDay = new Date(calYear, calMonth - 1, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => { if (calMonth === 1) { setCalMonth(12); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); };
  const nextMonth = () => { if (calMonth === 12) { setCalMonth(1); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); };

  return (
    <div>
      {isAdmin && (
        <BuildingSelect className="mb-4" buildings={buildings} loading={buildingsLoading} value={selectedBuilding} onChange={selectBuilding} />
      )}
      {needsBuilding ? (
        <AdminBuildingPrompt />
      ) : (<>
      <PageHeader title="Visitors" action={
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={shareQR} className="gap-1">
            <QrCode className="w-4 h-4" /> Copy link
          </Button>
          <MobileOnlyButton feature="visitor-qr" variant="outline" className="h-8 text-xs gap-1">
            <Smartphone className="w-3.5 h-3.5" /> QR poster
          </MobileOnlyButton>
        </div>
      } />

      <MobileAppPrompt
        feature="visitor-qr"
        variant="compact"
        className="mb-4"
        message="Download and print visitor QR posters from the MyBuilding mobile app. Web can copy the entry link only."
      />

      {/* Calendar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={prevMonth}><ChevronLeft className="w-5 h-5 text-blue-600" /></button>
          <span className="font-bold text-gray-900">{MONTHS[calMonth - 1]} {calYear}</span>
          <button onClick={nextMonth}><ChevronRight className="w-5 h-5 text-blue-600" /></button>
        </div>
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map(d => <span key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</span>)}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (!day) return <div key={i} />;
            const ds = toDateStr(calYear, calMonth, day);
            const isSelected = ds === selectedDate;
            const hasVisitors = markedDates.has(ds);
            const isToday = ds === toDateStr(today.getFullYear(), today.getMonth() + 1, today.getDate());
            return (
              <button key={i} onClick={() => setSelectedDate(ds)}
                className={`relative flex flex-col items-center py-1.5 rounded-lg text-sm font-medium transition-colors ${isSelected ? 'bg-blue-600 text-white' : isToday ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                {day}
                {hasVisitors && <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? 'bg-white' : 'bg-blue-500'}`} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Visitor list */}
      <p className="text-sm font-semibold text-gray-500 mb-3">
        {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
      </p>
      {listLoading ? <LoadingSkeleton rows={3} /> : visitors.length === 0 ? (
        <EmptyState icon={<Users className="w-10 h-10 text-gray-300" />} title="No visitors" description="No visitors recorded for this date." />
      ) : (
        <div className="space-y-3">
          {visitors.map(v => (
            <button key={v.id} onClick={() => setDetail(v)} className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-left hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                  {v.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{v.name}</p>
                  <p className="text-sm text-gray-500">{v.phone}</p>
                </div>
                <p className="text-xs text-gray-400">{new Date(v.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              {(v.flat_no || v.purpose || v.work_detail) && (
                <div className="mt-2 flex gap-3 text-xs text-gray-500">
                  {v.flat_no && <span>Flat {v.flat_no}</span>}
                  {(v.purpose || v.work_detail) && <span>{v.purpose || v.work_detail}</span>}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Detail dialog */}
      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Visitor Details</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-3 mt-2">
              {detail.photo_url && <img src={detail.photo_url} alt="visitor" className="w-full h-48 object-cover rounded-xl" />}
              {[
                ['Name', detail.name], ['Phone', detail.phone],
                ['Flat No.', detail.flat_no], ['Purpose', detail.purpose || detail.work_detail],
                ['Time', new Date(detail.created_at).toLocaleString('en-IN')],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label as string} className="flex justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-medium text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
      </>)}
    </div>
  );
}
