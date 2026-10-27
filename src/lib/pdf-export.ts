import jsPDF from 'jspdf';
import { Course, SemesterTelemetry } from './gpa-engine';

export function generateAcademicPdf(courses: Course[], telemetry: SemesterTelemetry) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let currentY = 16;

  // Header Title
  doc.setFillColor(37, 99, 235); // Brand Indigo/Blue
  doc.rect(margin, currentY, pageWidth - margin * 2, 2.5, 'F');
  currentY += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("SVKM's NMIMS (Deemed to be University)", margin, currentY);

  currentY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text("Official Academic Grade Card & Evaluation Report", margin, currentY);

  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated: ${dateStr}`, pageWidth - margin, currentY, { align: 'right' });

  currentY += 6;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);

  // Summary Metrics Card
  currentY += 6;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 26, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 26, 2, 2, 'S');

  // SGPA Big Display
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(37, 99, 235);
  doc.text(`${telemetry.sgpa.toFixed(2)}`, margin + 6, currentY + 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('SEMESTER SGPA (OUT OF 10.00)', margin + 6, currentY + 18);

  // Standing and Standing info
  const standingText = telemetry.hasFailures
    ? 'RE-ATTEMPT REQUIRED'
    : telemetry.sgpa >= 9.0
    ? 'OUTSTANDING'
    : telemetry.sgpa >= 8.0
    ? 'FIRST CLASS WITH DISTINCTION'
    : telemetry.sgpa >= 7.0
    ? 'FIRST CLASS'
    : 'SECOND CLASS';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(standingText, margin + 55, currentY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Total Credits: ${telemetry.totalCredits}   |   Earned Grade Points: ${telemetry.earnedGradePoints}   |   Credits Passed: ${telemetry.passingCredits}/${telemetry.totalCredits}`,
    margin + 55,
    currentY + 16
  );

  const statusBadge = telemetry.hasFailures
    ? `Status: ${telemetry.failedCoursesCount} Backlog(s) Pending`
    : 'Status: ALL REGISTERED COURSES PASSED';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(telemetry.hasFailures ? 225 : 5, telemetry.hasFailures ? 29 : 150, telemetry.hasFailures ? 72 : 105);
  doc.text(statusBadge, margin + 55, currentY + 22);

  currentY += 34;

  // Table Headers
  const colX = {
    index: margin + 2,
    code: margin + 8,
    name: margin + 30,
    type: margin + 92,
    credits: margin + 114,
    ica: margin + 126,
    see: margin + 140,
    final: margin + 154,
    grade: margin + 167,
    points: margin + 178,
  };

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, currentY, pageWidth - margin * 2, 7.5, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, currentY, pageWidth - margin * 2, 7.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('#', colX.index, currentY + 5);
  doc.text('CODE', colX.code, currentY + 5);
  doc.text('COURSE TITLE', colX.name, currentY + 5);
  doc.text('TYPE', colX.type, currentY + 5);
  doc.text('CR', colX.credits, currentY + 5);
  doc.text('ICA/50', colX.ica, currentY + 5);
  doc.text('SEE/100', colX.see, currentY + 5);
  doc.text('FINAL %', colX.final, currentY + 5);
  doc.text('GRADE', colX.grade, currentY + 5);
  doc.text('PTS', colX.points, currentY + 5);

  currentY += 7.5;

  // Table Rows
  courses.forEach((c, i) => {
    const ev = telemetry.courseEvaluations[c.id];
    const isEven = i % 2 === 0;

    if (isEven) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(248, 250, 252);
    }
    doc.rect(margin, currentY, pageWidth - margin * 2, 7.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, currentY + 7.5, pageWidth - margin, currentY + 7.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);

    doc.text(String(i + 1), colX.index, currentY + 5);

    doc.setFont('helvetica', 'bold');
    doc.text(c.code || `SUB${i + 1}`, colX.code, currentY + 5);

    doc.setFont('helvetica', 'normal');
    // Truncate course name if too long
    const nameMaxChars = 34;
    const truncatedName =
      c.name.length > nameMaxChars ? c.name.substring(0, nameMaxChars - 3) + '...' : c.name;
    doc.text(truncatedName, colX.name, currentY + 5);

    doc.text(c.type === 'standard' ? 'Standard' : 'Lab / ICA', colX.type, currentY + 5);
    doc.text(String(c.credits), colX.credits, currentY + 5);
    doc.text(String(c.icaMarks), colX.ica, currentY + 5);
    doc.text(c.type === 'standard' ? String(c.seeMarks) : 'N/A', colX.see, currentY + 5);

    doc.setFont('helvetica', 'bold');
    doc.text(`${(ev?.finalPercentage ?? 0).toFixed(1)}%`, colX.final, currentY + 5);

    // Color grade
    const grade = ev?.grade ?? 'F';
    if (grade === 'F' || grade === 'AB') {
      doc.setTextColor(225, 29, 72);
    } else {
      doc.setTextColor(37, 99, 235);
    }
    doc.text(grade, colX.grade, currentY + 5);

    doc.setTextColor(51, 65, 85);
    doc.text(String(ev?.gradePoints ?? 0), colX.points, currentY + 5);

    currentY += 7.5;
  });

  // Evaluation Rules & Legal Footer
  currentY += 8;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('NMIMS EVALUATION RULES & PASSING THRESHOLDS:', margin, currentY);

  currentY += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(
    '1. Standard Course: Final Percentage = ICA (out of 50) + SEE/2 (out of 100). Passing requirement: ICA >= 20 AND SEE >= 40.',
    margin,
    currentY
  );
  currentY += 3.5;
  doc.text(
    '2. Lab / ICA-Only Course: Final Percentage = ICA * 2. Passing requirement: ICA >= 20.',
    margin,
    currentY
  );
  currentY += 3.5;
  doc.text(
    '3. Grade Points Scale: O: 10.0 (>=90%) | A+: 9.0 (>=80%) | A: 8.0 (>=70%) | B+: 7.0 (>=60%) | B: 6.0 (>=55%) | C: 5.0 (>=50%) | P: 4.0 (>=40%) | F: 0.0 (<40%).',
    margin,
    currentY
  );

  // Bottom Branding Line
  const bottomY = pageHeight - 10;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, bottomY - 3, pageWidth - margin, bottomY - 3);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Autonomous NMIMS Academic HUD · Exact DP GPA Optimization System', margin, bottomY);
  doc.text('Confidential Student Copy', pageWidth - margin, bottomY, { align: 'right' });

  // Save the PDF
  const filename = `NMIMS_Grade_Report_${dateStr.replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
}
