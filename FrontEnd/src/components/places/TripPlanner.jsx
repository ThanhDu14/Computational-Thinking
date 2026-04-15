import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { MapPin, Image as ImageIcon } from 'lucide-react';

export default function TripPlanner({ initialData }) {
    const [columns, setColumns] = useState({});

    useEffect(() => {
        if (initialData) {
            setColumns(initialData);
        }
    }, [initialData]);

    const onDragEnd = (result) => {
        if (!result.destination) return;
        const { source, destination } = result;

        if (source.droppableId === destination.droppableId) {
            // Dragging within the same column
            const column = columns[source.droppableId];
            const copiedItems = [...column.items];
            const [removed] = copiedItems.splice(source.index, 1);
            copiedItems.splice(destination.index, 0, removed);

            setColumns({
                ...columns,
                [source.droppableId]: {
                    ...column,
                    items: copiedItems
                }
            });
        } else {
            // Moving between columns
            const sourceColumn = columns[source.droppableId];
            const destColumn = columns[destination.droppableId];
            const sourceItems = [...sourceColumn.items];
            const destItems = [...destColumn.items];

            const [removed] = sourceItems.splice(source.index, 1);
            destItems.splice(destination.index, 0, removed);

            setColumns({
                ...columns,
                [source.droppableId]: {
                    ...sourceColumn,
                    items: sourceItems
                },
                [destination.droppableId]: {
                    ...destColumn,
                    items: destItems
                }
            });
        }
    };

    return (
        <div className="flex gap-6 overflow-x-auto pb-8 w-full">
            <DragDropContext onDragEnd={onDragEnd}>
                {Object.entries(columns).map(([columnId, column], index) => {
                    return (
                        <div 
                            key={columnId} 
                            className="bg-surface-container/50 backdrop-blur-md rounded-3xl p-5 min-w-[320px] max-w-[350px] flex-1 border border-outline-variant/30 flex flex-col shrink-0 h-[600px]"
                        >
                            <div className="flex items-center justify-between mb-4 px-2 tracking-tight">
                                <h2 className="font-display font-bold text-lg text-on-surface flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                        D{index + 1}
                                    </div>
                                    {column.title}
                                </h2>
                                <span className="text-xs font-bold text-on-surface-variant bg-surface-container-high px-2 py-1 rounded-md">
                                    {column.items.length}
                                </span>
                            </div>
                            
                            <Droppable droppableId={columnId}>
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={`flex-1 overflow-y-auto no-scrollbar p-2 rounded-xl transition-colors ${
                                            snapshot.isDraggingOver ? 'bg-primary/5 border-2 border-primary/20 border-dashed' : 'border-2 border-transparent'
                                        }`}
                                    >
                                        {column.items.map((item, index) => {
                                            const imageSrc = item.images?.[0] || item.image || null;
                                            
                                            return (
                                                <Draggable key={String(item.location_name || item.id)} draggableId={String(item.location_name || item.id)} index={index}>
                                                    {(provided, snapshot) => {
                                                        const usePortal = snapshot.isDragging;
                                                        
                                                        const child = (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className={`user-select-none p-3 rounded-2xl flex items-start gap-3 cursor-grab active:cursor-grabbing transition-shadow transition-colors ${
                                                                    snapshot.isDragging ? 'shadow-[0_20px_40px_rgba(0,0,0,0.25)] bg-surface border-2 border-primary z-50 opacity-100' : 'bg-surface-container-lowest border border-outline-variant/50 hover:shadow-md mb-3'
                                                                }`}
                                                                style={{
                                                                    ...provided.draggableProps.style
                                                                }}
                                                            >
                                                                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-surface-container-low flex items-center justify-center pointer-events-none">
                                                                    {imageSrc ? (
                                                                        <img src={imageSrc} className="w-full h-full object-cover pointer-events-none" />
                                                                    ) : (
                                                                        <ImageIcon className="text-outline-variant w-6 h-6" />
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h4 className="font-bold text-sm text-on-surface line-clamp-2 leading-tight">
                                                                        {item.location_name || item.name}
                                                                    </h4>
                                                                    <div className="flex items-center gap-1 mt-1.5 text-on-surface-variant max-w-full">
                                                                        <MapPin className="w-3 h-3 text-primary shrink-0" />
                                                                        <span className="text-[10px] font-bold truncate uppercase tracking-wider">{item.region || 'Unknown'}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );

                                                        if (usePortal) {
                                                            return createPortal(child, document.body);
                                                        }
                                                        
                                                        return child;
                                                    }}
                                                </Draggable>
                                            );
                                        })}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    );
                })}
            </DragDropContext>
        </div>
    );
}
