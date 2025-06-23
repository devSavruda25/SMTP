import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SendEmail from './pages/SendEmail';
import Sidebar from './components/Sidebar';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    setToken(localStorage.getItem('token'));
  }, []);

  return (
    <Router>
      {token && <Sidebar />}
      <Routes>
        <Route
          path="/"
          element={!token ? <Login setToken={setToken} /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/dashboard"
          element={token ? <Dashboard /> : <Navigate to="/" />}
        />
        <Route
          path="/send"
          element={token ? <SendEmail /> : <Navigate to="/" />}
        />
        <Route
          path="*"
          element={<h1 className="text-center text-red-500 mt-10">404 - Page Not Found</h1>}
        />
      </Routes>
    </Router>
  );
}

export default App;
