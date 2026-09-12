import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import apiClient from '../api/apiClient';
import KpiCard from '../components/KpiCard';
import Spinner from '../components/Spinner';

export default function DashboardPage() {
  const { user } = useSelector((state) => state.auth);
  const [summary, setSummary] = useState(null);
  const [pipeline, setPipeline] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { data } = await apiClient.get('/dashboard/summary');
        setSummary(data.data);

        // Pipeline chart only makes sense for sales-facing roles; ignore 403s for others.
        try {
          const pipelineRes = await apiClient.get('/deals/pipeline');
          const chartData = Object.entries(pipelineRes.data.data).map(([stage, deals]) => ({
            stage: stage.replace('_', ' '),
            value: deals.reduce((s, d) => s + Number(d.value || 0), 0),
            count: deals.length,
          }));
          setPipeline(chartData);
        } catch {
          setPipeline(null);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <Spinner label="Loading dashboard…" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-slate-500 text-sm">Here&apos;s what&apos;s happening across DevFlow today.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <KpiCard icon="contact_page" label="Total Leads" value={summary?.totalLeads ?? '—'} />
        {summary?.pipelineValue !== undefined && (
          <KpiCard icon="payments" label="Pipeline Value" value={`$${Number(summary.pipelineValue).toLocaleString()}`} accent="emerald" />
        )}
        <KpiCard icon="work" label="Active Projects" value={summary?.activeProjects ?? '—'} accent="indigo" />
        <KpiCard icon="pending_actions" label="Tasks Due Today" value={summary?.tasksDueToday ?? '—'} accent="amber" />
        <KpiCard icon="warning" label="Overdue Tasks" value={summary?.overdueTasks ?? '—'} accent="red" />
        <KpiCard icon="support_agent" label="Open Tickets" value={summary?.openTickets ?? '—'} accent="purple" />
        {summary?.revenueSummary && (
          <>
            <KpiCard icon="account_balance_wallet" label="Total Billed" value={`$${Number(summary.revenueSummary.billed).toLocaleString()}`} accent="emerald" />
            <KpiCard icon="hourglass_empty" label="Outstanding" value={`$${Number(summary.revenueSummary.outstanding).toLocaleString()}`} accent="amber" />
          </>
        )}
      </div>

      {pipeline && (
        <div className="card p-5">
          <h2 className="font-semibold text-slate-700 mb-4">Sales Pipeline by Stage</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={pipeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef1f6" />
              <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value, name) => (name === 'value' ? `$${value.toLocaleString()}` : value)} />
              <Bar dataKey="value" fill="#3366ff" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
