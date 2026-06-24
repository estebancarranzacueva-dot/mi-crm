const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const db = new Database('crm.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    telefono TEXT NOT NULL,
    correo TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'prospecto',
    creado_en TEXT NOT NULL DEFAULT (datetime('now','localtime'))
  )
`);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/clientes', (req, res) => {
  const clientes = db.prepare('SELECT * FROM clientes ORDER BY id DESC').all();
  res.json(clientes);
});

app.post('/api/clientes', (req, res) => {
  const { nombre, telefono, correo, estado } = req.body;
  if (!nombre || !telefono || !correo || !estado) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }
  const result = db.prepare(
    'INSERT INTO clientes (nombre, telefono, correo, estado) VALUES (?, ?, ?, ?)'
  ).run(nombre, telefono, correo, estado);
  const nuevo = db.prepare('SELECT * FROM clientes WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(nuevo);
});

app.put('/api/clientes/:id', (req, res) => {
  const { nombre, telefono, correo, estado } = req.body;
  const { id } = req.params;
  db.prepare(
    'UPDATE clientes SET nombre=?, telefono=?, correo=?, estado=? WHERE id=?'
  ).run(nombre, telefono, correo, estado, id);
  const actualizado = db.prepare('SELECT * FROM clientes WHERE id = ?').get(id);
  res.json(actualizado);
});

app.delete('/api/clientes/:id', (req, res) => {
  db.prepare('DELETE FROM clientes WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`CRM corriendo en http://localhost:${PORT}`);
});
