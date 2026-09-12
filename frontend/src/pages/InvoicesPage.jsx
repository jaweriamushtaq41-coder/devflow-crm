import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../api/apiClient';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';
import { useSelector } from 'react-redux';

const STATUS_FLOW = ['draft', 'issued', 'sent', 'partially_paid', 'paid', 'overdue'];

export default function InvoicesPage() {
  const { user } = useSelector((state) => state.auth);
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ clientId: '', projectId: '', amount: '', dueDate: '', notes: '' });
  const canManage = ['Super Admin', 'Admin / Operations', 'Accounts'].includes(user?.role);

  async function load() {
    setLoading(true);
    try {
      const [{ data: inv }, { data: c }, { data: p }] = await Promise.all([
        apiClient.get('/invoices'),
        apiClient.get('/clients').catch(() => ({ data: { data: [] } })),
        apiClient.get('/projects').catch(() => ({ data: { data: [] } })),
      ]);
      setInvoices(inv.data);
      setClients(c.data);
      setProjects(p.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.clientId || !form.amount) return toast.error('Client and amount are required');
    try {
      await apiClient.post('/invoices', {
        ...form,
        projectId: form.projectId || null,
        dueDate: form.dueDate || null,
      });
      toast.success('Invoice created');
      setShowCreate(false);
      setForm({ clientId: '', projectId: '', amount: '', dueDate: '', notes: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create invoice');
    }
  }

  async function handleStatusChange(id, status) {
    try {
      await apiClient.patch(`/invoices/${id}/status`, { status });
      toast.success('Invoice status updated');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  }

  const totalOutstanding = invoices
    .filter((i) => ['issued', 'sent', 'partially_paid', 'overdue'].includes(i.status))
    .reduce((sum, i) => sum + Number(i.amount || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Invoices</h1>
          <p className="text-slate-500 text-sm">
            Outstanding: <span className="font-semibold text-amber-600">${totalOutstanding.toLocaleString()}</span>
          </p>
        </div>
        {canManage && (
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <span className="material-symbols-outlined text-lg">add</span> New Invoice
          </button>
        )}
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <Spinner label="Loading invoices…" />
        ) : invoices.length === 0 ? (
          <EmptyState icon="receipt_long" title="No invoices yet" description="Create an invoice for a client to get started." />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Number</th>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Due Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{inv.number}</td>
                  <td className="px-4 py-3 text-slate-700">{inv.Client?.Company?.name || '—'}</td>
                  <td className="px-4 py-3 font-medium text-slate-700">${Number(inv.amount).toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-500">{inv.dueDate || '—'}</td>
                  <td className="px-4 py-3">
                    {canManage ? (
                      <select
                        className="input py-1 w-auto"
                        value={inv.status}
                        onChange={(e) => handleStatusChange(inv.id, e.target.value)}
                      >
                        {STATUS_FLOW.map((s) => (
                          <option key={s} value={s}>{s.replace('_', ' ')}</option>
                        ))}
                      </select>
                    ) : (
                      <StatusBadge status={inv.status} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40 p-4">
          <form onSubmit={handleCreate} className="card p-6 w-full max-w-lg space-y-4">
            <h2 className="font-semibold text-lg text-slate-800">New Invoice</h2>
            <div>
              <label className="label">Client</label>
              <select className="input" value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
                <option value="">Select a client…</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.Company?.name || c.id}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Project (optional)</label>
              <select className="input" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
                <option value="">No specific project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Amount ($)</label>
              <input
                type="number"
                className="input"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Due Date</label>
              <input
                type="date"
                className="input"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Notes</label>
              <textarea className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Create Invoice</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
