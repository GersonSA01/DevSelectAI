'use client';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function InformePDF({ datos }) {
  const generarPDF = async () => {
    const doc = new jsPDF();

    // Título principal
    doc.setFontSize(16);
    doc.text('Informe de Evaluación - DevSelectAI', 14, 20);

    // Datos generales
    doc.setFontSize(12);
    doc.text(`Nombre: ${datos.nombre}`, 14, 30);
    doc.text(`Itinerario: ${datos.itinerario}`, 14, 38);
    doc.text(`Vacante: ${datos.vacante}`, 14, 46);

    // Habilidades
    doc.text('Habilidades:', 14, 54);
    datos.habilidades.forEach((hab, i) => {
      doc.text(`- ${hab}`, 20, 62 + i * 8);
    });

    // Tabla de calificaciones
    const tablaY = 62 + datos.habilidades.length * 8 + 10;
    autoTable(doc, {
      head: [['Entrevista', 'Teórica', 'Técnica', 'Capturas']],
      body: [[
        datos.calificaciones.entrevista,
        datos.calificaciones.teorico,
        datos.calificaciones.tecnica,
        datos.calificaciones.capturas,
      ]],
      startY: tablaY,
    });

    // Observación IA
    const obsY = tablaY + 30;
    doc.setFontSize(12);
    doc.text('Observación de la IA:', 14, obsY);
    doc.setFontSize(10);
    doc.text(doc.splitTextToSize(datos.observacion, 180), 14, obsY + 8);

    let nextY = obsY + 30;

    // Incluir gráfico si existe (canvas con id="grafica-tiempos")
    const canvas = document.querySelector('#grafica-tiempos');
    if (canvas) {
      const imgData = canvas.toDataURL('image/png');
      doc.addPage();
      doc.setFontSize(14);
      doc.text('Gráfico de Tiempos de Respuesta', 14, 20);
      doc.addImage(imgData, 'PNG', 15, 30, 180, 100);
      nextY = 140;
    }

    // Capturas
    if (datos.capturas && datos.capturas.length > 0) {
      doc.addPage();
      doc.setFontSize(14);
      doc.text('Capturas de Evaluación', 14, 20);

      let x = 14;
      let y = 30;
      const imgSize = 50;

      for (let i = 0; i < datos.capturas.length; i++) {
        const captura = datos.capturas[i];
        if (captura.imagenBase64) {
          try {
            doc.addImage(captura.imagenBase64, 'JPEG', x, y, imgSize, imgSize);
            x += imgSize + 10;
            if (x > 180) {
              x = 14;
              y += imgSize + 10;
              if (y > 270) {
                doc.addPage();
                y = 30;
              }
            }
          } catch (err) {
            console.warn('Error al añadir captura', err);
          }
        }
      }
    }

    doc.save(`informe_postulante_${datos.nombre}.pdf`);
  };

  return (
    <button
      onClick={generarPDF}
      className="px-4 py-2 bg-[#3BDCF6] text-black rounded hover:bg-[#00FFF0]"
    >
      Generar PDF
    </button>
  );
}
