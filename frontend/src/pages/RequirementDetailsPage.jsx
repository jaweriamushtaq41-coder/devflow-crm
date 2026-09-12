import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  fetchRequirementById,
  addRequirementVersion,
  decideOnVersion,
} from '../features/requirements/requirementSlice';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';

export default function RequirementDetailsPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selected: requirement, loading } = useSelector((state) => state.requirements);
  const { user } = useSelector((state) => state.auth);
  const [showNewVersion, setShowNewVersion] = useState(false);
  const [versionForm, setVersionForm] = useState({ body: '', changeSummary: '' });
  const [decisionNote, setDecisionNote] = useState('');

  useEffect(() => {
    dispatch(fetchRequirementById(id));
  }, [dispatch, id]);

  async function handleAddVersion(e) {
    e.preventDefault();
    const result = await dispatch(addRequirementVersion({ id, ...versionForm }));
    if (addRequirementVersion.fulfilled.match(result)) {
      toast.success(`Version ${result.payload.versionNo} created`);
      setShowNewVersion(false);
      setVersionForm({ body: '', changeSummary: '' });
      dispatch(fetchRequirementById(id));
    } else {
      toast.error(result.payload || 'Failed to add version');
    }
  }

  async function handleDecision(versionId, decision) {
    const result = await dispatch(decideOnVersion({ versionId, decision, note: decisionNote }));
    if (decideOnVersion.fulfilled.match(result)) {
      toast.success(`Requirement ${decision.replace('_', ' ')}`);
      setDecisionNote('');
      dispatch(fetchRequirementById(id));
    } else {
      toast.error(result.payload || 'Action failed');
    }
  }

  if (loading || !requirement) return <Spinner label="Loading requirement…" />;

  const latestVersion = requirement.versions?.[0];
  const canApprove = ['Super Admin', 'Admin / Operations', 'Project Manager'].includes(user?.role);

  return (
    <div className="space-y-5">
      <Link to="/app/requirements" className="text-sm text-slate-500 hover:text-brand-600 inline-flex items-center gap-1">
        <span className="material-symbols-outlined text-lg">arrow_back</span> Back to Requirements
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <p className="font-mono text-xs text-slate-400">{requirement.code}</p>
          <h1 className="text-xl font-bold text-slate-800">{requirement.title}</h1>
          <p className="text-slate-500 text-sm">Project: {requirement.Project?.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={requirement.status} />
          <button className="btn-secondary" onClick={() => setShowNewVersion(true)}>
            <span className="material-symbols-outlined text-lg">add</span> New Version
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        <div className="md:col-span-2 space-y-4">
          <div className="card p-5">
            <h2 className="font-semibold text-slate-700 mb-3">Current Description (V{requirement.currentVersion})</h2>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{latestVersion?.body}</p>
          </div>

          <div className="card p-5">
            <h2 className="font-semibold text-slate-700 mb-3">Version History</h2>
            <div className="space-y-4">
              {(requirement.versions || []).map((v) => (
                <div key={v.id} className="border-l-2 border-brand-200 pl-4 relative">
                  <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-brand-500" />
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-700">Version {v.versionNo}</p>
                    <p className="text-xs text-slate-400">{new Date(v.createdAt).toLocaleString()}</p>
                  </div>
                  <p className="text-xs text-slate-400 mb-1">by {v.createdByUser?.name} — {v.changeSummary}</p>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap mb-2">{v.body}</p>

                  {(v.approvals || []).map((a) => (
                    <div key={a.id} className="text-xs bg-slate-50 rounded-md px-2 py-1.5 mb-1 flex items-center gap-2">
                      <StatusBadge status={a.decision === 'approved' ? 'approved' : a.decision === 'rejected' ? 'rejected' : 'clarification'} />
                      <span className="text-slate-500">by {a.approver?.name}</span>
                      {a.note && <span className="text-slate-400">— {a.note}</span>}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {canApprove && latestVersion && requirement.status === 'submitted' && (
            <div className="card p-5">
              <h2 className="font-semibold text-slate-700 mb-3">Approval</h2>
              <textarea
                className="input mb-3 min-h-[80px]"
                placeholder="Optional note…"
                value={decisionNote}
                onChange={(e) => setDecisionNote(e.target.value)}
              />
              <div className="flex flex-col gap-2">
                <button className="btn-primary" onClick={() => handleDecision(latestVersion.id, 'approved')}>
                  <span className="material-symbols-outlined text-lg">check_circle</span> Approve
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => handleDecision(latestVersion.id, 'clarification_requested')}
                >
                  <span className="material-symbols-outlined text-lg">help</span> Request Clarification
                </button>
                <button className="btn-danger" onClick={() => handleDecision(latestVersion.id, 'rejected')}>
                  <span className="material-symbols-outlined text-lg">cancel</span> Reject
                </button>
              </div>
            </div>
          )}

          <div className="card p-5 text-sm space-y-2">
            <h2 className="font-semibold text-slate-700 mb-1">Details</h2>
            <p className="flex justify-between"><span className="text-slate-400">Submitted by</span><span>{requirement.submitter?.name}</span></p>
            <p className="flex justify-between"><span className="text-slate-400">Priority</span><span className="capitalize">{requirement.priority}</span></p>
            <p className="flex justify-between"><span className="text-slate-400">Created</span><span>{new Date(requirement.createdAt).toLocaleDateString()}</span></p>
          </div>
        </div>
      </div>

      {showNewVersion && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40 p-4">
          <form onSubmit={handleAddVersion} className="card p-6 w-full max-w-lg space-y-4">
            <h2 className="font-semibold text-lg text-slate-800">Add New Version</h2>
            <div>
              <label className="label">Updated Description</label>
              <textarea
                className="input min-h-[140px]"
                value={versionForm.body}
                onChange={(e) => setVersionForm({ ...versionForm, body: e.target.value })}
              />
            </div>
            <div>
              <label className="label">What changed?</label>
              <input
                className="input"
                placeholder="e.g. Added accessibility contrast requirements"
                value={versionForm.changeSummary}
                onChange={(e) => setVersionForm({ ...versionForm, changeSummary: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn-secondary" onClick={() => setShowNewVersion(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Submit Version</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
