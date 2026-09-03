const express = require('express');
const { validateRegistration, validateLogin } = require('../modules/validation');
const { hashPassword, comparePassword } = require('../modules/crypto');
const { addUser, findUserByEmail } = require('../modules/persistence');

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const validation = await validateRegistration(req.body);

    if (!validation.valid) {
      return res.status(validation.status).json({ message: validation.message });
    }

    const { name, email, password } = validation.data;
    const passwordHash = await hashPassword(password);
    const user = await addUser({ name, email, passwordHash });

    return res.status(201).json({
      message: 'Usuário cadastrado com sucesso!',
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    if (error.code === 'EMAIL_EXISTS') {
      return res.status(409).json({ message: 'Este e-mail já está cadastrado.' });
    }
    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const validation = validateLogin(req.body);

    if (!validation.valid) {
      return res.status(validation.status).json({ message: validation.message });
    }

    const { email, password } = validation.data;
    const user = await findUserByEmail(email);
    const authenticated = user && await comparePassword(password, user.passwordHash);

    if (!authenticated) {
      return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
    }

    return res.json({
      message: `Login realizado com sucesso! Bem-vindo(a), ${user.name}.`,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
