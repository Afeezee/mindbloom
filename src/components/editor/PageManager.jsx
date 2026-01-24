import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PageManager({ pages, selectedPage, onSelectPage }) {
  return (
    <aside className="w-80 bg-white border-r border-gray-100 shadow-md p-4 overflow-y-auto">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Pages</h2>
      <Droppable droppableId="pages">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
            {pages.map((page, index) => (
              <Draggable key={page.page_number} draggableId={String(page.page_number)} index={index}>
                {(provided, snapshot) => (
                  <motion.div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => onSelectPage(page.page_number)}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedPage === page.page_number
                        ? 'border-purple-500 bg-purple-50 shadow-md'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    } ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                       <div {...provided.dragHandleProps} className="pt-1 text-gray-400 hover:text-gray-600">
                          <GripVertical className="w-5 h-5" />
                       </div>
                      {page.illustration_url && (
                        <img
                          src={page.illustration_url}
                          alt={`Page ${page.page_number}`}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800">Page {page.page_number}</div>
                        <p className="text-sm text-gray-600 truncate">{page.text}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </aside>
  );
}