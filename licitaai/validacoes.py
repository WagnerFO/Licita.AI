import re
from datetime import date
from decimal import Decimal, InvalidOperation

# contratos que vencem em até X dias recebem o alerta "Vence em breve"
DIAS_ALERTA = 60

MODALIDADES = [
    "Adesão a Ata",
    "Ata de Registro de Preço",
    "Chamada Publica",
    "Concorrência Publica",
    "Dispensa",
    "Inexigibilidade",
    "Pregão Eletrônico",
    "Processo Administrativo",
    "Tomada de Preço",
]


def cnpj_valido(cnpj):
    """Confere os dois dígitos verificadores do CNPJ."""
    numeros = re.sub(r"\D", "", cnpj)
    if len(numeros) != 14 or numeros == numeros[0] * 14:
        return False

    def calcular_digito(base, pesos):
        soma = sum(int(d) * p for d, p in zip(base, pesos))
        resto = soma % 11
        return "0" if resto < 2 else str(11 - resto)

    pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    pesos2 = [6] + pesos1
    d1 = calcular_digito(numeros[:12], pesos1)
    d2 = calcular_digito(numeros[:12] + d1, pesos2)
    return numeros[12:] == d1 + d2


def formatar_cnpj(cnpj):
    n = re.sub(r"\D", "", cnpj)
    return f"{n[:2]}.{n[2:5]}.{n[5:8]}/{n[8:12]}-{n[12:]}"


def valor_para_centavos(texto):
    """Converte '1.234,56' (ou '1234.56') em centavos. Retorna None se inválido."""
    texto = texto.replace("R$", "").replace(" ", "")
    if not texto:
        return None
    if "," in texto:
        texto = texto.replace(".", "").replace(",", ".")
    try:
        valor = Decimal(texto)
    except InvalidOperation:
        return None
    if not valor.is_finite() or valor < 0 or valor > Decimal("100000000000"):
        return None
    return int(valor * 100)


def centavos_para_texto(centavos):
    """Usado para preencher o formulário de edição."""
    if centavos is None:
        return ""
    return f"{centavos / 100:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def _data(texto):
    try:
        return date.fromisoformat(texto)
    except ValueError:
        return None


# campo -> (rótulo, tamanho máximo)
CAMPOS_TEXTO = {
    "numero": ("Número do contrato", 30),
    "processo_licitatorio": ("Processo licitatório", 30),
    "numero_modalidade": ("Número da modalidade", 30),
    "empresa": ("Empresa", 200),
    "cnpj": ("CNPJ", 18),
    "resumo_objeto": ("Resumo do objeto", 200),
    "objeto": ("Objeto", 5000),
    "orgao_gestor": ("Órgão gestor", 150),
    "secretario": ("Secretário", 150),
}


def validar_contrato(form):
    """Recebe request.form. Retorna (dados_limpos, erros)."""
    erros = {}
    dados = {}

    for campo, (rotulo, maximo) in CAMPOS_TEXTO.items():
        valor = form.get(campo, "").strip()
        if len(valor) > maximo:
            erros[campo] = f"{rotulo} deve ter no máximo {maximo} caracteres."
        dados[campo] = valor

    obrigatorios = ["numero", "processo_licitatorio", "empresa", "cnpj",
                    "resumo_objeto", "objeto", "orgao_gestor"]
    for campo in obrigatorios:
        if not dados[campo] and campo not in erros:
            erros[campo] = f"{CAMPOS_TEXTO[campo][0]} é obrigatório."

    if dados["cnpj"] and "cnpj" not in erros:
        if cnpj_valido(dados["cnpj"]):
            dados["cnpj"] = formatar_cnpj(dados["cnpj"])
        else:
            erros["cnpj"] = "CNPJ inválido."

    dados["modalidade"] = form.get("modalidade", "")
    if dados["modalidade"] not in MODALIDADES:
        erros["modalidade"] = "Selecione uma modalidade válida."

    # valores
    dados["valor_total_centavos"] = valor_para_centavos(form.get("valor_total", ""))
    if dados["valor_total_centavos"] is None:
        erros["valor_total"] = "Informe um valor total válido (ex.: 1.500,00)."

    texto_estimado = form.get("valor_estimado", "").strip()
    dados["valor_estimado_centavos"] = None
    if texto_estimado:
        dados["valor_estimado_centavos"] = valor_para_centavos(texto_estimado)
        if dados["valor_estimado_centavos"] is None:
            erros["valor_estimado"] = "Valor estimado inválido."

    # datas
    inicio = _data(form.get("data_assinatura", ""))
    fim = _data(form.get("data_fim", ""))
    if inicio is None:
        erros["data_assinatura"] = "Informe a data de assinatura."
    if fim is None:
        erros["data_fim"] = "Informe a data de fim da vigência."
    if inicio and fim and fim < inicio:
        erros["data_fim"] = "A data de fim não pode ser anterior à assinatura."
    dados["data_assinatura"] = inicio.isoformat() if inicio else ""
    dados["data_fim"] = fim.isoformat() if fim else ""

    # prazo em meses (opcional)
    prazo = form.get("prazo_vigencia_meses", "").strip()
    dados["prazo_vigencia_meses"] = None
    if prazo:
        if prazo.isdigit() and 0 < int(prazo) <= 600:
            dados["prazo_vigencia_meses"] = int(prazo)
        else:
            erros["prazo_vigencia_meses"] = "Informe o prazo em meses (número inteiro)."

    return dados, erros
