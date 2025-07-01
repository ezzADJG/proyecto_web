# JD Adventure Travel - Agencia de Tours

¡Bienvenido a **JD Adventure Travel**!  
Este es un sistema web completo para la gestión y reserva de tours turísticos, desarrollado con Node.js, Express, MySQL y un frontend moderno en HTML, CSS y JavaScript.

---

## 🚀 Características principales

- **Catálogo de tours** con imágenes, descripciones, itinerarios y precios.
- **Panel de administración** para agregar, editar y eliminar tours.
- **Gestión de usuarios** con roles (usuario y administrador).
- **Reservas de tours** para usuarios registrados.
- **Sistema de reseñas** y calificaciones.
- **Carga de imágenes** principal y secundarias para cada tour.
- **Panel de perfil** personalizado para usuarios y administradores.
- **Frontend responsive** y atractivo.

---

## 📦 Estructura del proyecto

```
proyecto_nodejs/
│
├── db/
│   └── connection.js         # Conexión a la base de datos MySQL
│
├── public/
│   ├── css/                  # Estilos CSS
│   ├── img/                  # Imágenes del sitio y tours
│   ├── js/                   # Scripts frontend
│   ├── index.html            # Página principal
│   ├── catalogo.html         # Catálogo de tours
│   ├── admin-agregar-tour.html
│   ├── admin-lista-tours.html
│   ├── perfil.html
│   └── ...                   # Otras páginas
│
├── src/
│   └── routes/
│       └── api.js            # Rutas de la API (tours, usuarios, reservas, etc.)
│
├── .gitignore
├── package.json
└── README.md
```

---

## ⚙️ Instalación y ejecución local

1. **Clona el repositorio:**
   ```
   git clone https://github.com/tuusuario/proyecto_nodejs.git
   cd proyecto_nodejs
   ```

2. **Instala las dependencias:**
   ```
   npm install
   ```

3. **Configura la base de datos:**
   - Crea una base de datos MySQL llamada `turismo_web`.
   - Importa las tablas necesarias según tu modelo (tours, usuarios, reservas, etc.).
   - Ajusta los datos de conexión en `db/connection.js` si es necesario.

4. **Inicia el servidor:**
   ```
   node app.js
   ```
   o si usas nodemon:
   ```
   npx nodemon app.js
   ```

5. **Abre tu navegador en:**
   ```
   http://localhost:3000/
   ```

---

## 📝 Ejemplo de datos para pruebas

**Tour de ejemplo:**
- Nombre: Aventura en Machu Picchu
- Descripción: Explora la maravilla del mundo en un tour guiado de 3 días...
- Precio: 350.00
- Ubicación: Cusco, Perú
- Tipo: Cultural
- Capacidad: 15
- Duración: 3 días y 2 noches
- Qué esperar: Recorre senderos ancestrales y vive la cultura andina.

**Incluye (uno por línea):**
```
Transporte ida y vuelta
Guía profesional
Entradas a Machu Picchu
Desayuno y almuerzo
```

**No incluye (uno por línea):**
```
Cena
Propinas
Bebidas alcohólicas
```

**Itinerario (un día por línea, formato: Día|Título|Contenido):**
```
Día 1|Llegada a Cusco|Recepción en el aeropuerto y traslado al hotel.
Día 2|Tour Valle Sagrado|Visita a Pisac, Ollantaytambo y almuerzo típico.
Día 3|Machu Picchu|Excursión guiada y tiempo libre para explorar.
```

---

## 👤 Roles de usuario

- **Administrador:** Puede agregar, editar y eliminar tours, ver reservas y gestionar usuarios.
- **Usuario:** Puede ver tours, reservar y dejar reseñas.

---

## 📄 Licencia

Este proyecto es solo para fines educativos y de demostración.

---

¿Dudas o sugerencias?  
¡Crea un issue o contacta al
