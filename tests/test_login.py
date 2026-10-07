from conftest import fazer_login, pegar_csrf


def test_pagina_de_login_abre(client):
    assert client.get("/login").status_code == 200


def test_rota_protegida_redireciona_para_login(client):
    resposta = client.get("/contratos/")
    assert resposta.status_code == 302
    assert "/login" in resposta.headers["Location"]


def test_login_com_credenciais_corretas(client):
    resposta = fazer_login(client)
    assert resposta.status_code == 302
    assert client.get("/contratos/").status_code == 200


def test_login_com_senha_errada(client):
    resposta = fazer_login(client, senha="senhaErrada")
    assert resposta.status_code == 401
    assert "inválidos" in resposta.get_data(as_text=True)


def test_mensagem_igual_para_email_inexistente(client):
    erro_usuario = fazer_login(client, email="naoexiste@teste.com").get_data(as_text=True)
    erro_senha = fazer_login(client, senha="errada").get_data(as_text=True)
    assert "inválidos" in erro_usuario and "inválidos" in erro_senha


def test_bloqueio_apos_cinco_tentativas(client):
    for _ in range(5):
        fazer_login(client, senha="errada")
    # mesmo com a senha certa a conta continua bloqueada
    resposta = fazer_login(client)
    assert resposta.status_code == 401


def test_post_sem_csrf_e_rejeitado(client):
    resposta = client.post("/login", data={"email": "admin@teste.com", "senha": "senhaForte123"})
    assert resposta.status_code == 400


def test_logout(client):
    fazer_login(client)
    token = pegar_csrf(client, "/contratos/")
    client.post("/logout", data={"csrf_token": token})
    assert client.get("/contratos/").status_code == 302


def test_logout_nao_funciona_com_get(client):
    fazer_login(client)
    assert client.get("/logout").status_code == 405


def test_cabecalhos_de_seguranca(client):
    resposta = client.get("/login")
    assert resposta.headers["X-Frame-Options"] == "DENY"
    assert "Content-Security-Policy" in resposta.headers
    assert resposta.headers["Cache-Control"] == "no-store"


def test_cookie_de_sessao_httponly(client):
    resposta = fazer_login(client)
    cookie = resposta.headers.get("Set-Cookie", "")
    assert "HttpOnly" in cookie
    assert "SameSite=Lax" in cookie
