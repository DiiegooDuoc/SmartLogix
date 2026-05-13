import React, { useState, useEffect } from 'react';

const Dashboard = ({ user, onLogout }) => {
  const LOGO_URL = 'https://cdn-icons-png.flaticon.com/512/3666/3666227.png';

  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('products');

  // Estados para agregar producto (Admin)
  const [newName, setNewName] = useState('');
  const [newPriceDigits, setNewPriceDigits] = useState('');

  // Estados para editar producto (Admin)
  const [editingProductId, setEditingProductId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPriceDigits, setEditPriceDigits] = useState('');

  // Confirmación de compra (Cliente)
  const [pendingPurchase, setPendingPurchase] = useState(null);
  const [purchaseResult, setPurchaseResult] = useState(null); // { type: 'success' | 'error', message: string }

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

  const onlyDigits = (value) => (value || '').toString().replace(/[^0-9]/g, '');

  // Formato CLP: separador de miles con punto, sin símbolo ni "CLP"
  const formatCLP = (amount) => {
    const value = Number(amount);
    if (Number.isNaN(value)) return `${amount}`;
    return new Intl.NumberFormat('es-CL', {
      useGrouping: true,
      maximumFractionDigits: 0
    }).format(Math.round(value));
  };

  const formatCLPFromDigits = (digits) => {
    if (!digits) return '';
    const n = Number(digits);
    if (Number.isNaN(n)) return '';
    return formatCLP(n);
  };

  const formatDateTime = (isoLike) => {
    if (!isoLike) return '—';
    const date = new Date(isoLike);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString('es-CL');
  };

  const statusLabel = (status) => {
    const s = (status || '').toString().toUpperCase();
    if (s === 'ENTREGADO') return 'Entregado';
    if (s === 'CANCELADO') return 'Cancelado';
    return 'En proceso';
  };

  const statusTone = (status) => {
    const s = (status || '').toString().toUpperCase();
    if (s === 'ENTREGADO') return 'success';
    if (s === 'CANCELADO') return 'danger';
    return 'warning';
  };

  // --- LÓGICA DE CLIENTE ---
  const handleBuy = (product) => {
    setPurchaseResult(null);
    setPendingPurchase(product);
  };

  const confirmPurchase = async () => {
    if (!pendingPurchase) return;
    try {
      const response = await fetch(`${bffUrl}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: user.email,
          productName: pendingPurchase.name,
          totalAmount: pendingPurchase.price
        })
      });
      if (response.ok) {
        setPendingPurchase(null);
        setPurchaseResult({
          type: 'success',
          message: 'Compra realizada con éxito. Puedes ver tus compras en Mis compras.'
        });
        fetchData();
      } else {
        setPurchaseResult({ type: 'error', message: 'No se pudo completar la compra. Intenta nuevamente.' });
      }
    } catch (err) {
      setPurchaseResult({ type: 'error', message: 'Error de conexión. Revisa el servidor e intenta nuevamente.' });
    }
  };

  const cancelPurchase = () => {
    setPendingPurchase(null);
  };

  const goToMyOrders = () => {
    setPurchaseResult(null);
    setView('my-orders');
  };

  // --- LÓGICA DE ADMIN: AGREGAR ---
  const handleAddProduct = async (e) => {
    e.preventDefault();
    const priceValue = Number(newPriceDigits);
    if (!newName.trim() || Number.isNaN(priceValue)) return;
    await fetch(`${bffUrl}/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, price: priceValue })
    });
    setNewName('');
    setNewPriceDigits('');
    fetchData();
  };

  const startEditProduct = (product) => {
    setEditingProductId(product.id);
    setEditName(product.name || '');
    setEditPriceDigits(onlyDigits(String(Math.round(Number(product.price) || 0))));
  };

  const cancelEditProduct = () => {
    setEditingProductId(null);
    setEditName('');
    setEditPriceDigits('');
  };

  const handleSaveEditProduct = async (e) => {
    e.preventDefault();
    if (!editingProductId) return;
    const priceValue = Number(editPriceDigits);
    if (!editName.trim() || Number.isNaN(priceValue)) return;

    await fetch(`${bffUrl}/inventory/${editingProductId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName, price: priceValue })
    });

    cancelEditProduct();
    fetchData();
  };

  // --- LÓGICA DE ADMIN: ELIMINAR ---
  const handleDeleteProduct = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este producto?")) {
      await fetch(`${bffUrl}/inventory/${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  const handleUpdateOrderStatus = async (orderId, nextStatus) => {
    try {
      const response = await fetch(`${bffUrl}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (response.ok) {
        fetchData();
      }
    } catch (e) {
      // No bloquear UI por un error de red
    }
  };

  const filteredProducts = inventory.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const myOrders = orders.filter(o => (o?.customerName || '') === user.email);

  return (
    <div style={styles.appShell}>

      {/* HEADER GLOBAL */}
      <header style={styles.header}>
        <div style={styles.brandBlock}>
          {LOGO_URL ? (
            <img
              src={LOGO_URL}
              alt="SmartLogix logo"
              style={styles.brandLogo}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div style={styles.brandLogoPlaceholder} aria-hidden="true">SL</div>
          )}
          <div>
            <div style={styles.brandTitle}>SmartLogix</div>
            <div style={styles.brandSubtitle}>Panel de logística</div>
          </div>
        </div>

        <div style={styles.headerRight}>
          <div style={styles.profileBadge}>
            <span aria-hidden="true">👤</span>
            <span style={styles.profileEmail}>{user.email}</span>
            <span style={styles.roleTag}>{user.role}</span>
          </div>
          <button onClick={onLogout} style={styles.logoutBtn}>Cerrar sesión</button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* SIDEBAR */}
        <nav style={styles.sidebar}>
          <div style={styles.sidebarTitle}>Navegación</div>
          <button
            onClick={() => setView('products')}
            style={{ ...styles.menuBtn, backgroundColor: view === 'products' ? '#2c3e50' : 'transparent' }}
          >
            📦 Catálogo
          </button>

          {user.role === 'CLIENTE' && (
            <button
              onClick={() => setView('my-orders')}
              style={{ ...styles.menuBtn, backgroundColor: view === 'my-orders' ? '#2c3e50' : 'transparent' }}
            >
              🛒 Mis compras
            </button>
          )}

          {user.role === 'ADMIN' && (
            <>
              <div style={styles.sidebarSection}>Administración</div>
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
        <main style={styles.main}>
          <div style={styles.mainHeader}>
            <div>
              <h2 style={styles.pageTitle}>
                {view === 'products'
                  ? 'Catálogo'
                  : view === 'orders'
                    ? 'Pedidos'
                    : view === 'my-orders'
                      ? 'Mis compras'
                      : 'Panel administrativo'}
              </h2>
              <div style={styles.pageHint}>
                {view === 'products'
                  ? 'Explora productos y realiza compras en un clic.'
                  : view === 'my-orders'
                    ? 'Aquí verás el historial de tus compras.'
                    : user.role === 'ADMIN'
                      ? 'Gestiona inventario y revisa pedidos.'
                      : ''}
              </div>
            </div>

            {view === 'products' && (
              <input
                type="text"
                placeholder="Buscar producto..."
                style={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            )}
          </div>

          {/* VISTA PRODUCTOS */}
          {view === 'products' && (
            <div>
              {(pendingPurchase || purchaseResult) && user.role === 'CLIENTE' && (
                <div style={styles.topPanel}>
                  {pendingPurchase && (
                    <>
                      <div style={styles.topPanelTitle}>Confirmar compra</div>
                      <div style={styles.topPanelRow}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={styles.topPanelProduct} title={pendingPurchase.name}>{pendingPurchase.name}</div>
                          <div style={styles.topPanelMeta}>Total: <span style={styles.topPanelAmount}>{formatCLP(pendingPurchase.price)}</span></div>
                        </div>
                        <div style={styles.topPanelActions}>
                          <button type="button" style={styles.confirmBtn} onClick={confirmPurchase}>Confirmar</button>
                          <button type="button" style={styles.cancelBtn} onClick={cancelPurchase}>Cancelar</button>
                        </div>
                      </div>
                    </>
                  )}

                  {!pendingPurchase && purchaseResult?.type === 'success' && (
                    <div style={styles.successBanner}>
                      <div style={{ fontSize: 18 }} aria-hidden="true">✅</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800 }}>Compra realizada con éxito</div>
                        <div style={{ opacity: 0.9, marginTop: 2 }}>
                          Puedes ver tus compras en{' '}
                          <button type="button" onClick={goToMyOrders} style={styles.inlineLink}>Mis compras</button>.
                        </div>
                      </div>
                      <button type="button" onClick={() => setPurchaseResult(null)} style={styles.bannerClose}>Cerrar</button>
                    </div>
                  )}

                  {!pendingPurchase && purchaseResult?.type === 'error' && (
                    <div style={styles.errorBanner}>
                      <div style={{ fontSize: 18 }} aria-hidden="true">⚠️</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800 }}>No se pudo comprar</div>
                        <div style={{ opacity: 0.9, marginTop: 2 }}>{purchaseResult.message}</div>
                      </div>
                      <button type="button" onClick={() => setPurchaseResult(null)} style={styles.bannerClose}>Cerrar</button>
                    </div>
                  )}
                </div>
              )}

              <div style={styles.grid}>
                {filteredProducts.map(p => (
                  <div key={p.id} style={styles.card}>
                    <div style={{ fontSize: '40px', textAlign: 'center' }}>📦</div>
                    <h3 style={{ margin: '10px 0' }}>{p.name}</h3>
                    <p style={styles.price}>{formatCLP(p.price)}</p>
                    {user.role === 'CLIENTE' && (
                      <button onClick={() => handleBuy(p)} style={styles.buyBtn}>🛒 Comprar</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VISTA MIS COMPRAS (CLIENTE) */}
          {view === 'my-orders' && user.role === 'CLIENTE' && (
            <div style={styles.stack}>
              <div style={styles.cardFull}>
                <div style={styles.sectionTitleRow}>
                  <h3 style={styles.sectionTitle}>Tus pedidos</h3>
                  <span style={styles.mutedBadge}>{myOrders.length} en total</span>
                </div>

                {myOrders.length === 0 ? (
                  <div style={styles.emptyState}>
                    <div style={{ fontSize: '34px' }} aria-hidden="true">🧾</div>
                    <div style={{ fontWeight: 600, marginTop: 8 }}>Aún no tienes compras registradas</div>
                    <div style={{ opacity: 0.8, marginTop: 6 }}>
                      Compra desde el catálogo y aquí verás el estado.
                    </div>
                  </div>
                ) : (
                  <div style={styles.orderList}>
                    {myOrders.map((o) => (
                      <div key={o.id} style={styles.orderItem}>
                        <div style={styles.orderIcon} aria-hidden="true">🛒</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={styles.orderTitleRow}>
                            <div style={styles.orderProduct} title={o.productName}>{o.productName}</div>
                            <div style={styles.orderAmount}>{formatCLP(o.totalAmount)}</div>
                          </div>
                          <div style={styles.orderMeta}>
                            <span>Pedido #{o.id} · {formatDateTime(o.createdAt)}</span>
                            <span style={{ marginLeft: 8 }}>
                              <span style={{ opacity: 0.9 }}>Estado:</span>{' '}
                              <span style={{
                                ...styles.statusPill,
                                ...(statusTone(o.status) === 'success'
                                  ? styles.statusPillSuccess
                                  : statusTone(o.status) === 'danger'
                                    ? styles.statusPillDanger
                                    : styles.statusPillWarning)
                              }}>
                                {statusLabel(o.status)}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={styles.notice} role="status">
                <div style={{ fontSize: '18px' }} aria-hidden="true">🚚</div>
                <div>
                  <div style={{ fontWeight: 700 }}>Tu pedido está siendo procesado</div>
                  <div style={{ opacity: 0.9, marginTop: 2 }}>
                    Puede llegar a tu domicilio en un plazo de 1 a 3 días hábiles.
                  </div>
                </div>
              </div>
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
                    <th style={styles.th}>Fecha/Hora</th>
                    <th style={styles.th}>Total</th>
                    <th style={styles.th}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} style={styles.tr}>
                      <td style={styles.td}>{o.id}</td>
                      <td style={styles.td}>{o.customerName}</td>
                      <td style={styles.td}>{o.productName}</td>
                      <td style={styles.td}>{formatDateTime(o.createdAt)}</td>
                      <td style={styles.td}>{formatCLP(o.totalAmount)}</td>
                      <td style={styles.td}>
                        <div style={styles.statusCell}>
                          <span style={{
                            ...styles.statusPill,
                            ...(statusTone(o.status) === 'success'
                              ? styles.statusPillSuccess
                              : statusTone(o.status) === 'danger'
                                ? styles.statusPillDanger
                                : styles.statusPillWarning)
                          }}>
                            {statusLabel(o.status)}
                          </span>

                          <select
                            style={styles.select}
                            value={(o.status || 'EN_PROCESO').toString().toUpperCase()}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                          >
                            <option value="EN_PROCESO">En proceso</option>
                            <option value="ENTREGADO">Entregado</option>
                            <option value="CANCELADO">Cancelado</option>
                          </select>
                        </div>
                      </td>
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
                  <input
                    style={styles.input}
                    type="text"
                    inputMode="numeric"
                    placeholder="Precio (ej: 10.000)"
                    value={formatCLPFromDigits(newPriceDigits)}
                    onChange={(e) => setNewPriceDigits(onlyDigits(e.target.value))}
                    required
                  />
                  <button type="submit" style={styles.addBtn}>+ Guardar</button>
                </form>
              </div>

              <div style={styles.cardFull}>
                <h3>Inventario Actual</h3>

                {editingProductId && (
                  <div style={styles.editPanel}>
                    <div style={styles.editPanelTitle}>Editar producto</div>
                    <form onSubmit={handleSaveEditProduct} style={styles.editFormRow}>
                      <input
                        style={styles.input}
                        type="text"
                        placeholder="Nombre"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        required
                      />
                      <input
                        style={styles.input}
                        type="text"
                        inputMode="numeric"
                        placeholder="Precio (ej: 10.000)"
                        value={formatCLPFromDigits(editPriceDigits)}
                        onChange={(e) => setEditPriceDigits(onlyDigits(e.target.value))}
                        required
                      />
                      <button type="submit" style={styles.saveBtn}>Guardar</button>
                      <button type="button" onClick={cancelEditProduct} style={styles.cancelBtn}>Cancelar</button>
                    </form>
                  </div>
                )}

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
                        <td style={styles.td}>{formatCLP(p.price)}</td>
                        <td style={styles.td}>
                          <div style={styles.rowActions}>
                            <button
                              type="button"
                              onClick={() => startEditProduct(p)}
                              style={styles.editBtn}
                              title="Editar"
                            >
                              ✏️
                            </button>
                            <button onClick={() => handleDeleteProduct(p.id)} style={styles.delBtn}>Eliminar</button>
                          </div>
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
  appShell: { display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: 'Segoe UI, system-ui, -apple-system, sans-serif', backgroundColor: '#0b1220' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 22px', backgroundColor: '#0b1220', color: 'white', borderBottom: '1px solid rgba(255,255,255,0.08)' },
  brandBlock: { display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 },
  brandLogo: { height: '34px', width: 'auto', objectFit: 'contain' },
  brandLogoPlaceholder: { width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, letterSpacing: '0.5px' },
  brandTitle: { fontWeight: 800, fontSize: '16px', letterSpacing: '0.4px', lineHeight: 1.1 },
  brandSubtitle: { fontSize: '12px', opacity: 0.8, marginTop: 2 },
  headerRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  profileEmail: { maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  roleTag: { fontSize: '11px', padding: '2px 8px', borderRadius: '999px', backgroundColor: 'rgba(26,188,156,0.18)', border: '1px solid rgba(26,188,156,0.35)' },

  sidebar: { width: '240px', backgroundColor: '#111a2c', padding: '18px', display: 'flex', flexDirection: 'column', gap: '8px', borderRight: '1px solid rgba(255,255,255,0.06)' },
  sidebarTitle: { color: 'rgba(255,255,255,0.75)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '6px' },
  sidebarSection: { marginTop: '10px', color: 'rgba(255,255,255,0.55)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em' },
  menuBtn: { color: 'white', border: 'none', padding: '12px', textAlign: 'left', cursor: 'pointer', borderRadius: '8px', fontSize: '15px', transition: 'all 0.2s' },
  profileBadge: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'rgba(255,255,255,0.08)', padding: '8px 12px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.10)', maxWidth: '520px' },
  logoutBtn: { backgroundColor: 'rgba(231, 76, 60, 0.95)', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '10px', cursor: 'pointer', fontWeight: 700 },
  main: { flex: 1, padding: '26px', background: 'linear-gradient(180deg, #0e1730 0%, #0b1220 55%, #0b1220 100%)' },
  mainHeader: { marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px' },
  pageTitle: { color: 'white', margin: 0, fontSize: '22px', letterSpacing: '0.2px' },
  pageHint: { color: 'rgba(255,255,255,0.70)', fontSize: '13px', marginTop: 6 },
  searchInput: { padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.14)', width: '340px', outline: 'none', backgroundColor: 'rgba(255,255,255,0.06)', color: 'white' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '25px' },
  card: { backgroundColor: 'rgba(255,255,255,0.06)', padding: '18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.10)', boxShadow: '0 10px 22px rgba(0,0,0,0.22)', textAlign: 'center', color: 'white' },
  cardFull: { backgroundColor: 'rgba(255,255,255,0.06)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.10)', boxShadow: '0 10px 22px rgba(0,0,0,0.22)', color: 'white' },
  price: { fontSize: '18px', fontWeight: 800, color: 'rgba(26,188,156,0.95)', margin: '8px 0 0' },
  buyBtn: { width: '100%', backgroundColor: 'rgba(41, 128, 185, 0.95)', color: 'white', border: '1px solid rgba(255,255,255,0.10)', padding: '10px', borderRadius: '12px', cursor: 'pointer', marginTop: '14px', fontWeight: 700 },
  addBtn: { backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' },
  delBtn: { backgroundColor: '#c0392b', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '5px', cursor: 'pointer' },
  editBtn: { backgroundColor: 'rgba(255,255,255,0.10)', color: 'white', border: '1px solid rgba(255,255,255,0.14)', padding: '5px 10px', borderRadius: '8px', cursor: 'pointer' },
  rowActions: { display: 'flex', alignItems: 'center', gap: '8px' },
  input: { padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.14)', flex: 1, outline: 'none', backgroundColor: 'rgba(255,255,255,0.06)', color: 'white' },
  select: { padding: '8px 10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.18)', outline: 'none', backgroundColor: '#ffffff', color: '#111827', width: '140px' },
  statusCell: { display: 'flex', alignItems: 'center', gap: '10px' },
  statusPill: { display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 800, border: '1px solid transparent', lineHeight: 1 },
  statusPillSuccess: { color: 'rgba(18, 120, 65, 0.98)', backgroundColor: 'rgba(46, 204, 113, 0.18)', borderColor: 'rgba(46, 204, 113, 0.35)' },
  statusPillDanger: { color: 'rgba(145, 34, 26, 0.98)', backgroundColor: 'rgba(231, 76, 60, 0.16)', borderColor: 'rgba(231, 76, 60, 0.35)' },
  statusPillWarning: { color: 'rgba(146, 98, 0, 0.98)', backgroundColor: 'rgba(241, 196, 15, 0.16)', borderColor: 'rgba(241, 196, 15, 0.35)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)' },
  td: { padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.9)' },
  tr: { transition: 'background 0.2s' },

  stack: { display: 'flex', flexDirection: 'column', gap: '14px' },
  sectionTitleRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: 12 },
  sectionTitle: { margin: 0, fontSize: '16px', letterSpacing: '0.2px' },
  mutedBadge: { fontSize: '12px', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.12)', padding: '4px 10px', borderRadius: '999px', backgroundColor: 'rgba(255,255,255,0.05)' },
  emptyState: { padding: '22px', borderRadius: '14px', border: '1px dashed rgba(255,255,255,0.18)', backgroundColor: 'rgba(255,255,255,0.03)', textAlign: 'center' },
  orderList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  orderItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.10)', backgroundColor: 'rgba(0,0,0,0.12)' },
  orderIcon: { width: '40px', height: '40px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(26,188,156,0.14)', border: '1px solid rgba(26,188,156,0.25)', fontSize: '18px' },
  orderTitleRow: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '10px' },
  orderProduct: { fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  orderAmount: { fontWeight: 900, color: 'rgba(26,188,156,0.95)' },
  orderMeta: { marginTop: 4, fontSize: '12px', color: 'rgba(255,255,255,0.70)' },
  notice: { display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 16px', borderRadius: '16px', border: '1px solid rgba(41, 128, 185, 0.30)', backgroundColor: 'rgba(41, 128, 185, 0.12)', color: 'rgba(255,255,255,0.92)' }
  ,
  editPanel: { marginTop: '12px', marginBottom: '14px', padding: '14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.12)', backgroundColor: 'rgba(0,0,0,0.14)' },
  editPanelTitle: { fontWeight: 800, marginBottom: '10px' },
  editFormRow: { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' },
  saveBtn: { backgroundColor: 'rgba(26,188,156,0.90)', color: 'white', border: 'none', padding: '10px 14px', borderRadius: '10px', cursor: 'pointer', fontWeight: 800 },
  cancelBtn: { backgroundColor: 'rgba(255,255,255,0.10)', color: 'white', border: '1px solid rgba(255,255,255,0.14)', padding: '10px 14px', borderRadius: '10px', cursor: 'pointer', fontWeight: 700 }
  ,
  topPanel: { marginBottom: '16px' },
  topPanelTitle: { color: 'rgba(255,255,255,0.92)', fontWeight: 900, marginBottom: 8, letterSpacing: '0.2px' },
  topPanelRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', padding: '14px 16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.12)', backgroundColor: 'rgba(0,0,0,0.16)' },
  topPanelProduct: { fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  topPanelMeta: { marginTop: 4, fontSize: '12px', color: 'rgba(255,255,255,0.78)' },
  topPanelAmount: { color: 'rgba(26,188,156,0.95)', fontWeight: 900 },
  topPanelActions: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  confirmBtn: { backgroundColor: 'rgba(26,188,156,0.92)', color: 'white', border: 'none', padding: '10px 14px', borderRadius: '12px', cursor: 'pointer', fontWeight: 900 },
  successBanner: { display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 16px', borderRadius: '16px', border: '1px solid rgba(46, 204, 113, 0.30)', backgroundColor: 'rgba(46, 204, 113, 0.12)', color: 'rgba(255,255,255,0.92)' },
  errorBanner: { display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 16px', borderRadius: '16px', border: '1px solid rgba(231, 76, 60, 0.30)', backgroundColor: 'rgba(231, 76, 60, 0.10)', color: 'rgba(255,255,255,0.92)' },
  bannerClose: { backgroundColor: 'rgba(255,255,255,0.10)', color: 'white', border: '1px solid rgba(255,255,255,0.14)', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer', fontWeight: 800 },
  inlineLink: { background: 'none', border: 'none', padding: 0, margin: 0, color: 'rgba(255,255,255,0.98)', fontWeight: 900, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px' }
};

export default Dashboard;