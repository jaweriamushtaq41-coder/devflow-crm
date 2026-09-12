import { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  async function load(page = 1) {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/audit-logs', { params: { page, limit: 15 } });
      setLogs(data.data);
      setMeta(data.meta);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(1); }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Audit Log</h1>
        <p className="text-slate-500 text-sm">Every sensitive action across the system, with actor and timestamp.</p>
      </div>

      {loading ? (
        <Spinner label="Loading audit trail…" />
      ) : logs.length === 0 ? (
        <EmptyState icon="security" title="No audit entries yet" />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Actor</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Entity</th>
                <th className="px-4 py-3 font-medium">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-700">{log.actor?.name || 'System'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-brand-700">{log.action}</td>
                  <td className="px-4 py-3 text-slate-500">{log.entityType} · {log.entityId?.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {meta.totalPages > 1 && (
            <div className="flex justify-between items-center px-4 py-3 border-t border-slate-100 text-sm text-slate-500">
              <span>Page {meta.page} of {meta.totalPages}</span>
              <div className="flex gap-2">
                <button className="btn-secondary py-1 px-2.5" disabled={meta.page <= 1} onClick={() => load(meta.page - 1)}>Previous</button>
                <button className="btn-secondary py-1 px-2.5" disabled={meta.page >= meta.totalPages} onClick={() => load(meta.page + 1)}>Next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
