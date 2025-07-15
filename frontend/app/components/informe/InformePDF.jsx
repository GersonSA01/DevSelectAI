'use client';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function InformePDF({ datos }) {
  const generarPDF = async () => {
    const doc = new jsPDF();

    const img = '/fondoPDF.jpeg'; // asegúrate de que esté en /public
    const imgData = await getImageBase64(img);

    // Fondo
    doc.addImage(
      imgData,
      'JPEG',
      0,
      0,
      doc.internal.pageSize.getWidth(),
      doc.internal.pageSize.getHeight()
    );

    const azul = [46, 58, 89];
    const gris = [136, 136, 136];
    const naranja = [245, 166, 35];

    let y = 90; // empezamos más abajo

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...azul);
    doc.text('Informe de Evaluación - DevSelectAI', 105, y, { align: 'center' });

    y += 25;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(`Nombre: ${datos.nombre || ''}`, 20, y);
    y += 10;
    doc.text(`Itinerario: ${datos.itinerario || ''}`, 20, y);
    y += 10;
    doc.text(`Vacante: ${datos.vacante || ''}`, 20, y);

    y += 20;

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...azul);
    doc.text('Habilidades:', 20, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    if (Array.isArray(datos.habilidades) && datos.habilidades.length > 0) {
      datos.habilidades.forEach((h) => {
        doc.text(`- ${h}`, 26, y);
        y += 8;
      });
    } else {
      doc.text('No hay habilidades disponibles.', 26, y);
      y += 8;
    }

    y += 15;

    doc.setFillColor(...azul);
    doc.setTextColor(255, 255, 255);
    doc.rect(55, y, 100, 12, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`PUNTAJE FINAL: ${datos.puntajeFinal || 0}/10`, 105, y + 8, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    y += 30;

    const { entrevista = 0, teorico = 0, tecnica = 0, capturas = 0 } = datos.calificaciones || {};
    const total = entrevista + teorico + tecnica + capturas;

    autoTable(doc, {
      startY: y,
      margin: { left: 20, right: 20 },
      head: [['Entrevista', 'Teórica', 'Técnica', 'Capturas', 'Total']],
      body: [[entrevista, teorico, tecnica, capturas, total]],
      styles: { halign: 'center', font: 'helvetica', fontSize: 11 },
      headStyles: { fillColor: azul, textColor: [255, 255, 255], fontStyle: 'bold' },
    });

    y = doc.lastAutoTable.finalY + 15;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...naranja);
    doc.text('Observación de la IA:', 20, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(doc.splitTextToSize(datos.observacion || 'Sin observación', 170), 20, y);

    y += 25;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...azul);
    doc.text('Detalle de la Entrevista Oral:', 20, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    if (Array.isArray(datos.tiempos?.entrevista) && datos.tiempos.entrevista.length > 0) {
      datos.tiempos.entrevista.forEach((t, i) => {
        doc.text(`Pregunta ${i + 1} - Tiempo: ${t} segundos`, 26, y);
        y += 8;
      });
    } else {
      doc.text('No hay datos de entrevista.', 26, y);
      y += 8;
    }

    y += 15;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...azul);
    doc.text('Detalle de la Evaluación Teórica:', 20, y);

    const preguntasTeoricas = (datos.preguntasTeoricas || []).map((p, i) => ([
      `P${i + 1}`,
      p.pregunta || '',
      p.respuesta || '',
      p.Puntaje || 0,
      `${p.TiempoRpta || 0} s`
    ]));

    autoTable(doc, {
      startY: y + 5,
      margin: { left: 20, right: 20 },
      head: [['#', 'Pregunta', 'Respuesta', 'Puntaje', 'Tiempo']],
      body: preguntasTeoricas.length > 0 ? preguntasTeoricas : [['-', 'Sin datos', '-', '-', '-']],
      styles: { fontSize: 9 },
      headStyles: { fillColor: azul, textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        3: { halign: 'center', cellWidth: 15 },
        4: { halign: 'center', cellWidth: 20 },
      },
    });

    doc.addPage();
    y = 50;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...azul);
    doc.text('Detalle de la Evaluación Técnica:', 20, y);

    y += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    if (datos.preguntaTecnica) {
      doc.text('Pregunta:', 20, y);
      y += 8;
      const preguntaLines = doc.splitTextToSize(datos.preguntaTecnica.pregunta || '', 170);
      doc.text(preguntaLines, 20, y);
      y += preguntaLines.length * 5 + 8;

      doc.setFont('helvetica', 'bold');
      doc.text('Respuesta del Postulante:', 20, y);
      y += 8;
      doc.setFont('helvetica', 'normal');
      const rptaLines = doc.splitTextToSize(datos.preguntaTecnica.respuesta || '', 170);
      doc.text(rptaLines, 20, y);
      y += rptaLines.length * 5 + 12;

      doc.setFont('helvetica', 'bold');
      doc.text(`Puntaje:`, 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`${datos.preguntaTecnica.Puntaje || 0}`, 50, y);
      y += 8;

      doc.setFont('helvetica', 'bold');
      doc.text(`Tiempo de respuesta:`, 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`${datos.preguntaTecnica.TiempoRpta || 0} segundos`, 70, y);
      y += 8;

      doc.setFont('helvetica', 'bold');
      doc.text(`Uso de IA:`, 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text(datos.preguntaTecnica.UsoIA ? 'Sí' : 'No', 50, y);
    } else {
      doc.text('No hay datos de evaluación técnica.', 20, y);
    }

    doc.save(`informe_postulante_${datos.nombre || 'sin_nombre'}.pdf`);
  };

  const getImageBase64 = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = function () {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg'));
      };
      img.src = url;
    });
  };

  return (
    <button
      onClick={generarPDF}
      className="px-4 py-2 bg-[#2E3A59] text-white rounded hover:bg-[#F5A623]"
    >
      Generar PDF
    </button>
  );
}
