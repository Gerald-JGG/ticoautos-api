# TicoAutos API

Backend REST API para la plataforma TicoAutos — publicación y consulta de automóviles en venta.

**Stack:** NestJS · MongoDB · Mongoose · JWT · Passport

---

## Requisitos

- Node.js >= 18
- MongoDB (local o Atlas)
- npm

---

## Instalación

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd ticonautos-api

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# 4. Iniciar en modo desarrollo
npm run start:dev
```

El servidor corre en `http://localhost:3001/api`

---

## Variables de entorno

```env
MONGODB_URI=mongodb://localhost:27017/ticonautos
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
PORT=3001
FRONTEND_URL=http://localhost:3000
```

---

## Endpoints

### Auth (Público)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/auth/register` | Registro de usuario |
| `POST` | `/api/auth/login` | Login, retorna JWT |

**Register body:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@email.com",
  "password": "123456",
  "phone": "88888888"
}
```

**Login body:**
```json
{
  "email": "juan@email.com",
  "password": "123456"
}
```

---

### Vehículos (Público)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/vehicles` | Listar con filtros y paginación |
| `GET` | `/api/vehicles/:id` | Ver detalle de vehículo |

**Filtros disponibles (query params):**
```
GET /api/vehicles?brand=Toyota&model=Corolla&minYear=2015&maxYear=2022&minPrice=5000&maxPrice=15000&status=available&search=automatico&page=1&limit=10
```

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `brand` | string | Marca (parcial, case-insensitive) |
| `model` | string | Modelo (parcial, case-insensitive) |
| `minYear` | number | Año mínimo |
| `maxYear` | number | Año máximo |
| `minPrice` | number | Precio mínimo |
| `maxPrice` | number | Precio máximo |
| `status` | `available` \| `sold` | Estado del vehículo |
| `search` | string | Búsqueda de texto libre |
| `page` | number | Página actual (default: 1) |
| `limit` | number | Resultados por página (default: 10, max: 50) |

**Respuesta paginada:**
```json
{
  "data": [...],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### Vehículos (Autenticado — requiere `Authorization: Bearer <token>`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/vehicles/my` | Mis vehículos publicados |
| `POST` | `/api/vehicles` | Crear publicación |
| `PUT` | `/api/vehicles/:id` | Editar vehículo (solo dueño) |
| `PATCH` | `/api/vehicles/:id/sold` | Marcar como vendido (solo dueño) |
| `DELETE` | `/api/vehicles/:id` | Eliminar vehículo (solo dueño) |

**Create/Update body:**
```json
{
  "brand": "Toyota",
  "model": "Corolla",
  "year": 2020,
  "price": 12000,
  "description": "Excelente estado, único dueño...",
  "mileage": 45000,
  "color": "Blanco",
  "transmission": "Automático",
  "fuel": "Gasolina",
  "images": ["https://url-imagen.com/foto1.jpg"]
}
```

---

### Preguntas

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/api/vehicles/:id/questions` | No | Ver preguntas de un vehículo |
| `POST` | `/api/vehicles/:id/questions` | Sí | Hacer una pregunta |
| `GET` | `/api/questions/my` | Sí | Mis preguntas realizadas |
| `GET` | `/api/questions/inbox` | Sí | Preguntas recibidas en mis vehículos |

**Reglas:**
- Solo usuarios autenticados pueden preguntar
- Las preguntas no se pueden modificar una vez enviadas
- Se registra fecha de pregunta y usuario que pregunta

---

### Respuestas

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/api/questions/:id/answer` | No | Ver respuesta de una pregunta |
| `POST` | `/api/questions/:id/answer` | Sí | Responder (solo dueño del vehículo) |

**Reglas:**
- Solo el dueño del vehículo puede responder
- Cada pregunta tiene máximo una respuesta
- Se registra fecha de respuesta y usuario que responde

---

## Arquitectura REST

El API sigue las restricciones REST:

- **Interfaz uniforme:** Recursos identificados por URIs, uso correcto de métodos HTTP (GET, POST, PUT, PATCH, DELETE) y códigos de estado.
- **Sin estado (Stateless):** Cada request contiene toda la información necesaria. La autenticación se maneja con JWT en el header.
- **Capas:** El cliente no sabe qué hay detrás del servidor.
- **Filtrado en backend:** Todo el filtrado y paginación ocurre en el servidor, nunca en el cliente.

---

## Modelo de entidades

```
User
 ├── _id, name, email, password, phone
 └── timestamps (createdAt, updatedAt)

Vehicle
 ├── _id, brand, model, year, price, description
 ├── status (available | sold), mileage, color
 ├── transmission, fuel, images[]
 ├── owner → User
 └── timestamps

Question
 ├── _id, content
 ├── vehicle → Vehicle
 ├── askedBy → User
 └── timestamps (createdAt = fecha de pregunta)

Answer
 ├── _id, content
 ├── question → Question (unique)
 ├── answeredBy → User
 └── timestamps (createdAt = fecha de respuesta)
```
