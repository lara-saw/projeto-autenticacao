const user = JSON.parse(localStorage.getItem('authUser') || 'null');
const token = localStorage.getItem('authToken');

if (!user || !token) {
  window.location.replace('login.html');
} else if (user.email === 'lara@lara.com') {
  window.location.replace('admin.html');
} else {
  document.querySelector('#userName').textContent = user.name;
}

document.querySelector('#logoutButton').addEventListener('click', () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('authUser');
  window.location.href = 'login.html';
});
