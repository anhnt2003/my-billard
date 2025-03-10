import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import './styles/toast.css';

import { JSX } from 'react';

import { ToastContainer } from 'react-toastify';

import PlayerSetup from './components/PlayerSetup';

function App() : JSX.Element {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to FnB Billard</h1>
        <p>A modern application built by developer</p>
      </header>
      <main>
        <PlayerSetup />
      </main>
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        style={{
          width: '90%',
          maxWidth: '400px',
          fontSize: '14px',
          padding: '10px',
          margin: '0 auto',
        }}
      />
    </div>
  );
};

export default App;
