const modal = document.getElementById('modal');
document.getElementById('newLog').addEventListener('click', () => modal.classList.add('visible'));
document.getElementById('closeModal').addEventListener('click', () => modal.classList.remove('visible'));
modal.addEventListener('click', event => { if (event.target === modal) modal.classList.remove('visible'); });
document.querySelector('.log-modal').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  window.DredgeStore.create('shift_logs', {
    id: crypto.randomUUID(),
    vessel_name: form.querySelector('select').value,
    production_m3: Number(form.querySelector('input').value || 0),
    notes: form.querySelector('textarea').value,
    status: 'submitted'
  }).catch(error => console.error('Could not save shift log', error));
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

const input = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const importList = document.getElementById('importList');
const toast = document.getElementById('toast');
const showToast = message => { toast.textContent = `âœ“ ${message}`; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2800); };
const fileType = name => {
  const ext = name.split('.').pop().toLowerCase();
  return ext === 'pdf' ? 'PDF' : ['doc', 'docx'].includes(ext) ? 'DOC' : ext === 'csv' ? 'CSV' : 'XLS';
};
const addFiles = files => [...files].forEach(file => {
  const type = fileType(file.name);
  const row = document.createElement('div');
  row.className = 'import-row';
  row.innerHTML = `<span class="file-type ${type === 'PDF' ? 'pdf' : type === 'DOC' ? 'doc' : 'xlsx'}">${type}</span><p><strong>${file.name}</strong><small>Imported just now Â· ${(file.size / 1024).toFixed(0)} KB</small></p><span class="import-status review">Review</span><button class="more">â€¢â€¢â€¢</button>`;
  importList.prepend(row);
  window.DredgeStore.create('documents', {
    id: crypto.randomUUID(), name: file.name, file_type: type, size_bytes: file.size, status: 'review'
  }).catch(error => console.error('Could not register document', error));
  showToast(`${file.name} added for review`);
});
document.getElementById('uploadTrigger').addEventListener('click', () => input.click());
document.getElementById('selectFiles').addEventListener('click', () => input.click());
document.getElementById('browseFiles').addEventListener('click', () => input.click());
input.addEventListener('change', () => { addFiles(input.files); input.value = ''; });
['dragenter', 'dragover'].forEach(event => dropZone.addEventListener(event, e => { e.preventDefault(); dropZone.classList.add('dragging'); }));
['dragleave', 'drop'].forEach(event => dropZone.addEventListener(event, e => { e.preventDefault(); dropZone.classList.remove('dragging'); }));
dropZone.addEventListener('drop', e => addFiles(e.dataTransfer.files));
document.querySelectorAll('.approve').forEach(button => button.addEventListener('click', () => {
  const item = button.parentElement;
  item.style.opacity = '.45';
  button.textContent = 'Approved';
  button.disabled = true;
  window.DredgeStore.create('approvals', {
    id: crypto.randomUUID(), title: item.querySelector('strong').textContent, record_type: 'operations_record', status: 'approved'
  }).catch(error => console.error('Could not save approval', error));
  showToast('Record approved and added to the audit trail');
}));
document.getElementById('generateReport').addEventListener('click', () => showToast('Daily operations report is being prepared'));
document.querySelectorAll('.report-cards button').forEach(button => button.addEventListener('click', () => showToast(`${button.querySelector('strong').textContent} selected`)));

