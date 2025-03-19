
import React from 'react';
import PeriodicTable from '../components/PeriodicTable';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex flex-col">
      <header className="py-8 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold tracking-tight mb-2 animate-fade-in">
            Interactive Periodic Table
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto animate-slide-up">
            Explore all 118 elements with detailed information. Click on any element to learn more, 
            or use the search bar to find specific elements.
          </p>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 pb-12">
        <PeriodicTable />
      </main>
      
      <footer className="py-6 border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>A comprehensive reference of all known chemical elements.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
