from app import create_app
from app.extensions import db
from app.models.user import User
from app.db.seed import seed_data

app = create_app()

with app.app_context():
    db.create_all()
    seed_data()