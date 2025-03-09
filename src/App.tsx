import './App.css';

import React from 'react';

import PlayerSetup from './components/PlayerSetup';

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to My Billard</h1>
        <p>A modern React TypeScript application</p>
      </header>
      <main>
        <PlayerSetup />
      </main>
    </div>
  );
};

export default App;
