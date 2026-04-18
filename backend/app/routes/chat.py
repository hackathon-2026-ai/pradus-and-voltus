from flask import Blueprint, current_app, jsonify, request

from mobile_llm import run_pradus_api
from web_llm import run_voltus_api

chat_bp = Blueprint("chat", __name__)


def _clip(text: str, limit: int = 300) -> str:
    if len(text) <= limit:
        return text
    return f"{text[:limit]}..."


def _extract_answer_text(result: dict) -> str:
    if not isinstance(result, dict):
        return ""

    ui = result.get("ui_components")
    if not isinstance(ui, dict):
        return ""

    ai_panel = ui.get("ai_copilot_panel")
    if isinstance(ai_panel, dict):
        summary = ai_panel.get("executive_summary")
        if isinstance(summary, str) and summary.strip():
            return summary.strip()

    pradus_alert = ui.get("pradus_alert")
    if isinstance(pradus_alert, str) and pradus_alert.strip():
        return pradus_alert.strip()

    explainable = ui.get("explainable_ai")
    if isinstance(explainable, str) and explainable.strip():
        return explainable.strip()

    return ""


@chat_bp.route("/chat/pradus", methods=["GET", "POST"])
def chat_with_pradus():
    message = request.args.get("message")
    if request.is_json:
        payload = request.get_json(silent=True) or {}
        message = payload.get("message", message)

    if not message:
        return jsonify({"status": "error", "message": "Missing required field: message"}), 400

    current_app.logger.info("[chat/pradus] request message=%s", _clip(message))

    result = run_pradus_api(user_prompt=message)
    answer_text = _extract_answer_text(result)
    current_app.logger.info(
        "[chat/pradus] response status=%s answer=%s",
        result.get("status", "unknown") if isinstance(result, dict) else "unknown",
        _clip(answer_text or "<empty>")
    )

    return jsonify(result)


@chat_bp.route("/chat/voltus", methods=["GET", "POST"])
def chat_with_voltus():
    message = request.args.get("message")
    if request.is_json:
        payload = request.get_json(silent=True) or {}
        message = payload.get("message", message)

    if not message:
        return jsonify({"status": "error", "message": "Missing required field: message"}), 400

    current_app.logger.info("[chat/voltus] request message=%s", _clip(message))

    result = run_voltus_api(user_prompt=message)
    answer_text = _extract_answer_text(result)
    current_app.logger.info(
        "[chat/voltus] response status=%s answer=%s",
        result.get("status", "unknown") if isinstance(result, dict) else "unknown",
        _clip(answer_text or "<empty>")
    )

    return jsonify(result)
