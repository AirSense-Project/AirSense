document.addEventListener("DOMContentLoaded", async () => {
  console.log("🌍 AirSense iniciado");

  // Inicializar mapa centrado en Valle del Cauca
  const map = L.map("map").setView([3.45, -76.5], 8);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  // Capas separadas
  const municipiosLayer = L.layerGroup().addTo(map);
  const estacionesLayer = L.layerGroup().addTo(map);

  // Referencias a elementos del DOM
  const select = document.getElementById("selectMunicipio");
  const boton = document.getElementById("btnMostrarEstaciones");

  // --- Cargar municipios ---
  async function cargarMunicipios() {
    try {
      const res = await fetch("/api/municipios");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const municipios = await res.json();

      select.innerHTML = '<option value="">-- Selecciona un municipio --</option>';

      municipios.forEach((m) => {
        const option = document.createElement("option");
        option.value = m.id_municipio;
        option.textContent = m.nombre_municipio;
        select.appendChild(option);

        if (m.latitud && m.longitud) {
          const marker = L.marker([m.latitud, m.longitud]).addTo(municipiosLayer);
          marker.bindPopup(`<b>${m.nombre_municipio}</b>`);
        }
      });

      console.log("✅ Municipios cargados correctamente");
    } catch (err) {
      console.error("Error al cargar municipios:", err);
      alert("No se pudieron cargar los municipios.");
    }
  }

  // --- Mostrar estaciones ---
  async function mostrarEstaciones() {
    const idMunicipio = select.value;
    if (!idMunicipio) {
      alert("Selecciona un municipio primero");
      return;
    }

    try {
      const res = await fetch(`/api/estaciones/${idMunicipio}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const estaciones = await res.json();

      // Limpiar capa de estaciones
      estacionesLayer.clearLayers();

      // Ocultar capa de municipios (para que no se vean sus marcadores)
      if (map.hasLayer(municipiosLayer)) {
        map.removeLayer(municipiosLayer);
      }

      if (estaciones.length === 0) {
        alert("No hay estaciones registradas para este municipio.");
        return;
      }

      const bounds = [];

      estaciones.forEach((est) => {
        if (est.latitud && est.longitud) {
          const marker = L.marker([est.latitud, est.longitud]).addTo(estacionesLayer);

          marker.bindPopup(`
            <b>${est.nombre_estacion}</b><br>
            <b>ID estación:</b> ${est.id_estacion}<br>
            <b>Año:</b> ${est.anio}<br>
            <b>Latitud:</b> ${est.latitud}<br>
            <b>Longitud:</b> ${est.longitud}
          `);

          marker.bindTooltip(est.nombre_estacion, {
            permanent: false,
            direction: "top",
          });

          bounds.push([est.latitud, est.longitud]);
        }
      });

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
      }

      console.log(`✅ Estaciones mostradas para municipio ID ${idMunicipio}`);
    } catch (err) {
      console.error("Error al cargar estaciones:", err);
      alert("Error al cargar las estaciones.");
    }
  }

  // --- Volver a mostrar municipios si se deselecciona ---
  function mostrarMunicipiosSiNoHaySeleccion() {
    if (!select.value) {
      if (!map.hasLayer(municipiosLayer)) {
        map.addLayer(municipiosLayer);
      }
      estacionesLayer.clearLayers();
      map.setView([3.45, -76.5], 8);
    }
  }

  // --- Eventos ---
  await cargarMunicipios();

  if (boton) boton.addEventListener("click", mostrarEstaciones);
  if (select) {
    select.addEventListener("change", mostrarEstaciones);
    select.addEventListener("change", mostrarMunicipiosSiNoHaySeleccion);
  }
});
