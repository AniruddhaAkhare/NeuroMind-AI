from flask import Flask, jsonify, send_from_directory

from config import Config
from extensions import cors, jwt
from database.db import init_db

from routes.auth_routes import auth_bp
from routes.prediction_routes import prediction_bp
from routes.history_routes import history_bp


def create_app():

    # ============================================================
    # CREATE FLASK APPLICATION
    # ============================================================

    app = Flask(__name__)

    # Load configuration
    app.config.from_object(Config)

    # ============================================================
    # INITIALIZE CORS
    # ============================================================

    cors.init_app(
        app,
        resources={
            r"/api/*": {
                "origins": "*"
            }
        }
    )

    # ============================================================
    # INITIALIZE JWT
    # ============================================================

    jwt.init_app(app)

    # ============================================================
    # INITIALIZE DATABASE
    #
    # IMPORTANT:
    # init_db() calls db.init_app(app), so we DO NOT
    # call db.init_app(app) separately here.
    # ============================================================

    init_db(app)

    # ============================================================
    # REGISTER BLUEPRINTS
    # ============================================================

    app.register_blueprint(
        auth_bp,
        url_prefix="/api"
    )

    app.register_blueprint(
        prediction_bp,
        url_prefix="/api"
    )

    app.register_blueprint(
        history_bp,
        url_prefix="/api"
    )

    # ============================================================
    # ROOT HEALTH CHECK
    # ============================================================

    @app.route("/", methods=["GET"])
    def root_health():

        return jsonify({
            "status": "healthy",
            "system": (
                "Alzheimer's MRI Detection "
                "& Explainable AI"
            ),
            "model": "EfficientNet-B3",
            "database": "PostgreSQL",
            "authentication": "JWT"
        }), 200

    # ============================================================
    # API HEALTH CHECK
    # ============================================================

    @app.route("/api/health", methods=["GET"])
    def api_health():

        return jsonify({
            "status": "healthy",
            "model": "EfficientNet-B3",
            "database": "PostgreSQL",
            "authentication": "JWT"
        }), 200

    # ============================================================
    # SERVE UPLOADED FILES
    # ============================================================

    @app.route(
        "/uploads/<path:filename>",
        methods=["GET"]
    )
    def serve_uploaded_file(filename):

        return send_from_directory(
            Config.UPLOAD_FOLDER,
            filename
        )

    # ============================================================
    # FILE TOO LARGE
    # ============================================================

    @app.errorhandler(413)
    def request_entity_too_large(error):

        return jsonify({
            "success": False,
            "error": (
                "File size exceeds the "
                "maximum allowed limit of 10MB."
            )
        }), 413

    # ============================================================
    # BAD REQUEST
    # ============================================================

    @app.errorhandler(400)
    def bad_request(error):

        description = getattr(
            error,
            "description",
            "Bad Request"
        )

        return jsonify({
            "success": False,
            "error": str(description)
        }), 400

    # ============================================================
    # UNAUTHORIZED
    # ============================================================

    @app.errorhandler(401)
    def unauthorized(error):

        return jsonify({
            "success": False,
            "error": "Authentication required."
        }), 401

    # ============================================================
    # NOT FOUND
    # ============================================================

    @app.errorhandler(404)
    def not_found(error):

        return jsonify({
            "success": False,
            "error": "Endpoint not found."
        }), 404

    # ============================================================
    # INTERNAL SERVER ERROR
    # ============================================================

    @app.errorhandler(500)
    def internal_error(error):

        return jsonify({
            "success": False,
            "error": (
                "An internal server error occurred "
                "while processing your request."
            )
        }), 500

    return app


# ============================================================
# RUN APPLICATION
# ============================================================

if __name__ == "__main__":

    app = create_app()

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )