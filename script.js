const menuBtn = document.getElementById('menuBtn');
const nav = document.getElementById('nav');

menuBtn.addEventListener('click', () => {
  nav.classList.toggle('open');
});

nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => nav.classList.remove('open'));
});

document.getElementById('year').textContent = new Date().getFullYear();
