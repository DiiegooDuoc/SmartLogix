import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:8081/api/v1/logistics/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const user = await response.json();
        localStorage.setItem('user', JSON.stringify(user));
        onLogin(user); // Esto actualiza el estado en App.js
      } else {
        setError('Credenciales incorrectas. Intenta de nuevo.');
      }
    } catch (err) {
      setError('No se pudo conectar con el servidor.');
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={{ textAlign: 'center', color: '#2c3e50' }}>SmartLogix Login</h2>
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        
        <div style={styles.inputGroup}>
          <label>Email:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={styles.input}
            placeholder="admin@smart.com"
          />
        </div>

        <div style={styles.inputGroup}>
          <label>Password:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={styles.input}
            placeholder="admin123"
          />
        </div>

        <button type="submit" style={styles.button}>Ingresar</button>
        <p style={{ fontSize: '12px', marginTop: '10px', color: '#7f8c8d' }}>
          Tip: admin@smart.com / admin123
        </p>
      </form>
    </div>
  );
};

// Estilos rápidos para que se vea bien
const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f7f6' },
  form: { padding: '40px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '350px' },
  inputGroup: { marginBottom: '15px' },
  input: { width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' },
  button: { width: '100%', padding: '10px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }
};

export default Login;