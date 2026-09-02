/* Shared-data adapter. It uses browser storage until Supabase credentials are configured. */
window.DredgeStore = (() => {
  const config = window.DREDGETRACK_CONFIG || {};
  const key = 'dredgetrack-demo-data';
  const local = JSON.parse(localStorage.getItem(key) || '{"documents":[],"logs":[],"approvals":[]}');
  const save = () => localStorage.setItem(key, JSON.stringify(local));
  const ready = Boolean(config.supabaseUrl && config.supabaseAnonKey && window.supabase);
  const client = ready ? window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey) : null;

  async function create(table, record) {
    const row = { ...record, project_id: config.projectId, created_at: new Date().toISOString() };
    if (client) {
      const { error } = await client.from(table).insert(row);
      if (error) throw error;
    } else {
      const bucket = table === 'documents' ? local.documents : table === 'shift_logs' ? local.logs : local.approvals;
      bucket.unshift(row); save();
    }
    return row;
  }
  async function approve(id) {
    if (client) return client.from('approvals').update({ status: 'approved', approved_at: new Date().toISOString() }).eq('id', id);
    const row = local.approvals.find(item => item.id === id); if (row) row.status = 'approved'; save();
  }
  async function storeDocument(file) {
    if (!client) return create('documents', { id: crypto.randomUUID(), name: file.name, file_type: file.name.split('.').pop(), size_bytes: file.size, status: 'review' });
    const { data: session } = await client.auth.getUser();
    if (!session.user) throw new Error('Sign in is required before uploading documents.');
    const storagePath = `${config.projectId}/${session.user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const { error: uploadError } = await client.storage.from('operational-documents').upload(storagePath, file, { upsert: false });
    if (uploadError) throw uploadError;
    return create('documents', { id: crypto.randomUUID(), name: file.name, file_type: file.name.split('.').pop(), size_bytes: file.size, storage_path: storagePath, status: 'review', imported_by: session.user.id });
  }
  return { mode: client ? 'connected' : 'demo', create, approve, storeDocument };
})();

