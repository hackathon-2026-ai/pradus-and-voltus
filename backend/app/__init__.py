from flask import Flask
from app.config import Config
from app.extensions import db as sqlalchemy_db
from app.routes.chat import chat_bp
from app.routes.health import health_bp
from app.routes.users import users_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    sqlalchemy_db.init_app(app)

    app.register_blueprint(chat_bp, url_prefix="/api")
    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(users_bp, url_prefix="/api")

    return app