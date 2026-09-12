import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { fetchLeadById, updateLead, convertLead } from '../features/leads/leadSlice';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';

const TABS = ['Overview', 'Activity', 'Notes'];
const STATUS_FLOW = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];

export default function LeadDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selected: lead, loading } = useSelector((state) => state.leads);
  const [tab, setTab] = useState('Overview');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    dispatch(fetchLeadById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (lead) setNotes(lead.notes || '');
  }, [lead]);

  async function handleStatusChange(status) {
    const result = await dispatch(updateLead({ id, payload: { status } }));
    if (updateLead.fulfilled.match(result)) toast.success(`Status updated to ${status}`);
    else toast.error(result.payload || 'Failed to update status');
  }

  async function handleSaveNotes() {
    const result = await dispatch(updateLead({ id, payload: { notes } }));
    if (updateLead.fulfilled.match(result)) toast.success('Notes saved');
  }

  async function handleConvert() {
    if (!window.confirm('Convert this lead to a client? This will create a Client record.')) return;
    const result = await dispatch(convertLead(id));
    if (convertLead.fulfilled.match(result)) {
      toast.success('Lead converted to client!');
      navigate('/app/projects');
    } else {
      toast.error(result.payload || 'Conversion failed');
    }
  }

  if (loading || !lead) return <Spinner label="Loading lead…" />;

  return (
    <div className="space-y-5">
      <Link to="/app/crm/leads" className="text-sm text-slate-500 hover:text-brand-600 inline-flex items-center gap-1">
        <span className="material-symbols-outlined text-lg">arrow_back</span> Back to Leads
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">{lead.name}</h1>
          <p className="text-slate-500 text-sm">{lead.email} · {lead.phone || 'No phone'}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={lead.status} />
          {lead.status !== 'won' && lead.status !== 'lost' && (
            <button className="btn-primary" onClick={handleConvert}>
              <span className="material-symbols-outlined text-lg">how_to_reg</span> Convert to Client
            </button>
          )}
        </div>
      </div>

      <div className="border-b border-slate-200 flex gap-6">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className="grid md:grid-cols-3 gap-5">
          <div className="md:col-span-2 card p-5 space-y-4">
            <h2 className="font-semibold text-slate-700">Lead Information</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-slate-400">Company</p><p className="text-slate-700">{lead.Company?.name || '—'}</p></div>
              <div><p className="text-slate-400">Owner</p><p className="text-slate-700">{lead.owner?.name || '—'}</p></div>
              <div><p className="text-slate-400">Source</p><p className="text-slate-700 capitalize">{lead.source || '—'}</p></div>
              <div><p className="text-slate-400">Score</p><p className="text-slate-700">{lead.score}</p></div>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-semibold text-slate-700 mb-3">Move Stage</h2>
            <div className="space-y-2">
              {STATUS_FLOW.map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm capitalize border transition-colors ${
                    lead.status === s
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'Activity' && (
        <div className="card p-5">
          <h2 className="font-semibold text-slate-700 mb-3">Activity Timeline</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="material-symbols-outlined text-brand-600">flag</span>
              <div>
                <p className="text-slate-700">Lead created</p>
                <p className="text-xs text-slate-400">{new Date(lead.createdAt).toLocaleString()}</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="material-symbols-outlined text-slate-400">update</span>
              <div>
                <p className="text-slate-700">Last updated — status: <span className="capitalize">{lead.status}</span></p>
                <p className="text-xs text-slate-400">{new Date(lead.updatedAt).toLocaleString()}</p>
              </div>
            </li>
          </ul>
          <p className="text-xs text-slate-400 mt-4">
            Full audit history for this record is available to admins under Audit Log.
          </p>
        </div>
      )}

      {tab === 'Notes' && (
        <div className="card p-5 space-y-3">
          <h2 className="font-semibold text-slate-700">Notes</h2>
          <textarea
            className="input min-h-[160px]"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add internal notes about this lead…"
          />
          <div className="flex justify-end">
            <button className="btn-primary" onClick={handleSaveNotes}>Save Notes</button>
          </div>
        </div>
      )}
    </div>
  );
}
