import React, { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { MapPin, Image as ImageIcon, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TripPlanner({ initialData, onChange }) {
    const navigate = useNavigate();
    const [columns, setColumns] = useState({});
    const [isDragging, setIsDragging] = useState(false);
    const scrollContainerRef = useRef(null);
    const mouseXRef = useRef(0);
    const requestRef = useRef(null);

    useEffect(() => {
        if (initialData) {
            setColumns(initialData);
        }
    }, [initialData]);

    useEffect(() => {
        const handleMouseMove = (e) => {
            mouseXRef.current = e.clientX;
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            
            const scrollEdgeSize = 150;
            const maxScrollSpeed = 20;

            const scrollLoop = () => {
                if (scrollContainerRef.current) {
                    const container = scrollContainerRef.current;
                    const rect = container.getBoundingClientRect();
                    const mouseX = mouseXRef.current;

                    let scrollAmount = 0;
                    if (mouseX > rect.right - scrollEdgeSize) {
                        const intensity = Math.min(1, (mouseX - (rect.right - scrollEdgeSize)) / scrollEdgeSize);
                        scrollAmount = maxScrollSpeed * intensity;
                    } else if (mouseX > 0 && mouseX < rect.left + scrollEdgeSize) {
                        const intensity = Math.min(1, ((rect.left + scrollEdgeSize) - mouseX) / scrollEdgeSize);
                        scrollAmount = -maxScrollSpeed * intensity;
                    }

                    if (scrollAmount !== 0) {
                        container.scrollLeft += scrollAmount;
                    }
                }
                requestRef.current = requestAnimationFrame(scrollLoop);
            };

            requestRef.current = requestAnimationFrame(scrollLoop);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [isDragging]);

    const handleDragStart = () => {
        setIsDragging(true);
        // Force overflow-y: hidden on all droppables synchronously to bypass react-beautiful-dnd nested scroll limitation
        const droppables = document.querySelectorAll('.droppable-list');
        droppables.forEach(el => {
            el.style.overflowY = 'hidden';
        });
    };

    const onDragEnd = (result) => {
        setIsDragging(false);
        const droppables = document.querySelectorAll('.droppable-list');
        droppables.forEach(el => {
            el.style.overflowY = 'auto';
        });
        if (!result.destination) return;
        const { source, destination } = result;

        if (source.droppableId === destination.droppableId) {
            // Dragging within the same column
            const column = columns[source.droppableId];
            const copiedItems = [...column.items];
            const [removed] = copiedItems.splice(source.index, 1);
            copiedItems.splice(destination.index, 0, removed);

            const updatedColumns = {
                ...columns,
                [source.droppableId]: {
                    ...column,
                    items: copiedItems
                }
            };
            setColumns(updatedColumns);
            if (onChange) onChange(updatedColumns);
        } else {
            // Moving between columns
            const sourceColumn = columns[source.droppableId];
            const destColumn = columns[destination.droppableId];
            const sourceItems = [...sourceColumn.items];
            const destItems = [...destColumn.items];

            const [removed] = sourceItems.splice(source.index, 1);
            destItems.splice(destination.index, 0, removed);

            const updatedColumns = {
                ...columns,
                [source.droppableId]: {
                    ...sourceColumn,
                    items: sourceItems
                },
                [destination.droppableId]: {
                    ...destColumn,
                    items: destItems
                }
            };
            setColumns(updatedColumns);
            if (onChange) onChange(updatedColumns);
        }
    };

    return (
        <DragDropContext onDragStart={handleDragStart} onDragEnd={onDragEnd}>
            <div ref={scrollContainerRef} className="flex gap-6 overflow-x-auto pb-8 w-full relative">
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
                            
                            <Droppable 
                                droppableId={columnId}
                                renderClone={(provided, snapshot, rubric) => {
                                    const item = column.items[rubric.source.index];
                                    if (!item) return null;
                                    const imageSrc = item.image_url || item.image || item.images?.[0] || item.illustration_url || null;
                                    const ratingValue = item.rating || item.overall_rating || "4.5";
                                    const ratingClean = typeof ratingValue === 'string' && ratingValue.includes('/5')
                                        ? ratingValue.replace('/5', '')
                                        : ratingValue;
                                    return (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className="user-select-none p-3 rounded-2xl flex items-start gap-3 cursor-grabbing shadow-[0_20px_40px_rgba(0,0,0,0.25)] bg-surface border-2 border-primary z-50 opacity-100"
                                            style={{ ...provided.draggableProps.style, margin: 0 }}
                                        >
                                            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-surface-container-low flex items-center justify-center pointer-events-none border border-outline-variant/20">
                                                {imageSrc ? (
                                                    <img src={imageSrc} className="w-full h-full object-cover pointer-events-none" />
                                                ) : (
                                                    <ImageIcon className="text-outline-variant w-6 h-6" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-sm text-on-surface line-clamp-2 leading-tight">
                                                    {item.name || item.location_name}
                                                </h4>
                                                <div className="flex items-center gap-1 mt-2 text-amber-500 font-bold max-w-full">
                                                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
                                                    <span className="text-xs font-bold font-display">{ratingClean}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }}
                            >
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={`droppable-list flex-1 overflow-y-auto no-scrollbar p-2 rounded-xl transition-colors ${
                                            snapshot.isDraggingOver ? 'bg-primary/5 border-2 border-primary/20 border-dashed' : 'border-2 border-transparent'
                                        }`}
                                    >
                                        {column.items.map((item, index) => {
                                            const imageSrc = item.image_url || item.image || item.images?.[0] || item.illustration_url || null;
                                            const ratingValue = item.rating || item.overall_rating || "4.5";
                                            const ratingClean = typeof ratingValue === 'string' && ratingValue.includes('/5')
                                                ? ratingValue.replace('/5', '')
                                                : ratingValue;
                                            
                                            return (
                                                <Draggable key={String(item.id || item.location_name || item.name || index)} draggableId={String(item.id || item.location_name || item.name || index)} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`user-select-none p-3 rounded-2xl flex items-start gap-3 cursor-grab active:cursor-grabbing transition-shadow transition-colors bg-surface-container-lowest border border-outline-variant/50 hover:shadow-md mb-3`}
                                                            style={{
                                                                ...provided.draggableProps.style
                                                            }}
                                                        >
                                                            <div 
                                                                className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-surface-container-low flex items-center justify-center pointer-events-auto border border-outline-variant/20 cursor-pointer hover:opacity-80 transition-opacity"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const identifier = item.id || item.location_id || encodeURIComponent(item.name || item.location_name);
                                                                    navigate(`/place/${identifier}`);
                                                                }}
                                                            >
                                                                {imageSrc ? (
                                                                    <img src={imageSrc} className="w-full h-full object-cover pointer-events-none" />
                                                                ) : (
                                                                    <ImageIcon className="text-outline-variant w-6 h-6 pointer-events-none" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 
                                                                    className="font-bold text-sm text-on-surface line-clamp-2 leading-tight cursor-pointer hover:text-primary hover:underline"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        const identifier = item.id || item.location_id || encodeURIComponent(item.name || item.location_name);
                                                                        navigate(`/place/${identifier}`);
                                                                    }}
                                                                >
                                                                    {item.name || item.location_name}
                                                                </h4>
                                                                <div className="flex items-center gap-1 mt-2 text-amber-500 font-bold max-w-full">
                                                                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
                                                                    <span className="text-xs font-bold font-display">{ratingClean}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
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
            </div>
        </DragDropContext>
    );
}
