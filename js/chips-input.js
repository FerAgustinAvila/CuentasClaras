/**
 * chips-input.js — Montos múltiples estilo chips (Gmail-style)
 *
 * Uso:
 *   const chips = createChipsInput(document.getElementById('contenedor-chips-montos'));
 *   chips.getMontos()       → [500, 1200, 850]
 *   chips.appendMontos([...]) → carga inicial
 *   chips.reset()           → limpia todo
 *   chips.focus()           → enfoca el input
 *   chips.isEmpty()         → true/false
 */

export function createChipsInput(container) {
  let montos = [];

  const wrapper = document.createElement('div');
  wrapper.className =
    'flex flex-wrap items-center gap-1.5 bg-slate-900 border border-slate-600 rounded-lg px-2 py-1.5 min-h-[42px] cursor-text transition-colors focus-within:border-emerald-500';

  const chipsContainer = document.createElement('div');
  chipsContainer.className = 'flex flex-wrap items-center gap-1.5';

  const input = document.createElement('input');
  input.type = 'number';
  input.inputMode = 'numeric';
  input.placeholder = 'Agregá montos...';
  input.className =
    'flex-1 min-w-[80px] bg-transparent border-none outline-none text-white font-semibold text-sm py-0.5 placeholder:text-slate-500';
  input.autocomplete = 'off';

  input.addEventListener('keydown', (e) => {
    if (['-', '+', 'e', 'E', ',', '.'].includes(e.key)) {
      e.preventDefault();
      return;
    }

    if (e.key === ' ') {
      e.preventDefault();
      commitInput(true);
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      commitInput(true);
      return;
    }

    if (e.key === 'Backspace' && input.value === '' && montos.length > 0) {
      e.preventDefault();
      removerUltimo();
    }
  });

  input.addEventListener('input', () => {
    let valor = input.value.replace(/\D/g, '');
    if (valor.startsWith('0')) valor = valor.replace(/^0+/, '');
    input.value = valor;
  });

  input.addEventListener('blur', () => {
    commitInput(false);
  });
  wrapper.addEventListener('click', (e) => {
    if (e.target === wrapper || e.target === chipsContainer) {
      input.focus();
    }
  });

  wrapper.appendChild(chipsContainer);
  wrapper.appendChild(input);
  container.appendChild(wrapper);

  function commitInput(focusAfter = true) {
    const raw = input.value.trim();
    const num = parseInt(raw, 10);
    if (isNaN(num) || num <= 0) return;
    montos.push(num);
    renderizar();
    input.value = '';
    if (focusAfter) {
      input.focus();
    }
    wrapper.dispatchEvent(new CustomEvent('chips-change', { detail: { montos: [...montos] } }));
  }

  function removerUltimo() {
    montos.pop();
    renderizar();
    wrapper.dispatchEvent(new CustomEvent('chips-change', { detail: { montos: [...montos] } }));
  }

  function renderizar() {
    chipsContainer.innerHTML = '';
    montos.forEach((monto, index) => {
      const chip = document.createElement('span');
      chip.className =
        'inline-flex items-center gap-1 bg-slate-700 border border-slate-600 rounded-md px-2 py-0.5 text-sm font-bold text-white select-none';

      const label = document.createElement('span');
      label.textContent = `$${monto.toLocaleString('es-AR')}`;

      const btnRemove = document.createElement('button');
      btnRemove.type = 'button';
      btnRemove.className =
        'text-slate-400 hover:text-red-400 font-bold text-xs leading-none px-0.5 cursor-pointer';
      btnRemove.textContent = '✕';
      btnRemove.setAttribute('aria-label', `Quitar $${monto}`);
      btnRemove.addEventListener('click', (e) => {
        e.stopPropagation();
        montos.splice(index, 1);
        renderizar();
        wrapper.dispatchEvent(new CustomEvent('chips-change', { detail: { montos: [...montos] } }));
      });

      chip.appendChild(label);
      chip.appendChild(btnRemove);
      chipsContainer.appendChild(chip);
    });
  }

  return {
    getMontos() {
      return [...montos];
    },
    appendMontos(arr) {
      if (!arr || arr.length === 0) return;
      const validos = arr.filter((m) => typeof m === 'number' && m > 0);
      montos.push(...validos);
      renderizar();
    },
    reset() {
      montos = [];
      input.value = '';
      renderizar();
    },
    focus() {
      input.focus();
    },
    isEmpty() {
      return montos.length === 0;
    },
    sum() {
      return montos.reduce((s, m) => s + m, 0);
    },
    commitPending() {
      commitInput(false);
    },
    destroy() {
      container.removeChild(wrapper);
    },
  };
}
