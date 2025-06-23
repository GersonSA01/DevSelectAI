'use client';
import Swal from 'sweetalert2';

/**
 * CustomAlert estilizado
 * @param {Object} options
 * @returns {Promise<SweetAlertResult>}
 */
export async function Alert(options) {
  return Swal.fire({
    title: options.title || '',
    html: options.html || '',
    icon: options.icon || 'info',
    input: options.input || undefined,
    inputOptions: options.inputOptions || undefined,
    inputPlaceholder: options.inputPlaceholder || undefined,
    showCancelButton: options.showCancelButton ?? false,
    showConfirmButton: options.showConfirmButton ?? true,
    confirmButtonText: options.confirmButtonText || 'Confirmar',
    cancelButtonText: options.cancelButtonText || 'Cancelar',
    buttonsStyling: false,
    customClass: {
      popup: 'bg-pageBackground text-white rounded-xl p-6',
      title: 'text-2xl font-bold mb-2',
      htmlContainer: 'text-primaryButton mb-4',
      ...(options.showConfirmButton !== false && {
        confirmButton: 'bg-primaryButton hover:bg-primaryButtonHover text-white font-semibold py-2 px-6 rounded-full mx-2',
      }),
      ...(options.showCancelButton === true && {
        cancelButton: 'bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-full mx-2',
      }),
      input: 'text-black p-2 rounded mt-4 bg-white',
    },
    timer: options.timer,
    timerProgressBar: options.timerProgressBar,
    showClass: options.showClass,
    hideClass: options.hideClass,
    preConfirm: options.preConfirm || undefined,
  });
}
