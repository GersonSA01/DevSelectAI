'use client';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function InformePDF({ datos }) {
  const generarPDF = async () => {
    const doc = new jsPDF();

    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Informe de Evaluación - DevSelectAI', 105, 20, { align: 'center' });

 
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nombre: ${datos.nombre}`, 14, 35);
    doc.text(`Itinerario: ${datos.itinerario}`, 14, 43);
    doc.text(`Vacante: ${datos.vacante}`, 14, 51);

    
    doc.setFont('helvetica', 'bold');
    doc.text('Habilidades:', 14, 63);
    doc.setFont('helvetica', 'normal');
    datos.habilidades.forEach((h, i) => {
      doc.text(`- ${h}`, 20, 71 + i * 7);
    });

    
    let y = 71 + datos.habilidades.length * 7 + 10;
    doc.setFillColor(50, 50, 50); 
    doc.setTextColor(255, 255, 255); 
    doc.rect(55, y, 100, 12, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`PUNTAJE FINAL: ${datos.puntajeFinal}/10`, 105, y + 8, { align: 'center' });

    doc.setTextColor(0, 0, 0); ro
    y += 25;

    
    const { entrevista, teorico, tecnica, capturas } = datos.calificaciones;
    const total = entrevista + teorico + tecnica + capturas;
    autoTable(doc, {
      startY: y,
      head: [['Entrevista', 'Teórica', 'Técnica', 'Capturas', 'Total']],
      body: [[entrevista, teorico, tecnica, capturas, total]],
      styles: { halign: 'center', font: 'helvetica', fontSize: 11 },
      headStyles: { fillColor: [50, 50, 50], textColor: [255, 255, 255], fontStyle: 'bold' },
    });

    
    y = doc.lastAutoTable?.finalY || y;
    y += 10;

   
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Observación de la IA:', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(doc.splitTextToSize(datos.observacion || 'Sin observación', 180), 14, y + 8);

    y += 30;

    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Detalle de la Entrevista Oral:', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    datos.tiempos.entrevista.forEach((t, i) => {
      doc.text(`Pregunta ${i + 1} - Tiempo: ${t} segundos`, 20, y + 8 + i * 6);
    });

    y += 8 + datos.tiempos.entrevista.length * 6 + 10;

    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Detalle de la Evaluación Teórica:', 14, y);

    const preguntasTeoricas = datos.preguntasTeoricas.map((p, i) => ([
      `P${i + 1}`,
      p.pregunta,
      p.respuesta,
      p.Puntaje,
      `${p.TiempoRpta} s`
    ]));

    autoTable(doc, {
      startY: y + 5,
      head: [['#', 'Pregunta', 'Respuesta', 'Puntaje', 'Tiempo']],
      body: preguntasTeoricas,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [50, 50, 50], textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        3: { halign: 'center', cellWidth: 15 },
        4: { halign: 'center', cellWidth: 20 },
      },
    });

    
    doc.addPage();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Detalle de la Evaluación Técnica:', 14, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const tecnicaY = 28;
    doc.text('Pregunta:', 14, tecnicaY);
    doc.text(doc.splitTextToSize(datos.preguntaTecnica.pregunta, 180), 14, tecnicaY + 6);

    let rptaY = tecnicaY + 6 + (doc.splitTextToSize(datos.preguntaTecnica.pregunta, 180).length * 5) + 6;

    doc.setFont('helvetica', 'bold');
    doc.text('Respuesta del Postulante:', 14, rptaY);
    doc.setFont('helvetica', 'normal');
    doc.text(doc.splitTextToSize(datos.preguntaTecnica.respuesta, 180), 14, rptaY + 6);

    let resumenY = rptaY + 6 + (doc.splitTextToSize(datos.preguntaTecnica.respuesta, 180).length * 5) + 10;

    doc.setFont('helvetica', 'bold');
    doc.text(`Puntaje:`, 14, resumenY);
    doc.setFont('helvetica', 'normal');
    doc.text(`${datos.preguntaTecnica.Puntaje}`, 40, resumenY);
    doc.setFont('helvetica', 'bold');
    doc.text(`Tiempo de respuesta:`, 14, resumenY + 7);
    doc.setFont('helvetica', 'normal');
    doc.text(`${datos.preguntaTecnica.TiempoRpta} segundos`, 60, resumenY + 7);
    doc.setFont('helvetica', 'bold');
    doc.text(`Uso de IA:`, 14, resumenY + 14);
    doc.setFont('helvetica', 'normal');
    doc.text(datos.preguntaTecnica.UsoIA ? 'Sí' : 'No', 40, resumenY + 14);

    
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
