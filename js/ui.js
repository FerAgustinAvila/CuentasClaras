/**
 * ui.js — Renderizado del DOM
 *
 * No usa innerHTML con datos de usuario para evitar XSS y no necesita
 * función escapeHtml (el runtime procesa entidades HTML automáticamente).
 */

export function createAppUI() {
  const $ = (id) => document.getElementById(id);

  return {
    sinPersonas: $('sin-personas'),
    listaPersonas: $('lista-personas'),
    btnCalcular: $('btn-calcular'),
    resultadosSection: $('resultados-section'),
    txtGastoTotal: $('gasto-total'),
    txtCuotaIndividual: $('cuota-individual'),
    contenedorTransferencias: $('contenedor-transferencias'),
    btnCompartir: $('btn-compartir'),
    btnReset: $('btn-reset'),
    inputNombre: $('nombre'),
    inputAlias: $('alias'),
    inputTotalPersonas: $('total-personas'),
    form: $('persona-form'),
    contenedorChips: $('contenedor-chips'),
    listaChips: $('lista-chips'),
    btnLimpiarHistorial: $('btn-limpiar-historial'),
    btnCancelarEdicion: $('btn-cancelar-edicion'),
    btnSubmitPersona: $('btn-submit-persona'),

    renderAportantes(aportantes, editingIndex = null) {
      this.listaPersonas.innerHTML = '';

      if (aportantes.length === 0) {
        this.sinPersonas.classList.remove('hidden');
        this.listaPersonas.appendChild(this.sinPersonas);
        return;
      }

      this.sinPersonas.classList.add('hidden');

      aportantes.forEach((p, index) => {
        const li = document.createElement('li');

        if (index === editingIndex) {
          li.className = 'flex justify-between items-center py-2.5 px-2 -mx-2 rounded-lg text-white text-sm cursor-pointer bg-indigo-950/60 border border-indigo-500/50 hover:bg-indigo-950/80 transition-colors shadow-inner';
          li.title = 'Editando ahora';
        } else {
          li.className = 'flex justify-between items-center py-2.5 px-2 -mx-2 rounded-lg text-slate-300 text-sm cursor-pointer hover:bg-slate-700/20 transition-colors';
          li.title = 'Toca para editar';
        }

        li.dataset.indice = String(index);
        li.dataset.accion = 'editar-aportante';

        const leftDiv = document.createElement('div');
        leftDiv.className = 'truncate pr-2';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'font-medium text-slate-200 block truncate';
        nameSpan.textContent = p.nombre;
        leftDiv.appendChild(nameSpan);

        if (p.montos && p.montos.length > 0) {
          const montosDetail = document.createElement('span');
          montosDetail.className = 'block text-[10px] text-slate-500 truncate max-w-[160px]';
          montosDetail.textContent = p.montos.length > 1
            ? p.montos.map(m => `$${m.toLocaleString('es-AR')}`).join(' + ')
            : `$${p.montoTotal.toLocaleString('es-AR')}`;
          leftDiv.appendChild(montosDetail);
        }

        if (p.alias) {
          const aliasSpan = document.createElement('span');
          aliasSpan.className = 'block text-[10px] text-slate-500 truncate max-w-[150px]';
          aliasSpan.textContent = `🔑 ${p.alias}`;
          leftDiv.appendChild(aliasSpan);
        }

        const rightDiv = document.createElement('div');
        rightDiv.className = 'flex items-center gap-3 shrink-0';

        const badge = document.createElement('span');
        badge.className = 'bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-3 py-0.5 rounded-full text-xs font-bold';
        badge.textContent = `$${p.montoTotal.toLocaleString('es-AR')}`;
        rightDiv.appendChild(badge);

        const btnRemove = document.createElement('button');
        btnRemove.dataset.indice = String(index);
        btnRemove.dataset.accion = 'eliminar-aportante';
        btnRemove.className = 'text-slate-500 hover:text-red-400 font-bold px-1 cursor-pointer';
        btnRemove.textContent = '✕';
        rightDiv.appendChild(btnRemove);

        li.appendChild(leftDiv);
        li.appendChild(rightDiv);
        this.listaPersonas.appendChild(li);
      });
    },

    activarModoEdicion() {
      this.btnCancelarEdicion.classList.remove('hidden');
      this.inputAlias.classList.remove('col-span-10');
      this.inputAlias.classList.add('col-span-8');
      this.btnSubmitPersona.classList.remove('bg-emerald-600', 'hover:bg-emerald-500');
      this.btnSubmitPersona.classList.add('bg-indigo-600', 'hover:bg-indigo-500');
      this.btnSubmitPersona.textContent = '✓';
    },

    desactivarModoEdicion() {
      this.btnCancelarEdicion.classList.add('hidden');
      this.inputAlias.classList.remove('col-span-8');
      this.inputAlias.classList.add('col-span-10');
      this.btnSubmitPersona.classList.remove('bg-indigo-600', 'hover:bg-indigo-500');
      this.btnSubmitPersona.classList.add('bg-emerald-600', 'hover:bg-emerald-500');
      this.btnSubmitPersona.textContent = '+';
    },

    actualizarBotonCalcular(totalGente, cantidadAportantes) {
      const ok = totalGente > 0 && cantidadAportantes > 0 && totalGente >= cantidadAportantes;

      if (ok) {
        this.btnCalcular.disabled = false;
        this.btnCalcular.className =
          'w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:scale-[0.98] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg text-md tracking-wide uppercase cursor-pointer';
      } else {
        this.btnCalcular.disabled = true;
        this.btnCalcular.className =
          'w-full bg-slate-700 text-slate-500 font-bold py-3.5 rounded-xl transition-all shadow-lg text-md tracking-wide uppercase cursor-not-allowed';
      }
    },

    renderResultados(resultado) {
      const { gastoTotal, cuotaIndividual } = resultado;

      this.txtGastoTotal.textContent = `$${gastoTotal.toLocaleString('es-AR')}`;
      this.txtCuotaIndividual.textContent = `$${cuotaIndividual.toLocaleString('es-AR')}`;

      this.contenedorTransferencias.innerHTML = '';

      if (!resultado.hayTransferencias) {
        const div = document.createElement('div');
        div.className = 'text-center py-4 text-slate-400 text-sm font-medium';
        div.textContent = 'Estamos todos a mano 🤝';
        this.contenedorTransferencias.appendChild(div);
        return;
      }

      resultado.transferencias.forEach((t) => {
        const div = document.createElement('div');
        div.className = 'grid grid-cols-12 items-center text-xs gap-1 py-2.5 px-3';

        const deudorSpan = document.createElement('span');
        deudorSpan.className = 'col-span-3 text-red-400 font-bold text-left truncate';
        deudorSpan.textContent = t.deudor;
        div.appendChild(deudorSpan);

        const montoCol = document.createElement('div');
        montoCol.className = 'col-span-2 flex flex-col items-center justify-center border-l border-slate-800 px-0.5';
        const pagaLabel = document.createElement('span');
        pagaLabel.className = 'text-[8px] uppercase font-bold text-slate-500';
        pagaLabel.textContent = t.esGrupal && t.cantidad > 1 ? 'Pagan c/u' : 'Paga';
        montoCol.appendChild(pagaLabel);
        const montoSpan = document.createElement('span');
        montoSpan.className = 'text-xs font-black text-white';
        montoSpan.textContent = `$${t.monto.toLocaleString('es-AR')}`;
        montoCol.appendChild(montoSpan);
        div.appendChild(montoCol);

        const acreedorSpan = document.createElement('span');
        acreedorSpan.className = 'col-span-3 text-emerald-400 font-bold text-left truncate border-l border-slate-800 pl-1.5';
        acreedorSpan.textContent = `a ${t.acreedor}`;
        div.appendChild(acreedorSpan);

        if (t.alias) {
          const aliasBtn = document.createElement('button');
          aliasBtn.dataset.alias = t.alias;
          aliasBtn.dataset.accion = 'copiar-alias';
          aliasBtn.className = 'col-span-4 text-left pl-2 border-l border-slate-800 cursor-pointer focus:outline-none w-full group';
          aliasBtn.setAttribute('aria-label', 'Copiar alias');

          const aliasLabel = document.createElement('span');
          aliasLabel.className = 'block text-[8px] text-slate-500 font-bold uppercase tracking-wide group-hover:text-indigo-400 transition-colors';
          aliasLabel.textContent = 'Alias (Toca)';
          aliasBtn.appendChild(aliasLabel);

          const aliasText = document.createElement('span');
          aliasText.className = 'block text-[11px] text-indigo-400 font-semibold truncate max-w-full';
          aliasText.textContent = t.alias;
          aliasBtn.appendChild(aliasText);

          div.appendChild(aliasBtn);
        } else {
          const empty = document.createElement('div');
          empty.className = 'col-span-4';
          div.appendChild(empty);
        }

        this.contenedorTransferencias.appendChild(div);
      });
    },

    ocultarResultados() {
      this.resultadosSection.classList.add('hidden');
    },

    mostrarResultados() {
      this.resultadosSection.classList.remove('hidden');
      this.resultadosSection.scrollIntoView({ behavior: 'smooth' });
    },

    validarCantidadPersonas(totalGente, cantidadAportantes) {
      if (totalGente > 0 && totalGente < cantidadAportantes) {
        this.inputTotalPersonas.classList.add('border-red-500', 'bg-red-950/20');
      } else {
        this.inputTotalPersonas.classList.remove('border-red-500', 'bg-red-950/20');
      }
    },

    renderizarChipsHistorial(historial, onSeleccionar) {
      this.listaChips.innerHTML = '';
      if (historial.length === 0) {
        this.contenedorChips.classList.add('hidden');
        return;
      }
      this.contenedorChips.classList.remove('hidden');

      historial.forEach((nombre) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className =
          'bg-slate-700 hover:bg-slate-640 active:scale-95 px-2.5 py-1 rounded-md shrink-0 transition-all font-medium text-slate-200 cursor-pointer';
        btn.textContent = nombre;
        btn.addEventListener('click', () => onSeleccionar(nombre));
        this.listaChips.appendChild(btn);
      });
    },

    generarTextoWhatsApp(resultado) {
      if (!resultado.hayTransferencias) {
        return '💰 *Cuentas Claras* \n¡Estamos todos a mano! No se debe nada.';
      }

      const lineas = resultado.transferencias.map((t) => {
        const aliasStr = t.alias ? ` *(Alias: ${t.alias})*` : '';
        const cuStr = t.esGrupal && t.cantidad > 1 ? ' c/u' : '';
        return `• *${t.deudor}* ➡️ *$${t.monto.toLocaleString('es-AR')}${cuStr}* a *${t.acreedor}*${aliasStr}`;
      });

      return (
        `💰 *RESUMEN DE LA JUNTADA* 🥩🍻\n\n` +
        `• *Gasto Total:* $${resultado.gastoTotal.toLocaleString('es-AR')}\n` +
        `• *Por cabeza:* $${resultado.cuotaIndividual.toLocaleString('es-AR')}\n\n` +
        `*TRANSFERENCIAS:* \n` +
        lineas.join('\n') +
        `\n\n_Calculado con Cuentas Claras_`
      );
    },

    feedbackCopiado(btn) {
      const originalHtml = btn.innerHTML;
      btn.innerHTML = '✅ ¡Resumen copiado!';
      btn.classList.replace('text-emerald-400', 'text-white');
      btn.classList.add('bg-emerald-700');
      setTimeout(() => {
        btn.innerHTML = originalHtml;
        btn.classList.replace('text-white', 'text-emerald-400');
        btn.classList.remove('bg-emerald-700');
      }, 2000);
    },
  };
}
