document.addEventListener("DOMContentLoaded", async () => {
  const tourId = localStorage.getItem("tourId");
  if (!tourId) return;

  // 1. Cargar datos del tour
  const res = await fetch(`/api/tours/${tourId}`);
  const data = await res.json();
  const tour = data.tour;

  

  // 2. Banner principal
  document.querySelector(".section-hero-banner h1").textContent = tour.nombre;
  document.querySelector(".section-hero-banner .container-img img").src =
    tour.imagen;
  document.querySelector(
    ".section-hero-banner .container-reviews .count-reviews"
  ).textContent = `(${tour.cantidad_resenas || 0} Reseñas)`;

  // Mostrar capacidad máxima y duración en el banner (puedes crear estos elementos en tu HTML)
  const duracionElem = document.querySelector(".info-item-duracion span");
  if (duracionElem) {
    duracionElem.textContent = tour.duracion || "";
  }

  const capacidadElem = document.querySelector(".info-item-cantidad span");
  if (capacidadElem) {
    capacidadElem.textContent = `Max ${tour.capacidad || 0} personas`;
  }

  // 3. Detalles
  const detallesSection = document.querySelector(".section-detail");
  if (detallesSection) {
    detallesSection.querySelectorAll("p")[0].textContent =
      tour.descripcion || "";
    // Si tienes más párrafos, puedes llenarlos con más info
  }

  // 4. Incluye/No incluye
  const incluyeUl = document.querySelector(".includes ul");
  incluyeUl.innerHTML = "";
  data.incluye.forEach((item) => {
    incluyeUl.innerHTML += `<li><i class="fa-solid fa-check"></i><span>${item.item}</span></li>`;
  });
  const excluyeUl = document.querySelector(".excludes ul");
  excluyeUl.innerHTML = "";
  data.noIncluye.forEach((item) => {
    excluyeUl.innerHTML += `<li><i class="fa-solid fa-times"></i><span>${item.item}</span></li>`;
  });

  // 5. Qué esperar
  document.querySelector(".expect p").textContent = tour.que_esperar || "";
  const expectUl = document.querySelector(".expect ul");
  expectUl.innerHTML = "";
  data.queEsperarLista.forEach((item) => {
    expectUl.innerHTML += `<li>${item.item}</li>`;
  });

  // 5.2 Precio
  const precioElem = document.querySelector(".price-btn-booking .price");
  if (precioElem) {
    precioElem.textContent = tour.precio
      ? new Intl.NumberFormat("es-PE", {
          style: "currency",
          currency: "PEN",
        }).format(tour.precio)
      : "";
  }

  // 6. Itinerario
  const itinerarySection = document.querySelector(".section-itinerary");
  itinerarySection.innerHTML =
    '<h2 class="title" id="itinerary">Itinerario</h2>';
  data.itinerario.forEach((dia) => {
    itinerarySection.innerHTML += `
      <div class="itinerary-item">
        <div class="itinerary-header"><h3>Día ${dia.dia} - ${dia.titulo}</h3></div>
        <div class="itinerary-content"><p>${dia.contenido}</p></div>
      </div>
    `;
  });

  const itineraryItems = document.querySelectorAll(".itinerary-item");
  itineraryItems.forEach((item) =>
    item.addEventListener("click", () => {
      item.classList.toggle("active");
    })
  );

  // 7. Galería
  const galeria = document.querySelector(".grid-gallery");
  galeria.innerHTML = "";
  data.imagenes.forEach((img) => {
    galeria.innerHTML += `
      <div class="gallery-item">
        <img src="${img.ruta}" alt="Galería Tour" />
      </div>
    `;
  });

  // Renderizar reseñas
  function renderResenas(resenas) {
    const contenedorResenas = document.getElementById("contenedorResenas");
    contenedorResenas.innerHTML = "";
    if (!resenas.length) {
      contenedorResenas.innerHTML =
        '<p class="no-reviews">No hay reseñas para este tour.</p>';
      return;
    }
    resenas.forEach((resena) => {
      let stars = "";
      for (let i = 1; i <= 5; i++) {
        stars += `<i class="fa-${
          i <= resena.calificacion ? "solid" : "regular"
        } fa-star"></i>`;
      }
      contenedorResenas.innerHTML += `
        <div class="card-review">
          <div class="header-card-review">
            <div class="container-img">
              <i class="fa-solid fa-user fa-2x" style="color:#b6c6e3;"></i>
              <div class="decoration"></div>
            </div>
            <div>
              <h3 class="name">${resena.autor || "Usuario"}</h3>
              <span class="date">${
                resena.fecha ? new Date(resena.fecha).toLocaleDateString() : ""
              }</span>
            </div>
          </div>
          <div class="review">
            <p>${resena.comentario}</p>
          </div>
          <div class="footer">
            <span class="stars">${stars}</span>
          </div>
        </div>
      `;
    });
  }

  // Mostrar sección de reseña solo si hay usuario logueado
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const sectionAddReview = document.getElementById("sectionAddReview");
  if (usuario && usuario.id) {
    sectionAddReview.style.display = "block";
  } else {
    sectionAddReview.style.display = "none";
  }

  // Validación y envío del formulario de reseña
  const formResena = document.getElementById("formResena");
  if (formResena) {
    formResena.addEventListener("submit", async (e) => {
      e.preventDefault();
      const comentario = document.getElementById("comentario").value.trim();
      const calificacion = parseInt(
        document.getElementById("calificacion").value,
        10
      );
      const tourId = localStorage.getItem("tourId");
      const mensaje = document.getElementById("mensajeResena");

      // Validaciones
      if (!comentario || comentario.length < 10) {
        mensaje.textContent =
          "El comentario debe tener al menos 10 caracteres.";
        mensaje.style.color = "red";
        return;
      }
      if (!calificacion || calificacion < 1 || calificacion > 5) {
        mensaje.textContent = "La calificación debe ser entre 1 y 5.";
        mensaje.style.color = "red";
        return;
      }
      if (!usuario || !usuario.id) {
        mensaje.textContent = "Debes iniciar sesión para publicar una reseña.";
        mensaje.style.color = "red";
        return;
      }

      try {
        const res = await fetch("/api/resenas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_usuario: usuario.id,
            id_tour: tourId,
            calificacion,
            comentario,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          mensaje.textContent = "¡Reseña enviada!";
          mensaje.style.color = "green";
          formResena.reset();

          // Actualizar reseñas sin recargar
          // Puedes volver a pedirlas a la API o agregarlas al DOM directamente:
          const nuevaResena = {
            autor: usuario.nombre || "Usuario",
            comentario,
            calificacion,
            fecha: new Date().toISOString(),
          };
          // Agrega la nueva reseña al inicio
          const resenasActuales = Array.from(
            document.querySelectorAll(".card-review")
          ).map((card) => ({
            autor: card.querySelector(".name").textContent,
            comentario: card.querySelector(".review p").textContent,
            calificacion: card.querySelectorAll(".fa-solid.fa-star").length,
            fecha: card.querySelector(".date")?.textContent || "",
          }));
          renderResenas([nuevaResena, ...resenasActuales]);
        } else {
          mensaje.textContent = data.error || "Error al enviar reseña.";
          mensaje.style.color = "red";
        }
      } catch (err) {
        mensaje.textContent = "Error de conexión.";
        mensaje.style.color = "red";
      }
    });
  }

  // Al cargar la página, renderiza las reseñas traídas de la API
  renderResenas(data.resenas);

  async function cargarToursRelacionados() {
    const tourId = localStorage.getItem("tourId");
    const contenedor = document.getElementById("contenedorToursRelacionados");
    contenedor.innerHTML = "<p>Cargando tours relacionados...</p>";

    try {
      const res = await fetch(`/api/tours/${tourId}/relacionados`);
      const data = await res.json();
      if (!data.length) {
        contenedor.innerHTML = "<p>No hay tours relacionados.</p>";
        return;
      }
      contenedor.innerHTML = "";
      data.forEach((tour) => {
        let stars = "";
        for (let i = 1; i <= 5; i++) {
          stars += `<i class="fa-${
            i <= Math.round(tour.rating) ? "solid" : "regular"
          } fa-star"></i>`;
        }
        // Cada card es un div clickable
        const card = document.createElement("div");
        card.className = "card-tour";
        card.style.cursor = "pointer";
        card.innerHTML = `
          <div class="container-img">
            <img src="${tour.imagen}" alt="${tour.nombre}" />
            <div class="container-icon">
              <i class="fa-regular fa-heart"></i>
            </div>
          </div>
          <div class="content">
            <span class="location">
              <i class="fa-solid fa-map-pin"></i>
              ${tour.ubicacion}
            </span>
            <h3>${tour.nombre}</h3>
            <div class="details">
              <span class="capacity-person">
                <i class="fa-solid fa-user-group"></i>
                ${tour.capacidad} Personas
              </span>
              <span class="time">
                <i class="fa-solid fa-clock"></i>
                ${tour.duracion}
              </span>
            </div>
            <div class="reviews">
              <span class="stars">${stars}</span>
              <span class="count-reviews">(${
                tour.cantidad_resenas || 0
              } Reseñas)</span>
            </div>
            <p class="price">Precio: ${new Intl.NumberFormat("es-PE", {
              style: "currency",
              currency: "PEN",
            }).format(tour.precio)}</p>
          </div>
        `;
        // Al hacer click, guarda el id y redirige a la página de detalles
        card.addEventListener("click", () => {
          localStorage.setItem("tourId", tour.id);
          window.location.href = "tour.html?id=" + tour.id;
        });
        contenedor.appendChild(card);
      });
    } catch (err) {
      contenedor.innerHTML = "<p>Error al cargar tours relacionados.</p>";
    }
  }

  // Llama a la función después de cargar el detalle principal
  cargarToursRelacionados();

  const formReserva = document.getElementById("formReserva");
  if (formReserva) {
    formReserva.addEventListener("submit", async (e) => {
      e.preventDefault();
      const usuario = JSON.parse(localStorage.getItem("usuario"));
      const mensaje = document.getElementById("mensajeReserva");
      if (!usuario || !usuario.nombre || !usuario.email) {
        mensaje.textContent = "Debes iniciar sesión para reservar.";
        mensaje.style.color = "red";
        return;
      }

      // Obtén los valores del formulario
      const reserva = {
        id_usuario: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        nombre_tour: tour.nombre,
        tipo_tour: document.getElementById("type").value,
        invitados: parseInt(document.getElementById("guests").value, 10),
        pais: document.getElementById("country").value,
        direccion_recogida: document.getElementById("pickup").value,
        checkin: document.getElementById("checkin").value,
        checkout: document.getElementById("checkout").value,
        hotel: document.getElementById("hotel").value,
        habitaciones: parseInt(document.getElementById("rooms").value, 10),
        opcional: document.getElementById("option").value,
        id_tour: localStorage.getItem("tourId"),
        precio: tour.precio, 
      };

      try {
        const res = await fetch("/api/reservas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reserva),
        });
        const data = await res.json();
        if (res.ok) {
          mensaje.textContent = "¡Reserva realizada con éxito!";
          mensaje.style.color = "green";
          formReserva.reset();
        } else {
          mensaje.textContent = data.error || "Error al reservar. Verifica los datos.";
          mensaje.style.color = "red";
        }
      } catch (err) {
        mensaje.textContent = "Error de conexión.";
        mensaje.style.color = "red";
      }
    });
  }

  // Mostrar nombre y correo del usuario en los campos (readonly)
  if (usuario) {
    const inputNombre = document.getElementById("name");
    const inputEmail = document.getElementById("email");
    if (inputNombre) inputNombre.value = usuario.nombre || "";
    if (inputEmail) inputEmail.value = usuario.email || "";
  }

  // Llenar campos de solo lectura en el formulario de reserva
  const inputTourName = document.getElementById("tourName");
  const inputType = document.getElementById("type");
  if (inputTourName && inputType && tour) {
    inputTourName.value = tour.nombre || "";
    inputType.value = tour.tipo || "";
  }

  const inputPrecio = document.getElementById("precio");
  if (inputPrecio && tour && tour.precio) {
    inputPrecio.value = new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(tour.precio);
  } else if (inputPrecio) {
    inputPrecio.value = "";
  }

  // Botón para abrir el modal
  const btnBooking = document.querySelector('.price-btn-booking');
  const modal = document.getElementById('modalReserva');
  const closeModal = document.getElementById('closeModalReserva');

  if (btnBooking && modal && closeModal) {
    btnBooking.addEventListener('click', (e) => {
      e.preventDefault();
      const usuario = JSON.parse(localStorage.getItem('usuario'));
      if (usuario && usuario.nombre && usuario.email) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      } else {
        alert('Debes iniciar sesión para reservar un tour.');
        window.location.href = 'login.html';
      }
    });

    closeModal.addEventListener('click', () => {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    });

    // Cerrar modal al hacer click fuera del contenido
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
      }
    });
  }
});
