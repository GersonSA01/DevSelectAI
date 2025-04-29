'use client';

import Swal from 'sweetalert2';

/**
 * CustomAlert
 * @param {Object} options
 * @returns {Promise<SweetAlertResult>}
 */
export async function Alert(options) {
  return Swal.fire({
    title: options.title || '',
    text: options.text || '',
    icon: options.icon || 'info',
    input: options.input || undefined,
    inputOptions: options.inputOptions || undefined,
    inputPlaceholder: options.inputPlaceholder || undefined,
    showCancelButton: options.showCancelButton ?? true,
    confirmButtonText: options.confirmButtonText || 'Confirmar',
    cancelButtonText: options.cancelButtonText || 'Cancelar',
    buttonsStyling: false,
    customClass: {
      popup: 'bg-pageBackground text-white rounded-xl p-6',
      title: 'text-2xl font-bold mb-2',
      htmlContainer: 'text-primaryButton mb-4',
      confirmButton: 'bg-primaryButton hover:bg-primaryButtonHover text-white font-semibold py-2 px-6 rounded-full',
      cancelButton: 'bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-full',
      input: 'text-black p-2 rounded mt-4',
    },
    preConfirm: options.preConfirm || undefined,
  });
}
