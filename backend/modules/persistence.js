const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATABASE_FILE = path.join(DATA_DIR, 'database.json');
const TEMP_FILE = path.join(DATA_DIR, 'database.tmp.json');
let writeQueue = Promise.resolve();

async function ensureDatabase() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATABASE_FILE);
  } catch {
    await fs.writeFile(DATABASE_FILE, JSON.stringify({ users: [] }, null, 2), 'utf8');
  }
}

async function readDatabase() {
  await ensureDatabase();
  const content = await fs.readFile(DATABASE_FILE, 'utf8');
  const database = JSON.parse(content);

  if (!database || !Array.isArray(database.users)) {
    throw new Error('O arquivo database.json possui um formato inválido.');
  }
  return database;
}

async function findUserByEmail(email) {
  const database = await readDatabase();
  const normalizedEmail = String(email).trim().toLowerCase();
  return database.users.find((user) => user.email === normalizedEmail) || null;
}

function addUser(userData) {
  const operation = writeQueue.then(async () => {
    const database = await readDatabase();
    const email = userData.email.trim().toLowerCase();

    if (database.users.some((user) => user.email === email)) {
      const error = new Error('E-mail já cadastrado.');
      error.code = 'EMAIL_EXISTS';
      throw error;
    }

    const newUser = {
      id: crypto.randomUUID(),
      name: userData.name,
      email,
      passwordHash: userData.passwordHash,
      createdAt: new Date().toISOString()
    };

    database.users.push(newUser);
    await fs.writeFile(TEMP_FILE, JSON.stringify(database, null, 2), 'utf8');
    await fs.rename(TEMP_FILE, DATABASE_FILE);
    return newUser;
  });

  writeQueue = operation.catch(() => undefined);
  return operation;
}

module.exports = { ensureDatabase, readDatabase, findUserByEmail, addUser };
