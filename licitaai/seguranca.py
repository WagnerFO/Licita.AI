import hmac
import secrets
from flask import abort, request, session


def token_csrf():
    # cria um token por sessão, usado nos formulários
    if "csrf" not in session:
        session["csrf"] = secrets.token_hex(32)
    return session["csrf"]


def init_app(app):
    app.jinja_env.globals["csrf_token"] = token_csrf

    @app.before_request
    def checar_csrf():
        # todo POST precisa trazer o token que foi gerado na sessão
        if request.method == "POST":
            enviado = request.form.get("csrf_token", "")
            esperado = session.get("csrf", "")
            if not enviado or not esperado or not hmac.compare_digest(enviado, esperado):
                abort(400)

    @app.after_request
    def cabecalhos_de_seguranca(resposta):
        resposta.headers["X-Content-Type-Options"] = "nosniff"
        resposta.headers["X-Frame-Options"] = "DENY"
        resposta.headers["Referrer-Policy"] = "same-origin"
        resposta.headers["Content-Security-Policy"] = (
            "default-src 'self'; script-src 'self'; style-src 'self'; "
            "frame-ancestors 'none'; form-action 'self'"
        )
        # evita que páginas com dados de contratos fiquem em cache
        if request.endpoint != "static":
            resposta.headers["Cache-Control"] = "no-store"
        return resposta
