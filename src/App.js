import './App.css';

import React from 'react';
import TriHardVisualizations from './components/Visualizations';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>TriHard Strata Club</h1>
      </header>
      <main className="App-main">
        <TriHardVisualizations />
      </main>
      <footer className="App-footer">
        <p>© {new Date().getFullYear()} TriHard Strata Club</p>
      </footer>
    </div>
  );
}

export default App;