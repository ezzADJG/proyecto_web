document.addEventListener('DOMContentLoaded', () => {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  if (!usuario || usuario.rol !== 'admin') return location.href = 'login.html';

  const form = document.getElementById('formTour');
  const mensaje = document.getElementById('mensaje');

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Validación simple: descripción corta obligatoria
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
