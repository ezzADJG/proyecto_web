// Función para cargar los destinos populares desde la API
async function cargarDestinosPopulares() {
    const container = document.getElementById('destinos-populares');
    
    // Mostrar estado de carga
    container.innerHTML = '<div class="loading"></div>';
    
    try {
        const response = await fetch('/api/tours/populares');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const tours = await response.json();
        
        if (tours.length === 0) {
            container.innerHTML = '<p class="no-tours">No hay tours disponibles en este momento.</p>';
            return;
        }
        
        // Limpiar el contenedor
        container.innerHTML = '';
        
        // Crear las cards para cada tour
        tours.forEach((tour, index) => {
            const card = document.createElement('div');
            card.className = `card-destination img-background-${index + 1}`;
            
            // Establecer la imagen de fondo dinámicamente
            if (tour.imagen) {
                card.style.backgroundImage = `
                    linear-gradient(
                        to top,
                        rgba(0, 0, 0, 0.5) 20%,
                        rgba(0, 0, 0, 0) 80%
                    ),
                    url('${tour.imagen}')
                `;
                card.style.backgroundSize = 'cover';
                card.style.backgroundPosition = 'center';
                card.style.borderRadius = '20px';
            } else {
                // Imagen por defecto si no hay imagen
                card.style.backgroundImage = `url('img/tours/default-tour.svg')`;
            }
            
            card.innerHTML = `
                <div class="content-card">
                    <span class="location">
                        <i class="fa-solid fa-location-dot"></i>
                        ${tour.ubicacion || 'Ubicación no especificada'}
                    </span>
                    <h3>${tour.nombre}</h3>
                    <div class="footer-card-destination">
                        <span class="price">Precio: $${tour.precio || '0'}</span>
                        <span class="capacity-persons">
                            Personas: ${tour.capacidad || '0'}
                            <i class="fa-solid fa-user-group"></i>
                        </span>
                    </div>
                </div>
            `;
            
            // Agregar evento click para navegar al detalle del tour
            card.addEventListener('click', () => {
                localStorage.setItem('tourId', tour.id);
                window.location.href = `tour.html`;
            });
            
            container.appendChild(card);
        });
        
    } catch (error) {
        console.error('Error al cargar destinos populares:', error);
        container.innerHTML = `
            <p class="error">
                Error al cargar los destinos populares. 
                <button onclick="cargarDestinosPopulares()" style="margin-left: 10px; padding: 5px 10px; background: var(--primary-color); color: white; border: none; border-radius: 3px; cursor: pointer;">
                    Reintentar
                </button>
            </p>
        `;
    }
}

// Cargar los destinos populares cuando se cargue la página
document.addEventListener('DOMContentLoaded', cargarDestinosPopulares); 