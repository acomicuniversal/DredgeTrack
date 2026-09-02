const modal = document.getElementById('modal');
document.getElementById('newLog').addEventListener('click', () => modal.classList.add('visible'));
document.getElementById('closeModal').addEventListener('click', () => modal.classList.remove('visible'));
modal.addEventListener('click', event => { if (event.target === modal) modal.classList.remove('visible'); });
document.querySelector('.log-modal').addEventListener('submit', event => {
  event.preventDefault();
  modal.classList.remove('visible');
  const button = document.getElementById('newLog');
  const old = button.textContent;
  button.textContent = 'âœ“ Log saved';
  setTimeout(() => button.textContent = old, 2200);
});
document.querySelectorAll('nav a').forEach(link => link.addEventListener('click', () => {
  document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
  link.classList.add('active');
}));

