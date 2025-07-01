document.addEventListener('DOMContentLoaded', () => {
  // Verifica si el usuario está logueado
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  if (!usuario) return alert('Te recordamos que debes iniciar sesión para disfrutar de nuestros servicios.');

  // document.getElementById('saludo').innerText = `Bienvenido, ${usuario.nombre}`;
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

function cerrarSesion() {
  localStorage.removeItem('usuario');
  alert('Sesión cerrada');
  window.location.href = 'index.html';
}