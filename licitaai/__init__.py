import os
import secrets
from datetime import date, datetime, timedelta

from flask import Flask, redirect, render_template, url_for

from . import auth, contratos, db, seguranca
from .validacoes import DIAS_ALERTA


def formatar_moeda(centavos):
    if centavos is None:
        return "—"
    texto = f"{centavos / 100:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    return "R$ " + texto


def formatar_data(texto):
    if not texto:
        return "—"
    return date.fromisoformat(texto).strftime("%d/%m/%Y")


def situacao_contrato(data_fim):
    """Retorna (texto, classe_css, texto_dos_dias) de acordo com a data de fim."""
    fim = date.fromisoformat(data_fim)
    hoje = date.today()
    dias = (fim - hoje).days

    if dias < 0:
        n = abs(dias)
        return "Vencido", "vencido", f"Venceu há {n} dia{'s' if n > 1 else ''}"
    if dias == 0:
        return "Vence em breve", "a-vencer", "Vence hoje"
    if dias <= DIAS_ALERTA:
        return "Vence em breve", "a-vencer", f"Faltam {dias} dia{'s' if dias > 1 else ''}"
    return "No prazo", "no-prazo", f"Faltam {dias} dias"


def create_app(config=None):
    app = Flask(__name__, instance_relative_config=True)

    chave = os.environ.get("SECRET_KEY")
    if not chave:
        # sem SECRET_KEY definida, cada reinício desloga todo mundo
        chave = secrets.token_hex(32)
        print("AVISO: defina a variável SECRET_KEY para uso real.")

    app.config.from_mapping(
        SECRET_KEY=chave,
        DATABASE=os.path.join(app.instance_path, "licitaai.sqlite"),
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE="Lax",
        SESSION_COOKIE_SECURE=os.environ.get("COOKIE_SECURE") == "1",  # use 1 com HTTPS
        PERMANENT_SESSION_LIFETIME=timedelta(minutes=30),
        MAX_CONTENT_LENGTH=1024 * 1024,
    )
    if config:
        app.config.update(config)

    os.makedirs(app.instance_path, exist_ok=True)

    db.init_app(app)
    seguranca.init_app(app)
    app.register_blueprint(auth.bp)
    app.register_blueprint(contratos.bp)
    app.cli.add_command(auth.criar_usuario_command)

    from .importar import importar_command
    app.cli.add_command(importar_command)

    app.jinja_env.filters["moeda"] = formatar_moeda
    app.jinja_env.filters["data_br"] = formatar_data
    app.jinja_env.globals["situacao_do_contrato"] = situacao_contrato

    @app.route("/")
    def inicio():
        return redirect(url_for("contratos.listar"))

    @app.errorhandler(400)
    @app.errorhandler(403)
    @app.errorhandler(404)
    @app.errorhandler(413)
    def erro_http(e):
        mensagens = {
            400: "Requisição inválida. Volte e tente novamente.",
            403: "Você não tem permissão para acessar esta página.",
            404: "Página não encontrada.",
            413: "Requisição grande demais.",
        }
        return render_template("erro.html", codigo=e.code,
                               mensagem=mensagens.get(e.code, "Erro.")), e.code

    @app.errorhandler(500)
    def erro_interno(e):
        # não mostra detalhes do erro para o usuário
        return render_template("erro.html", codigo=500,
                               mensagem="Ocorreu um erro inesperado."), 500

    return app
