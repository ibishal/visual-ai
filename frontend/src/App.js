import React from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import VisualAgentBuilder from './components/VisualAgentBuilder';
import './App.css';

function App() {
  return (
    <div className="App h-screen">
      <ReactFlowProvider>
        <VisualAgentBuilder />
      </ReactFlowProvider>
    </div>
  );
}

export default App;