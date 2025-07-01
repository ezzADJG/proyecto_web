const express = require("express");
const router = express.Router();
const db = require("../../db/connection");
const fs = require("fs");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Usa nombre limpio o id temporal (por ejemplo, nombre del tour)
    const nombreTour = req.body.nombre.replace(/\s+/g, "_").toLowerCase();
    const dir = `public/img/tours/${nombreTour}`;
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    if (file.fieldname === "imagen_principal") {
      cb(null, "principal" + path.extname(file.originalname));
    } else {
      if (!req._imgSec) req._imgSec = 1;
      cb(null, `image${req._imgSec++}${path.extname(file.originalname)}`);
    }
  },
});
const upload = multer({ storage });

// Registro
router.post("/register", async (req, res) => {
  const { nombre, email, password } = req.body;
  const [exist] = await db.execute("SELECT * FROM usuarios WHERE email=?", [
    email,
  ]);
  if (exist.length) return res.json({ error: "Correo ya registrado" });

  await db.execute(
    'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, "usuario")',
    [nombre, email, password]
  );
  res.json({ mensaje: "Usuario registrado" });
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const [u] = await db.execute(
    "SELECT id, nombre, email, rol FROM usuarios WHERE email=? AND password=?",
    [email, password]
  );
  if (!u.length) return res.json({ error: "Credenciales inválidas" });
  res.json({ usuario: u[0] });
});

// Listar todos los tours
router.get("/tours", async (req, res) => {
  const [tours] = await db.execute(`
    SELECT t.id, t.nombre, t.descripcion, t.precio, t.ubicacion, t.tipo, t.capacidad, t.duracion, t.imagen, t.rating, t.fecha_creacion,
           COUNT(r.id) as cantidad_resenas,
           COALESCE(AVG(r.calificacion), 0) as rating_promedio
    FROM tours t
    LEFT JOIN resenas r ON t.id = r.id_tour
    GROUP BY t.id, t.nombre, t.descripcion, t.precio, t.ubicacion, t.tipo, t.capacidad, t.duracion, t.imagen, t.rating, t.fecha_creacion
    ORDER BY t.id DESC
  `);
  // Modifica la ruta de la imagen principal y ajusta el rating
  tours.forEach((tour) => {
    const nombreLimpio = tour.nombre.replace(/\s+/g, "_").toLowerCase();
    tour.imagen = `img/tours/${nombreLimpio}/${tour.imagen}`;
    tour.rating = parseFloat(tour.rating_promedio).toFixed(1);
    tour.cantidad_resenas = parseInt(tour.cantidad_resenas);
  });
  res.json(tours);
});

router.get("/tours/destacados", async (req, res) => {
  const [tours] = await db.execute(`
    SELECT t.id, t.nombre, t.descripcion, t.precio, t.ubicacion, t.tipo, t.capacidad, t.duracion, t.imagen, t.rating, t.fecha_creacion,
           COUNT(r.id) as cantidad_resenas,
           COALESCE(AVG(r.calificacion), 0) as rating_promedio
    FROM tours t
    LEFT JOIN resenas r ON t.id = r.id_tour
    GROUP BY t.id, t.nombre, t.descripcion, t.precio, t.ubicacion, t.tipo, t.capacidad, t.duracion, t.imagen, t.rating, t.fecha_creacion
    ORDER BY t.fecha_creacion DESC
    LIMIT 3
  `);
  // Modifica la ruta de la imagen principal y ajusta el rating
  tours.forEach((tour) => {
    const nombreLimpio = tour.nombre.replace(/\s+/g, "_").toLowerCase();
    tour.imagen = `img/tours/${nombreLimpio}/${tour.imagen}`;
    tour.rating = parseFloat(tour.rating_promedio).toFixed(1);
    tour.cantidad_resenas = parseInt(tour.cantidad_resenas);
  });
  res.json(tours);
});

// Obtener 3 tours más recientes para destinos populares
router.get("/tours/populares", async (req, res) => {
  const [tours] = await db.execute(`
    SELECT t.id, t.nombre, t.descripcion, t.precio, t.ubicacion, t.tipo, t.capacidad, t.duracion, t.imagen, t.rating, t.fecha_creacion,
           COUNT(r.id) as cantidad_resenas,
           COALESCE(AVG(r.calificacion), 0) as rating_promedio
    FROM tours t
    LEFT JOIN resenas r ON t.id = r.id_tour
    GROUP BY t.id, t.nombre, t.descripcion, t.precio, t.ubicacion, t.tipo, t.capacidad, t.duracion, t.imagen, t.rating, t.fecha_creacion
    ORDER BY t.id DESC
    LIMIT 3
  `);
  // Modifica la ruta de la imagen principal y ajusta el rating
  tours.forEach((tour) => {
    const nombreLimpio = tour.nombre.replace(/\s+/g, "_").toLowerCase();
    tour.imagen = `img/tours/${nombreLimpio}/${tour.imagen}`;
    tour.rating = parseFloat(tour.rating_promedio).toFixed(1);
    tour.cantidad_resenas = parseInt(tour.cantidad_resenas);
  });
  res.json(tours);
});

// Crear nuevo tour (admin)
router.post(
  "/tours",
  upload.fields([
    { name: "imagen_principal", maxCount: 1 },
    { name: "imagenes_secundarias", maxCount: 10 },
  ]),

  async (req, res) => {
    try {
      const {
        nombre,
        descripcion,
        precio,
        ubicacion,
        tipo,
        capacidad,
        duracion,
        que_esperar,
        que_esperar_lista,
        incluye_tour,
        no_incluye_tour,
        itinerario_tour,
      } = req.body;
      const imagenPrincipal = req.files["imagen_principal"]
        ? req.files["imagen_principal"][0].filename
        : null;

      console.log("BODY:", req.body);
      console.log("FILES:", req.files);

      const [result] = await db.execute(
        `INSERT INTO tours (nombre, descripcion, precio, ubicacion, tipo, capacidad, duracion, imagen, que_esperar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nombre,
          descripcion,
          precio,
          ubicacion,
          tipo,
          capacidad,
          duracion,
          imagenPrincipal,
          que_esperar,
        ]
      );
      const idTour = result.insertId;

      // 2. Imágenes secundarias
      if (req.files["imagenes_secundarias"]) {
        for (const file of req.files["imagenes_secundarias"]) {
          await db.execute(
            `INSERT INTO imagenes_tour (id_tour, ruta) VALUES (?, ?)`,
            [idTour, file.filename]
          );
        }
      }

      // 3. ¿Qué esperar? (tabla: que_esperar_lista)
      if (que_esperar_lista) {
        const items = que_esperar_lista
          .split("\n")
          .map((i) => i.trim())
          .filter((i) => i);
        for (const item of items) {
          await db.execute(
            `INSERT INTO que_esperar_lista (id_tour, item) VALUES (?, ?)`,
            [idTour, item]
          );
        }
      }

      // 4. Incluye (tabla: incluye_tour)
      if (incluye_tour) {
        const items = incluye_tour
          .split("\n")
          .map((i) => i.trim())
          .filter((i) => i);
        for (const item of items) {
          await db.execute(
            `INSERT INTO incluye_tour (id_tour, item) VALUES (?, ?)`,
            [idTour, item]
          );
        }
      }

      // 5. No incluye (tabla: no_incluye_tour)
      if (no_incluye_tour) {
        const items = no_incluye_tour
          .split("\n")
          .map((i) => i.trim())
          .filter((i) => i);
        for (const item of items) {
          await db.execute(
            `INSERT INTO no_incluye_tour (id_tour, item) VALUES (?, ?)`,
            [idTour, item]
          );
        }
      }

      // 6. Itinerario (tabla: itinerario, formato: Día|Título|Contenido)
      if (itinerario_tour) {
        const items = itinerario_tour
          .split("\n")
          .map((i) => i.trim())
          .filter((i) => i);
        for (const item of items) {
          const [diaStr, titulo, contenido] = item
            .split("|")
            .map((x) => x.trim());
          let dia = 1;
          const match = diaStr && diaStr.match(/\d+/);
          if (match) dia = parseInt(match[0], 10);
          await db.execute(
            `INSERT INTO itinerario_tour (id_tour, dia, titulo, contenido) VALUES (?, ?, ?, ?)`,
            [idTour, dia, titulo || "", contenido || ""]
          );
        }
      }

      res.json({ mensaje: "Tour creado correctamente" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Error al crear el tour", detalle: error.message });
    }
  }
);

// Eliminar tour (admin)
router.delete("/tours/:tourId", async (req, res) => {
  const tourId = req.params.tourId;
  try {
    // Obtén el nombre del tour para saber la carpeta
    const [[tour]] = await db.execute("SELECT nombre FROM tours WHERE id=?", [
      tourId,
    ]);
    if (!tour) return res.status(404).json({ error: "Tour no encontrado" });

    // Borra todo lo relacionado
    await db.execute("DELETE FROM imagenes_tour WHERE id_tour=?", [tourId]);
    await db.execute("DELETE FROM incluye_tour WHERE id_tour=?", [tourId]);
    await db.execute("DELETE FROM no_incluye_tour WHERE id_tour=?", [tourId]);
    await db.execute("DELETE FROM que_esperar_lista WHERE id_tour=?", [tourId]);
    await db.execute("DELETE FROM itinerario_tour WHERE id_tour=?", [tourId]);
    await db.execute("DELETE FROM resenas WHERE id_tour=?", [tourId]);
    await db.execute("DELETE FROM reservas WHERE id_tour=?", [tourId]);
    await db.execute("DELETE FROM tours WHERE id=?", [tourId]);

    // Elimina la carpeta de imágenes del tour
    const nombreLimpio = tour.nombre.replace(/\s+/g, "_").toLowerCase();
    const dir = path.join(
      __dirname,
      "..",
      "..",
      "public",
      "img",
      "tours",
      nombreLimpio
    );
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }

    res.json({ mensaje: "Tour y todo lo relacionado eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error al eliminar el tour y sus datos relacionados" });
  }
});

// Crear reserva (usuario)
router.post("/reservas", async (req, res) => {
  try {
    const {
      id_usuario,
      nombre,
      email,
      tipo_tour,
      invitados,
      pais,
      direccion_recogida,
      checkin,
      checkout,
      hotel,
      habitaciones,
      opcional,
      id_tour,
      precio,
    } = req.body;

    // Obtener el nombre del tour (opcional, si no lo mandas desde el frontend)
    let nombre_tour = req.body.nombre_tour;
    if (!nombre_tour && id_tour) {
      const [rows] = await db.execute("SELECT nombre FROM tours WHERE id = ?", [
        id_tour,
      ]);
      nombre_tour = rows[0]?.nombre || "";
    }

    // Validación básica
    if (
      !id_usuario ||
      !nombre ||
      !email ||
      !tipo_tour ||
      !nombre_tour ||
      !precio
    ) {
      return res.status(400).json({ error: "Faltan datos obligatorios." });
    }

    await db.execute(
      `INSERT INTO reservas (
        id_usuario, nombre, email, nombre_tour, tipo_tour, precio, invitados, pais, direccion_recogida, checkin, checkout, hotel, habitaciones, opcional, id_tour
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_usuario,
        nombre,
        email,
        nombre_tour,
        tipo_tour,
        precio,
        invitados,
        pais,
        direccion_recogida,
        checkin,
        checkout,
        hotel,
        habitaciones,
        opcional,
        id_tour,
      ]
    );

    res.json({ mensaje: "Reserva guardada correctamente." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al guardar la reserva." });
  }
});

// Crear reseña (usuario)
router.post("/resenas", async (req, res) => {
  const { id_usuario, id_tour, calificacion, comentario } = req.body;
  await db.execute(
    "INSERT INTO resenas (id_usuario, id_tour, calificacion, comentario, fecha) VALUES (?, ?, ?, ?, NOW())",
    [id_usuario, id_tour, calificacion, comentario]
  );
  res.json({ mensaje: "Reseña guardada" });
});

// Obtener reservas por usuario
router.get("/usuarios/:id/reservas", async (req, res) => {
  const id_usuario = req.params.id;
  const [r] = await db.execute(
    `
    SELECT r.*, t.nombre AS nombre_tour 
    FROM reservas r
    JOIN tours t ON r.id_tour = t.id
    WHERE r.id_usuario = ?
    ORDER BY r.fecha_reserva DESC
  `,
    [id_usuario]
  );
  res.json(r);
});

// Enviar mensaje de contacto
router.post("/contacto", async (req, res) => {
  const { nombre, email, telefono, asunto, mensaje } = req.body;
  try {
    const [result] = await db.execute(
      "INSERT INTO mensajes_contacto (nombre, email, telefono, asunto, mensaje) VALUES (?, ?, ?, ?, ?)",
      [nombre, email, telefono, asunto, mensaje]
    );
    res.json({ mensaje: "Mensaje enviado correctamente." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al guardar el mensaje." });
  }
});

// Obtener imágenes secundarias de un tour
router.get("/tours/:tourId/imagenes", async (req, res) => {
  const tourId = req.params.tourId;
  // Obtén el nombre limpio del tour (de la tabla tours)
  const [[tour]] = await db.execute("SELECT nombre FROM tours WHERE id=?", [
    tourId,
  ]);
  const nombreLimpio = tour.nombre.replace(/\s+/g, "_").toLowerCase();

  const [imagenes] = await db.execute(
    `SELECT ruta FROM imagenes_tour WHERE id_tour = ?`,
    [tourId]
  );
  // Devuelve la ruta relativa completa
  res.json(
    imagenes.map((img) => ({
      ruta: `img/tours/${nombreLimpio}/${img.ruta}`,
    }))
  );
});

// Detalle de un tour (incluye, no incluye, qué esperar, itinerario, imágenes, reseñas)
router.get("/tours/:tourId", async (req, res) => {
  const tourId = req.params.tourId;

  // 1. Tour principal
  const [t] = await db.execute(`SELECT * FROM tours WHERE id = ?`, [tourId]);
  if (!t.length) return res.status(404).json({ error: "Tour no encontrado" });
  const tour = t[0];

  // Ajustar ruta de imagen principal
  const nombreLimpio = tour.nombre.replace(/\s+/g, "_").toLowerCase();
  tour.imagen = `img/tours/${nombreLimpio}/${tour.imagen}`;

  // Si quieres calcular rating y cantidad_resenas en el detalle, hazlo así:
  const [resenasStats] = await db.execute(
    `SELECT COUNT(*) as cantidad_resenas, COALESCE(AVG(calificacion),0) as rating_promedio FROM resenas WHERE id_tour = ?`,
    [tourId]
  );
  tour.cantidad_resenas = parseInt(resenasStats[0].cantidad_resenas);
  tour.rating = parseFloat(resenasStats[0].rating_promedio).toFixed(1);

  // 2. Incluye
  const [incluye] = await db.execute(
    `SELECT item FROM incluye_tour WHERE id_tour = ?`,
    [tourId]
  );

  // 3. No incluye
  const [noIncluye] = await db.execute(
    `SELECT item FROM no_incluye_tour WHERE id_tour = ?`,
    [tourId]
  );

  // 4. Qué esperar (lista)
  const [queEsperarLista] = await db.execute(
    `SELECT item FROM que_esperar_lista WHERE id_tour = ?`,
    [tourId]
  );

  // 5. Itinerario
  const [itinerario] = await db.execute(
    `SELECT dia, titulo, contenido FROM itinerario_tour WHERE id_tour = ? ORDER BY dia ASC`,
    [tourId]
  );

  // 6. Imágenes secundarias
  const [imagenes] = await db.execute(
    `SELECT ruta FROM imagenes_tour WHERE id_tour = ?`,
    [tourId]
  );
  // Ajustar la ruta de cada imagen secundaria
  imagenes.forEach((img) => {
    img.ruta = `img/tours/${nombreLimpio}/${img.ruta}`;
  });

  // 7. Reseñas
  const [resenas] = await db.execute(
    `SELECT r.comentario, r.calificacion, r.fecha, u.nombre AS autor
     FROM resenas r
     JOIN usuarios u ON r.id_usuario = u.id
     WHERE r.id_tour = ?
     ORDER BY r.fecha DESC`,
    [tourId]
  );

  res.json({
    tour,
    incluye,
    noIncluye,
    queEsperarLista,
    itinerario,
    imagenes,
    resenas,
  });
});

router.get("/tours/:tourId/relacionados", async (req, res) => {
  const tourId = req.params.tourId;
  // Ejemplo: mismos tipo o ubicación, excluyendo el actual
  const [relacionados] = await db.execute(
    `SELECT id, nombre, imagen, ubicacion, capacidad, duracion, precio, 
      (SELECT COUNT(*) FROM resenas WHERE id_tour = t.id) as cantidad_resenas,
      (SELECT COALESCE(AVG(calificacion),0) FROM resenas WHERE id_tour = t.id) as rating
     FROM tours t WHERE t.id != ? AND t.tipo = (SELECT tipo FROM tours WHERE id = ?) LIMIT 3`,
    [tourId, tourId]
  );
  // Ajusta la ruta de imagen si es necesario
  relacionados.forEach((tour) => {
    const nombreLimpio = tour.nombre.replace(/\s+/g, "_").toLowerCase();
    tour.imagen = `img/tours/${nombreLimpio}/${tour.imagen}`;
  });
  res.json(relacionados);
});

module.exports = router;

// Ejemplo: Obtener tours
//router.get('/tours', async (req, res) => {
//try {
//const [rows] = await db.query('SELECT * FROM tours');
//res.json(rows);
//} catch (err) {
//res.status(500).json({ error: 'Error al obtener tours' });
//}
//});
