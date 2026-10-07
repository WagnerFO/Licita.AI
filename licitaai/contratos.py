from datetime import date, timedelta

from flask import (Blueprint, abort, flash, redirect, render_template,
                   request, url_for)

from .auth import login_required, perfil_required
from .db import get_db
from .validacoes import (DIAS_ALERTA, MODALIDADES, centavos_para_texto, validar_contrato)

bp = Blueprint("contratos", __name__, url_prefix="/contratos")

POR_PAGINA = 15


def escapar_like(texto):
    # impede que % e _ digitados pelo usuário funcionem como curinga
    return texto.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


def buscar_contrato(id_contrato):
    contrato = get_db().execute(
        "SELECT * FROM contratos WHERE id = ?", (id_contrato,)
    ).fetchone()
    if contrato is None:
        abort(404)
    return contrato


@bp.route("/")
@login_required
def listar():
    busca = request.args.get("q", "").strip()[:100]
    modalidade = request.args.get("modalidade", "")
    situacao = request.args.get("situacao", "")
    pagina = max(request.args.get("pagina", 1, type=int), 1)

    # o SQL é montado só com textos fixos; os valores vão sempre em "params"
    condicoes = []
    params = []

    if busca:
        termo = f"%{escapar_like(busca)}%"
        colunas = ["numero", "processo_licitatorio", "empresa", "resumo_objeto", "objeto"]
        partes = [f"{c} LIKE ? ESCAPE '\\'" for c in colunas]
        condicoes.append("(" + " OR ".join(partes) + ")")
        params += [termo] * len(colunas)

    if modalidade in MODALIDADES:
        condicoes.append("modalidade = ?")
        params.append(modalidade)

    # datas de referência (usamos a data do Python para não depender do fuso do SQLite)
    hoje = date.today().isoformat()
    limite = (date.today() + timedelta(days=DIAS_ALERTA)).isoformat()

    if situacao == "no_prazo":
        condicoes.append("data_fim > ?")
        params.append(limite)
    elif situacao == "a_vencer":
        condicoes.append("data_fim >= ? AND data_fim <= ?")
        params += [hoje, limite]
    elif situacao == "vencido":
        condicoes.append("data_fim < ?")
        params.append(hoje)

    where = "WHERE " + " AND ".join(condicoes) if condicoes else ""
    db = get_db()

    total = db.execute(f"SELECT COUNT(*) FROM contratos {where}", params).fetchone()[0]
    contratos = db.execute(
        f"SELECT * FROM contratos {where} ORDER BY data_assinatura DESC, id DESC "
        "LIMIT ? OFFSET ?",
        params + [POR_PAGINA, (pagina - 1) * POR_PAGINA],
    ).fetchall()

    # números dos cartões do topo (contam todos os contratos, sem filtro)
    resumo = db.execute(
        """SELECT COUNT(*) AS total,
                  COALESCE(SUM(data_fim < ?), 0) AS vencidos,
                  COALESCE(SUM(data_fim >= ? AND data_fim <= ?), 0) AS a_vencer,
                  COALESCE(SUM(data_fim > ?), 0) AS no_prazo
           FROM contratos""",
        (hoje, hoje, limite, limite),
    ).fetchone()

    total_paginas = max((total + POR_PAGINA - 1) // POR_PAGINA, 1)
    return render_template(
        "contratos_lista.html", contratos=contratos, total=total,
        pagina=pagina, total_paginas=total_paginas, busca=busca,
        modalidade=modalidade, situacao=situacao, modalidades=MODALIDADES,
        resumo=resumo,
    )


@bp.route("/<int:id_contrato>")
@login_required
def detalhe(id_contrato):
    return render_template("contrato_detalhe.html", contrato=buscar_contrato(id_contrato))


def _numero_ja_existe(numero, ignorar_id=0):
    linha = get_db().execute(
        "SELECT id FROM contratos WHERE numero = ? AND id != ?", (numero, ignorar_id)
    ).fetchone()
    return linha is not None


@bp.route("/novo", methods=["GET", "POST"])
@perfil_required("admin")
def novo():
    if request.method == "POST":
        dados, erros = validar_contrato(request.form)
        if not erros and _numero_ja_existe(dados["numero"]):
            erros["numero"] = "Já existe um contrato com esse número."

        if not erros:
            db = get_db()
            colunas = ", ".join(_COLUNAS)
            interrogacoes = ", ".join("?" for _ in _COLUNAS)
            db.execute(
                f"INSERT INTO contratos ({colunas}) VALUES ({interrogacoes})",
                [dados[c] for c in _COLUNAS],
            )
            db.commit()
            flash("Contrato cadastrado com sucesso.", "sucesso")
            return redirect(url_for("contratos.listar"))

        return render_template("contrato_form.html", valores=request.form, erros=erros,
                               modalidades=MODALIDADES, titulo="Novo contrato"), 400

    return render_template("contrato_form.html", valores={}, erros={},
                           modalidades=MODALIDADES, titulo="Novo contrato")


# colunas que o formulário preenche (a ordem importa nos INSERT/UPDATE)
_COLUNAS = [
    "numero", "processo_licitatorio", "numero_modalidade", "modalidade", "empresa",
    "cnpj", "resumo_objeto", "objeto", "valor_estimado_centavos",
    "valor_total_centavos", "orgao_gestor", "secretario", "data_assinatura",
    "data_fim", "prazo_vigencia_meses",
]


@bp.route("/<int:id_contrato>/editar", methods=["GET", "POST"])
@perfil_required("admin")
def editar(id_contrato):
    contrato = buscar_contrato(id_contrato)

    if request.method == "POST":
        dados, erros = validar_contrato(request.form)
        if not erros and _numero_ja_existe(dados["numero"], id_contrato):
            erros["numero"] = "Já existe um contrato com esse número."

        if not erros:
            db = get_db()
            atribuicoes = ", ".join(f"{c} = ?" for c in _COLUNAS)
            db.execute(
                f"UPDATE contratos SET {atribuicoes}, atualizado_em = CURRENT_TIMESTAMP "
                "WHERE id = ?",
                [dados[c] for c in _COLUNAS] + [id_contrato],
            )
            db.commit()
            flash("Contrato atualizado com sucesso.", "sucesso")
            return redirect(url_for("contratos.detalhe", id_contrato=id_contrato))

        return render_template("contrato_form.html", valores=request.form, erros=erros,
                               modalidades=MODALIDADES, titulo="Editar contrato"), 400

    valores = dict(contrato)
    valores["valor_total"] = centavos_para_texto(contrato["valor_total_centavos"])
    valores["valor_estimado"] = centavos_para_texto(contrato["valor_estimado_centavos"])
    return render_template("contrato_form.html", valores=valores, erros={},
                           modalidades=MODALIDADES, titulo="Editar contrato")
