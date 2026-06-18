const VERSION = 'v6';

const KEYS = {
  APORTANTES: `cc_aportantes_${VERSION}`,
  HISTORIAL: `cc_historial_nombres_${VERSION}`,
  TOTAL_PERSONAS: `cc_total_personas_${VERSION}`,
};

const OLD_KEYS = {
  APORTANTES_V5: 'cc_aportantes_v5',
  TOTAL_PERSONAS_V5: 'cc_total_personas_v5',
  HISTORIAL_V5: 'cc_historial_nombres_v5',
};

function migrarDesdeV5() {
  const oldAportantes = JSON.parse(localStorage.getItem(OLD_KEYS.APORTANTES_V5));
  const oldTotal = localStorage.getItem(OLD_KEYS.TOTAL_PERSONAS_V5);
  const oldHistorial = JSON.parse(localStorage.getItem(OLD_KEYS.HISTORIAL_V5));

  if (oldAportantes && !localStorage.getItem(KEYS.APORTANTES)) {
    const nuevos = oldAportantes.map(a => ({
      nombre: a.nombre,
      montos: typeof a.monto === 'number' ? [a.monto] : (a.montos || []),
      alias: a.alias || '',
    }));
    localStorage.setItem(KEYS.APORTANTES, JSON.stringify(nuevos));
    localStorage.removeItem(OLD_KEYS.APORTANTES_V5);
  }

  if (oldTotal && !localStorage.getItem(KEYS.TOTAL_PERSONAS)) {
    localStorage.setItem(KEYS.TOTAL_PERSONAS, oldTotal);
    localStorage.removeItem(OLD_KEYS.TOTAL_PERSONAS_V5);
  }

  if (oldHistorial && !localStorage.getItem(KEYS.HISTORIAL)) {
    localStorage.setItem(KEYS.HISTORIAL, JSON.stringify(oldHistorial));
    localStorage.removeItem(OLD_KEYS.HISTORIAL_V5);
  }
}

export function cargarDatos() {
  migrarDesdeV5();

  const aportantesRaw = JSON.parse(localStorage.getItem(KEYS.APORTANTES)) || [];
  const aportantes = aportantesRaw.map(a => {
    const montos = Array.isArray(a.montos) ? a.montos : (typeof a.monto === 'number' ? [a.monto] : []);
    return {
      nombre: a.nombre,
      montos,
      montoTotal: montos.reduce((s, m) => s + m, 0),
      alias: a.alias || '',
    };
  });

  return {
    aportantes,
    historialNombres: JSON.parse(localStorage.getItem(KEYS.HISTORIAL)) || [],
    totalPersonas: localStorage.getItem(KEYS.TOTAL_PERSONAS) || '',
  };
}

export function guardarAportantes(aportantes) {
  const data = aportantes.map(a => ({
    nombre: a.nombre,
    montos: a.montos,
    alias: a.alias,
  }));
  localStorage.setItem(KEYS.APORTANTES, JSON.stringify(data));
}

export function guardarHistorial(historial) {
  localStorage.setItem(KEYS.HISTORIAL, JSON.stringify(historial));
}

export function guardarTotalPersonas(total) {
  localStorage.setItem(KEYS.TOTAL_PERSONAS, total);
}

export function limpiarDatosJuntada() {
  localStorage.removeItem(KEYS.APORTANTES);
  localStorage.removeItem(KEYS.TOTAL_PERSONAS);
}
