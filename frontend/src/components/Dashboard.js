import React, { useState, useEffect } from 'react';

const Dashboard = ({ user, onLogout }) => {
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('products');

  // Estados para agregar producto (Admin)
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const bffUrl = 'http://localhost:8081/api/v1/logistics';

  const fetchData = () => {
    fetch(`${bffUrl}/dashboard`)
      .then(res => res.json())
      .then(data => {
        setInventory(data.inventory || []);
        setOrders(data.orders || []);
      })
      .catch(err => console.error("Error cargando datos:", err));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- LÓGICA DE CLIENTE ---
  const handleBuy = async (product) => {
    try {
      const response = await fetch(`${bffUrl}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: user.email,
          productName: product.name,
          totalAmount: product.price
        })
      });
      if (response.ok) {
        alert(`¡Compraste ${product.name} con éxito!`);
        fetchData(); 
      }
    } catch (err) {
      alert("Error en la conexión");
    }
  };

  // --- LÓGICA DE ADMIN: AGREGAR ---
  const handleAddProduct = async (e) => {
    e.preventDefault();
    await fetch(`${bffUrl}/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, price: parseFloat(newPrice) })
    });
    setNewName('');
    setNewPrice('');
    fetchData();
  };

  // --- LÓGICA DE ADMIN: ELIMINAR ---
  const handleDeleteProduct = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este producto?")) {
      await fetch(`${bffUrl}/inventory/${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  const filteredProducts = inventory.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif' }}>

      {/* HEADER GLOBAL */}
      <header style={styles.header}>
        <div style={{ fontWeight: 'bold', fontSize: '20px', letterSpacing: '1px' }}>SMARTLOGIX PRO</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={styles.profileBadge}>
            👤 {user.email} <span style={{ fontSize: '10px', opacity: 0.8 }}>[{user.role}]</span>
          </div>
          <button onClick={onLogout} style={styles.logoutBtn}>Cerrar Sesión</button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* SIDEBAR */}
        <nav style={styles.sidebar}>
          <button
            onClick={() => setView('products')}
            style={{ ...styles.menuBtn, backgroundColor: view === 'products' ? '#2c3e50' : 'transparent' }}
          >
            📦 Catálogo
          </button>

          {user.role === 'ADMIN' && (
            <>
              <button
                onClick={() => setView('admin-tools')}
                style={{ ...styles.menuBtn, backgroundColor: view === 'admin-tools' ? '#2c3e50' : 'transparent' }}
              >
                ⚙️ Gestión Stock
              </button>
              <button
                onClick={() => setView('orders')}
                style={{ ...styles.menuBtn, backgroundColor: view === 'orders' ? '#2c3e50' : 'transparent' }}
              >
                📊 Ver Pedidos
              </button>
            </>
          )}
        </nav>

        {/* CONTENIDO PRINCIPAL */}
        <main style={{ flex: 1, padding: '30px', backgroundColor: '#f4f7f6' }}>
          <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ color: '#2c3e50', margin: 0 }}>
              {view === 'products' ? 'Productos' : view === 'orders' ? 'Pedidos' : 'Panel Administrativo'}
            </h2>
            <input
              type="text"
              placeholder="Buscar..."
              style={styles.searchInput}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* VISTA PRODUCTOS */}
          {view === 'products' && (
            <div style={styles.grid}>
              {filteredProducts.map(p => (
                <div key={p.id} style={styles.card}>
                  <div style={{ fontSize: '40px', textAlign: 'center' }}>📦</div>
                  <h3 style={{ margin: '10px 0' }}>{p.name}</h3>
                  <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#27ae60' }}>${p.price}</p>
                  {user.role === 'CLIENTE' && (
                    <button onClick={() => handleBuy(p)} style={styles.buyBtn}>🛒 Comprar</button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* VISTA ÓRDENES (ADMIN) */}
          {view === 'orders' && user.role === 'ADMIN' && (
            <div style={styles.cardFull}>
              <table style={styles.table}>
                <thead style={{ backgroundColor: '#2c3e50', color: 'white' }}>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Cliente</th>
                    <th style={styles.th}>Producto</th>
                    <th style={styles.th}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} style={styles.tr}>
                      <td style={styles.td}>{o.id}</td>
                      <td style={styles.td}>{o.customerName}</td>
                      <td style={styles.td}>{o.productName}</td>
                      <td style={styles.td}>${o.totalAmount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* VISTA GESTIÓN (ADMIN) */}
          {view === 'admin-tools' && user.role === 'ADMIN' && (
            <div style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
              <div style={styles.cardFull}>
                <h3>Añadir Nuevo Producto</h3>
                <form onSubmit={handleAddProduct} style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                  <input style={styles.input} type="text" placeholder="Nombre" value={newName} onChange={e => setNewName(e.target.value)} required />
                  <input style={styles.input} type="number" placeholder="Precio" value={newPrice} onChange={e => setNewPrice(e.target.value)} required />
                  <button type="submit" style={styles.addBtn}>+ Guardar</button>
                </form>
              </div>

              <div style={styles.cardFull}>
                <h3>Inventario Actual</h3>
                <table style={styles.table}>
                  <thead>
                    <tr style={{ textAlign: 'left' }}>
                      <th style={styles.th}>Producto</th>
                      <th style={styles.th}>Precio</th>
                      <th style={styles.th}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map(p => (
                      <tr key={p.id} style={styles.tr}>
                        <td style={styles.td}>{p.name}</td>
                        <td style={styles.td}>${p.price}</td>
                        <td style={styles.td}>
                          <button onClick={() => handleDeleteProduct(p.id)} style={styles.delBtn}>Eliminar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 30px', backgroundColor: '#1a252f', color: 'white', borderBottom: '4px solid #1abc9c' },
  sidebar: { width: '220px', backgroundColor: '#2c3e50', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' },
  menuBtn: { color: 'white', border: 'none', padding: '12px', textAlign: 'left', cursor: 'pointer', borderRadius: '8px', fontSize: '15px', transition: 'all 0.2s' },
  profileBadge: { backgroundColor: '#34495e', padding: '6px 15px', borderRadius: '20px', border: '1px solid #1abc9c' },
  logoutBtn: { backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '8px 18px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  searchInput: { padding: '10px 20px', borderRadius: '25px', border: '1px solid #ddd', width: '300px', outline: 'none' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '25px' },
  card: { backgroundColor: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center' },
  cardFull: { backgroundColor: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
  buyBtn: { width: '100%', backgroundColor: '#2980b9', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', marginTop: '15px' },
  addBtn: { backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' },
  delBtn: { backgroundColor: '#c0392b', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '5px', cursor: 'pointer' },
  input: { padding: '10px', borderRadius: '8px', border: '1px solid #ddd', flex: 1 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px', textAlign: 'left', borderBottom: '2px solid #eee' },
  td: { padding: '12px', borderBottom: '1px solid #eee' },
  tr: { transition: 'background 0.2s' }
};

export default Dashboard;