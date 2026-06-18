/**
 * main.js — Orquestador de Cuentas Claras v3.0
 *
 * Conecta los módulos: storage, calculator, chips-input, ui.
 * Usa event delegation en lugar de funciones colgadas de window.
 * Carga y persiste datos en localStorage v6.
 */

import { cargarDatos, guardarAportantes, guardarHistorial, guardarTotalPersonas, limpiarDatosJuntada } from './storage.js';
import { calcular } from './calculator.js';
import { createChipsInput } from './chips-input.js';
import { createAppUI } from './ui.js';

let state = cargarDatos();
let textoCompartir = '';
let editingIndex = null;

const ui = createAppUI();

const chipsContainer = document.createElement('div');
chipsContainer.className = 'col-span-10';
ui.form.insertBefore(chipsContainer, ui.inputAlias.parentElement);

const montosChips = createChipsInput(chipsContainer);

if (state.totalPersonas) {
  ui.inputTotalPersonas.value = state.totalPersonas;
}
ui.renderAportantes(state.aportantes);
ui.renderizarChipsHistorial(state.historialNombres, (nombre) => {
  ui.inputNombre.value = nombre;
  montosChips.focus();
});
actualizarUI();

ui.listaPersonas.addEventListener('click', (e) => {
  const btnEliminar = e.target.closest('[data-accion="eliminar-aportante"]');
  if (btnEliminar) {
    e.stopPropagation();
    const index = parseInt(btnEliminar.dataset.indice, 10);
    state.aportantes.splice(index, 1);
    guardarAportantes(state.aportantes);

    if (editingIndex !== null) {
      cancelarEdicion();
    } else {
      ui.renderAportantes(state.aportantes);
      ui.validarCantidadPersonas(parseInt(ui.inputTotalPersonas.value) || 0, state.aportantes.length);
      actualizarUI();
      ui.ocultarResultados();
    }
    return;
  }

  const rowEditar = e.target.closest('[data-accion="editar-aportante"]');
  if (rowEditar) {
    const index = parseInt(rowEditar.dataset.indice, 10);
    const persona = state.aportantes[index];
    if (!persona) return;

    editingIndex = index;

    ui.inputNombre.value = persona.nombre;
    ui.inputAlias.value = persona.alias || '';
    montosChips.reset();
    montosChips.appendMontos(persona.montos);

    ui.activarModoEdicion();
    ui.renderAportantes(state.aportantes, editingIndex);
    ui.ocultarResultados();

    ui.inputNombre.focus();
  }
});

ui.contenedorTransferencias.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-accion="copiar-alias"]');
  if (!btn) return;
  const alias = btn.dataset.alias;
  if (!alias) return;
  navigator.clipboard.writeText(alias).then(() => {
    const originalHtml = btn.innerHTML;
    btn.innerHTML = `<span class="text-[10px] text-emerald-400 font-bold animate-pulse">✓ Copiado</span>`;
    setTimeout(() => {
      btn.innerHTML = originalHtml;
    }, 1500);
  });
});

ui.inputTotalPersonas.addEventListener('keydown', bloquearInvalidos);
ui.inputTotalPersonas.addEventListener('input', (e) => {
  let valor = limpiarNoDigitos(e);
  guardarTotalPersonas(valor);
  ui.ocultarResultados();
  ui.validarCantidadPersonas(parseInt(valor) || 0, state.aportantes.length);
  actualizarUI();
});

ui.inputNombre.addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ]/g, '');
});

ui.inputAlias.addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/[^a-zA-Z0-9.-]/g, '');
});

ui.form.addEventListener('submit', (e) => {
  e.preventDefault();

  const nombre = ui.inputNombre.value.trim();
  if (!nombre) return;

  montosChips.commitPending();

  const montos = montosChips.getMontos();
  if (montos.length === 0) return;
  const alias = ui.inputAlias.value.trim();

  const montoTotal = montos.reduce((s, m) => s + m, 0);
  const personaNueva = { nombre, montos, montoTotal, alias };

  if (editingIndex !== null) {
    state.aportantes[editingIndex] = personaNueva;
    editingIndex = null;
    ui.desactivarModoEdicion();
  } else {
    state.aportantes.push(personaNueva);
  }

  guardarAportantes(state.aportantes);

  state.historialNombres = state.historialNombres.filter(
    (n) => n.toLowerCase() !== nombre.toLowerCase()
  );
  state.historialNombres.unshift(nombre);
  if (state.historialNombres.length > 5) state.historialNombres.pop();
  guardarHistorial(state.historialNombres);
  ui.renderizarChipsHistorial(state.historialNombres, (n) => {
    ui.inputNombre.value = n;
    montosChips.focus();
  });

  ui.renderAportantes(state.aportantes);
  ui.validarCantidadPersonas(parseInt(ui.inputTotalPersonas.value) || 0, state.aportantes.length);
  actualizarUI();

  ui.inputNombre.value = '';
  montosChips.reset();
  ui.inputAlias.value = '';
  ui.inputNombre.focus();
});

ui.btnCalcular.addEventListener('click', () => {
  const totalGente = parseInt(ui.inputTotalPersonas.value) || 0;
  if (totalGente <= 0 || state.aportantes.length === 0) return;

  const resultado = calcular(state.aportantes, totalGente);
  ui.renderResultados(resultado);
  ui.mostrarResultados();

  textoCompartir = ui.generarTextoWhatsApp(resultado);
});

ui.btnCompartir.addEventListener('click', () => {
  if (navigator.share) {
    navigator.share({
      title: 'Resumen de Juntada 🥩🍻',
      text: textoCompartir
    }).catch((err) => {
      if (err.name !== 'AbortError') {
        copiarAlPortapapeles();
      }
    });
  } else {
    copiarAlPortapapeles();
  }

  function copiarAlPortapapeles() {
    navigator.clipboard.writeText(textoCompartir).then(() => {
      ui.feedbackCopiado(ui.btnCompartir);
    }).catch(() => alert('Error al copiar.'));
  }
});

ui.btnReset.addEventListener('click', () => {
  if (!confirm('¿Querés borrar los datos de esta juntada?')) return;

  editingIndex = null;
  ui.desactivarModoEdicion();
  state.aportantes = [];
  ui.inputTotalPersonas.value = '';
  limpiarDatosJuntada();
  montosChips.reset();
  ui.renderAportantes(state.aportantes);
  ui.validarCantidadPersonas(0, 0);
  actualizarUI();
  ui.ocultarResultados();
  ui.form.reset();
});

ui.btnLimpiarHistorial.addEventListener('click', () => {
  state.historialNombres = [];
  guardarHistorial([]);
  ui.renderizarChipsHistorial(state.historialNombres, () => { });
});

ui.btnCancelarEdicion.addEventListener('click', cancelarEdicion);

function cancelarEdicion() {
  editingIndex = null;
  ui.desactivarModoEdicion();
  ui.inputNombre.value = '';
  montosChips.reset();
  ui.inputAlias.value = '';
  ui.renderAportantes(state.aportantes);
  ui.validarCantidadPersonas(parseInt(ui.inputTotalPersonas.value) || 0, state.aportantes.length);
  actualizarUI();
}

function actualizarUI() {
  const totalGente = parseInt(ui.inputTotalPersonas.value) || 0;
  ui.actualizarBotonCalcular(totalGente, state.aportantes.length);
}

function bloquearInvalidos(e) {
  if (['-', '+', 'e', 'E', ',', '.'].includes(e.key)) {
    e.preventDefault();
  }
}

function limpiarNoDigitos(e) {
  let valor = e.target.value.replace(/\D/g, '');
  if (valor.startsWith('0')) valor = valor.replace(/^0+/, '');
  e.target.value = valor;
  return valor;
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('sw.js')
      .then((reg) => console.log('SW registrado', reg))
      .catch((err) => console.error('Error SW', err));
  });
}
