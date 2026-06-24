const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  const parts = event.path.replace(/\/+$/, '').split('/');
  const lastPart = parts[parts.length - 1];
  const id = lastPart && /^\d+$/.test(lastPart) ? lastPart : null;

  try {
    if (event.httpMethod === 'GET') {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('id', { ascending: false });
      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (event.httpMethod === 'POST') {
      const { nombre, telefono, correo, estado } = JSON.parse(event.body);
      const { data, error } = await supabase
        .from('clientes')
        .insert({ nombre, telefono, correo, estado })
        .select()
        .single();
      if (error) throw error;
      return { statusCode: 201, headers, body: JSON.stringify(data) };
    }

    if (event.httpMethod === 'PUT' && id) {
      const { nombre, telefono, correo, estado } = JSON.parse(event.body);
      const { data, error } = await supabase
        .from('clientes')
        .update({ nombre, telefono, correo, estado })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (event.httpMethod === 'DELETE' && id) {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Método no permitido' }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
