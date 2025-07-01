async function cargarToursDestacados() {
    const container = document.getElementById('tours-destacados');
    container.innerHTML = '<div class="loading"></div>';

    try {
        const response = await fetch('/api/tours/destacados');
        if (!response.ok) throw new Error('Error al cargar tours');
        const tours = await response.json();

        if (!tours.length) {
            container.innerHTML = '<p class="no-tours">No hay tours destacados.</p>';
            return;
        }

        container.innerHTML = '';
        tours.forEach(tour => {
            const card = document.createElement('div');
            card.className = 'card-tour';

            // Generar estrellas
            const rating = parseFloat(tour.rating) || 0;
            let stars = '';
            for (let i = 1; i <= 5; i++) {
                stars += `<i class="fa${i <= Math.round(rating) ? '-solid' : '-regular'} fa-star"></i>`;
            }

            card.innerHTML = `
                <div class="container-img">
                    <img src="${tour.imagen}" alt="${tour.nombre}" onerror="this.src='img/tours/default-tour.svg'" />
                </div>
                <div class="content">
                    <span class="location">
                        <i class="fa-solid fa-map-pin"></i>
                        ${tour.ubicacion || 'Ubicación no especificada'}
                    </span>
                    <h3>${tour.nombre}</h3>
                    <div class="details">
                        <span class="capacity-person">
                            <i class="fa-solid fa-user-group"></i>
                            ${tour.capacidad || '0'} Personas
                        </span>
                        <span class="time">
                            <i class="fa-solid fa-clock"></i>
                            ${tour.duracion || '0'} días
                        </span>
                    </div>
                    <div class="reviews">
                        <span class="stars">${stars}</span>
                        <span class="count-reviews">(${tour.cantidad_resenas || 0} Reseñas)</span>
                    </div>
                    <p class="price">Precio: $${tour.precio || '0'}</p>
                    <button class="btn-ver-mas" data-tour-id="${tour.id}">Ver más</button>
                </div>
            `;

            // Botón "Ver más"
            card.querySelector('.btn-ver-mas').addEventListener('click', (e) => {
                e.stopPropagation();
                localStorage.setItem('tourId', tour.id);
                window.location.href = `tour.html`;
            });

            container.appendChild(card);
        });
    } catch (err) {
        container.innerHTML = '<p class="error">No se pudieron cargar los tours destacados.</p>';
    }
}

document.addEventListener('DOMContentLoaded', cargarToursDestacados);