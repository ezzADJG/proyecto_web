// Script para agregar un nuevo tour desde el panel de administración

document.addEventListener('DOMContentLoaded', () => {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  // Solo permite acceso a administradores
  if (!usuario || usuario.rol !== 'admin') return location.href = 'login.html';

  const form = document.getElementById('formTour');
  const mensaje = document.getElementById('mensaje');

  // Maneja el envío del formulario para crear un nuevo tour
  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Validación: la descripción corta de "¿Qué esperar?" es obligatoria
    const descCorta = form.querySelector('[name="que_esperar"]').value.trim();
    if (!descCorta) {
      mensaje.innerText = 'La descripción corta de "¿Qué esperar?" es obligatoria.';
      mensaje.style.color = 'red';
      return;
    }

    const formData = new FormData(this);

    try {
      const res = await fetch('/api/tours', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      mensaje.innerText = data.mensaje || data.error;
      mensaje.style.color = data.mensaje ? 'green' : 'red';
      if (data.mensaje) this.reset();
    } catch (err) {
      mensaje.innerText = 'Error de conexión o del servidor.';
      mensaje.style.color = 'red';
    }
  });
});
