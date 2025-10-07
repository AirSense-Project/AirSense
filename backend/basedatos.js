// backend/basedatos.js
const { Pool } = require('pg');

// Crear un pool de conexiones
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres', // 
  password: '2313',     // 👈 tu contraseña real
  port: 5432,
});

// Probar la conexión
pool.connect()
  .then(client => {
    console.log("✅ Conexión exitosa a PostgreSQL");
    client.release();
  })
  .catch(err => console.error("❌ Error de conexión:", err));

// Función general para ejecutar SQL
const query = async (text, params) => {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } catch (err) {
    console.error("❌ Error en la consulta SQL:", err);
    throw err;
  } finally {
    client.release();
  }
};

// 🔹 Obtener todos los municipios
const getMunicipios = async () => {
  const sql = `
    SELECT id_municipio, nombre_municipio
    FROM municipios
    WHERE nombre_municipio IN (
      'CALI', 'PALMIRA', 'BUGA', 'TULUA', 'CARTAGO',
      'BUENAVENTURA', 'YUMBO', 'JAMUNDI', 'CANDELARIA', 'ZARZAL'
    )
    ORDER BY nombre_municipio;
  `;
  const res = await query(sql);
  return res.rows;
};

// 🔹 2 Obtener estaciones de un municipio específico
const getEstacionesPorMunicipio = async (id_municipio) => {
  const sql = `
    SELECT e.id_estacion, e.nombre_estacion, u.latitud, u.longitud, u.anio
    FROM estaciones e
    JOIN ubicaciones_estaciones u ON e.id_estacion = u.id_estacion
    WHERE e.id_municipio = $1;
  `;
  const res = await query(sql, [id_municipio]);
  return res.rows; // muy importante devolver res.rows
};

// Exportar funciones
module.exports = {
  query,
  getMunicipios,
  getEstacionesPorMunicipio
};
