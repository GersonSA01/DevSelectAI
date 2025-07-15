'use client';

import Swal from 'sweetalert2';
import { Alert } from '../alerts/Alerts';

export async function mostrarTerminosYCondiciones(router, token) {
  const result = await Alert({
    title: `<span class="text-[#3BDCF6] text-lg font-bold">Antes de comenzar la entrevista</span>`,
    html: `
  <div class="text-left text-sm text-white space-y-4 max-h-[70vh] overflow-y-auto">
    <p class="text-gray-300">
      Serás entrevistado por una <strong>IA</strong> que evaluará tu desempeño técnico y comportamiento. 
    </p>

    <ul class="list-disc list-inside space-y-1 text-sm text-white">
      <li>La entrevista se realizará en <strong>pantalla completa</strong>.</li>
      <li>Se tomarán <strong>capturas automáticas</strong> durante el proceso.</li>
      <li>Tu <strong>cámara y micrófono</strong> deben estar habilitados.</li>
      <li>No debes minimizar ni cambiar de pestaña durante la entrevista.</li>
    </ul>

    <div class="space-y-2 pt-4 text-sm">
      <label>
        <input type="checkbox" id="chk_all" />
        <span>He leído y acepto todas las condiciones anteriores</span>
      </label>
    </div>

    <p class="text-yellow-400 text-xs pt-2">
      Debes aceptar las condiciones para continuar.
    </p>
  </div>
`,
    icon: 'info',
    showCancelButton: true,
    confirmButtonText: 'Sí, acepto',
    cancelButtonText: 'Cancelar',
    didOpen: () => {
      const confirmBtn = document.querySelector('.swal2-confirm');
      const chkAll = document.getElementById('chk_all');

      confirmBtn.disabled = true;

      chkAll?.addEventListener('change', () => {
        confirmBtn.disabled = !chkAll.checked;
      });
    },
    preConfirm: () => {
      const chkAll = document.getElementById('chk_all')?.checked;

      if (!chkAll) {
        Swal.showValidationMessage('Debes aceptar las condiciones para continuar.');
        return false;
      }

      return true;
    }
  });

  if (result.isConfirmed) {
    router.push(`/postulador/entrevista/presentacion?token=${token}`);
  }
}
