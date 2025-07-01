function cerrarSesion() {
  localStorage.removeItem('usuario');
  alert('Sesión cerrada');
  window.location.href = 'login.html';
}
