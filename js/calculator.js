function agruparTransferencias(trans) {
  const result = [];
  const grupos = {};

  trans.forEach(t => {
    const esAnonimo = t.deudor === 'El que falta' || t.deudor.startsWith('Invitado #');
    if (!esAnonimo) {
      result.push({ ...t, esGrupal: false, cantidad: 1 });
    } else {
      const key = `${t.acreedor}|${t.monto}|${t.alias || ''}`;
      if (!grupos[key]) {
        grupos[key] = {
          deudores: [],
          acreedor: t.acreedor,
          monto: t.monto,
          alias: t.alias
        };
      }
      grupos[key].deudores.push(t.deudor);
    }
  });

  for (const key in grupos) {
    const g = grupos[key];
    const cant = g.deudores.length;
    if (cant === 1 && g.deudores[0] === 'El que falta') {
      result.push({
        deudor: 'El que falta',
        acreedor: g.acreedor,
        monto: g.monto,
        alias: g.alias,
        esGrupal: false,
        cantidad: 1
      });
    } else {
      result.push({
        deudor: `El resto (${cant} pers.)`,
        acreedor: g.acreedor,
        monto: g.monto,
        alias: g.alias,
        esGrupal: true,
        cantidad: cant
      });
    }
  }

  return result;
}

export function calcular(apertantes, totalGente) {
  const gastoTotal = apertantes.reduce((sum, p) => sum + p.montoTotal, 0);
  const cuotaIndividual = gastoTotal / totalGente;

  const todos = [...apertantes];
  const losDemas = totalGente - apertantes.length;

  if (losDemas === 1) {
    todos.push({ nombre: 'El que falta', montoTotal: 0, alias: '', montos: [] });
  } else if (losDemas > 1) {
    for (let i = 1; i <= losDemas; i++) {
      todos.push({ nombre: `Invitado #${i}`, montoTotal: 0, alias: '', montos: [] });
    }
  }

  const deudores = [];
  const acreedores = [];

  todos.forEach((p) => {
    const saldo = p.montoTotal - cuotaIndividual;
    if (saldo < -0.99) deudores.push({ nombre: p.nombre, saldo: Math.abs(saldo) });
    else if (saldo > 0.99) acreedores.push({ nombre: p.nombre, saldo, alias: p.alias });
  });

  const transferencias = [];
  let i = 0;
  let j = 0;

  while (i < deudores.length && j < acreedores.length) {
    const d = deudores[i];
    const a = acreedores[j];

    if (d.saldo < 1) { i++; continue; }
    if (a.saldo < 1) { j++; continue; }

    const transferir = Math.min(d.saldo, a.saldo);
    transferencias.push({ deudor: d.nombre, acreedor: a.nombre, monto: Math.round(transferir), alias: a.alias });

    d.saldo -= transferir;
    a.saldo -= transferir;

    if (d.saldo < 1) i++;
    if (a.saldo < 1) j++;
  }

  const transferenciasAgrupadas = agruparTransferencias(transferencias);

  return {
    gastoTotal: Math.round(gastoTotal),
    cuotaIndividual: Math.round(cuotaIndividual),
    transferencias: transferenciasAgrupadas,
    hayTransferencias: transferenciasAgrupadas.length > 0,
  };
}
