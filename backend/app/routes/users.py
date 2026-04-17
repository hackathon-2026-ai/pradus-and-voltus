from flask import Blueprint, jsonify
from app.models.user import User

users_bp = Blueprint("users", __name__)


@users_bp.get("/users")
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users]), 200