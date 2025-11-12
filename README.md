# Frontend - Sistema de Gestión de Productos y Órdenes# Fronted



Frontend desarrollado en Angular 18+ con componentes standalone, TypeScript strict mode, y Tailwind CSS.This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.1.8.



## 🚀 Características## Development server



- ✅ **Autenticación JWT** - Login/Register con tokens de acceso y refrescoTo start a local development server, run:

- ✅ **Gestión de Productos** - Listado, detalle, filtros y búsqueda

- ✅ **Carrito de Compras** - Agregar/eliminar productos, calcular totales```bash

- ✅ **Órdenes de Pedido** - Crear órdenes, ver historialng serve

- ✅ **Panel de Administración** - Gestionar órdenes (aprobar/rechazar)```

- ✅ **Guards de Rutas** - Protección de rutas auth y admin

- ✅ **HTTP Interceptor** - Manejo automático de tokens JWTOnce the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

- ✅ **Endpoints Públicos** - GET requests sin autenticación

## Code scaffolding

## 📋 Requisitos Previos

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

- Node.js v18+ y npm

- Angular CLI (`npm install -g @angular/cli`)```bash

- Backend API corriendo en `http://localhost:3000`ng generate component component-name

```

## ⚙️ Configuración

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

### 1. Variables de Entorno

```bash

El proyecto usa un archivo `.env` para la configuración. Ya está creado con valores por defecto:ng generate --help

```

```env

PORT=4200## Building

API_URL=http://localhost:3000

API_BASE_URL=http://localhost:3000/apiTo build the project run:

GRAPHQL_URL=http://localhost:3000/graphql

NODE_ENV=development```bash

```ng build

```

**Nota:** Para producción, actualiza `src/environments/environment.prod.ts` con las URLs correctas.

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

### 2. Instalación de Dependencias

## Running unit tests

```bash

npm installTo execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```

```bash

## 🏃 Ejecutar el Proyectong test

```

### Modo Desarrollo

## Running end-to-end tests

```bash

npm startFor end-to-end (e2e) testing, run:

# o

ng serve```bash

```ng e2e

```

La aplicación estará disponible en `http://localhost:4200`

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

### Build de Producción

## Additional Resources

```bash

ng build --configuration productionFor more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

```

Los archivos generados estarán en `dist/fronted/`

## 📁 Estructura del Proyecto

```
fronted/
├── src/
│   ├── app/
│   │   ├── components/          # Componentes reutilizables
│   │   │   └── navbar/          # Barra de navegación
│   │   ├── pages/               # Páginas/Vistas principales
│   │   │   ├── home/            # Landing page
│   │   │   ├── login/           # Inicio de sesión
│   │   │   ├── register/        # Registro de usuarios
│   │   │   ├── productos/       # Listado de productos
│   │   │   ├── producto-detalle/ # Detalle de producto
│   │   │   ├── carrito/         # Carrito de compras
│   │   │   └── admin-ordenes/   # Panel admin de órdenes
│   │   ├── services/            # Servicios API
│   │   │   ├── auth.service.ts
│   │   │   ├── producto.service.ts
│   │   │   ├── orden.service.ts
│   │   │   └── carrito.service.ts
│   │   ├── guards/              # Route Guards
│   │   │   ├── auth.guard.ts
│   │   │   └── admin.guard.ts
│   │   ├── interceptors/        # HTTP Interceptors
│   │   │   └── auth.interceptor.ts
│   │   ├── models/              # Interfaces TypeScript
│   │   │   ├── usuario.interface.ts
│   │   │   ├── producto.interface.ts
│   │   │   ├── orden.interface.ts
│   │   │   └── carrito.interface.ts
│   │   ├── app.config.ts        # Configuración global
│   │   ├── app.routes.ts        # Definición de rutas
│   │   └── app.component.ts
│   ├── environments/            # Variables de entorno
│   │   ├── environment.ts       # Desarrollo
│   │   └── environment.prod.ts  # Producción
│   ├── index.html
│   ├── main.ts
│   └── styles.css               # Estilos globales + Tailwind
├── .env                         # Variables de entorno
├── angular.json
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## 🔐 Autenticación y Autorización

### Flujo de Autenticación

1. **Login/Register**: El usuario ingresa credenciales
2. **Tokens JWT**: El backend devuelve `accessToken` (15 min) y `refreshToken` (7 días)
3. **LocalStorage**: Los tokens se almacenan en el navegador
4. **Interceptor**: Automáticamente agrega el Bearer token a requests protegidos
5. **Endpoints Públicos**: GET requests a `/api/productos` y `/api/ordenes` NO envían token

### Guards de Rutas

- `authGuard`: Protege rutas que requieren autenticación
- `adminGuard`: Protege rutas exclusivas para administradores

### Roles de Usuario

- `USER`: Usuario normal (puede ver productos, crear órdenes)
- `ADMIN`: Administrador (puede gestionar órdenes)
- `MANAGER`: Gerente (permisos adicionales)

## 🌐 Endpoints Públicos vs Protegidos

### 📖 Endpoints Públicos (Sin Autenticación)

Estos endpoints **NO requieren** token JWT y pueden ser accedidos sin iniciar sesión:

**Productos:**
- `GET /api/productos` - Listar todos los productos
- `GET /api/productos/:id` - Ver detalle de producto
- `GET /api/productos/disponibles` - Productos en stock

**Órdenes:**
- `GET /api/ordenes` - Listar todas las órdenes (solo ver)
- `GET /api/ordenes/:id` - Ver detalle de orden
- `GET /api/ordenes/estadisticas` - Estadísticas de órdenes

### 🔒 Endpoints Protegidos (Requieren Autenticación)

**Productos (Solo Admin/Manager):**
- `POST /api/productos` - Crear producto
- `PUT /api/productos/:id` - Actualizar producto
- `DELETE /api/productos/:id` - Eliminar producto

**Órdenes (Usuarios Autenticados):**
- `POST /api/ordenes` - Crear orden (requiere token)
- `PATCH /api/ordenes/:id/estado` - Cambiar estado (Admin)
- `DELETE /api/ordenes/:id` - Cancelar orden (Admin)

## 🎨 Diseño y UX

- **Framework CSS**: Tailwind CSS
- **Estilo**: Minimalista, simple y elegante
- **Responsive**: Diseño adaptable a móviles, tablets y desktop
- **Componentes**: Angular standalone components
- **Control Flow**: Nueva sintaxis `@if`, `@for`, `@else` de Angular 18

## 🛠️ Servicios Principales

### AuthService
Maneja autenticación, login, registro y gestión de tokens.

```typescript
login(credentials: LoginRequest): Observable<AuthResponse>
register(data: RegisterRequest): Observable<AuthResponse>
logout(): void
getCurrentUser(): Usuario | null
isAuthenticated(): boolean
```

### ProductoService
CRUD de productos. Los GET son públicos.

```typescript
getProductos(filtros?): Observable<Producto[]>  // PÚBLICO
getProductoById(id): Observable<Producto>       // PÚBLICO
crearProducto(producto): Observable<Producto>   // PROTEGIDO (Admin)
actualizarProducto(id, producto): Observable<Producto> // PROTEGIDO
eliminarProducto(id): Observable<void>          // PROTEGIDO
```

### OrdenService
Gestión de órdenes. Los GET son públicos, POST/PATCH protegidos.

```typescript
getOrdenes(filtros?): Observable<Orden[]>       // PÚBLICO
getOrdenById(id): Observable<Orden>             // PÚBLICO
crearOrden(orden): Observable<Orden>            // PROTEGIDO (User)
actualizarEstado(id, estado): Observable<Orden> // PROTEGIDO (Admin)
getEstadisticas(): Observable<any>              // PÚBLICO
```

### CarritoService
Manejo del carrito de compras en localStorage (no hace llamadas API).

```typescript
agregarProducto(producto, cantidad): void
eliminarProducto(productoId): void
actualizarCantidad(productoId, cantidad): void
limpiarCarrito(): void
getTotal(): number
getCantidadTotal(): number
```

## 🔄 HTTP Interceptor Inteligente

El `auth.interceptor.ts` maneja automáticamente:

1. **Agregar Bearer Token** a todas las peticiones (excepto públicas)
2. **Endpoints Públicos**: No envía token en GET a `/api/productos` y `/api/ordenes`
3. **Manejo de Errores 401**: Redirige al login si el token expira
4. **Refresh Token**: (Implementable) Renovar token automáticamente

```typescript
// Ejemplo de lógica del interceptor
const isPublicGet = req.method === 'GET' && 
  publicGetEndpoints.some(endpoint => req.url.includes(endpoint));

if (token && !isPublicGet) {
  req = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });
}
```

## 📊 Estado de la Aplicación

- **Usuario**: Manejado con `BehaviorSubject` en `AuthService`
- **Carrito**: Manejado con `BehaviorSubject` en `CarritoService`
- **Persistencia**: Tokens y carrito en `localStorage`

## 🧪 Testing

```bash
# Tests unitarios
ng test

# Tests e2e
ng e2e
```

## 📦 Build & Deploy

### Build de Producción

```bash
ng build --configuration production --base-href=/
```

### Variables de Producción

Actualiza `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://tu-api.com',
  apiBaseUrl: 'https://tu-api.com/api',
  graphqlUrl: 'https://tu-api.com/graphql'
};
```

### Deploy en Servidor

Los archivos en `dist/fronted/` pueden ser servidos por:
- Nginx
- Apache
- Vercel
- Netlify
- Firebase Hosting

## 🐛 Troubleshooting

### El frontend no conecta con el backend

1. Verifica que el backend esté corriendo en `http://localhost:3000`
2. Revisa el archivo `.env` y confirma las URLs
3. Verifica CORS en el backend

### Tokens no se envían

1. Verifica que el token esté en localStorage (`accessToken`)
2. Revisa el interceptor en DevTools > Network > Headers
3. Confirma que la ruta no sea un endpoint público GET

### Errores de compilación

```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install

# Limpiar caché de Angular
ng cache clean
```

## 📝 Notas Importantes

1. **Seguridad**: Nunca commitear el `.env` con tokens reales en producción
2. **CORS**: El backend debe permitir requests desde `http://localhost:4200`
3. **Tokens**: Los tokens JWT expiran. Implementar refresh token si es necesario
4. **Environment**: Usar `environment.ts` (dev) vs `environment.prod.ts` (prod)

## 🔗 Enlaces Útiles

- [Angular Docs](https://angular.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [RxJS](https://rxjs.dev/)
- Backend API Docs: http://localhost:3000/api-docs

## 👨‍💻 Desarrollo

Desarrollado como proyecto final de Maestría en Software - Patrones de Diseño de APIs.

---

**Versión generada con Angular CLI 19.1.8**
