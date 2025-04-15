import React, { useState, useEffect, useRef } from 'react';
import { Command } from './ui/command';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { X } from 'lucide-react';
import ScientificCalculator from './ScientificCalculator';
import UnitConverter from './UnitConverter';

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  component: React.ReactNode;
  color: string;
}

interface ToolsMenuProps {
  tools: Tool[];
  activeTools: string[];
  onToggleTool: (id: string) => void;
}

const ToolsMenu: React.FC<ToolsMenuProps> = ({ tools, activeTools, onToggleTool }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredTools = search
    ? tools.filter(tool => 
        tool.name.toLowerCase().includes(search.toLowerCase()) || 
        tool.description.toLowerCase().includes(search.toLowerCase()))
    : tools;

  // Focus the input when the dialog opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Function to toggle tool without closing the menu
  const handleToggleTool = (id: string) => {
    onToggleTool(id);
    // We don't close the menu: setOpen(false);
  };

  return (
    <div className="flex flex-col">
      <div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 sm:text-sm"
            >
              <span className="material-icons text-sm sm:text-base">widgets</span>
              Tools Menu
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-medium">Available Tools</h2>

              <div className="mb-4">
                <Input 
                  ref={inputRef}
                  placeholder="Search tools..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
                {filteredTools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => handleToggleTool(tool.id)}
                    className={`flex items-center gap-2 p-2 rounded-md transition-colors text-left ${
                      activeTools.includes(tool.id)
                        ? `${tool.color} text-white`
                        : 'bg-secondary/20 hover:bg-secondary/30'
                    }`}
                  >
                    <span className="material-icons text-base">{tool.icon}</span>
                    <div className="flex-1 flex flex-col">
                      <span className="font-medium">{tool.name}</span>
                      <span className="text-xs opacity-80">{tool.description}</span>
                    </div>
                    {activeTools.includes(tool.id) && (
                      <span className="material-icons text-sm">check</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex justify-between mt-2">
                <span className="text-xs text-muted-foreground">
                  {activeTools.length} tools active
                </span>
                {activeTools.length > 0 && (
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      activeTools.forEach(id => onToggleTool(id));
                    }}
                    className="h-8 text-xs"
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active tools tags - moved to a fixed position element that will appear below the buttons */}
    </div>
  );
};

export default ToolsMenu;