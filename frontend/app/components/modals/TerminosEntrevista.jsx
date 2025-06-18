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
      <li><strong>Pantalla completa</strong> compartida.</li>
      <li><strong>Capturas automáticas</strong> activas.</li>
      <li><strong>Presencia en cámara</strong> requerida.</li>
      <li>Evita minimizar o cambiar de pestaña.</li>
    </ul>

    <div class="space-y-2 pt-2 text-sm">
      <div class="text-primaryButton font-semibold">Aceptación:</div>
      <label><input type="checkbox" id="chk1" /> Pantalla completa</label><br/>
      <label><input type="checkbox" id="chk2" /> Cámara y micrófono</label><br/>
      <label><input type="checkbox" id="chk3" /> Capturas automáticas</label>
    </div>

    <p class="text-yellow-400 text-xs pt-2">
      Debes aceptar todos los puntos para continuar.
    </p>
  </div>
`,

    icon: 'info',
    showCancelButton: true,
    confirmButtonText: 'Sí, estoy listo',
    cancelButtonText: 'Cancelar',
    didOpen: () => {
      const confirmBtn = document.querySelector('.swal2-confirm');
      const chk1 = document.getElementById('chk1');
      const chk2 = document.getElementById('chk2');
      const chk3 = document.getElementById('chk3');

      const toggleBtn = () => {
        confirmBtn.disabled = !(chk1?.checked && chk2?.checked && chk3?.checked);
      };

      confirmBtn.disabled = true;
      chk1?.addEventListener('change', toggleBtn);
      chk2?.addEventListener('change', toggleBtn);
      chk3?.addEventListener('change', toggleBtn);
    },
    preConfirm: () => {
      const chk1 = document.getElementById('chk1')?.checked;
      const chk2 = document.getElementById('chk2')?.checked;
      const chk3 = document.getElementById('chk3')?.checked;

      if (!chk1 || !chk2 || !chk3) {
        Swal.showValidationMessage('Debes aceptar todas las condiciones.');
        return false;
      }
      return true;
    }
  });

  if (result.isConfirmed) {
    router.push(`/postulador/entrevista/presentacion?token=${token}`);
  }
}
