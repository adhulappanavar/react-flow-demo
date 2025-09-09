import React, { useState } from 'react';
import OverviewFlow from './OverviewFlow';
import SequenceDiagram from './SequenceDiagram';
import MermaidSequenceDiagram from './MermaidSequenceDiagram';
import '@xyflow/react/dist/style.css';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState<'overview' | 'sequence' | 'mermaid'>('overview');

  return (
    <div className="App">
      <div style={{ 
        position: 'absolute', 
        top: '10px', 
        left: '10px', 
        zIndex: 1000,
        display: 'flex',
        gap: '10px'
      }}>
        <button 
          onClick={() => setCurrentView('overview')}
          style={{
            padding: '8px 16px',
            background: currentView === 'overview' ? '#007bff' : '#f8f9fa',
            color: currentView === 'overview' ? 'white' : 'black',
            border: '1px solid #007bff',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Overview Flow
        </button>
        <button 
          onClick={() => setCurrentView('sequence')}
          style={{
            padding: '8px 16px',
            background: currentView === 'sequence' ? '#007bff' : '#f8f9fa',
            color: currentView === 'sequence' ? 'white' : 'black',
            border: '1px solid #007bff',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Sequence Diagram
        </button>
        <button 
          onClick={() => setCurrentView('mermaid')}
          style={{
            padding: '8px 16px',
            background: currentView === 'mermaid' ? '#007bff' : '#f8f9fa',
            color: currentView === 'mermaid' ? 'white' : 'black',
            border: '1px solid #007bff',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Mermaid Parser
        </button>
      </div>
      
      {currentView === 'overview' ? <OverviewFlow /> : 
       currentView === 'sequence' ? <SequenceDiagram /> : 
       <MermaidSequenceDiagram />}
    </div>
  );
}

export default App;