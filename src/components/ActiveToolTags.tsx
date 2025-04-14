import React from 'react';
import { X } from 'lucide-react';
import { Tool } from './ToolsMenu';

interface ActiveToolTagsProps {
  tools: Tool[];
  activeTools: string[];
  onToggleTool: (id: string) => void;
}

const ActiveToolTags: React.FC<ActiveToolTagsProps> = ({ tools, activeTools, onToggleTool }) => {
  if (activeTools.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4 mt-2">
      {activeTools.map(id => {
        const tool = tools.find(t => t.id === id);
        if (!tool) return null;
        
        return (
          <div
            key={tool.id}
            className={`px-2 py-1 rounded-full flex items-center gap-1 ${tool.color} text-white text-xs`}
          >
            <span className="material-icons text-xs">{tool.icon}</span>
            <span>{tool.name}</span>
            <button
              onClick={() => onToggleTool(tool.id)}
              className="ml-1 rounded-full hover:bg-white/20 p-0.5"
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ActiveToolTags;