# TFG_EPSU2378_Public

## Estructura de Carpetas

### Carpeta `Database`

- **Contenido:**
  - Modelo conceptual de la base de datos del sistema.
  - Backup con algunos datos de la base de datos.
  - Código para crear la base de datos en un motor MySQL.
  - Código SQL necesario para la lógica de la aplicación (Triggers en MySQL).

### Carpeta `APP`

- **Contenido:**
  - Capa de datos.
  - Capa de blockchain.
  - Interfaz de usuario.

### Carpeta `node`

- **Contenido:**
  - API REST escrita en Node.js que permite la interacción de la interfaz con la capa de datos.
  - Archivo `database.js` dentro de la subcarpeta `database`, que contiene los parámetros de configuración para conectar la API REST con la base de datos.

### Carpeta `route`

- **Contenido:**
  - Endpoints que permiten recibir conexiones desde la interfaz y atacar al controlador correspondiente.

### Configuración y Modificaciones Necesarias

#### Carpeta `node`

- **Archivo a Modificar:**
  - `index.js` dentro de la subcarpeta `config`.
- **Acciones:**
  - Crear un archivo `.env` y definir los valores necesarios:
    - Parámetros de conexión de la base de datos.
    - Nombre de la base de datos.
    - Nombre de usuario.
    - Contraseña.
    - Clave privada del servidor para firmar los tokens JWT.
  - El archivo `index.js` se encargará de leer estos valores para configurar el servidor Node.js.

### Carpeta `DApp`

- **Contenido:**
  - Capa de blockchain.
  - Interfaz de la aplicación.

#### Subcarpeta `src`

- **Contenido:**
  - **Subcarpeta `frontend`:**
    - Interfaz escrita en React.
    - **Archivo a Modificar:**
      - `App.js`.
    - **Acciones:**
      - Modificar el parámetro `URI` por la URL donde se encuentre la API REST desplegada. Si es `localhost`, no es necesario modificarlo.
  - **Subcarpeta `backend`:**
    - Contratos inteligentes del sistema.
    - Scripts de despliegue (`deploy.js`), simulación de lectores inteligentes (`reportEnergy.js`), y eliminación de usuario (`deleteUser.js`).
    - **Nota:**
      - No es necesario realizar modificaciones en esta carpeta.

#### Configuración de Blockchain

- **Archivo a Modificar:**
  - `hardhat.config.js`.
- **Acciones:**
  - Modificar la configuración en la sección de `networks` para desplegar la capa de blockchain en otra red si es necesario.

### Pasos para Desplegar el Sistema

### 1. Install Dependencies:

$ npm install

### 2. Arranque de la Blockchain de desarrollo local

$ npx hardhat node

### 3. Conectar las cuentas del blockchain de desarrollo a Metamask

- Copiar la clave privada de las direcciones e importarla a Metamask
- Conecta tu metamask al hardhat blockchain, 127.0.0.1:8545.

### 4. Migrar los Smart Contracts

npx hardhat run src/backend/scripts/deploy.js --network ganache

### 5. Levantar la Api rest

npx nodemon app.js

### 6. Lanzar el Frontend

$ npm run start
