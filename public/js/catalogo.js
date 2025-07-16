// Script principal para la gestión y filtrado del catálogo de tours

document.addEventListener("DOMContentLoaded", async () => {
  let toursOriginales = [];
  let toursFiltrados = [];
  let filtrosActivos = {
    ubicaciones: [],
    tipos: [],
    precios: [],
    duraciones: [],
    ratings: []
  };

  // Carga los tours desde la API y los muestra en pantalla
  async function cargarTours() {
    const contenedor = document.getElementById("contenedorTours");
    try {
      const res = await fetch("/api/tours");
      const tours = await res.json();
      toursOriginales = tours;
      toursFiltrados = tours;
      renderizarTours(toursFiltrados);
      actualizarContadorTours(toursFiltrados.length);
    } catch (error) {
      contenedor.innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Error al cargar los tours: ${error.message}</p>
        </div>`;
    }
  }

  // Actualiza el contador de tours encontrados
  function actualizarContadorTours(cantidad) {
    const contador = document.getElementById('contador-tours');
    if (contador) {
      contador.textContent = `${cantidad} tours encontrados`;
    }
  }

  // Renderiza las tarjetas de tours en el DOM
  function renderizarTours(tours) {
    const contenedor = document.getElementById("contenedorTours");
    contenedor.innerHTML = "";
    
    if (tours.length === 0) {
      contenedor.innerHTML = `
        <div class="no-results">
          <i class="fas fa-search"></i>
          <h3>No se encontraron tours</h3>
          <p>Intenta ajustar los filtros para encontrar más opciones</p>
          <button class="btn-limpiar-filtros" onclick="limpiarFiltros()">
            <i class="fas fa-times"></i> Limpiar filtros
          </button>
        </div>`;
      return;
    }

    tours.forEach((tour) => {
      const card = document.createElement("div");
      card.className = "card-tour";
      
      // Genera las estrellas de calificación
      const rating = tour.rating || 0;
      const estrellas = generarEstrellas(rating);
      
      // Formatea el precio en moneda local
      const precioFormateado = new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN'
      }).format(tour.precio);

      card.innerHTML = `
        <div class="container-img">
          <img src="${tour.imagen}" alt="${tour.nombre}" onerror="this.src='img/tours/default-tour.svg'" />
          <div class="container-icon">
            <i class="fa-regular fa-heart"></i>
          </div>
          <div class="tour-badge">
            <span class="badge ${tour.tipo?.toLowerCase() || 'default'}">${tour.tipo || 'Tour'}</span>
          </div>
        </div>
        <div class="content-card-tour">
          <div class="container-location-price">
            <span class="location">
              <i class="fa-solid fa-map-marker-alt"></i> ${tour.ubicacion || "Ubicación"}
            </span>
            <span class="price">${precioFormateado}</span>
          </div>
          <div class="container-title">
            <h3>${tour.nombre}</h3>
          </div>
          <div class="details">
            <span class="capacity-person">
              <i class="fa-solid fa-user-group"></i> ${tour.capacidad || 10} Personas
            </span>
            <span class="time">
              <i class="fa-solid fa-clock"></i> ${tour.duracion || "N/A"}
            </span>
          </div>
          <p class="description">
            ${tour.descripcion ? (tour.descripcion.length > 120 ? tour.descripcion.slice(0, 120) + '...' : tour.descripcion) : "Descripción no disponible"}
          </p>
          <div class="reviews">
            <span class="stars">
              ${estrellas}
            </span>
            <span class="count-reviews">(${tour.cantidad_resenas || 0} Reseñas)</span>
          </div>
          <div class="footer-card-tour">
            <a class='btn btn-outline btn-detalles' href='tour.html' data-tour-id="${tour.id}">
              <i class="fas fa-info-circle"></i> Detalles
            </a>
            <a href="#" class="btn btn-solid btn-reservar" data-tour-id="${tour.id}">
              <i class="fas fa-calendar-check"></i> Reservar
            </a>
          </div>
        </div>
      `;

      // Evento para guardar el ID del tour al ver detalles
      card.querySelector('.btn-detalles').addEventListener('click', function(e) {
        localStorage.setItem('tourId', tour.id);
      });

      // Evento para reservar un tour (requiere login)
      card.querySelector('.btn-reservar').addEventListener('click', function(e) {
        e.preventDefault();
        if (localStorage.getItem('usuario')) {
          localStorage.setItem('tourId', tour.id);
          window.location.href = 'tour.html';
        } else {
          window.location.href = 'login.html';
        }
      });

      contenedor.appendChild(card);
    });
  }

  // Genera el HTML de las estrellas de calificación
  function generarEstrellas(rating) {
    const estrellasCompletas = Math.floor(rating);
    const tieneMediaEstrella = rating % 1 >= 0.5;
    let html = '';

    for (let i = 1; i <= 5; i++) {
      if (i <= estrellasCompletas) {
        html += '<i class="fa-solid fa-star"></i>';
      } else if (i === estrellasCompletas + 1 && tieneMediaEstrella) {
        html += '<i class="fa-solid fa-star-half-alt"></i>';
      } else {
        html += '<i class="fa-solid fa-star gray"></i>';
      }
    }

    return html;
  }

  // Inicializa los tabs de filtros y sus eventos
  function inicializarTabsFiltros() {
    const tabs = document.querySelectorAll('.tab-filter');
    const panels = document.querySelectorAll('.tab-panel');

    tabs.forEach(tab => {
      tab.addEventListener('click', function() {
        tabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        const tabName = this.getAttribute('data-tab');
        panels.forEach(panel => {
          if (panel.getAttribute('data-panel') === tabName) {
            panel.classList.add('active');
          } else {
            panel.classList.remove('active');
          }
        });
      });
    });

    panels.forEach(panel => {
      panel.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', aplicarFiltrosTabs);
      });
      panel.querySelectorAll('input[type="radio"]').forEach(rb => {
        rb.addEventListener('change', aplicarFiltrosTabs);
      });
    });
  }

  // Aplica los filtros seleccionados en los tabs
  function aplicarFiltrosTabs() {
    const ubicaciones = Array.from(document.querySelectorAll('.tab-panel[data-panel="ubicacion"] input[type="checkbox"]:checked')).map(cb => cb.value);
    const tipos = Array.from(document.querySelectorAll('.tab-panel[data-panel="tipo"] input[type="checkbox"]:checked')).map(cb => cb.value);
    const precios = Array.from(document.querySelectorAll('.tab-panel[data-panel="precio"] input[type="checkbox"]:checked')).map(cb => cb.value);
    const duraciones = Array.from(document.querySelectorAll('.tab-panel[data-panel="duracion"] input[type="checkbox"]:checked')).map(cb => cb.value);
    const ratingRadio = document.querySelector('.tab-panel[data-panel="calificacion"] input[type="radio"]:checked');
    const ratings = ratingRadio ? [ratingRadio.value] : [];

    filtrosActivos = { ubicaciones, tipos, precios, duraciones, ratings };
    aplicarFiltros();
  }

  // Filtra los tours según los filtros activos
  function aplicarFiltros() {
    toursFiltrados = toursOriginales.filter(tour => {
      // Filtro por ubicacion
      if (filtrosActivos.ubicaciones.length > 0) {
        const ubicacion = tour.ubicacion?.toLowerCase() || '';
        if (!filtrosActivos.ubicaciones.some(filtro => 
          ubicacion.includes(filtro.toLowerCase()))) {
          return false;
        }
      }
      // Filtro por tipo
      if (filtrosActivos.tipos.length > 0) {
        const tipo = tour.tipo?.toLowerCase() || '';
        if (!filtrosActivos.tipos.some(filtro => 
          tipo.includes(filtro.toLowerCase()))) {
          return false;
        }
      }
      // Filtro por precio
      if (filtrosActivos.precios.length > 0) {
        const precio = parseFloat(tour.precio);
        let cumpleFiltroPrecio = false;
        filtrosActivos.precios.forEach(precioFiltro => {
          if (precioFiltro === '5000+') {
            if (precio > 5000) cumpleFiltroPrecio = true;
          } else {
            const [min, max] = precioFiltro.split('-').map(Number);
            if (precio >= min && precio <= max) cumpleFiltroPrecio = true;
          }
        });
        if (!cumpleFiltroPrecio) return false;
      }
      // Filtro por duracion
      if (filtrosActivos.duraciones.length > 0) {
        const duracion = tour.duracion?.toLowerCase() || '';
        let cumpleFiltroDuracion = false;
        filtrosActivos.duraciones.forEach(duracionFiltro => {
          if (duracion.includes(duracionFiltro.toLowerCase())) {
            cumpleFiltroDuracion = true;
          }
        });
        if (!cumpleFiltroDuracion) return false;
      }
      // Filtro por calificacion
      if (filtrosActivos.ratings.length > 0) {
        const rating = tour.rating || 0;
        let cumpleFiltroRating = false;
        filtrosActivos.ratings.forEach(ratingFiltro => {
          const ratingNum = parseInt(ratingFiltro);
          if (rating >= ratingNum) {
            cumpleFiltroRating = true;
          }
        });
        if (!cumpleFiltroRating) return false;
      }
      return true;
    });
    renderizarTours(toursFiltrados);
    actualizarContadorTours(toursFiltrados.length);
  }

  function inicializarBusqueda() {
    const searchInput = document.getElementById('search-tours');
    if (searchInput) {
      searchInput.addEventListener('input', function(e) {
        const busqueda = e.target.value.toLowerCase();
        if (busqueda === '') {
          toursFiltrados = toursOriginales;
        } else {
          toursFiltrados = toursOriginales.filter(tour => 
            tour.nombre.toLowerCase().includes(busqueda) ||
            tour.ubicacion.toLowerCase().includes(busqueda) ||
            tour.tipo.toLowerCase().includes(busqueda) ||
            tour.descripcion.toLowerCase().includes(busqueda)
          );
        }
        renderizarTours(toursFiltrados);
        actualizarContadorTours(toursFiltrados.length);
      });
    }
  }

  function inicializarOrdenamiento() {
    const sortSelect = document.getElementById('sort-tours');
    if (sortSelect) {
      sortSelect.addEventListener('change', function(e) {
        const orden = e.target.value;
        toursFiltrados.sort((a, b) => {
          switch (orden) {
            case 'precio-asc':
              return parseFloat(a.precio) - parseFloat(b.precio);
            case 'precio-desc':
              return parseFloat(b.precio) - parseFloat(a.precio);
            case 'rating-desc':
              return (b.rating || 0) - (a.rating || 0);
            case 'nombre-asc':
              return a.nombre.localeCompare(b.nombre);
            default:
              return 0;
          }
        });
        renderizarTours(toursFiltrados);
      });
    }
  }

  await cargarTours();
  inicializarTabsFiltros();
  inicializarBusqueda();
  inicializarOrdenamiento();

  // Funcion global para limpiar todos los filtros
  window.limpiarFiltros = function() {
    document.querySelectorAll('.tab-panel input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.querySelectorAll('.tab-panel input[type="radio"]').forEach(rb => rb.checked = false);
    filtrosActivos = {
      ubicaciones: [],
      tipos: [],
      precios: [],
      duraciones: [],
      ratings: []
    };
    aplicarFiltros();
  };
});
