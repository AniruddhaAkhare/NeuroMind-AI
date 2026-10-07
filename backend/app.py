"""
NeuroMind AI — Flask Application Factory
"""
import atexit
from flask import Flask, jsonify, send_from_directory
from flask_jwt_extended import jwt_required

from config import Config
from extensions import cors, jwt, db, migrate, limiter, scheduler
from database.db import init_db

# ---- Import all models so SQLAlchemy discovers them --------
import database.models  # noqa: F401

# ---- Blueprints --------------------------------------------
from routes.auth_routes import auth_bp
from routes.prediction_routes import prediction_bp
from routes.history_routes import history_bp
from routes.patient_routes import patient_bp
from routes.report_routes import report_bp
from routes.rag_routes import rag_bp
from routes.analytics_routes import analytics_bp
from routes.appointment_routes import appointment_bp
from routes.doctor_routes import doctor_bp
from routes.notification_routes import notification_bp
from routes.admin_routes import admin_bp

# ---- Background jobs ---------------------------------------
from tasks.reminder_jobs import register_reminder_jobs


def create_app():

    app = Flask(__name__)
    app.config.from_object(Config)

    # ========================================================
    # INITIALIZE EXTENSIONS
    # ========================================================

    cors.init_app(
        app,
        resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}},
        supports_credentials=True,
    )

    jwt.init_app(app)
    limiter.init_app(app)

    # ---- DB + Migrations -----------------------------------
    init_db(app)
    migrate.init_app(app, db)

    # ========================================================
    # REGISTER BLUEPRINTS
    # ========================================================

    blueprints = [
        (auth_bp,         "/api"),
        (prediction_bp,   "/api"),
        (history_bp,      "/api"),
        (patient_bp,      "/api"),
        (report_bp,       "/api"),
        (rag_bp,          "/api"),
        (analytics_bp,    "/api"),
        (appointment_bp,  "/api"),
        (doctor_bp,       "/api"),
        (notification_bp, "/api"),
        (admin_bp,        "/api"),
    ]

    for blueprint, prefix in blueprints:
        app.register_blueprint(blueprint, url_prefix=prefix)

    # ========================================================
    # HEALTH ENDPOINTS
    # ========================================================

    @app.route("/", methods=["GET"])
    def root_health():
        return jsonify({
            "status": "healthy",
            "system": "NeuroMind AI — Dementia Clinical Intelligence Platform",
            "model": "EfficientNet-B3",
            "database": "PostgreSQL",
            "authentication": "JWT",
            "version": "2.0.0",
        }), 200

    @app.route("/api/health", methods=["GET"])
    def api_health():
        return jsonify({
            "status": "healthy",
            "model": "EfficientNet-B3",
            "database": "PostgreSQL",
            "authentication": "JWT",
        }), 200

    # ========================================================
    # SERVE UPLOADED FILES (Image previews & static assets)
    # ========================================================

    @app.route("/uploads/<path:filename>", methods=["GET"])
    @app.route("/api/uploads/<path:filename>", methods=["GET"])
    @jwt_required(optional=True)
    def serve_uploaded_file(filename):
        return send_from_directory(Config.UPLOAD_FOLDER, filename)

    # ========================================================
    # ERROR HANDLERS
    # ========================================================

    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({"success": False, "error": str(getattr(error, "description", "Bad Request"))}), 400

    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({"success": False, "error": "Authentication required."}), 401

    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({"success": False, "error": "Access denied."}), 403

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"success": False, "error": "Endpoint not found."}), 404

    @app.errorhandler(413)
    def too_large(error):
        return jsonify({"success": False, "error": "File exceeds maximum allowed size."}), 413

    @app.errorhandler(429)
    def too_many_requests(error):
        return jsonify({"success": False, "error": "Too many requests. Please try again later."}), 429

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({"success": False, "error": "An internal server error occurred."}), 500

    # ========================================================
    # JWT EXTENDED CALLBACKS
    # ========================================================

    @jwt.unauthorized_loader
    def missing_token_callback(reason):
        return jsonify({"success": False, "error": f"Missing token: {reason}"}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(reason):
        return jsonify({"success": False, "error": f"Invalid token: {reason}"}), 422

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_data):
        return jsonify({"success": False, "error": "Token has expired. Please log in again."}), 401

    # ========================================================
    # START APSCHEDULER
    # ========================================================

    with app.app_context():
        register_reminder_jobs(app, scheduler)

    if not scheduler.running:
        scheduler.start()
        atexit.register(lambda: scheduler.shutdown(wait=False))

    return app


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=Config.DEBUG)