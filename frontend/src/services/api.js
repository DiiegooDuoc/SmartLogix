const API_BFF = 'http://localhost:8081/api/v1/logistics/dashboard';
const API_INV = 'http://localhost:8080/products';

export const fetchDashboardData = () => fetch(API_BFF).then(res => res.json());

// Función para crear un producto nuevo (POST)
export const addProduct = (product) => {
    return fetch(API_INV, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
    }).then(res => res.json());
};

// Función para borrar (DELETE)
export const deleteProduct = (id) => {
    return fetch(`${API_INV}/${id}`, { method: 'DELETE' });
};