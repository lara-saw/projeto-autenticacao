const API_BASE_URL = 'http://localhost:3000/api/auth';

async function sendForm(form, endpoint) {
  const submitButton = form.querySelector('button[type="submit"]');
  const originalLabel = submitButton.textContent;
  const data = Object.fromEntries(new FormData(form).entries());

  submitButton.disabled = true;
  submitButton.textContent = 'Aguarde...';

  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.message || 'Não foi possível concluir a operação.');
    }

    await Swal.fire({
      icon: 'success',
      title: 'Sucesso!',
      text: result.message,
      confirmButtonText: 'Continuar'
    });

    form.reset();
    if (endpoint === 'register') {
      window.location.href = 'login.html';
    }
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Ops!',
      text: error.message === 'Failed to fetch'
        ? 'Não foi possível conectar ao servidor. Verifique se o back-end está ativo.'
        : error.message,
      confirmButtonText: 'Tentar novamente'
    });
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalLabel;
  }
}

const registerForm = document.querySelector('#registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!registerForm.checkValidity()) {
      registerForm.reportValidity();
      return;
    }
    sendForm(registerForm, 'register');
  });
}

const loginForm = document.querySelector('#loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!loginForm.checkValidity()) {
      loginForm.reportValidity();
      return;
    }
    sendForm(loginForm, 'login');
  });
}
