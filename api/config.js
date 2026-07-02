const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('config')
      .select('clave, valor');
    if (error) return res.status(500).json({ error: error.message });
    const cfg = {};
    data.forEach(row => { cfg[row.clave] = row.valor; });
    return res.status(200).json(cfg);
  }

  if (req.method === 'PUT') {
    const updates = req.body;
    const rows = Object.entries(updates).map(([clave, valor]) => ({ clave, valor: String(valor) }));
    const { error } = await supabase
      .from('config')
      .upsert(rows, { onConflict: 'clave' });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  res.status(405).json({ error: 'Método no permitido' });
};
