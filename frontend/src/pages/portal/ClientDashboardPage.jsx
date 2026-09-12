import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import apiClient from '../../api/apiClient';
import KpiCard from '../../components/KpiCard';
import Spinner from '../../components/Spinner';

export default function ClientDashboardPage() {
  const { user } = useSelector((state) => state.auth);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/portal/dashboard').then(({ data }) => setSummary(data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading your dashboard…" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Welcome, {user?.name}</h1>
        <p className="text-slate-500 text-sm">Here&apos;s an overview of your projects with U Devs.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard icon="work" label="Active Projects" value={summary?.projects ?? '—'} />
        <KpiCard icon="support_agent" label="Open Tickets" value={summary?.openTickets ?? '—'} accent="amber" />
        <KpiCard icon="description" label="Pending Requirements" value={summary?.pendingRequirements ?? '—'} accent="indigo" />
      </div>
    </div>
  );
}
