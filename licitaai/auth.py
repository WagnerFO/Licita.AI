import functools
from datetime import datetime, timedelta

import click
from flask import (Blueprint, abort, flash, g, redirect, render_template,
                   request, session, url_for, current_app)
from flask.cli import with_appcontext
from werkzeug.security import check_password_hash, generate_password_hash

from .db import get_db

bp = Blueprint("auth", __name__)

MAX_TENTATIVAS = 5
BLOQUEIO_MINUTOS = 15
MSG_ERRO_LOGIN = "E-mail ou senha inválidos, ou conta temporariamente bloqueada."

# Hash usado quando o e-mail não existe, para o tempo de resposta ser parecido
HASH_FALSO = generate_password_hash("senha-falsa-para-comparacao")


def agora():
    return datetime.now()


@bp.before_app_request
def carregar_usuario():
    id_usuario = session.get("usuario_id")
    g.usuario = None
    if id_usuario is not None:
        g.usuario = get_db().execute(
            "SELECT id, nome, email, perfil FROM usuarios WHERE id = ? AND ativo = 1",
            (id_usuario,),
        ).fetchone()
        if g.usuario is None:
            session.clear()


def login_required(view):
    @functools.wraps(view)
    def wrapped(*args, **kwargs):
        if g.usuario is None:
            return redirect(url_for("auth.login"))
        return view(*args, **kwargs)
    return wrapped


def perfil_required(*perfis):
    """Só deixa passar quem tem um dos perfis informados."""
    def decorator(view):
        @functools.wraps(view)
        def wrapped(*args, **kwargs):
            if g.usuario is None:
                return redirect(url_for("auth.login"))
            if g.usuario["perfil"] not in perfis:
                abort(403)
            return view(*args, **kwargs)
        return wrapped
    return decorator


def _registrar_falha(db, usuario):
    tentativas = usuario["tentativas_falhas"] + 1
    bloqueado_ate = None
    if tentativas >= MAX_TENTATIVAS:
        bloqueado_ate = (agora() + timedelta(minutes=BLOQUEIO_MINUTOS)).isoformat()
        tentativas = 0
        current_app.logger.warning("Conta bloqueada por tentativas: %s", usuario["email"])
    db.execute(
        "UPDATE usuarios SET tentativas_falhas = ?, bloqueado_ate = ? WHERE id = ?",
        (tentativas, bloqueado_ate, usuario["id"]),
    )
    db.commit()


@bp.route("/login", methods=["GET", "POST"])
def login():
    if g.usuario is not None:
        return redirect(url_for("contratos.listar"))

    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        senha = request.form.get("senha", "")
        db = get_db()
        usuario = db.execute("SELECT * FROM usuarios WHERE email = ?", (email,)).fetchone()

        bloqueado = (
            usuario is not None
            and usuario["bloqueado_ate"] is not None
            and datetime.fromisoformat(usuario["bloqueado_ate"]) > agora()
        )

        hash_senha = usuario["senha_hash"] if usuario else HASH_FALSO
        senha_ok = check_password_hash(hash_senha, senha)

        if usuario is None or bloqueado or not usuario["ativo"] or not senha_ok:
            if usuario is not None and not bloqueado and usuario["ativo"]:
                _registrar_falha(db, usuario)
            flash(MSG_ERRO_LOGIN, "erro")
            return render_template("login.html"), 401

        # login correto: zera as tentativas e cria uma sessão nova
        db.execute(
            "UPDATE usuarios SET tentativas_falhas = 0, bloqueado_ate = NULL WHERE id = ?",
            (usuario["id"],),
        )
        db.commit()
        session.clear()
        session["usuario_id"] = usuario["id"]
        session.permanent = True
        return redirect(url_for("contratos.listar"))

    return render_template("login.html")


@bp.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return redirect(url_for("auth.login"))


@click.command("criar-usuario")
@click.option("--nome", prompt=True)
@click.option("--email", prompt=True)
@click.option("--perfil", type=click.Choice(["admin", "consulta"]), default="consulta")
@click.password_option()
@with_appcontext
def criar_usuario_command(nome, email, perfil, password):
    """Cria um usuário (a senha não fica salva em nenhum arquivo)."""
    if len(password) < 10:
        raise click.ClickException("A senha precisa ter pelo menos 10 caracteres.")
    db = get_db()
    try:
        db.execute(
            "INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES (?, ?, ?, ?)",
            (nome.strip(), email.strip().lower(), generate_password_hash(password), perfil),
        )
        db.commit()
    except Exception:
        raise click.ClickException("Já existe um usuário com esse e-mail.")
    click.echo("Usuário criado.")
