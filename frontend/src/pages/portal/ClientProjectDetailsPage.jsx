import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import StatusBadge from '../../components/StatusBadge';
import Spinner from '../../components/Spinner';

export default function ClientProjectDetailsPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get(`/portal/projects/${id}`).then(({ data }) => setProject(data.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading || !project) return <Spinner label="Loading project…" />;

  return (
    <div className="space-y-5">
      <Link to="/portal/projects" className="text-sm text-slate-500 hover:text-brand-600 inline-flex items-center gap-1">
        <span className="material-symbols-outlined text-lg">arrow_back</span> Back to My Projects
      </Link>
      <div className="flex items-start justify-between">
        <h1 className="text-xl font-bold text-slate-800">{project.name}</h1>
        <StatusBadge status={project.status} />
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-slate-700 mb-3">Milestones</h2>
        {(project.Milestones || []).length === 0 ? (
          <p className="text-sm text-slate-400">No milestones published yet.</p>
        ) : (
          <div className="space-y-3">
            {project.Milestones.map((m) => (
              <div key={m.id} className="flex items-center justify-between border-b border-slate-50 pb-2">
                <p className="text-sm text-slate-700">{m.title}</p>
                <div className="flex items-center gap-3">
                  <div className="w-28 bg-slate-100 rounded-full h-2">
                    <div className="bg-brand-500 h-2 rounded-full" style={{ width: `${m.progress}%` }} />
                  </div>
                  <StatusBadge status={m.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-slate-700 mb-3">Requirements</h2>
        {(project.Requirements || []).length === 0 ? (
          <p className="text-sm text-slate-400">No requirements submitted for this project yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {project.Requirements.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2">
                <p className="text-sm text-slate-700">{r.title}</p>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
