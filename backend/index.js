// backend/index.js
const express = require("express");
const cors = require("cors");
const db = require("./basedatos");
const path = require("path");
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ✅ Servir los archivos del frontend (carpeta public)
app.use(express.static(path.join(__dirname, "../public")));

// ----------------------------------------------------------------------
// RUTAS API
// ----------------------------------------------------------------------

// 🔹 Municipios (con coordenadas fijas añadidas)
app.get("/api/municipios", async (req, res) => {
  try {
    const municipiosDB = await db.getMunicipios();

    const coords = {
      "BUENAVENTURA": { latitud: 3.8801, longitud: -77.0312 },
      "BUGA": { latitud: 3.9020, longitud: -76.2978 },
      "CALI": { latitud: 3.4516, longitud: -76.5320 },
      "CANDELARIA": { latitud: 3.4067, longitud: -76.3486 },
      "CARTAGO": { latitud: 4.7464, longitud: -75.9117 },
      "JAMUNDI": { latitud: 3.2599, longitud: -76.5410 },
      "PALMIRA": { latitud: 3.5394, longitud: -76.3036 },
      "TULUA": { latitud: 4.0847, longitud: -76.1954 },
      "YUMBO": { latitud: 3.5829, longitud: -76.4910 },
      "ZARZAL": { latitud: 4.3853, longitud: -76.0792 }
    };

    const municipios = municipiosDB.map(m => ({
      id_municipio: m.id_municipio,
      nombre_municipio: m.nombre_municipio,
      latitud: coords[m.nombre_municipio.toUpperCase()]?.latitud || null,
      longitud: coords[m.nombre_municipio.toUpperCase()]?.longitud || null
    }));

    res.json(municipios);
  } catch (err) {
    console.error("Error al obtener municipios:", err);
    res.status(500).send("Error al obtener municipios");
  }
});

// 🔹 Estaciones por municipio
app.get("/api/estaciones/:id_municipio", async (req, res) => {
  const { id_municipio } = req.params;
  try {
    const result = await db.query(`
      SELECT e.id_estacion, e.nombre_estacion, u.latitud, u.longitud, u.anio
      FROM estaciones e
      JOIN ubicaciones_estaciones u ON e.id_estacion = u.id_estacion
      WHERE e.id_municipio = $1
        AND u.anio = (
          SELECT MAX(anio)
          FROM ubicaciones_estaciones
          WHERE id_estacion = e.id_estacion
        )
      ORDER BY e.nombre_estacion;
    `, [id_municipio]);

    res.json(result.rows);
  } catch (err) {
    console.error("Error obteniendo estaciones:", err);
    res.status(500).send("Error al obtener estaciones");
  }
});

// ✅ Servir el index.html por defecto
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Servidor activo en: http://localhost:${PORT}`);
});
