# Skill To Money Frontend

Frontend de Skill To Money.

## Setup local

```bash
npm install
cp .env.example .env
npm run dev
```

Frontend local:

```txt
http://localhost:5173
```

## Variables de entorno

```env
VITE_API_URL=http://localhost:8000/api
```

Si quieres usar el backend desplegado, reemplaza esa URL por la del backend en Render.

## Setup con Docker

Este repositorio puede levantarse de forma independiente con Docker.

Construir la imagen:

```bash
docker build -t skill-tomoney-frontend .
```

Levantar el contenedor:

```bash
docker run -p 5173:5173 -e VITE_API_URL=http://localhost:8000/api skill-tomoney-frontend
```

Frontend:

```txt
http://localhost:5173
```

## Docker para desarrollo diario

Si quieres ver cambios sin borrar contenedores ni reconstruir la imagen a cada rato, usa el modo dev:

Primera vez:

```bash
docker compose -f docker-compose.dev.yml up --build
```

Uso diario:

```bash
docker compose -f docker-compose.dev.yml up
```

Detener:

```bash
docker compose -f docker-compose.dev.yml down
```

Con este modo:

- el codigo local se monta dentro del contenedor
- Vite recarga cambios automaticamente
- no necesitas reconstruir por cada cambio de `src`

Solo reconstruye si cambias:

- `package.json`
- `package-lock.json`
- `Dockerfile`

Si cambias dependencias y quieres forzar la instalacion otra vez:

```bash
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml up --build
```

## Nota

Si el backend tambien corre en Docker o local, asegúrate de que `VITE_API_URL` apunte a la URL correcta del backend.
