// Código para manejar el inicio de sesión y registro de usuarios

document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');

  if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.error) return alert(data.error);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      alert('Inicio de sesión exitoso');
      window.location.href = 'index.html';
    });
  }

  if (registerBtn) {
    registerBtn.addEventListener('click', async () => {
      const nombre = document.getElementById('nombre').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ nombre, email, password })
      });
      const data = await res.json();
      if (data.error) return alert(data.error);
      alert('Registrado correctamente');
      window.location.href = 'login.html';
    });
  }
});

// Función para mostrar/ocultar la contraseña

const password = document.querySelector('#password');
const eye = document.querySelector('#icon-eye');

eye.addEventListener('click', () => {
	if (password.type === 'password') {
		password.type = 'text';
		eye.classList.remove('fa-eye-slash');
		eye.classList.add('fa-eye');
	} else {
		password.type = 'password';
		eye.classList.remove('fa-eye');
		eye.classList.add('fa-eye-slash');
	}
});
