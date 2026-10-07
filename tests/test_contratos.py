from conftest import cadastrar_contrato, fazer_login, pegar_csrf
from licitaai.validacoes import cnpj_valido, valor_para_centavos, centavos_para_texto


# ---- funções de validação ----
def test_cnpj_valido():
    assert cnpj_valido("08.632.326/0001-43")
    assert not cnpj_valido("08.632.326/0001-44")
    assert not cnpj_valido("11111111111111")
    assert not cnpj_valido("123")


def test_valor_para_centavos():
    assert valor_para_centavos("1.234,56") == 123456
    assert valor_para_centavos("R$ 10,00") == 1000
    assert valor_para_centavos("1500.50") == 150050
    assert valor_para_centavos("abc") is None
    assert valor_para_centavos("-5,00") is None
    assert valor_para_centavos("") is None


def test_centavos_para_texto():
    assert centavos_para_texto(123456) == "1.234,56"


# ---- cadastro ----
def test_admin_cadastra_contrato(client):
    fazer_login(client)
    resposta = cadastrar_contrato(client)
    assert resposta.status_code == 302
    lista = client.get("/contratos/").get_data(as_text=True)
    assert "002/2023" in lista
    assert "R$ 8.999.899,91" in lista


def test_usuario_consulta_nao_cadastra(client):
    fazer_login(client, email="consulta@teste.com")
    assert client.get("/contratos/novo").status_code == 403


def test_campos_obrigatorios(client):
    fazer_login(client)
    resposta = cadastrar_contrato(client, empresa="")
    assert resposta.status_code == 400
    assert "Empresa é obrigatório" in resposta.get_data(as_text=True)


def test_cnpj_invalido_e_recusado(client):
    fazer_login(client)
    resposta = cadastrar_contrato(client, cnpj="12.345.678/0001-00")
    assert resposta.status_code == 400
    assert "CNPJ inválido" in resposta.get_data(as_text=True)


def test_data_fim_anterior_a_assinatura(client):
    fazer_login(client)
    resposta = cadastrar_contrato(client, data_fim="2020-01-01")
    assert resposta.status_code == 400


def test_numero_duplicado(client):
    fazer_login(client)
    cadastrar_contrato(client)
    resposta = cadastrar_contrato(client)
    assert resposta.status_code == 400
    assert "Já existe um contrato" in resposta.get_data(as_text=True)


def test_modalidade_fora_da_lista(client):
    fazer_login(client)
    assert cadastrar_contrato(client, modalidade="Inventada").status_code == 400


# ---- consulta, busca e filtros ----
def test_detalhe_do_contrato(client):
    fazer_login(client)
    cadastrar_contrato(client)
    pagina = client.get("/contratos/1").get_data(as_text=True)
    assert "Empresa de Teste LTDA" in pagina
    assert "08.632.326/0001-43" in pagina


def test_contrato_inexistente_da_404(client):
    fazer_login(client)
    assert client.get("/contratos/999").status_code == 404


def test_busca_por_empresa(client):
    fazer_login(client)
    cadastrar_contrato(client)
    cadastrar_contrato(client, numero="003/2023", empresa="Outra Firma SA")
    pagina = client.get("/contratos/?q=Outra").get_data(as_text=True)
    assert "003/2023" in pagina
    assert "002/2023" not in pagina


def test_busca_com_tentativa_de_sql_injection(client):
    fazer_login(client)
    cadastrar_contrato(client)
    resposta = client.get("/contratos/?q=' OR 1=1 --")
    assert resposta.status_code == 200
    assert "Nenhum contrato encontrado" in resposta.get_data(as_text=True)


def test_curinga_percent_nao_funciona(client):
    fazer_login(client)
    cadastrar_contrato(client)
    pagina = client.get("/contratos/?q=%25").get_data(as_text=True)
    assert "Nenhum contrato encontrado" in pagina


def test_filtro_de_situacao(client):
    fazer_login(client)
    cadastrar_contrato(client)  # vigente até 2030
    cadastrar_contrato(client, numero="010/2020", data_assinatura="2020-01-01", data_fim="2021-01-01")
    vigentes = client.get("/contratos/?situacao=no_prazo").get_data(as_text=True)
    encerrados = client.get("/contratos/?situacao=vencido").get_data(as_text=True)
    assert "002/2023" in vigentes and "010/2020" not in vigentes
    assert "010/2020" in encerrados and "002/2023" not in encerrados


# ---- edição ----
def test_editar_contrato(client):
    fazer_login(client)
    cadastrar_contrato(client)
    dados = dict(
        numero="002/2023", processo_licitatorio="103/2022", modalidade="Pregão Eletrônico",
        empresa="Nome Alterado LTDA", cnpj="08.632.326/0001-43", valor_total="100,00",
        data_assinatura="2023-01-04", data_fim="2030-01-04", orgao_gestor="Secretaria de Educação",
        resumo_objeto="Resumo", objeto="Objeto", csrf_token=pegar_csrf(client, "/contratos/1/editar"),
    )
    resposta = client.post("/contratos/1/editar", data=dados)
    assert resposta.status_code == 302
    assert "Nome Alterado LTDA" in client.get("/contratos/1").get_data(as_text=True)


def test_consulta_nao_edita(client):
    fazer_login(client, email="consulta@teste.com")
    assert client.get("/contratos/1/editar").status_code == 403


def test_tela_de_edicao_vem_preenchida(client):
    fazer_login(client)
    cadastrar_contrato(client)
    pagina = client.get("/contratos/1/editar").get_data(as_text=True)
    assert "8.999.899,91" in pagina


# ---- segurança ----
def test_xss_e_escapado(client):
    fazer_login(client)
    cadastrar_contrato(client, empresa="<script>alert(1)</script>")
    pagina = client.get("/contratos/1").get_data(as_text=True)
    assert "<script>alert(1)</script>" not in pagina
    assert "&lt;script&gt;" in pagina


def test_cadastro_sem_csrf_e_rejeitado(client):
    fazer_login(client)
    resposta = client.post("/contratos/novo", data={"numero": "x"})
    assert resposta.status_code == 400


# ---- visual / card lateral ----
def test_lista_traz_dados_para_o_card_lateral(client):
    fazer_login(client)
    cadastrar_contrato(client)
    pagina = client.get("/contratos/").get_data(as_text=True)
    assert 'id="painel"' in pagina
    assert 'data-numero="002/2023"' in pagina
    assert 'data-url-editar' in pagina          # admin vê o botão de editar


def test_consulta_nao_recebe_url_de_edicao(client):
    fazer_login(client)
    cadastrar_contrato(client)
    client.post("/logout", data={"csrf_token": pegar_csrf(client, "/contratos/")})
    fazer_login(client, email="consulta@teste.com")
    pagina = client.get("/contratos/").get_data(as_text=True)
    assert 'data-url-editar' not in pagina


def test_situacao_no_prazo_e_vencido(client):
    fazer_login(client)
    cadastrar_contrato(client)  # vence em 2030
    cadastrar_contrato(client, numero="010/2020", data_assinatura="2020-01-01", data_fim="2021-01-01")
    pagina = client.get("/contratos/").get_data(as_text=True)
    assert "No prazo" in pagina
    assert "Vencido" in pagina


def test_cartoes_de_resumo(client):
    fazer_login(client)
    cadastrar_contrato(client)
    cadastrar_contrato(client, numero="010/2020", data_assinatura="2020-01-01", data_fim="2021-01-01")
    pagina = client.get("/contratos/").get_data(as_text=True)
    assert "Total de contratos" in pagina


def test_arquivo_js_e_servido(client):
    assert client.get("/static/app.js").status_code == 200


def test_atributo_com_aspas_nao_quebra_o_html(client):
    fazer_login(client)
    cadastrar_contrato(client, empresa='Firma "Aspas" & <b>Cia</b>')
    pagina = client.get("/contratos/").get_data(as_text=True)
    assert '<b>Cia</b>' not in pagina
