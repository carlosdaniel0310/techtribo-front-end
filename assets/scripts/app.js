const API = "https://techtribo-backend.onrender.com";

// ---------------------- DETALHES DO DESENVOLVEDOR ----------------------
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  // Página Detalhes
  if (id) {
    fetch(`${API}/desenvolvedores/${id}`)
      .then(res => res.json())
      .then(dev => {
        document.getElementById("detalhe-info-geral").innerHTML = `
          <div class="d-flex align-items-center">
            <img src="${dev.imagem}" alt="${dev.nome}" class="rounded me-3" width="150">
            <div>
              <h3>${dev.nome}</h3>
              <p class="text-muted">${dev.empresa}</p>
              <p>${dev.descricao}</p>
              <p><strong>Formação:</strong> ${dev.formacao || "Não informado"}</p>
              <p><strong>Linguagens:</strong> ${dev.linguagens || "Não informado"}</p>
              <p><strong>Experiência:</strong> ${dev.experiencia || "Não informado"}</p>
            </div>
          </div>
        `;

        const fotos = (dev.projetos || [])
          .map(p => `
            <div class="col-md-4">
              <div class="card h-100 shadow-sm">
                <img src="${p.src}" class="card-img-top" alt="Imagem do projeto">
                <div class="card-body text-center">
                  <p>${p.descricao}</p>
                </div>
              </div>
            </div>
          `)
          .join("");

        document.getElementById("detalhe-fotos-vinculadas").innerHTML = fotos;
      });

    return;
  }

  // ---------------------- PÁGINA INDEX ----------------------
  fetch(`${API}/desenvolvedores`)
    .then(res => res.json())
    .then(devs => {
      const lista = document.getElementById("lista-desenvolvedores");

      if (lista) {
        lista.innerHTML = devs
          .map(dev => `
            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
              <div class="card shadow-sm h-100 text-center">
                <img src="${dev.imagem}" class="card-img-top" alt="${dev.nome}">
                <div class="card-body">
                  <h5>${dev.nome}</h5>
                  <h6 class="text-muted">${dev.empresa}</h6>
                  <p class="small">${dev.descricao?.substring(0, 60) || ""}...</p>
                  <a href="detalhes.html?id=${dev.id}" class="btn btn-primary btn-sm mt-2">Ver Detalhes</a>
                </div>
              </div>
            </div>
          `)
          .join("");
      }
    });
});

// ---------------------- FAVORITOS ----------------------
function toggleFavorito(id) {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!usuario) return alert("Faça login para favoritar!");

  const chave = `favoritos_${usuario.id}`;
  let favoritos = JSON.parse(localStorage.getItem(chave)) || [];

  if (favoritos.includes(id)) {
    favoritos = favoritos.filter(f => f !== id);
  } else {
    favoritos.push(id);
  }

  localStorage.setItem(chave, JSON.stringify(favoritos));
  carregarDevs();
}

function isFavorito(id) {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!usuario) return false;

  const favoritos = JSON.parse(localStorage.getItem(`favoritos_${usuario.id}`)) || [];
  return favoritos.includes(id);
}

// ---------------------- CARREGAR DEVS (HOME) ----------------------
async function carregarDevs() {
  const resposta = await fetch(`${API}/desenvolvedores`);
  const devs = await resposta.json();

  const destaques = devs.filter(d => d.destaque === true);
  const todos = devs;

  const listaDestaques = document.getElementById("listaDestaques");
  const listaTodos = document.getElementById("listaTodos");

  if (!listaDestaques || !listaTodos) return;

  listaDestaques.innerHTML = "";
  listaTodos.innerHTML = "";

  listaDestaques.innerHTML = destaques.map(criarCardDev).join("");
  listaTodos.innerHTML = todos.map(criarCardDev).join("");
}

function criarCardDev(dev) {
  const favorito = isFavorito(dev.id);

  return `
    <div class="col-md-3 col-sm-6">
      <div class="card shadow-sm border-0 position-relative">

        <button class="btn position-absolute top-0 end-0 m-2 favorito-btn"
                onclick="toggleFavorito('${dev.id}')">
            <i class="bi ${favorito ? "bi-star-fill" : "bi-star"}"
               style="color: white; font-size: 15px; text-shadow: 0px 0px 5px black;"></i>
        </button>

        <img src="${dev.imagem}" 
             class="card-img-top" 
             style="height:250px; object-fit:cover;">

        <div class="card-body text-center">
            <h5 class="fw-bold">${dev.nome}</h5>
            <p class="text-muted">${dev.empresa}</p>

            <a href="detalhe.html?id=${dev.id}" class="btn btn-primary">Ver Perfil</a>
        </div>
      </div>
    </div>
  `;
}

carregarDevs();

// ---------------------- PROJETOS DO USUÁRIO ----------------------
function carregarProjetos() {
  const lista = document.getElementById("projetosUsuarios");
  if (!lista) return;

  const projetos = JSON.parse(localStorage.getItem("projetos") || "[]");
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado") || "{}");

  lista.innerHTML = projetos
    .map((p, index) => `
      <div class="col-12 col-md-6 col-lg-4">
        <div class="card shadow-sm text-center h-100">

          ${p.imagem ? `
            <img src="${p.imagem}" class="card-img-top" style="height:180px; object-fit:cover;">
          ` : `
            <div style="height:80px; background:#f1f1f1; display:flex; justify-content:center; align-items:center;">
              Sem imagem
            </div>
          `}

          <div class="card-body">
            <h5 class="fw-bold">${p.nome}</h5>
            <p class="text-muted">${p.projeto}</p>

            <button class="btn btn-primary btn-sm" onclick="verProjeto(${index})">Ver Projeto</button>

            ${usuario.admin ? `
              <button class="btn btn-warning btn-sm me-1" onclick="editarProjeto(${index})">Editar</button>
              <button class="btn btn-danger btn-sm" onclick="excluirProjeto(${index})">Excluir</button>
            ` : ""}
          </div>

        </div>
      </div>
    `)
    .join("");
}

carregarProjetos();

// ---------------------- EXCLUIR PROJETO ----------------------
function excluirProjeto(index) {
  let projetos = JSON.parse(localStorage.getItem("projetos") || "[]");
  projetos.splice(index, 1);
  localStorage.setItem("projetos", JSON.stringify(projetos));
  carregarProjetos();
}

// ---------------------- VER PROJETO ----------------------
function verProjeto(index) {
  const projetos = JSON.parse(localStorage.getItem("projetos") || "[]");
  const p = projetos[index];

  document.getElementById("verNome").innerText = `${p.projeto} — ${p.nome}`;
  document.getElementById("verDescricao").innerText = p.descricao || "Sem descrição disponível";
  document.getElementById("verLink").href = p.link || "#";
  document.getElementById("verImagem").src = p.imagem || "https://via.placeholder.com/400x250?text=Sem+Imagem";

  new bootstrap.Modal(document.getElementById("modalVerProjeto")).show();
}

// ---------------------- EDITAR PROJETO ----------------------
let editIndex = -1;

function editarProjeto(index) {
  const projetos = JSON.parse(localStorage.getItem("projetos") || "[]");
  const p = projetos[index];

  document.getElementById("devNome").value = p.nome;
  document.getElementById("devProjeto").value = p.projeto;
  document.getElementById("devDescricao").value = p.descricao;
  document.getElementById("devLink").value = p.link;
  document.getElementById("devImagem").value = "";

  editIndex = index;

  new bootstrap.Modal(document.getElementById("modalCadastro")).show();
}

// ---------------------- SALVAR PROJETO ----------------------
document.getElementById("formCadastro")?.addEventListener("submit", async e => {
  e.preventDefault();

  const nome = document.getElementById("devNome").value;
  const projeto = document.getElementById("devProjeto").value;
  const descricao = document.getElementById("devDescricao").value;
  const link = document.getElementById("devLink").value;
  const inputImg = document.getElementById("devImagem");

  let imagemBase64 = "";

  if (inputImg.files.length > 0) {
    imagemBase64 = await converterParaBase64(inputImg.files[0]);
  }

  let projetos = JSON.parse(localStorage.getItem("projetos") || "[]");

  if (editIndex >= 0) {
    projetos[editIndex] = {
      nome,
      projeto,
      descricao,
      link,
      imagem: imagemBase64 || projetos[editIndex].imagem
    };
  } else {
    projetos.push({ nome, projeto, descricao, link, imagem: imagemBase64 });
  }

  localStorage.setItem("projetos", JSON.stringify(projetos));
  editIndex = -1;

  carregarProjetos();
  bootstrap.Modal.getInstance(document.getElementById("modalCadastro")).hide();
  e.target.reset();
});

// Conversor de imagem para Base64
function converterParaBase64(arquivo) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject("Erro ao converter imagem.");

    reader.readAsDataURL(arquivo);
  });
}

// Botão "Explorar"
document.getElementById("btnExplorar")?.addEventListener("click", () => {
  document.getElementById("todosDevs").scrollIntoView({ behavior: "smooth" });
});

