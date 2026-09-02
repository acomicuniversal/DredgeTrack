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
  return { mode: client ? 'connected' : 'demo', create, approve };
})();

