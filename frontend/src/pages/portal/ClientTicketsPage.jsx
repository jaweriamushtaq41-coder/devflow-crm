import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../../api/apiClient';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import Spinner from '../../components/Spinner';

export default function ClientTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ subject: '', description: '', priority: 'medium' });

  async function load() {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/portal/tickets');
      setTickets(data.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.subject) return toast.error('Subject is required');
    try {
      await apiClient.post('/portal/tickets', form);
      toast.success('Support ticket created');
      setShowCreate(false);
      setForm({ subject: '', description: '', priority: 'medium' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create ticket');
    }
  }

  if (loading) return <Spinner label="Loading tickets…" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">Support</h1>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          <span className="material-symbols-outlined text-lg">add</span> New Ticket
        </button>
      </div>

      {tickets.length === 0 ? (
        <EmptyState icon="support_agent" title="No support tickets" description="Need help? Create a ticket and our team will respond." />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Subject</th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{t.code}</td>
                  <td className="px-4 py-3 text-slate-700">{t.subject}</td>
                  <td className="px-4 py-3 capitalize text-slate-500">{t.priority}</td>
                  <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40 p-4">
          <form onSubmit={handleSubmit} className="card p-6 w-full max-w-md space-y-4">
            <h2 className="font-semibold text-lg text-slate-800">New Support Ticket</h2>
            <div>
              <label className="label">Subject</label>
              <input className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input min-h-[100px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Create Ticket</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
