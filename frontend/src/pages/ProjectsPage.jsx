import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../api/apiClient';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';
import { useSelector } from 'react-redux';

export default function ProjectsPage() {
  const { user } = useSelector((state) => state.auth);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', clientId: '', startDate: '', endDate: '', budget: '' });
  const canManage = ['Super Admin', 'Admin / Operations', 'Project Manager'].includes(user?.role);

  async function load() {
    setLoading(true);
    try {
      const [{ data: p }, { data: c }] = await Promise.all([
        apiClient.get('/projects'),
        apiClient.get('/clients').catch(() => ({ data: { data: [] } })),
      ]);
      setProjects(p.data);
      setClients(c.data);
    } catch {
      // handled by empty state
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.name || !form.clientId) return toast.error('Name and client are required');
    try {
      await apiClient.post('/projects', {
        ...form,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        budget: form.budget || null,
      });
      toast.success('Project created');
      setShowCreate(false);
      setForm({ name: '', clientId: '', startDate: '', endDate: '', budget: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Projects</h1>
          <p className="text-slate-500 text-sm">All active and past delivery engagements.</p>
        </div>
        {canManage && (
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <span className="material-symbols-outlined text-lg">add</span> New Project
          </button>
        )}
      </div>

      {loading ? (
        <Spinner label="Loading projects…" />
      ) : projects.length === 0 ? (
        <EmptyState icon="work" title="No projects yet" description="Convert a won lead to a client, then create their first project." />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <Link to={`/app/projects/${p.id}`} key={p.id} className="card p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-xs text-slate-400">{p.code}</p>
                  <h3 className="font-semibold text-slate-800">{p.name}</h3>
                </div>
                <StatusBadge status={p.status} />
              </div>
              <p className="text-sm text-slate-500 mt-2">{p.Client?.Company?.name}</p>
              <p className="text-xs text-slate-400 mt-3">PM: {p.projectManager?.name || 'Unassigned'}</p>
            </Link>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40 p-4">
          <form onSubmit={handleCreate} className="card p-6 w-full max-w-lg space-y-4">
            <h2 className="font-semibold text-lg text-slate-800">New Project</h2>
            <div>
              <label className="label">Project Name</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Client</label>
              <select className="input" value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
                <option value="">Select a client…</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.Company?.name || c.id}</option>
                ))}
              </select>
              {clients.length === 0 && (
                <p className="text-xs text-slate-400 mt-1">No clients yet — convert a won lead to a client first.</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Start date</label>
                <input type="date" className="input" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div>
                <label className="label">End date</label>
                <input type="date" className="input" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Budget ($)</label>
              <input type="number" className="input" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Create Project</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
