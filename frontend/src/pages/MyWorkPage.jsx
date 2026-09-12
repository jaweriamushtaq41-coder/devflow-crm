import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../api/apiClient';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';

const STATUS_FLOW = ['todo', 'in_progress', 'in_review', 'done'];

export default function MyWorkPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/projects/my-work');
      setTasks(data.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleStatusChange(taskId, status) {
    try {
      await apiClient.patch(`/tasks/${taskId}/status`, { status });
      toast.success('Task updated');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  }

  const isOverdue = (task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  if (loading) return <Spinner label="Loading your tasks…" />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-800">My Work</h1>
        <p className="text-slate-500 text-sm">Tasks assigned to you across all projects.</p>
      </div>

      {tasks.length === 0 ? (
        <EmptyState icon="task_alt" title="No tasks assigned" description="You're all caught up — nothing assigned to you right now." />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Task</th>
                <th className="px-4 py-3 font-medium">Project</th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="px-4 py-3 font-medium">Due</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tasks.map((t) => (
                <tr key={t.id} className={isOverdue(t) ? 'bg-red-50/40' : 'hover:bg-slate-50'}>
                  <td className="px-4 py-3 font-medium text-slate-700">{t.title}</td>
                  <td className="px-4 py-3 text-slate-500">{t.Project?.name}</td>
                  <td className="px-4 py-3 capitalize text-slate-500">{t.priority}</td>
                  <td className={`px-4 py-3 ${isOverdue(t) ? 'text-red-600 font-medium' : 'text-slate-500'}`}>
                    {t.dueDate || '—'} {isOverdue(t) && '(overdue)'}
                  </td>
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
        </div>
      )}
    </div>
  );
}
