import os
import json
import uuid
from datetime import datetime
from flask import current_app

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Image as RLImage,
    Table,
    TableStyle,
    HRFlowable,
    KeepTogether,
)
from reportlab.lib.units import inch

from database.models import PredictionHistory, ClinicalReport, Patient
from extensions import db
from services.gemini_service import GeminiService


class ReportService:
    def __init__(self):
        self.gemini_service = GeminiService()

    def generate_report(self, prediction_id, user_id, clinical_observations=None, recommendations=None):
        """
        Creates a ClinicalReport record, generates a 6-Pillar AI narrative using Gemini,
        and builds a high-tier clinical PDF report.
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
                risk_level=prediction.risk_level,
                region_importance=prediction.xai_result.region_importance if prediction.xai_result else None,
            )
            db.session.commit()

        # 4. Generate PDF
        pdf_filename = f"clinical_dossier_{prediction_id}_{uuid.uuid4().hex[:8]}.pdf"
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
            rightMargin=45,
            leftMargin=45,
            topMargin=45,
            bottomMargin=40,
        )
        
        # Color Palette: Executive Healthcare Light
        navy_primary = colors.HexColor("#1E3A8A")
        slate_dark = colors.HexColor("#0F172A")
        slate_muted = colors.HexColor("#475569")
        slate_bg = colors.HexColor("#F8FAFC")
        border_light = colors.HexColor("#E2E8F0")
        teal_accent = colors.HexColor("#0D9488")
        amber_alert = colors.HexColor("#D97706")
        rose_alert = colors.HexColor("#BE123C")

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'DocTitle',
            fontName='Helvetica-Bold',
            fontSize=18,
            leading=22,
            textColor=navy_primary,
            spaceAfter=4,
        )
        subtitle_style = ParagraphStyle(
            'DocSubtitle',
            fontName='Helvetica',
            fontSize=9,
            leading=12,
            textColor=slate_muted,
            spaceAfter=12,
        )
        sec_header = ParagraphStyle(
            'SecHeader',
            fontName='Helvetica-Bold',
            fontSize=11,
            leading=15,
            textColor=navy_primary,
            spaceBefore=10,
            spaceAfter=6,
        )
        body_style = ParagraphStyle(
            'Body',
            fontName='Helvetica',
            fontSize=8.5,
            leading=12,
            textColor=slate_dark,
        )
        body_bold = ParagraphStyle(
            'BodyBold',
            fontName='Helvetica-Bold',
            fontSize=8.5,
            leading=12,
            textColor=slate_dark,
        )
        alert_style = ParagraphStyle(
            'AlertText',
            fontName='Helvetica-Bold',
            fontSize=8.5,
            leading=12,
            textColor=rose_alert,
        )
        bullet_style = ParagraphStyle(
            'Bullet',
            fontName='Helvetica',
            fontSize=8.5,
            leading=12,
            textColor=slate_dark,
            leftIndent=12,
            firstLineIndent=-8,
        )

        elements = []

        # ============================================================
        # HEADER BAR
        # ============================================================
        elements.append(Paragraph("NeuroMind AI Clinical Diagnostic Dossier", title_style))
        elements.append(Paragraph(
            "Alzheimer's Disease & Neurocognitive Evaluation Protocol | EfficientNet-B3 Saliency Analysis",
            subtitle_style
        ))
        elements.append(HRFlowable(width="100%", thickness=1.5, color=navy_primary, spaceAfter=10))

        # ============================================================
        # PATIENT & SCAN METADATA TABLE
        # ============================================================
        patient_name = patient.user.full_name if patient and patient.user else "Anonymous / Unlinked"
        patient_dob = str(patient.date_of_birth) if patient and patient.date_of_birth else "Not Specified"
        eval_date = prediction.created_at.strftime("%Y-%m-%d %H:%M UTC") if prediction.created_at else datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")

        info_data = [
            [
                Paragraph("<b>Patient Name:</b>", body_style), Paragraph(patient_name, body_bold),
                Paragraph("<b>Dossier ID:</b>", body_style), Paragraph(f"EVAL-{prediction.id:05d}", body_bold)
            ],
            [
                Paragraph("<b>Date of Birth:</b>", body_style), Paragraph(patient_dob, body_style),
                Paragraph("<b>Exam Date:</b>", body_style), Paragraph(eval_date, body_style)
            ],
            [
                Paragraph("<b>Scan Modality:</b>", body_style), Paragraph(prediction.scan_type or "Axial T1/T2 MRI", body_style),
                Paragraph("<b>Model Architecture:</b>", body_style), Paragraph(f"{prediction.model_name} v{prediction.model_version}", body_style)
            ]
        ]
        info_table = Table(info_data, colWidths=[1.1*inch, 2.3*inch, 1.2*inch, 2.4*inch])
        info_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), slate_bg),
            ('BOX', (0, 0), (-1, -1), 0.8, border_light),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, border_light),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))
        elements.append(info_table)
        elements.append(Spacer(1, 10))

        # ============================================================
        # AI PREDICTION & RISK SUMMARY TABLE
        # ============================================================
        risk_color = rose_alert if prediction.risk_level in ["HIGH", "CRITICAL"] else (amber_alert if prediction.risk_level == "MODERATE" else teal_accent)
        pred_data = [
            [
                Paragraph("<b>AI Predicted Stage:</b>", body_style),
                Paragraph(f"<font color='{navy_primary.hexval()}'><b>{prediction.predicted_class}</b></font>", body_bold),
                Paragraph("<b>Classification Confidence:</b>", body_style),
                Paragraph(f"<b>{prediction.confidence * 100:.2f}%</b>", body_bold),
            ],
            [
                Paragraph("<b>Clinical Risk Tier:</b>", body_style),
                Paragraph(f"<font color='{risk_color.hexval()}'><b>{prediction.risk_level or 'MONITORED'}</b></font>", body_bold),
                Paragraph("<b>Risk Score Index:</b>", body_style),
                Paragraph(f"<b>{prediction.risk_score * 100 if prediction.risk_score else 0:.0f} / 100</b>", body_bold),
            ]
        ]
        pred_table = Table(pred_data, colWidths=[1.3*inch, 2.1*inch, 1.4*inch, 2.2*inch])
        pred_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.white),
            ('BOX', (0, 0), (-1, -1), 1, border_light),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, border_light),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))
        elements.append(pred_table)
        elements.append(Spacer(1, 10))

        # ============================================================
        # SCAN IMAGES (Original MRI + Grad-CAM Heatmap)
        # ============================================================
        base_dir = current_app.config["UPLOAD_FOLDER"]
        orig_img_path = os.path.join(base_dir, prediction.image_path.replace("/uploads/", ""))
        gradcam_img_path = None
        if prediction.gradcam_path:
            gradcam_img_path = os.path.join(base_dir, prediction.gradcam_path.replace("/uploads/", ""))

        try:
            if os.path.exists(orig_img_path):
                img_elements = []
                img_orig = RLImage(orig_img_path, width=2.4*inch, height=2.4*inch)
                if gradcam_img_path and os.path.exists(gradcam_img_path):
                    img_gc = RLImage(gradcam_img_path, width=2.4*inch, height=2.4*inch)
                    img_table_data = [
                        [img_orig, img_gc],
                        [Paragraph("<b>Figure 1: Input Anatomical MRI</b>", body_style),
                         Paragraph("<b>Figure 2: Grad-CAM Saliency Overlay</b>", body_style)]
                    ]
                else:
                    img_table_data = [
                        [img_orig],
                        [Paragraph("<b>Figure 1: Input Anatomical MRI</b>", body_style)]
                    ]
                img_table = Table(img_table_data, colWidths=[3.4*inch, 3.4*inch] if len(img_table_data[0]) > 1 else [6.8*inch])
                img_table.setStyle(TableStyle([
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                    ('BOTTOMPADDING', (0, 0), (-1, 0), 4),
                    ('TOPPADDING', (0, 1), (-1, 1), 4),
                ]))
                elements.append(KeepTogether(img_table))
                elements.append(Spacer(1, 10))
        except Exception as img_err:
            print(f"Warning rendering report images: {img_err}")

        # ============================================================
        # PARSE 6-PILLAR DOSSIER
        # ============================================================
        dossier = None
        if report.ai_narrative:
            try:
                stripped = report.ai_narrative.strip()
                if stripped.startswith("{"):
                    dossier = json.loads(stripped)
            except Exception:
                dossier = None

        if dossier:
            # Executive Summary
            if dossier.get("summary"):
                elements.append(Paragraph("Executive Neuroimaging Summary", sec_header))
                elements.append(Paragraph(dossier["summary"], body_style))
                elements.append(Spacer(1, 6))

            # Pillar 1: Diagnostic Assessment
            p1 = dossier.get("pillar_1_diagnostic_assessment")
            if p1:
                elements.append(Paragraph("Pillar 1: Formal Diagnostic Assessment & Staging", sec_header))
                elements.append(Paragraph(f"<b>Clinical Staging:</b> {p1.get('stage_classification')} | <b>Rating:</b> {p1.get('clinical_dementia_rating')}", body_style))
                findings = p1.get("neuroimaging_findings", [])
                for f in findings:
                    elements.append(Paragraph(f"• {f}", bullet_style))
                elements.append(Spacer(1, 6))

            # Pillar 2: Cautions & High-Risk Red Flags
            p2 = dossier.get("pillar_2_cautions_and_risks")
            if p2:
                elements.append(Paragraph("Pillar 2: Patient Safety Cautions & High-Risk Red Flags", sec_header))
                flags = p2.get("critical_flags", [])
                for fl in flags:
                    elements.append(Paragraph(f"<b>[!] ALERT:</b> {fl}", alert_style))
                if p2.get("fall_and_mobility_risk"):
                    elements.append(Paragraph(f"<b>Fall Risk:</b> {p2.get('fall_and_mobility_risk')}", body_style))
                if p2.get("wandering_and_disorientation"):
                    elements.append(Paragraph(f"<b>Wandering / Elopement Precaution:</b> {p2.get('wandering_and_disorientation')}", body_style))
                elements.append(Spacer(1, 6))

            # Pillar 3: Caregiver Daily Protocol Checklist
            p3 = dossier.get("pillar_3_caregiver_daily_protocol")
            if p3:
                elements.append(Paragraph("Pillar 3: Caregiver Daily Protocol & Circadian Home Care", sec_header))
                if p3.get("morning_routine"):
                    elements.append(Paragraph(f"<b>Morning Protocol:</b> {p3.get('morning_routine')}", body_style))
                if p3.get("cognitive_stimulation"):
                    elements.append(Paragraph(f"<b>Cognitive Engagement:</b> {p3.get('cognitive_stimulation')}", body_style))
                if p3.get("evening_sundowning_prevention"):
                    elements.append(Paragraph(f"<b>Sundowning Prevention:</b> {p3.get('evening_sundowning_prevention')}", body_style))
                elements.append(Spacer(1, 6))

            # Pillar 4: Integrative Ayurvedic Home Regimens
            p4 = dossier.get("pillar_4_ayurvedic_integrative_regimens")
            if p4:
                elements.append(Paragraph("Pillar 4: Integrative Ayurvedic Neuro-Supportive Regimens", sec_header))
                herbs = p4.get("herbal_medhya_rasayana", [])
                herb_rows = [[Paragraph("<b>Herb / Compound</b>", body_style), Paragraph("<b>Dosage & Route</b>", body_style), Paragraph("<b>Clinical Rationale</b>", body_style)]]
                for h in herbs:
                    herb_rows.append([
                        Paragraph(h.get("herb", ""), body_bold),
                        Paragraph(h.get("dosage", ""), body_style),
                        Paragraph(h.get("rationale", ""), body_style),
                    ])
                herb_table = Table(herb_rows, colWidths=[1.8*inch, 2.0*inch, 3.0*inch])
                herb_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), slate_bg),
                    ('BOX', (0, 0), (-1, -1), 0.5, border_light),
                    ('INNERGRID', (0, 0), (-1, -1), 0.5, border_light),
                    ('TOPPADDING', (0, 0), (-1, -1), 4),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                ]))
                elements.append(herb_table)
                elements.append(Spacer(1, 6))

            # Pillar 5: Doctor-Directed Medical Prescriptions & Pharmacotherapy
            p5 = dossier.get("pillar_5_medical_prescriptions_and_pharmacotherapy")
            if p5:
                elements.append(Paragraph("Pillar 5: Doctor-Directed Pharmacotherapy & Lab Surveillance", sec_header))
                drugs = p5.get("first_line_pharmacotherapy", [])
                drug_rows = [[Paragraph("<b>Medication</b>", body_style), Paragraph("<b>Dosage Protocol</b>", body_style), Paragraph("<b>Clinical Indication</b>", body_style)]]
                for d in drugs:
                    drug_rows.append([
                        Paragraph(d.get("medication", ""), body_bold),
                        Paragraph(d.get("dosage", ""), body_style),
                        Paragraph(d.get("indications", ""), body_style),
                    ])
                drug_table = Table(drug_rows, colWidths=[1.8*inch, 2.2*inch, 2.8*inch])
                drug_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), slate_bg),
                    ('BOX', (0, 0), (-1, -1), 0.5, border_light),
                    ('INNERGRID', (0, 0), (-1, -1), 0.5, border_light),
                    ('TOPPADDING', (0, 0), (-1, -1), 4),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                ]))
                elements.append(drug_table)
                elements.append(Spacer(1, 6))

            # Pillar 6: Hospital Specialist Findings & Multidisciplinary Plan
            p6 = dossier.get("pillar_6_hospital_specialist_findings")
            if p6:
                elements.append(Paragraph("Pillar 6: Hospital Specialist Referral & Action Plan", sec_header))
                if p6.get("specialist_consultation_timeline"):
                    elements.append(Paragraph(f"<b>Timeline:</b> {p6.get('specialist_consultation_timeline')}", body_style))
                if p6.get("neuropsychological_testing"):
                    elements.append(Paragraph(f"<b>Psychometrics:</b> {p6.get('neuropsychological_testing')}", body_style))
                elements.append(Spacer(1, 6))

        else:
            # Fallback for plain text narratives
            if report.ai_narrative:
                elements.append(Paragraph("Clinical Narrative", sec_header))
                elements.append(Paragraph(report.ai_narrative.replace("\n", "<br/>"), body_style))
                elements.append(Spacer(1, 8))

        # Clinical Observations (Manual)
        if report.clinical_observations:
            elements.append(Paragraph("Attending Physician Observations", sec_header))
            elements.append(Paragraph(report.clinical_observations.replace("\n", "<br/>"), body_style))
            elements.append(Spacer(1, 8))

        # Recommendations
        if report.recommendations:
            elements.append(Paragraph("Target Recommendations & Plan", sec_header))
            elements.append(Paragraph(report.recommendations.replace("\n", "<br/>"), body_style))
            elements.append(Spacer(1, 8))

        # Footer & Institutional Disclaimer
        elements.append(Spacer(1, 14))
        elements.append(HRFlowable(width="100%", thickness=0.8, color=border_light, spaceAfter=8))
        disclaimer_text = (
            "<b>Institutional Medical Disclaimer:</b> This dossier incorporates deep learning neuroimaging predictions (EfficientNet-B3) "
            "and generative clinical intelligence. It is engineered strictly as an auxiliary diagnostic support system and does not constitute "
            "an autonomous medical diagnosis. All pharmacotherapy and treatment regimens must be reviewed, prescribed, and supervised by a licensed neurologist."
        )
        elements.append(Paragraph(disclaimer_text, ParagraphStyle('Disc', fontName='Helvetica-Oblique', fontSize=7, leading=10, textColor=slate_muted)))

        doc.build(elements)
