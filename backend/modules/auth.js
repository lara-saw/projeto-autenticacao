const jwt = require('jsonwebtoken');

const ADMIN_EMAIL = 'lara@lara.com';
const JWT_SECRET = process.env.AUTH_SECRET || 'desenvolvimento-local-altere-esta-chave';

function createToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '2h' }
  );
}

function requireAuthentication(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Faça login para continuar.' });
  }

  try {
    req.auth = jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ message: 'Sua sessão expirou. Faça login novamente.' });
  }
}

function requireAdmin(req, res, next) {
  if (req.auth.email !== ADMIN_EMAIL) {
    return res.status(403).json({ message: 'Acesso permitido somente à administradora.' });
  }
  return next();
}

module.exports = { ADMIN_EMAIL, createToken, requireAuthentication, requireAdmin };
