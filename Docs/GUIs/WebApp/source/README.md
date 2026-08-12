# 💻 Source - WebApp (TraveXperience)

---
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

Aplicación web de **TraveXperience**, una plataforma orientada a experiencias de viaje. Este repositorio contiene el frontend de la aplicación, construido con React, Vite y Tailwind CSS.

## Stack tecnológico

- **React** — Librería principal de UI
- **Vite** — Bundler y servidor de desarrollo
- **Tailwind CSS v4** — Estilos utilitarios y sistema de diseño
- **PostCSS** + `@tailwindcss/postcss` — Procesamiento de CSS

## Requisitos previos

- **Node.js** v18 o superior (recomendado v20+)
- **npm** v9 o superior

Verifica tus versiones con:

```bash
node -v
npm -v
```

## Instalación

```bash
# Clonar el repositorio
git clone <url-del-repo>

# Entrar a la carpeta del frontend
cd frontend

# Instalar dependencias
npm install
```

## Variables de entorno

Crea un archivo `.env.local` en la raíz de `frontend/` con las siguientes variables:

```env
VITE_API_URL=
VITE_GOOGLE_MAPS_KEY=
```

>  No subas el archivo `.env.local` al repositorio. Ya debería estar incluido en `.gitignore`.

---

## Scripts disponibles

| Comando           | Descripción                                  |
|--------------------|-----------------------------------------------|
| `npm run dev`      | Levanta el servidor de desarrollo             |
| `npm run build`    | Genera el build de producción                 |
| `npm run preview`  | Sirve una vista previa del build de producción |
| `npm run lint`     | Ejecuta el linter sobre el código             |

---
## Estructura del proyecto

```
frontend/
├── public/              # Archivos estáticos
├── src/
│   ├── assets/          # Imágenes, íconos, fuentes
│   ├── components/      # Componentes reutilizables de UI
│   ├── pages/           # Vistas/páginas de la aplicación
│   ├── services/        # Llamadas a la API / lógica de negocio
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css        # Estilos globales y configuración de Tailwind
├── postcss.config.cjs
├── vite.config.js
└── package.json
```
---
## Sistema de diseño

El proyecto utiliza variables de tema personalizadas de Tailwind v4, definidas en `src/index.css` dentro del bloque `@theme`. Esto incluye:

- Paleta de colores (`--color-primary`, `--color-secondary`, `--color-error`, etc.)
- Espaciados personalizados (`--spacing-*`)

Antes de agregar nuevos colores o espaciados, revisa si ya existe una variable equivalente en `@theme`.

---
## Convenciones del proyecto

- **Commits:** se recomienda seguir [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, etc.)
- **Componentes:** nombrarlos en PascalCase (`TravelCard.jsx`)
- **Ramas:** trabajar sobre `feature/nombre-feature` y hacer PR hacia `develop`

---
##  Problemas conocidos / Troubleshooting

### Error de PostCSS con Tailwind CSS
Si ves un error como `No se puede usar tailwindcss directamente como plugin de PostCSS`, asegúrate de:

1. Tener instalado `@tailwindcss/postcss` (no solo `tailwindcss`)
2. Que `postcss.config.cjs` use `module.exports` (no `export default`, ya que `.cjs` requiere sintaxis CommonJS)
3. Que no haya versiones duplicadas de Tailwind instaladas:
   ```bash
   npm ls tailwindcss
   ```
   Si aparece más de una versión, actualiza la versión fijada en `package.json` a la v4 y vuelve a correr `npm install`.

## Licencia

Este proyecto es privado y de uso interno para TraveXperience.

## Estructura

```text
source
├── backend
└── frontend
```

---

## Equipo de Desarrollo

| Integrante | Contacto | Rol | Observaciones |
| :--- | :--- | :--- | :---: |
| Angel de Jesus Rufino Mendoza | [@RufinoAngel](https://github.com/RufinoAngel) | Líder del Proyecto y Desarrollador | ✅ Aprobado |
| Karen Lizbeth Negrete Hernández | [@KarenNegrete06](https://github.com/KarenNegrete06) | Lider de Documentación | Sin Revisar ❎ |
| Abril Guzman Barrera | [@Abrilgb](https://github.com/Abrilgb) | Lider de Fronted | Aprobado ✅ |
| Esther Gonzalez Peralta | [@Esther-Gonzalez04](https://github.com/Esther-Gonzalez04) | Líder del Base de datos | Aprobado ✅ |

