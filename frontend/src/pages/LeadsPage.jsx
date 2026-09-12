import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchLeads, createLead, setLeadFilters } from '../features/leads/leadSlice';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';

const STATUS_OPTIONS = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];

export default function LeadsPage() {
  const dispatch = useDispatch();
  const { items, meta, filters, loading } = useSelector((state) => state.leads);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', source: 'website' });
  const [searchInput, setSearchInput] = useState(filters.search);

  useEffect(() => {
    dispatch(fetchLeads(filters));
  }, [dispatch, filters]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    dispatch(setLeadFilters({ search: searchInput, page: 1 }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.name) return toast.error('Name is required');
    const result = await dispatch(createLead(form));
    if (createLead.fulfilled.match(result)) {
      toast.success('Lead created');
      setShowCreate(false);
      setForm({ name: '', email: '', phone: '', source: 'website' });
    } else {
      toast.error(result.payload || 'Failed to create lead');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Leads</h1>
          <p className="text-slate-500 text-sm">Track and qualify incoming leads before they enter the pipeline.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          <span className="material-symbols-outlined text-lg">add</span> New Lead
        </button>
      </div>

      <div className="card p-4 flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[220px] relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input
            className="input pl-9"
            placeholder="Search by name or email…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </form>
        <select
          className="input w-auto"
          value={filters.status}
          onChange={(e) => dispatch(setLeadFilters({ status: e.target.value, page: 1 }))}
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s} className="capitalize">
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <Spinner label="Loading leads…" />
        ) : items.length === 0 ? (
          <EmptyState
            icon="contact_page"
            title="No leads found"
            description="Try adjusting your filters, or create your first lead to get started."
            action={<button className="btn-primary" onClick={() => setShowCreate(true)}>Create a lead</button>}
          />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link to={`/app/crm/leads/${lead.id}`} className="font-medium text-slate-700 hover:text-brand-600">
                      {lead.name}
                    </Link>
                    <p className="text-xs text-slate-400">{lead.email}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{lead.Company?.name || '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{lead.owner?.name || '—'}</td>
                  <td className="px-4 py-3 text-slate-500 capitalize">{lead.source || '—'}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/app/crm/leads/${lead.id}`} className="text-brand-600 text-sm hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {meta?.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-sm text-slate-500">
            <span>
              Page {meta.page} of {meta.totalPages} — {meta.total} total
            </span>
            <div className="flex gap-2">
              <button
                className="btn-secondary py-1 px-2.5"
                disabled={meta.page <= 1}
                onClick={() => dispatch(setLeadFilters({ page: meta.page - 1 }))}
              >
                Previous
              </button>
              <button
                className="btn-secondary py-1 px-2.5"
                disabled={meta.page >= meta.totalPages}
                onClick={() => dispatch(setLeadFilters({ page: meta.page + 1 }))}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40 p-4">
          <form onSubmit={handleCreate} className="card p-6 w-full max-w-md space-y-4">
            <h2 className="font-semibold text-lg text-slate-800">Create a new lead</h2>
            <div>
              <label className="label">Name</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="label">Source</label>
              <select className="input" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="cold-call">Cold Call</option>
                <option value="social">Social Media</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">Create Lead</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
