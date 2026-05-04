# SmartLogix - Gestión de Logística con Microservicios

Este proyecto implementa una arquitectura basada en microservicios para el control de inventario y pedidos.

## Componentes y Puertos
- **Inventory MS:** http://localhost:8080/products
- **Orders MS:** http://localhost:8082/orders
- **BFF (Orquestador):** http://localhost:8081/api/v1/logistics/dashboard
- **Frontend (React):** http://localhost:3000

## Requisitos
- Java 17+
- Node.js (para el frontend)
- Maven

## Cómo ejecutar
1. Iniciar los 3 servicios de Java (carpeta de backend) Inventory, Orders y BFF (ejecutar con el boton de play en el mismo vscode o en consola colocar "./mvnw spring-boot:run" dentro de cada carpeta de los 3 servicios (mejor opcion por vscode)).
2. En la carpeta `frontend`, ejecutar `npm install` y luego `npm start`.