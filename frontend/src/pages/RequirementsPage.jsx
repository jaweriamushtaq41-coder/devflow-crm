import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchRequirements, createRequirement } from '../features/requirements/requirementSlice';
import apiClient from '../api/apiClient';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';

export default function RequirementsPage() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.requirements);
  const [showCreate, setShowCreate] = useState(false);
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ projectId: '', title: '', body: '', priority: 'medium' });

  useEffect(() => {
    dispatch(fetchRequirements());
    apiClient.get('/projects').then(({ data }) => setProjects(data.data)).catch(() => {});
  }, [dispatch]);

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.projectId || !form.title || !form.body) return toast.error('All fields are required');
    const result = await dispatch(createRequirement(form));
    if (createRequirement.fulfilled.match(result)) {
      toast.success(`Requirement ${result.payload.code} created`);
      setShowCreate(false);
      setForm({ projectId: '', title: '', body: '', priority: 'medium' });
    } else {
      toast.error(result.payload || 'Failed to create requirement');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Requirement Vault</h1>
          <p className="text-slate-500 text-sm">Versioned requirements with full approval history — no more scattered WhatsApp specs.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          <span className="material-symbols-outlined text-lg">add</span> New Requirement
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <Spinner label="Loading requirements…" />
        ) : items.length === 0 ? (
          <EmptyState icon="description" title="No requirements yet" description="Create the first requirement for a project." />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Project</th>
                <th className="px-4 py-3 font-medium">Version</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{req.code}</td>
                  <td className="px-4 py-3">
                    <Link to={`/app/requirements/${req.id}`} className="font-medium text-slate-700 hover:text-brand-600">
                      {req.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{req.Project?.name}</td>
                  <td className="px-4 py-3 text-slate-500">V{req.currentVersion}</td>
                  <td className="px-4 py-3"><StatusBadge status={req.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/app/requirements/${req.id}`} className="text-brand-600 text-sm hover:underline">View</Link>
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
            <h2 className="font-semibold text-lg text-slate-800">New Requirement</h2>
            <div>
              <label className="label">Project</label>
              <select className="input" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
                <option value="">Select a project…</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
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
            <div>
              <label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Create Requirement</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
