document.addEventListener('DOMContentLoaded', async () => {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  if (!usuario || usuario.rol !== 'admin') return location.href = 'login.html';

  const res = await fetch('/api/tours');
  const tours = await res.json();
  const contenedor = document.getElementById('listaTours');

  tours.forEach(t => {
    const div = document.createElement('div');
    div.className = "admin-tour-card";
    div.innerHTML = `
      <h3>${t.nombre}</h3>
      <img src="${t.imagen}" alt="Imagen principal" style="max-width:180px;max-height:120px;border-radius:8px;">
      <p><strong>Descripción:</strong> ${t.descripcion}</p>
      <p><strong>Precio:</strong> $${t.precio}</p>
      <p><strong>Ubicación:</strong> ${t.ubicacion}</p>
      <p><strong>Tipo:</strong> ${t.tipo}</p>
      <p><strong>Capacidad:</strong> ${t.capacidad}</p>
      <p><strong>Duración:</strong> ${t.duracion}</p>
      <p><strong>Rating:</strong> ${t.rating} ⭐ (${t.cantidad_resenas} reseñas)</p>
      <button onclick="eliminarTour(${t.id})">Eliminar</button>
      <hr>
    `;
    contenedor.appendChild(div);
  });
});

async function eliminarTour(id) {
  const confirmar = confirm('¿Seguro que deseas eliminar este tour y todo lo relacionado?');
  if (!confirmar) return;
  const res = await fetch(`/api/tours/${id}`, {
    method: 'DELETE'
  });
  const data = await res.json();
  if (data.error) return alert(data.error);
  alert('Tour y todo lo relacionado eliminado');
  location.reload();
}
