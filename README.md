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

Dato importante: Los Pasos con Metodos (Ejemplo: PASO 5 - METODO 1), leer todos los metodos antes de iniciar tal proceso y asi evitar futuros problemas.

### PASO 1 | Requisitos OBLIGATORIOS:
1. Tener instalado [Node](https://nodejs.org/dist/v24.15.0/node-v24.15.0-x64.msi).
2. Tener instalado [Java 21](https://github.com/DiiegooDuoc/SmartLogix).

### PASO 2 | Requisitos generales (obligatorios)
1. Abrir la consola (CMD) en la ubicacion que quieres descargar el archivo
2. Ejecutar el comando "git clone https://github.com/DiiegooDuoc/SmartLogix"
3. Abrir la carpeta `SmartLogix`

### PASO 3 | Iniciar Frontend
1. En la carpeta `frontend`, abrir la consola (CMD) y ejecutar `npm install` y luego `npm start`. Se abrira una web automaticamente en localhost 3000.

De no abrirse automaticamente, dar [clic aqui](http://localhost:3000).

### PASO 4 | Requisito general OBLIGATORIO para accesibilidad con la DB
1. Asegurarse de que el `application.properties` (`backend > auth/inventory/orders > src > main > resources > application.properties`), la linea 6 contenga el espacio vacio (de no tener la base de datos con password), por ejemplo: `spring.datasource.password=`, de tener password, insertarla en la linea, luego del "=", por ejemplo: `spring.datasource.password=system`. Luego de tal, se guardan los cambios en los 3 archivos (de haber modificado la password).

### PASO 5 - METODO 1 | Requisito de la DB - Usando Laragon
1. Si se usa Laragon, iniciar **MySQL 8.4.3** con el puerto 3306 (puerto por defecto).
2. No es necesario crear manualmente las Bases de Datos ya que al ejecutar los archivos **Application.java** se crearan automaticamente.

Opcional: Luego de iniciar **MySQL 8.4.3**, clickear en el boton "Data Base/Base de Datos" (dentro de Laragon) para poder visualizar las Bases de Datos.

### PASO 5 - METODO 2 |  Requisito de la DB - Usando cualquier Entorno de desarrollo local
1. De usar otro entorno de desarrollo local, por ejemplo XAMPP, se tiene que iniciar el servicio MySQL en el puerto 3306 (obligatorio).
2. Crear manualmente las Bases de Datos de cada microservicio: `inventorydb`, `authdb` y `ordersdb`.

### PASO FINAL - METODO 1 | Iniciar Backend - Metodo Visual Studio Code (Vscode)
1. En el apartado "Explorer/Explorador" dentro de Vscode, abrir/arrastrar la carpeta `SmartLogix`.
2. Abrir la carpeta `backend`
3. Iniciar cada archivo .java: Dentro de cada carpeta (`auth`, `bff`, `inventory` y `orders`), ir a `src > main > java > com > smartlogix > store > auth/bff/inventory/orders` (por defecto, al abrir la carpeta java, se ira automaticamente a la ubicacion mencionada, desde src a auth, bff, inventory o orders). Dentro de la carpeta final mencionada habra un archivo con terminacion **Application.java**, por ejemplo: **AuthApplication.java**, este archivo se tiene que abrir y ejecutar (se puede ejecutar con el boton `Run Java`, de la Extension `Test Runner for Java` de Vscode).

### PASO FINAL - METODO 2 | Iniciar Backend - Metodo Consola (CMD)
1. Abrir la carpeta `backend`
2. Abrir las carpetas `auth`, `bff`, `inventory` y `orders`, abrir la consola (CMD) y ejecutar el comando "./mvnw spring-boot:run" (cada carpeta `auth`, `bff`, `inventory` y `orders` tendra su propia consola con la ejecucion del comando mencionado).