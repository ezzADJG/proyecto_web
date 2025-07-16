// Script para gestionar la visibilidad de elementos según el estado de sesión del usuario

document.addEventListener('DOMContentLoaded', () => {
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  // Si no hay usuario logueado, mostrar el modal de aviso
  if (!usuario) {
    const modal = document.getElementById('modalAviso');
    modal.style.display = 'flex';
    document.getElementById('cerrarModalAviso').onclick = function() {
      modal.style.display = 'none';
    };
    return;
  }

  // Si hay usuario, mostrar enlaces de perfil y ocultar login/register
  document.getElementById('perfilLink').innerHTML = `<a href="perfil.html" class='sign-in'>Mi Perfil</a>`;
  document.getElementById('perfilLink_responsive').innerHTML = `<a href="perfil.html" class='sign-in'>Mi Perfil</a>`;
  const login = document.getElementById('login');
  const register = document.getElementById('register');
  const login_res = document.getElementById('login_responsive');
  const register_res = document.getElementById('register_responsive');
  const perfil= document.getElementById('perfilLink');
  const perfil_resp= document.getElementById('perfilLink_responsive');
  const cerrarSesionBtn = document.getElementById('closeBtn');

  login.style.display = 'none';
  register.style.display = 'none';
  login_res.style.display = 'none';
  register_res.style.display = 'none';
  perfil.style.display = 'block';
  perfil_resp.style.display = 'block';
  cerrarSesionBtn.style.display = 'block';

});

// Función para cerrar sesión y limpiar datos del usuario
function cerrarSesion() {
  localStorage.removeItem('usuario');
  alert('Sesión cerrada');
  window.location.href = 'index.html';
}