// Script para mostrar el panel de perfil según el rol del usuario y listar sus reservas

document.addEventListener('DOMContentLoaded', async () => {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  // Si no hay usuario logueado, redirige a la página de login
  if (!usuario) return window.location.href = 'login.html';

  // Muestra saludo personalizado
  document.getElementById('saludo').innerText = `Bienvenido, ${usuario.nombre}`;

  const contenedor = document.getElementById('contenidoPerfil');

  // Si el usuario es administrador, muestra el panel de administración
  if (usuario.rol === 'admin') {
    contenedor.className = 'admin-panel';
    contenedor.innerHTML = `
      <h3>Panel de Administrador</h3>
      <a href="admin-agregar-tour.html">Agregar Tour</a><br>
      <a href="admin-lista-tours.html">Ver Tours</a>
    `;
  } else {
    // Si es usuario normal, muestra sus reservas
    contenedor.className = 'user-panel';
    const res = await fetch(`/api/usuarios/${usuario.id}/reservas`);
    const reservas = await res.json();

    contenedor.innerHTML = '<h3>Mis Reservas</h3>';
    if (reservas.length === 0) {
      contenedor.innerHTML += '<p>No tienes reservas aún</p>';
    } else {
      reservas.forEach(r => {
        const fecha = new Date(r.fecha_reserva).toLocaleDateString('es-PE', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
        contenedor.innerHTML += `
          <p>
            <strong>${r.nombre_tour}</strong><br>
            Fecha: ${fecha} - Personas: ${r.invitados}
          </p>
        `;
      });
    }
  }
});
