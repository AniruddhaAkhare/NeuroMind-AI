"""
APScheduler background jobs for reminders and notifications.
"""
from datetime import datetime, date, timezone
from apscheduler.schedulers.background import BackgroundScheduler

from extensions import db
from database.models.followup import MRIReminder, CognitiveAssessmentReminder, MedicationReminder
from database.models.appointment import Appointment
from database.models.notification import Notification
from database.models.patient import Patient


def create_notification(user_id, title, message, notification_type, ref_type=None, ref_id=None):
    """Helper to create and save a notification."""
    notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type,
        reference_type=ref_type,
        reference_id=ref_id
    )
    db.session.add(notif)


def check_daily_reminders(app):
    """
    Runs daily to check for upcoming appointments, MRI reminders, and cognitive assessment reminders.
    """
    with app.app_context():
        today = date.today()
        now = datetime.now(timezone.utc)
        
        # 1. MRI Reminders (Due in 7 days or less)
        from datetime import timedelta
        target_date = today + timedelta(days=7)
        mri_reminders = MRIReminder.query.filter(
            MRIReminder.is_sent == False,
            MRIReminder.due_date <= target_date
        ).all()
        
        for reminder in mri_reminders:
            patient = Patient.query.get(reminder.patient_id)
            if patient and patient.user_id:
                days_left = (reminder.due_date - today).days
                if days_left > 0:
                    msg = f"Your MRI scan is due in {days_left} days ({reminder.due_date}). Please schedule an appointment."
                else:
                    msg = f"Your MRI scan was due on {reminder.due_date}. Please schedule an appointment immediately."
                    
                create_notification(
                    user_id=patient.user_id,
                    title="MRI Scan Reminder",
                    message=msg,
                    notification_type="mri_reminder",
                )
                reminder.is_sent = True
                reminder.sent_at = now
                
        # 2. Cognitive Assessment Reminders
        cog_reminders = CognitiveAssessmentReminder.query.filter(
            CognitiveAssessmentReminder.is_sent == False,
            CognitiveAssessmentReminder.due_date <= target_date
        ).all()
        
        for reminder in cog_reminders:
            patient = Patient.query.get(reminder.patient_id)
            if patient and patient.user_id:
                create_notification(
                    user_id=patient.user_id,
                    title="Cognitive Assessment Due",
                    message=f"A cognitive assessment ({reminder.assessment_type}) is due on {reminder.due_date}.",
                    notification_type="cognitive_reminder",
                )
                reminder.is_sent = True
                reminder.sent_at = now
                
        # 3. Upcoming Appointments (Tomorrow)
        tomorrow = today + timedelta(days=1)
        appointments = Appointment.query.filter_by(
            appointment_date=tomorrow,
            status="BOOKED"
        ).all()
        
        for appt in appointments:
            patient = Patient.query.get(appt.patient_id)
            if patient and patient.user_id:
                create_notification(
                    user_id=patient.user_id,
                    title="Upcoming Appointment",
                    message=f"You have an appointment with Dr. {appt.doctor.user.full_name} tomorrow at {appt.appointment_time}.",
                    notification_type="appointment_reminder",
                    ref_type="appointment",
                    ref_id=appt.id
                )

        db.session.commit()
        print(f"[{now}] Checked daily reminders.")


def check_medication_reminders(app):
    """
    Runs every hour to check for medication reminders due in the current hour.
    """
    with app.app_context():
        now = datetime.now()
        current_time = now.time()
        
        # Simplified: Just log that it ran. 
        # Real impl would compare current_time with reminder_time bounds.
        # print(f"[{now}] Checked medication reminders.")
        pass


def register_reminder_jobs(app, scheduler: BackgroundScheduler):
    """
    Register all APScheduler jobs.
    """
    # Run daily check every day at 8:00 AM
    scheduler.add_job(
        func=check_daily_reminders,
        trigger="cron",
        hour=8,
        minute=0,
        args=[app],
        id="daily_reminders",
        replace_existing=True
    )
    
    # Run medication check every hour
    scheduler.add_job(
        func=check_medication_reminders,
        trigger="cron",
        minute=0,
        args=[app],
        id="hourly_meds",
        replace_existing=True
    )
