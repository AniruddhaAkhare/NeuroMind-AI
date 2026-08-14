from extensions import db


def init_db(app):
    """
    Initialize SQLAlchemy with the Flask application
    and create the required PostgreSQL tables.
    """

    database_url = app.config.get(
        "SQLALCHEMY_DATABASE_URI"
    )

    if not database_url:
        raise RuntimeError(
            "SQLALCHEMY_DATABASE_URI is not configured."
        )

    if not database_url.startswith("postgresql"):
        raise RuntimeError(
            "Invalid database configuration. "
            "This application requires PostgreSQL."
        )

    # Initialize SQLAlchemy
    db.init_app(app)

    # Create database tables
    with app.app_context():

        try:
            db.create_all()

            print(
                "Successfully connected to PostgreSQL "
                "and initialized database schema."
            )

            print(
                f"Database URI: "
                f"{database_url.split('@')[-1]}"
            )

        except Exception as exc:

            raise RuntimeError(
                "Failed to initialize PostgreSQL database. "
                f"Error: {exc}"
            ) from exc