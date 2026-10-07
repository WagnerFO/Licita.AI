// Card lateral dos contratos.
// Lê os atributos data-* da linha clicada e preenche o painel.
// Usamos textContent (e não innerHTML) para o texto nunca ser interpretado como HTML.
(function () {
  var painel = document.getElementById("painel");
  if (!painel) return; // páginas sem painel (login, formulários...)

  var fundo = document.getElementById("fundo-painel");
  var botaoFechar = document.getElementById("painel-fechar");
  var linhaAtiva = null;

  function abrir(linha) {
    var d = linha.dataset;

    document.getElementById("painel-titulo").textContent = "Contrato " + d.numero;
    var selo = document.getElementById("painel-selo");
    selo.textContent = d.situacao;
    selo.className = "selo selo-" + d.classe;
    document.getElementById("painel-prazo").textContent = d.prazo;

    painel.querySelectorAll("[data-campo]").forEach(function (el) {
      el.textContent = d[el.dataset.campo] || "—";
    });

    document.getElementById("painel-ver").href = d.urlDetalhe;
    var botaoEditar = document.getElementById("painel-editar");
    if (d.urlEditar) {
      botaoEditar.href = d.urlEditar;
      botaoEditar.hidden = false;
    } else {
      botaoEditar.hidden = true;
    }

    if (linhaAtiva) linhaAtiva.classList.remove("selecionada");
    linhaAtiva = linha;
    linha.classList.add("selecionada");

    painel.classList.add("aberto");
    painel.setAttribute("aria-hidden", "false");
    fundo.hidden = false;
    botaoFechar.focus();
  }

  function fechar() {
    painel.classList.remove("aberto");
    painel.setAttribute("aria-hidden", "true");
    fundo.hidden = true;
    if (linhaAtiva) {
      linhaAtiva.classList.remove("selecionada");
      linhaAtiva.focus();
      linhaAtiva = null;
    }
  }

  document.querySelectorAll(".linha-contrato").forEach(function (linha) {
    linha.addEventListener("click", function () { abrir(linha); });
    linha.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        abrir(linha);
      }
    });
  });

  botaoFechar.addEventListener("click", fechar);
  fundo.addEventListener("click", fechar);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && painel.classList.contains("aberto")) fechar();
  });
})();
