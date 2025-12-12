async function fazerLogin() {

    const API = "https://techtribo-backend.onrender.com";

    const login = document.getElementById("login").value.trim();
    const senha = document.getElementById("senha").value.trim();
    const tipoEscolhido = document.getElementById("tipoLogin").value;
    const erro = document.getElementById("erro");

    if (!login || !senha) {
        erro.innerText = "Preencha todos os campos!";
        return;
    }

    try {
        const response = await fetch(`${API}/usuarios?login=${login}&senha=${senha}`);
        const dados = await response.json();

        if (dados.length === 0) {
            erro.innerText = "Login ou senha incorretos!";
            return;
        }

        let usuario = dados[0];

        if (!usuario.favoritos) {
            usuario.favoritos = [];
        }

        if (usuario.admin && tipoEscolhido !== "adm") {
            erro.innerText = "Este usuário só pode entrar como Administrador!";
            return;
        }

        if (!usuario.admin && tipoEscolhido !== "dev") {
            erro.innerText = "Este usuário não possui permissão de Administrador!";
            return;
        }

        usuario.tipo = tipoEscolhido;

        localStorage.setItem("usuarioLogado", JSON.stringify(usuario));

        window.location.href = "index.html";

    } catch (e) {
        console.error(e);
        erro.innerText = "Erro ao conectar ao servidor!";
    }
}
