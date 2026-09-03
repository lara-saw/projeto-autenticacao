const { findUserByEmail } = require('./persistence');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

async function validateRegistration(body = {}) {
  const name = String(body.name || '').trim();
  const email = normalizeEmail(body.email);
  const password = String(body.password || '');

  if (!name) {
    return { valid: false, status: 400, message: 'Informe o nome.' };
  }
  if (!EMAIL_PATTERN.test(email)) {
    return { valid: false, status: 400, message: 'Informe um e-mail válido.' };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      valid: false,
      status: 400,
      message: `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`
    };
  }
  if (await findUserByEmail(email)) {
    return { valid: false, status: 409, message: 'Este e-mail já está cadastrado.' };
  }

  return { valid: true, data: { name, email, password } };
}

function validateLogin(body = {}) {
  const email = normalizeEmail(body.email);
  const password = String(body.password || '');

  if (!EMAIL_PATTERN.test(email) || !password) {
    return { valid: false, status: 400, message: 'Informe e-mail e senha válidos.' };
  }

  return { valid: true, data: { email, password } };
}

module.exports = { validateRegistration, validateLogin };
