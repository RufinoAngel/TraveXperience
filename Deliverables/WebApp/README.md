# Manual de Usuario — TraveXperience WebApp

Guía de uso de la plataforma web **TraveXperience**, para descubrir, planear y reservar tu viaje a Xicotepec de Juárez, Puebla — e igualmente para el equipo que administra la plataforma.

---

# Parte 1 — Sitio de Usuario

## 1. Página de inicio (Landing)

Al entrar sin haber iniciado sesión verás la página principal, con:
- Presentación de la plataforma y sus 3 pilares: **Descubrimiento Inteligente**, **Itinerarios Colaborativos** y **Billetera Inteligente**.
- Sección "La Experiencia" explicando el mapa interactivo.
- Estadísticas de la comunidad y destinos destacados.
- Botones **"Comienza tu Viaje"** (registro) y **"Ver Demo"**.

## 2. Crear una cuenta

1. Toca **"Comienza tu Viaje"** o **"Comienza Gratis"**.
2. Elige tu perfil: **Usuario** (para planear y descubrir) o **Administrador** (para gestionar la plataforma).
3. Completa tu nombre completo, correo electrónico y contraseña.
   - Si eliges **Usuario**: la contraseña debe tener mínimo 8 caracteres, con al menos una letra y un número.
   - Si eliges **Administrador**: la contraseña debe tener mínimo 10 caracteres, incluyendo mayúscula, minúscula, número y carácter especial.
4. Toca **"Crear Cuenta"**.

## 3. Iniciar sesión

Ingresa tu correo y contraseña. Puedes mostrar/ocultar la contraseña con el ícono del ojo. Si olvidaste tu contraseña, toca **"¿La olvidaste?"**.

## 4. Recuperar contraseña

1. Ingresa tu correo electrónico registrado.
2. Toca **"Enviar enlace de recuperación"**.
3. Revisa tu bandeja de entrada (el enlace expira en 60 minutos). Si no llega, revisa spam o intenta con otro correo.

## 5. Descubrir (Inicio)

La pantalla principal tras iniciar sesión muestra:
- Un mapa de fondo con **pines por categoría** (Restaurantes, Museos, Entretenimiento, Eventos).
- Filtros rápidos arriba para explorar solo una categoría.
- Tarjetas horizontales con cada lugar: distancia, calificación, reseñas y etiquetas.
- Botón de **favorito (❤️)** en cada tarjeta.
- Al tocar un pin del mapa, la tarjeta correspondiente se resalta automáticamente.
- Botón **"Recentrar Mapa"** flotante.

## 6. Mapa interactivo

Vista de mapa completo (Leaflet/OpenStreetMap) con marcadores de colores por categoría (comida, cultura, vida nocturna, miradores). Toca cualquier marcador para ver su información y acceder al detalle completo del lugar.

## 7. Detalle de un lugar / hotel

Al tocar "Ver más" en cualquier tarjeta o pin:
- Verás fotos, descripción, servicios y ubicación.
- Puedes **guardar** o **compartir** el lugar.
- Si es un hotel, selecciona: tipo de habitación, número de noches y huéspedes — el precio total se calcula automáticamente.
- Botón **"Reservar"** te lleva al pago (Checkout).

## 8. Confirmar y pagar (Checkout)

1. Elige tu método de pago: una tarjeta ya guardada o **agregar una nueva**.
2. Si agregas una tarjeta nueva, se valida en tiempo real: número de tarjeta (con verificación real tipo Luhn), fecha de expiración (formato MM/AA, no debe estar vencida) y CVC (3 o 4 dígitos).
3. Revisa el resumen de tu reserva.
4. Confirma el pago.

## 9. Confirmación de pago

Pantalla de éxito con animación, que muestra:
- Destino y fechas de tu reserva.
- Número de referencia (puedes tocarlo para copiarlo).
- Monto total pagado y método usado.
- Sugerencias de "¿Qué sigue?" y un tip de viaje.
- Botones: **Ver Itinerario**, **Descargar Recibo**, **Volver al Inicio**.

## 10. Itinerario

- Grid de destinos destacados con filtros por etiqueta (#Naturaleza, #Cultura, #Aventura, #Café, #Sierra).
- Vista de **itinerario por días**, con cada actividad organizada cronológicamente (traslados, comidas, hospedaje, etc.), clasificada por categoría con colores distintos.

## 11. Favoritos ("Mis Guardados")

Lista de tus lugares guardados con foto, calificación y descripción. Desde aquí puedes:
- Quitar un lugar de favoritos (ícono de corazón).
- Ver detalles del lugar.
- Enviarlo directo a "Planificar viaje" (Itinerario).

## 12. Notificaciones

- Historial de alertas: reservas confirmadas, invitaciones a colaborar en un itinerario, gastos registrados por compañeros de viaje, etc.
- Puedes marcar todas como leídas o eliminar una notificación individual.
- Panel de **canales de alerta**: activa/desactiva notificaciones por Correo, Push y SMS por separado.

## 13. Mi Perfil

Edita tu información: nombre completo, correo, teléfono, ubicación base y una biografía (máximo 300 caracteres, con contador visible). Se valida el formato de correo y teléfono antes de guardar.

## 14. Privacidad y cuenta

Desde el apartado de privacidad puedes:
- Activar/desactivar tu **perfil privado de viajero**.
- **Cambiar tu contraseña** (se valida que la nueva sea distinta a la actual y cumpla el formato exigido).
- Ver tus **servicios conectados** (cuentas vinculadas).

## 15. Seguridad

- **Controles de privacidad:** análisis de viajes personalizado, preferencias de marketing, cookies y seguimiento de sesión.
- **Autenticación de Dos Factores (2FA):** actívala ingresando tu teléfono y el código de verificación de 6 dígitos que te llega.
- **Sesiones activas:** revisa desde qué dispositivos tienes sesión iniciada y cierra las que no reconozcas.
- **Gestión de datos:** descarga una copia de tus datos, o solicita **eliminar tu cuenta** (requiere escribir la palabra de confirmación).

## 16. Pagos y facturación

- **Métodos de pago guardados:** consulta tus tarjetas, agrega una nueva (validada con número real, fecha y CVC) o elimina una existente (con confirmación).
- **Historial de transacciones:** revisa tus pagos anteriores; puedes eliminar una transacción del historial si es necesario.

## 17. Página no encontrada (404)

Si sigues un enlace roto o una ruta que ya no existe, verás una pantalla de "Destino Fuera del Mapa" con accesos directos para volver a explorar o regresar.

---

# Parte 2 — Panel de Administrador

Disponible solo para cuentas registradas con el rol **Administrador**.

## 18. Dashboard

Vista general de la operación:
- Tarjetas de métricas: usuarios activos, ingresos totales, reservas y satisfacción.
- Gráfico de tendencia de reservas, con selector de rango (7 días, 30 días, 90 días, 1 año).
- Destinos más populares con su porcentaje de demanda.
- Alertas del sistema (por ejemplo, latencia de un proveedor externo o respaldo pendiente).
- Actividad reciente de la plataforma.

## 19. Inventario de servicios

Tabla con todos los servicios registrados (hoteles, experiencias, transporte):
- Filtros por categoría, ubicación y estado (Aprobado / Pendiente / Marcado).
- Barra de disponibilidad por servicio.
- Exportar el listado.
- Botón flotante para agregar un nuevo servicio.

## 20. Registrar un nuevo hotel

Formulario con: nombre, categoría (estrellas), precio base por noche, dirección completa, servicios/amenidades (selección múltiple), tipos de habitación (se pueden agregar dinámicamente), galería de imágenes y vista previa en mapa.

## 21. Registrar una nueva opción de transporte

Formulario con: información básica del servicio, horarios y frecuencia, vista previa de la ruta, capacidad y disponibilidad, y niveles de precios.

## 22. Pagos (panel administrativo)

- Resumen financiero: total gastado, presupuesto usado, ahorros recientes y gastos por categoría.
- Métodos de pago de la plataforma e historial de transacciones.
- Acciones: **Transferir Fondos** y **Disputar un Pago**, cada una con su propio formulario validado.

## 23. Mi perfil (administrador)

Igual que el perfil de usuario, pero además muestra tu **rol** (no editable, solo un super administrador puede cambiarlo) y exige una contraseña más estricta al actualizarla (mínimo 10 caracteres, con mayúscula, minúscula, número y carácter especial).

## 24. Configuraciones del sistema

Ajustes generales de la plataforma:
- Nombre de la plataforma, correo de soporte, moneda e idioma predeterminados.
- Comisión por reserva (%) y ventana de reembolso (horas).
- Aprobación automática de nuevos socios (activar/desactivar).
- Notificaciones del sistema (correo, SMS).
- Seguridad: exigir 2FA a todos los administradores, y **Modo Mantenimiento** para bloquear el acceso público mientras se hacen cambios.

## 25. Notificaciones (administrador)

Historial de alertas del sistema (errores, nuevos socios, reservas, cambios de política), con filtro de "No leídas" y panel de preferencias para elegir qué tipos de notificación recibir.

---

## Preguntas frecuentes

**¿Cuál es la diferencia entre una cuenta de Usuario y de Administrador?**
Los usuarios planean y reservan sus propios viajes. Los administradores gestionan el catálogo de servicios, pagos de la plataforma y configuración general — no están pensados para viajeros individuales.

**¿Mis datos de tarjeta se guardan de forma segura?**
El número de tarjeta se valida con el algoritmo estándar (Luhn) antes de guardarse, y solo se muestra parcialmente en la interfaz. Consulta con el equipo técnico los detalles de cifrado del backend.

**¿Puedo cambiar mi rol de Usuario a Administrador?**
No desde tu perfil — el rol de administrador debe ser asignado por otro super administrador de la plataforma.

---

## Equipo de Desarrollo

| Integrante | Contacto | Rol | Observaciones |
| :--- | :--- | :--- | :---: |
| Angel de Jesus Rufino Mendoza | [@RufinoAngel](https://github.com/RufinoAngel) | Líder del Proyecto y Desarrollador | ✅ Aprobado |
| Karen Lizbeth Negrete Hernández | [@KarenNegrete06](https://github.com/KarenNegrete06) | Lider de Documentación | Sin Revisar ❎|
| Abril Guzman Barrera | [@Abrilgb](https://github.com/Abrilgb) | Lider de Fronted | Aprobado ✅ |
| Esther Gonzalez Peralta | [@Esther-Gonzalez04](https://github.com/Esther-Gonzalez04) | Líder del Base de datos | Aprobado ✅|

