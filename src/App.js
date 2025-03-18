import './App.css';

import { Analytics } from '@vercel/analytics/react';
import React from 'react';
import TriHardVisualizations from './components/Visualizations';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>TriHard Strava Club</h1>
      </header>
      <main className="App-main">
        <TriHardVisualizations />
      </main>
      <footer className="App-footer">
        <p>© {new Date().getFullYear()} TriHard Strava Club</p>
      </footer>
      <Analytics/>
    </div>
  );
}

export default App;