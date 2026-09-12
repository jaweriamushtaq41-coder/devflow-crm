import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../api/apiClient';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';

const STATUS_FLOW = ['open', 'in_progress', 'waiting_client', 'resolved', 'closed'];

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  async function load() {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/tickets', { params: statusFilter ? { status: statusFilter } : {} });
      setTickets(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function handleStatusChange(id, status) {
    try {
      await apiClient.patch(`/tickets/${id}/status`, { status });
      toast.success('Ticket status updated');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Support Tickets</h1>
          <p className="text-slate-500 text-sm">Client support requests across all projects.</p>
        </div>
        <select className="input w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {STATUS_FLOW.map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <Spinner label="Loading tickets…" />
        ) : tickets.length === 0 ? (
          <EmptyState icon="support_agent" title="No tickets found" description="Client support tickets will appear here once submitted." />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Subject</th>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{t.code}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-700">{t.subject}</p>
                    {t.description && <p className="text-xs text-slate-400 line-clamp-1">{t.description}</p>}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{t.Client?.Company?.name || '—'}</td>
                  <td className="px-4 py-3 capitalize text-slate-500">{t.priority}</td>
                  <td className="px-4 py-3">
                    <select
                      className="input py-1 w-auto"
                      value={t.status}
                      onChange={(e) => handleStatusChange(t.id, e.target.value)}
                    >
                      {STATUS_FLOW.map((s) => (
                        <option key={s} value={s}>{s.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
