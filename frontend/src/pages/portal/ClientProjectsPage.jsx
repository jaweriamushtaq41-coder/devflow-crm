import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import Spinner from '../../components/Spinner';

export default function ClientProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/portal/projects').then(({ data }) => setProjects(data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading your projects…" />;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-800">My Projects</h1>
      {projects.length === 0 ? (
        <EmptyState icon="work" title="No projects yet" description="Your account manager will link your first project soon." />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {projects.map((p) => (
            <Link to={`/portal/projects/${p.id}`} key={p.id} className="card p-4 hover:shadow-md">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-slate-800">{p.name}</h3>
                <StatusBadge status={p.status} />
              </div>
              <p className="text-sm text-slate-500 mt-2">PM: {p.projectManager?.name || 'Unassigned'}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
