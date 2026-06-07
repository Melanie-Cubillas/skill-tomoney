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

## Nota

Si el backend tambien corre en Docker o local, asegúrate de que `VITE_API_URL` apunte a la URL correcta del backend.
