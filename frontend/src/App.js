import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  // Intentamos recuperar el usuario del localStorage al cargar
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  // Si no hay usuario, mostramos el Login
  if (!user) {
    return <Login onLogin={setUser} />;
  }

  // Si hay usuario, mostramos el Dashboard pasando el rol y la función de logout
  return (
    <div className="app-container">
      <Dashboard user={user} onLogout={logout} />
    </div>
  );
}

export default App;