document.getElementById('container-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nombre = document.getElementById('nombre').value;
  const email = document.getElementById('email').value;
  const telefono = document.getElementById('telefono').value;
  const asunto = document.getElementById('asunto').value;
  const mensaje = document.getElementById('mensaje').value;

  try {
    const res = await fetch('/api/contacto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, telefono, asunto, mensaje })
    });

    const data = await res.json();
    alert(data.mensaje || 'Mensaje enviado con éxito.');
    document.getElementById('container-form').reset();
  } catch (err) {
    alert('Hubo un error al enviar el mensaje.');
  }
});
