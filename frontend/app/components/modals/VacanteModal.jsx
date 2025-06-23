"use client";
import { Alert } from "../alerts/alerts";

export default async function mostrarVacantesModal({ vacantesData }) {
  const inputOptions = {};
  vacantesData.forEach((v) => {
    inputOptions[v.Id_Vacante] = v.Descripcion;
  });

const seleccion = await Alert({
  title: 'Vacantes disponibles',
  html: `
    <div class="text-white text-left space-y-4">
      ${vacantesData.map((v, index) => `
        <div class="border border-gray-700 rounded-lg">
          <input type="radio" name="vacante" value="${v.Id_Vacante}" id="vacante-${index}" class="hidden peer">
          <label for="vacante-${index}" class="flex justify-between items-center p-3 cursor-pointer bg-gray-800 hover:bg-gray-700 peer-checked:bg-cyan-800 rounded-t-lg font-medium">
            ${v.Descripcion}
          </label>
          <div class="hidden peer-checked:block p-4 bg-gray-900 text-sm rounded-b-lg space-y-2">
            <p><strong>Contexto:</strong> ${v.Contexto}</p>
<p><strong>Habilidades:</strong> ${(v.Habilidades || []).map(h => h.Descripcion).join(', ') || 'No registradas'}</p>
          </div>
        </div>
      `).join('')}
    </div>
  `,
  showCancelButton: true,
  confirmButtonText: 'Seleccionar',
  cancelButtonText: 'Cancelar',
  preConfirm: () => {
    const seleccionada = document.querySelector('input[name="vacante"]:checked');
    if (!seleccionada) return Swal.showValidationMessage('Debes seleccionar una vacante');
    return seleccionada.value;
  }
});


  if (!seleccion.value) return null;

  const vacante = vacantesData.find((v) => v.Id_Vacante === parseInt(seleccion.value));

  const confirmar = await Alert({
    title: vacante.Descripcion,
    html: `<div class="text-white text-sm">${vacante.Contexto}</div>`,
    icon: "info",
    showCancelButton: true,
    confirmButtonText: "Seleccionar esta vacante",
    cancelButtonText: "Volver",
    customClass: {
      popup: "bg-pageBackground text-white",
    },
  });

  return confirmar.isConfirmed ? vacante : null;
}
