"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";

interface PdfDownloadButtonProps {
  reportContent: string;
}

export default function PdfDownloadButton({
  reportContent,
}: PdfDownloadButtonProps) {
  const handleDownload = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - margin * 2;
      let currentY = margin;

      // Add title
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Executive Report", margin, currentY);
      currentY += 15;

      // Add date
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, currentY);
      currentY += 10;

      // Add separator line
      doc.setLineWidth(0.5);
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 10;

      // Process content line by line
      const lines = reportContent.split("\n");

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // Check if we need a new page
        if (currentY + 10 > pageHeight - margin) {
          doc.addPage();
          currentY = margin;
        }

        // Handle headers
        if (line.startsWith("##")) {
          currentY += 5;
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          const headerText = line.replace(/#{1,6}\s/g, "");
          const wrappedHeader = doc.splitTextToSize(headerText, maxWidth);
          wrappedHeader.forEach((textLine: string) => {
            doc.text(textLine, margin, currentY);
            currentY += 8;
          });
          currentY += 2;
          doc.setFontSize(11);
          doc.setFont("helvetica", "normal");
        }
        // Handle bold text
        else if (line.includes("**")) {
          const cleanLine = line.replace(/\*\*(.+?)\*\*/g, "$1");
          doc.setFont("helvetica", "bold");
          const wrappedLine = doc.splitTextToSize(cleanLine, maxWidth);
          wrappedLine.forEach((textLine: string) => {
            doc.text(textLine, margin, currentY);
            currentY += 6;
          });
          doc.setFont("helvetica", "normal");
        }
        // Handle bullet points
        else if (line.trim().startsWith("-") || line.trim().startsWith("•")) {
          const bulletText = line.replace(/^[\s-•]+/, "");
          const wrappedBullet = doc.splitTextToSize(bulletText, maxWidth - 5);
          doc.text("•", margin, currentY);
          wrappedBullet.forEach((textLine: string, idx: number) => {
            doc.text(textLine, margin + 5, currentY);
            if (idx < wrappedBullet.length - 1) currentY += 6;
          });
          currentY += 6;
        }
        // Handle empty lines
        else if (line.trim() === "") {
          currentY += 3;
        }
        // Handle regular text
        else {
          const cleanLine = line
            .replace(/\*\*(.+?)\*\*/g, "$1")
            .replace(/\*(.+?)\*/g, "$1");
          const wrappedLine = doc.splitTextToSize(cleanLine, maxWidth);
          wrappedLine.forEach((textLine: string) => {
            doc.text(textLine, margin, currentY);
            currentY += 6;
          });
        }
      }

      // Download the PDF
      doc.save("executive-report.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
    >
      <Download className="mr-2 h-4 w-4" />
      Download PDF Report
    </Button>
  );
}
