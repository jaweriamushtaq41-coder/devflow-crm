import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import apiClient from '../api/apiClient';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';

const TABS = ['Overview', 'Milestones', 'Task Board', 'Requirements'];
const TASK_STATUSES = [
  { key: 'todo', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'in_review', label: 'In Review' },
  { key: 'done', label: 'Done' },
];

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [board, setBoard] = useState({});
  const [tab, setTab] = useState('Overview');
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', priority: 'medium', dueDate: '' });

  async function load() {
    setLoading(true);
    try {
      const [{ data: p }, { data: b }] = await Promise.all([
        apiClient.get(`/projects/${id}`),
        apiClient.get(`/projects/${id}/board`),
      ]);
      setProject(p.data);
      setBoard(b.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleCreateTask(e) {
    e.preventDefault();
    if (!taskForm.title) return toast.error('Title is required');
    try {
      await apiClient.post(`/projects/${id}/tasks`, taskForm);
      toast.success('Task created');
      setShowTaskForm(false);
      setTaskForm({ title: '', priority: 'medium', dueDate: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    }
  }

  async function handleDragEnd(result) {
    const { source, destination, draggableId } = result;
    if (!destination || source.droppableId === destination.droppableId) return;

    const prevBoard = board;
    const sourceList = Array.from(board[source.droppableId] || []);
    const [moved] = sourceList.splice(source.index, 1);
    const destList = Array.from(board[destination.droppableId] || []);
    destList.splice(destination.index, 0, { ...moved, status: destination.droppableId });
    setBoard({ ...board, [source.droppableId]: sourceList, [destination.droppableId]: destList });

    try {
      await apiClient.patch(`/tasks/${draggableId}/status`, { status: destination.droppableId });
    } catch {
      setBoard(prevBoard);
      toast.error('Failed to move task — reverted');
    }
  }

  if (loading || !project) return <Spinner label="Loading project…" />;

  return (
    <div className="space-y-5">
      <Link to="/app/projects" className="text-sm text-slate-500 hover:text-brand-600 inline-flex items-center gap-1">
        <span className="material-symbols-outlined text-lg">arrow_back</span> Back to Projects
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <p className="font-mono text-xs text-slate-400">{project.code}</p>
          <h1 className="text-xl font-bold text-slate-800">{project.name}</h1>
          <p className="text-slate-500 text-sm">{project.Client?.Company?.name}</p>
        </div>
        <StatusBadge status={project.status} />
      </div>

      <div className="border-b border-slate-200 flex gap-6">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 text-sm font-medium border-b-2 -mb-px ${
              tab === t ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className="grid md:grid-cols-3 gap-5">
          <div className="md:col-span-2 card p-5">
            <h2 className="font-semibold text-slate-700 mb-3">Description</h2>
            <p className="text-sm text-slate-600">{project.description || 'No description provided yet.'}</p>
          </div>
          <div className="card p-5 text-sm space-y-2">
            <h2 className="font-semibold text-slate-700 mb-1">Details</h2>
            <p className="flex justify-between"><span className="text-slate-400">PM</span><span>{project.projectManager?.name || 'Unassigned'}</span></p>
            <p className="flex justify-between"><span className="text-slate-400">Budget</span><span>${Number(project.budget || 0).toLocaleString()}</span></p>
            <p className="flex justify-between"><span className="text-slate-400">Start</span><span>{project.startDate || '—'}</span></p>
            <p className="flex justify-between"><span className="text-slate-400">End</span><span>{project.endDate || '—'}</span></p>
          </div>
        </div>
      )}

      {tab === 'Milestones' && (
        <div className="card p-5">
          {(project.Milestones || []).length === 0 ? (
            <p className="text-sm text-slate-400">No milestones yet.</p>
          ) : (
            <div className="space-y-3">
              {project.Milestones.map((m) => (
                <div key={m.id} className="flex items-center justify-between border-b border-slate-50 pb-3">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{m.title}</p>
                    <p className="text-xs text-slate-400">Due {m.dueDate || 'TBD'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-slate-100 rounded-full h-2">
                      <div className="bg-brand-500 h-2 rounded-full" style={{ width: `${m.progress}%` }} />
                    </div>
                    <StatusBadge status={m.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'Task Board' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button className="btn-primary" onClick={() => setShowTaskForm(true)}>
              <span className="material-symbols-outlined text-lg">add</span> New Task
            </button>
          </div>
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {TASK_STATUSES.map((s) => (
                <Droppable droppableId={s.key} key={s.key}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`bg-slate-50 rounded-xl p-3 min-h-[200px] ${snapshot.isDraggingOver ? 'ring-2 ring-brand-400' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-2 px-1">
                        <h3 className="text-sm font-semibold text-slate-700">{s.label}</h3>
                        <span className="text-xs text-slate-400">{(board[s.key] || []).length}</span>
                      </div>
                      <div className="space-y-2">
                        {(board[s.key] || []).map((task, index) => (
                          <Draggable draggableId={task.id} index={index} key={task.id}>
                            {(dragProvided, dragSnapshot) => (
                              <div
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                {...dragProvided.dragHandleProps}
                                className={`card p-3 cursor-grab active:cursor-grabbing ${dragSnapshot.isDragging ? 'shadow-lg ring-2 ring-brand-300' : ''}`}
                              >
                                <p className="text-sm font-medium text-slate-700">{task.title}</p>
                                <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
                                  <span className="capitalize">{task.priority}</span>
                                  <span>{task.assignee?.name || 'Unassigned'}</span>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
        </div>
      )}

      {tab === 'Requirements' && (
        <div className="card p-5">
          {(project.Requirements || []).length === 0 ? (
            <p className="text-sm text-slate-400">No requirements linked to this project yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {project.Requirements.map((r) => (
                <Link to={`/app/requirements/${r.id}`} key={r.id} className="flex items-center justify-between py-3 hover:bg-slate-50 px-2 rounded-lg">
                  <div>
                    <p className="font-mono text-xs text-slate-400">{r.code}</p>
                    <p className="text-sm font-medium text-slate-700">{r.title}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {showTaskForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40 p-4">
          <form onSubmit={handleCreateTask} className="card p-6 w-full max-w-md space-y-4">
            <h2 className="font-semibold text-lg text-slate-800">New Task</h2>
            <div>
              <label className="label">Title</label>
              <input className="input" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} />
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="input" value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="label">Due date</label>
              <input type="date" className="input" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn-secondary" onClick={() => setShowTaskForm(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Create Task</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
