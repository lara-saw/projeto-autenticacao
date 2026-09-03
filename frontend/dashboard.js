const token = localStorage.getItem('authToken');
const storedUser = JSON.parse(localStorage.getItem('authUser') || 'null');

function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('authUser');
  window.location.href = 'login.html';
}

document.querySelector('#logoutButton').addEventListener('click', logout);

if (!token || storedUser?.email !== 'lara@lara.com') {
  window.location.replace(storedUser ? 'welcome.html' : 'login.html');
} else {
  loadUsers();
}

async function loadUsers() {
  try {
    const response = await fetch('/api/auth/users', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) logout();
      throw new Error(result.message || 'Não foi possível carregar os usuários.');
    }

    const body = document.querySelector('#usersTableBody');
    result.users.forEach((user) => {
      const row = document.createElement('tr');
      const values = [
        user.name,
        user.email,
        user.createdAt ? new Date(user.createdAt).toLocaleString('pt-BR') : 'Não informado'
      ];
      values.forEach((value) => {
        const cell = document.createElement('td');
        cell.textContent = value;
        row.appendChild(cell);
      });
      body.appendChild(row);
    });

    document.querySelector('#userCount').textContent = result.users.length;
    document.querySelector('#loading').classList.add('d-none');
    document.querySelector('#tableWrapper').classList.remove('d-none');
  } catch (error) {
    document.querySelector('#loading').textContent = error.message;
    Swal.fire({ icon: 'error', title: 'Ops!', text: error.message });
  }
}
