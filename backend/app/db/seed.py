from app.extensions import db
from app.models.user import User


def seed_data():
    if User.query.first():
        return

    users = [
        User(email="test@example.com", name="Test User"),
        User(email="admin@example.com", name="Admin User"),
    ]

    db.session.add_all(users)
    db.session.commit()