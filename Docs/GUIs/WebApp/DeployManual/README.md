# Manual de Despliegue — TraveXperience WebApp

Este documento describe cómo desplegar la aplicación web **TraveXperience** (frontend en React + backend en JavaScript/Node.js). Como el hosting definitivo **aún no está decidido**, se cubren las opciones más comunes.

## 1. Requisitos previos

- Repositorio con acceso para el equipo de despliegue.
- Node.js LTS instalado en la máquina/servidor de despliegue.
- Variables de entorno de producción definidas (ver sección 2).
- Base de datos accesible desde el backend en producción.

## 2. Variables de entorno de producción

Definir (ajustando nombres según la implementación real del backend):

```
# Backend
PORT=4000
DATABASE_URL=<cadena de conexión de producción>
JWT_SECRET=<clave secreta robusta, distinta a la de desarrollo>
NODE_ENV=production

# Frontend
VITE_API_URL=https://api.travexperience.com          # si usan Vite
REACT_APP_API_URL=https://api.travexperience.com      # si usan CRA
```

## 3. Despliegue del Frontend (elige una opción)

### Opción A — Vercel
1. Conectar el repositorio en [vercel.com](https://vercel.com).
2. Configurar:
   - **Root directory:** `frontend`
   - **Build command:** `npm run build`
   - **Output directory:** `dist` (Vite) o `build` (CRA)
3. Agregar las variables de entorno de producción en el dashboard de Vercel.
4. Desplegar (Vercel lo hace automáticamente en cada push a la rama principal, si se configura así).

### Opción B — Netlify
1. Conectar el repositorio en [netlify.com](https://netlify.com).
2. Configurar:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist` (Vite) o `frontend/build` (CRA)
3. Agregar variables de entorno en Site Settings → Environment Variables.

### Opción C — Servidor propio / VPS
1. Generar el build de producción:
   ```bash
   cd frontend
   npm run build
   ```
2. Servir la carpeta resultante (`dist/` o `build/`) con un servidor de archivos estáticos, por ejemplo Nginx:
   ```nginx
   server {
     listen 80;
     server_name travexperience.com;
     root /var/www/travexperience/frontend/dist;
     index index.html;
     location / {
       try_files $uri /index.html;
     }
   }
   ```
3. Configurar HTTPS (por ejemplo con Certbot/Let's Encrypt).

## 4. Despliegue del Backend

### Opción A — Servicio administrado (Railway, Render, Fly.io, etc.)
1. Conectar el repositorio, apuntando al directorio `backend`.
2. Configurar el comando de inicio: `npm start`.
3. Agregar las variables de entorno de producción.
4. Configurar la base de datos (puede ser un addon del mismo proveedor o una instancia externa).

### Opción B — Servidor propio / VPS
1. Clonar el repositorio en el servidor.
2. Instalar dependencias:
   ```bash
   cd backend
   npm install --production
   ```
3. Usar un gestor de procesos para mantenerlo corriendo, por ejemplo **PM2**:
   ```bash
   npm install -g pm2
   pm2 start npm --name travexperience-backend -- start
   pm2 save
   pm2 startup
   ```
4. Configurar un proxy inverso (Nginx) hacia el puerto del backend, con HTTPS.

## 5. Conexión Frontend ↔ Backend en producción

Asegurarse de que la variable `VITE_API_URL` / `REACT_APP_API_URL` del frontend apunte a la URL pública real del backend desplegado, y que el backend tenga configurado **CORS** para aceptar peticiones desde el dominio del frontend.

## 6. Checklist antes de cada despliegue

- [ ] Variables de entorno de producción configuradas (no las de desarrollo).
- [ ] Base de datos de producción accesible y con las migraciones/esquema al día.
- [ ] CORS del backend permite el dominio del frontend en producción.
- [ ] Se probaron los flujos críticos: registro, login, reserva y pago, antes de publicar.
- [ ] Certificado HTTPS válido en ambos dominios (frontend y backend).
- [ ] Se hizo respaldo de la base de datos antes de aplicar cambios grandes.

## 7. Rollback

- **Frontend en Vercel/Netlify:** ambos permiten volver a un deploy anterior con un clic desde su dashboard.
- **Frontend en servidor propio:** mantener el build anterior en una carpeta de respaldo (`dist_backup/`) para poder restaurarlo rápido.
- **Backend con PM2:** volver a la versión anterior del código (`git checkout <commit-anterior>`) y ejecutar `pm2 restart travexperience-backend`.

## 8. Pendiente de decidir con el equipo

- Proveedor de hosting definitivo (Vercel/Netlify/VPS) para frontend y backend.
- Si el frontend usa Vite o Create React App (afecta los nombres exactos de las variables de entorno y las carpetas de salida).
- Proveedor de base de datos en producción.

---

## Equipo de Desarrollo

| Integrante | Contacto | Rol | Observaciones |
| :--- | :--- | :--- | :---: |
| Angel de Jesus Rufino Mendoza | [@RufinoAngel](https://github.com/RufinoAngel) | Líder del Proyecto y Desarrollador | ✅ Aprobado |
| Karen Lizbeth Negrete Hernández | [@KarenNegrete06](https://github.com/KarenNegrete06) | Lider de Documentación | Sin Revisar ❎ |
| Abril Guzman Barrera | [@Abrilgb](https://github.com/Abrilgb) | Lider de Fronted | Aprobado ✅ |
| Esther Gonzalez Peralta | [@Esther-Gonzalez04](https://github.com/Esther-Gonzalez04) | Líder del Base de datos | Aprobado ✅ |

