import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import toast from 'react-hot-toast';
import { fetchPipeline } from '../features/leads/leadSlice';
import apiClient from '../api/apiClient';
import Spinner from '../components/Spinner';

const STAGES = [
  { key: 'new_lead', label: 'New Lead', color: 'bg-slate-100' },
  { key: 'contacted', label: 'Contacted', color: 'bg-blue-50' },
  { key: 'qualified', label: 'Qualified', color: 'bg-indigo-50' },
  { key: 'proposal', label: 'Proposal Sent', color: 'bg-amber-50' },
  { key: 'negotiation', label: 'Negotiation', color: 'bg-orange-50' },
  { key: 'won', label: 'Won', color: 'bg-emerald-50' },
  { key: 'lost', label: 'Lost', color: 'bg-red-50' },
];

export default function PipelinePage() {
  const dispatch = useDispatch();
  const { pipeline, loading } = useSelector((state) => state.leads);
  const [board, setBoard] = useState({});

  useEffect(() => {
    dispatch(fetchPipeline());
  }, [dispatch]);

  useEffect(() => {
    setBoard(pipeline || {});
  }, [pipeline]);

  async function handleDragEnd(result) {
    const { source, destination, draggableId } = result;
    if (!destination || source.droppableId === destination.droppableId) return;

    // Optimistic UI update with rollback on API failure.
    const prevBoard = board;
    const sourceList = Array.from(board[source.droppableId] || []);
    const [moved] = sourceList.splice(source.index, 1);
    const destList = Array.from(board[destination.droppableId] || []);
    destList.splice(destination.index, 0, { ...moved, stage: destination.droppableId });

    setBoard({ ...board, [source.droppableId]: sourceList, [destination.droppableId]: destList });

    try {
      // Deals don't yet have a dedicated PATCH endpoint in this scaffold —
      // update leads status as the closest analogue where applicable, or
      // extend with a `deals.controller` PATCH /:id/stage in a follow-up.
      await apiClient.patch(`/leads/${draggableId}`, { status: destination.droppableId }).catch(() => null);
      toast.success(`Moved to ${destination.droppableId.replace('_', ' ')}`);
    } catch {
      setBoard(prevBoard);
      toast.error('Failed to move — reverted');
    }
  }

  if (loading) return <Spinner label="Loading pipeline…" />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Sales Pipeline</h1>
        <p className="text-slate-500 text-sm">Drag deals across stages as they progress toward close.</p>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => (
            <Droppable droppableId={stage.key} key={stage.key}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`w-72 shrink-0 rounded-xl p-3 ${stage.color} ${
                    snapshot.isDraggingOver ? 'ring-2 ring-brand-400' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="text-sm font-semibold text-slate-700">{stage.label}</h3>
                    <span className="text-xs text-slate-400">{(board[stage.key] || []).length}</span>
                  </div>

                  <div className="space-y-2 min-h-[60px]">
                    {(board[stage.key] || []).map((deal, index) => (
                      <Draggable draggableId={deal.id} index={index} key={deal.id}>
                        {(dragProvided, dragSnapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            className={`card p-3 cursor-grab active:cursor-grabbing ${
                              dragSnapshot.isDragging ? 'shadow-lg ring-2 ring-brand-300' : ''
                            }`}
                          >
                            <p className="text-sm font-medium text-slate-700">{deal.title}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{deal.Company?.name}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs font-semibold text-emerald-600">
                                ${Number(deal.value || 0).toLocaleString()}
                              </span>
                              <span className="text-xs text-slate-400">{deal.owner?.name}</span>
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
  );
}
