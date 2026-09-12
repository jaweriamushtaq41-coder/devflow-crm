import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../../api/apiClient';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import Spinner from '../../components/Spinner';

export default function ClientRequirementsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ projectId: '', title: '', body: '', priority: 'medium' });

  async function load() {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/portal/projects');
      setProjects(data.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.projectId || !form.title || !form.body) return toast.error('All fields required');
    try {
      await apiClient.post('/portal/requirements', form);
      toast.success('Requirement submitted for review');
      setShowCreate(false);
      setForm({ projectId: '', title: '', body: '', priority: 'medium' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    }
  }

  if (loading) return <Spinner label="Loading…" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">Submit a Requirement</h1>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          <span className="material-symbols-outlined text-lg">add</span> New Requirement
        </button>
      </div>

      {projects.length === 0 && <EmptyState icon="description" title="No projects to attach a requirement to yet" />}

      {showCreate && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40 p-4">
          <form onSubmit={handleSubmit} className="card p-6 w-full max-w-lg space-y-4">
            <h2 className="font-semibold text-lg text-slate-800">Submit a Requirement</h2>
            <div>
              <label className="label">Project</label>
              <select className="input" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
                <option value="">Select…</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Title</label>
              <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input min-h-[120px]" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Submit</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
