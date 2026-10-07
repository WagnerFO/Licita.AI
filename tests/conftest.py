import re
import pytest
from werkzeug.security import generate_password_hash

from licitaai import create_app
from licitaai.db import get_db, init_db


@pytest.fixture
def app(tmp_path):
    app = create_app({
        "TESTING": True,
        "SECRET_KEY": "chave-so-para-teste",
        "DATABASE": str(tmp_path / "teste.sqlite"),
    })
    with app.app_context():
        init_db()
        db = get_db()
        for nome, email, perfil in [
            ("Admin Teste", "admin@teste.com", "admin"),
            ("Consulta Teste", "consulta@teste.com", "consulta"),
        ]:
            db.execute(
                "INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES (?, ?, ?, ?)",
                (nome, email, generate_password_hash("senhaForte123"), perfil),
            )
        db.commit()
    return app


@pytest.fixture
def client(app):
    return app.test_client()


def pegar_csrf(client, url="/login"):
    pagina = client.get(url).get_data(as_text=True)
    return re.search(r'name="csrf_token" value="([^"]+)"', pagina).group(1)


def fazer_login(client, email="admin@teste.com", senha="senhaForte123"):
    token = pegar_csrf(client)
    return client.post("/login", data={"email": email, "senha": senha, "csrf_token": token})


CONTRATO_VALIDO = {
    "numero": "002/2023",
    "processo_licitatorio": "103/2022",
    "numero_modalidade": "053/2022",
    "modalidade": "Pregão Eletrônico",
    "empresa": "Empresa de Teste LTDA",
    "cnpj": "08.632.326/0001-43",
    "valor_total": "8.999.899,91",
    "valor_estimado": "10.245.296,11",
    "data_assinatura": "2023-01-04",
    "data_fim": "2030-01-04",
    "prazo_vigencia_meses": "24",
    "orgao_gestor": "Secretaria de Educação",
    "secretario": "Fulano de Tal",
    "resumo_objeto": "Transporte escolar",
    "objeto": "Prestação de serviço de transporte escolar.",
}


def cadastrar_contrato(client, **alteracoes):
    dados = dict(CONTRATO_VALIDO, **alteracoes)
    dados["csrf_token"] = pegar_csrf(client, "/contratos/novo")
    return client.post("/contratos/novo", data=dados)
