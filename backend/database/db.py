from extensions import db


def init_db(app):
    """
    Initialize SQLAlchemy with the Flask application
    and create the required database tables.
    """

    database_url = app.config.get(
        "SQLALCHEMY_DATABASE_URI"
    )

    if not database_url:
        raise RuntimeError(
            "SQLALCHEMY_DATABASE_URI is not configured."
        )

    # Initialize SQLAlchemy
    db.init_app(app)

    # Create database tables
    with app.app_context():
        try:
            db.create_all()
            db_target = database_url.split('@')[-1] if '@' in database_url else database_url
            print(
                f"Successfully connected to database and initialized schema ({db_target})."
            )
        except Exception as exc:
            raise RuntimeError(
                f"Failed to initialize database: {exc}"
            ) from exc