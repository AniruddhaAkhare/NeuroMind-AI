import os
import uuid
from datetime import datetime
from flask import current_app

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image as RLImage, Table, TableStyle
from reportlab.lib.units import inch

from database.models import PredictionHistory, ClinicalReport, Patient
from extensions import db
from services.gemini_service import GeminiService


class ReportService:
    def __init__(self):
        self.gemini_service = GeminiService()

    def generate_report(self, prediction_id, user_id, clinical_observations=None, recommendations=None):
        """
        Creates a ClinicalReport record, generates an AI narrative using Gemini,
        and builds a PDF report.
        """
        prediction = PredictionHistory.query.get(prediction_id)
        if not prediction:
            return None, "Prediction not found", 404

        patient = Patient.query.get(prediction.patient_id) if prediction.patient_id else None
        
        # 1. Check if report already exists
        report = ClinicalReport.query.filter_by(prediction_id=prediction_id).first()
        if not report:
            report = ClinicalReport(
                prediction_id=prediction_id,
                patient_id=prediction.patient_id,
                generated_by_id=user_id,
                status="DRAFT"
            )
            db.session.add(report)
            db.session.commit()

        # 2. Update manual fields if provided
        if clinical_observations is not None:
            report.clinical_observations = clinical_observations
        if recommendations is not None:
            report.recommendations = recommendations

        # 3. Generate AI Narrative if not present
        if not report.ai_narrative:
            patient_data = patient.to_dict() if patient else None
            pred_data = prediction.to_dict()
            report.ai_narrative = self.gemini_service.generate_clinical_narrative(
                patient_data=patient_data,
                prediction_data=pred_data,
                risk_level=prediction.risk_level
            )
            db.session.commit()

        # 4. Generate PDF
        pdf_filename = f"report_{prediction_id}_{uuid.uuid4().hex[:8]}.pdf"
        pdf_folder = current_app.config["REPORTS_FOLDER"]
        os.makedirs(pdf_folder, exist_ok=True)
        pdf_path_abs = os.path.join(pdf_folder, pdf_filename)

        try:
            self._build_pdf(pdf_path_abs, report, prediction, patient)
            report.pdf_path = f"/uploads/reports/{pdf_filename}"
            report.pdf_generated_at = datetime.utcnow()
            db.session.commit()
            
            return report.to_dict(), None, 200
            
        except Exception as e:
            print(f"PDF Generation error: {e}")
            return None, f"Failed to generate PDF: {str(e)}", 500

    def _build_pdf(self, file_path, report, prediction, patient):
        doc = SimpleDocTemplate(
            file_path,
            pagesize=A4,
            rightMargin=72, leftMargin=72,
            topMargin=72, bottomMargin=18
        )
        
        styles = getSampleStyleSheet()
        styles.add(ParagraphStyle(name='CenterTitle', alignment=1, fontSize=18, spaceAfter=20, fontName='Helvetica-Bold'))
        styles.add(ParagraphStyle(name='SectionHeader', fontSize=14, spaceAfter=10, spaceBefore=15, fontName='Helvetica-Bold'))
        
        elements = []
        
        # Header
        elements.append(Paragraph("NeuroMind AI - Clinical MRI Report", styles['CenterTitle']))
        elements.append(Spacer(1, 12))

        # Patient Info Table
        patient_data = [
            ["Patient Name:", patient.user.full_name if patient and patient.user else "Anonymous", "Report ID:", f"REP-{report.id}"],
            ["DOB:", str(patient.date_of_birth) if patient and patient.date_of_birth else "N/A", "Date:", datetime.now().strftime("%Y-%m-%d")],
            ["Patient ID:", f"PAT-{patient.id}" if patient else "N/A", "Scan Type:", prediction.scan_type or "MRI"]
        ]
        
        ptable = Table(patient_data, colWidths=[1.2*inch, 2*inch, 1.2*inch, 2*inch])
        ptable.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.whitesmoke),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
        ]))
        elements.append(ptable)
        elements.append(Spacer(1, 20))

        # AI Prediction Results
        elements.append(Paragraph("AI Prediction Results", styles['SectionHeader']))
        
        results_data = [
            ["Predicted Stage:", prediction.predicted_class],
            ["Model Confidence:", f"{prediction.confidence * 100:.2f}%"],
            ["Risk Level:", prediction.risk_level],
            ["Risk Score:", f"{prediction.risk_score:.2f} / 1.0"]
        ]
        
        rtable = Table(results_data, colWidths=[2*inch, 4*inch])
        rtable.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 1, colors.lightgrey),
            ('BACKGROUND', (0, 0), (0, -1), colors.whitesmoke),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(rtable)
        elements.append(Spacer(1, 20))

        # Images (Original and Grad-CAM)
        elements.append(Paragraph("Scan Images", styles['SectionHeader']))
        
        base_dir = current_app.config["UPLOAD_FOLDER"]
        # Convert relative URLs to absolute file paths for ReportLab
        orig_img_path = os.path.join(base_dir, prediction.image_path.replace("/uploads/", ""))
        
        gradcam_img_path = None
        if prediction.gradcam_path:
            gradcam_img_path = os.path.join(base_dir, prediction.gradcam_path.replace("/uploads/", ""))

        img_table_data = []
        try:
            orig_img = RLImage(orig_img_path, width=2.5*inch, height=2.5*inch)
            if gradcam_img_path and os.path.exists(gradcam_img_path):
                gc_img = RLImage(gradcam_img_path, width=2.5*inch, height=2.5*inch)
                img_table_data = [[orig_img, gc_img], ["Original MRI", "Grad-CAM Activation"]]
            else:
                img_table_data = [[orig_img], ["Original MRI"]]
                
            img_table = Table(img_table_data)
            img_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('BOTTOMPADDING', (0, 1), (-1, 1), 12),
                ('FONTNAME', (0, 1), (-1, 1), 'Helvetica-Bold'),
            ]))
            elements.append(img_table)
        except Exception as e:
            elements.append(Paragraph(f"Error loading images: {str(e)}", styles['Normal']))
            
        elements.append(Spacer(1, 20))

        # AI Narrative
        if report.ai_narrative:
            elements.append(Paragraph("AI-Generated Clinical Narrative", styles['SectionHeader']))
            elements.append(Paragraph(report.ai_narrative.replace("\n", "<br/>"), styles['Normal']))
            elements.append(Spacer(1, 15))

        # Clinical Observations
        if report.clinical_observations:
            elements.append(Paragraph("Clinical Observations", styles['SectionHeader']))
            elements.append(Paragraph(report.clinical_observations.replace("\n", "<br/>"), styles['Normal']))
            elements.append(Spacer(1, 15))

        # Recommendations
        if report.recommendations:
            elements.append(Paragraph("Recommendations / Plan", styles['SectionHeader']))
            elements.append(Paragraph(report.recommendations.replace("\n", "<br/>"), styles['Normal']))

        # Footer
        elements.append(Spacer(1, 40))
        elements.append(Paragraph("<i>This report incorporates AI-assisted analysis and should be interpreted by a qualified medical professional in conjunction with clinical findings.</i>", styles['Normal']))

        doc.build(elements)
