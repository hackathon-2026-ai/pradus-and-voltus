from app import create_app
from app.extensions import db
from app.models.user import User
from app.db.seed import seed_data

app = create_app()

with app.app_context():
    try:
        db.create_all()
        seed_data()
    except Exception as exc:
        # Allow the app to start even if the database isn't available (e.g. local dev
        # running only the chat endpoints). Endpoints that require DB may still fail.
        app.logger.warning("Database init/seed skipped: %s", exc)