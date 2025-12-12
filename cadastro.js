(function () {

  window.cadastrar = async function cadastrar() {
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const login = document.getElementById("login").value.trim();
    const senha = document.getElementById("senha").value.trim();
    const erro = document.getElementById("erro");

    erro.innerText = "";

    if (!nome || !email || !login || !senha) {
      erro.innerText = "Preencha todos os campos!";
      return;
    }

    try {

      const API = "https://projetos-puc.onrender.com";

      // verifica se login já existe
      const buscaLogin = await fetch(`${API}/usuarios?login=${login}`);
      const resultadoLogin = await buscaLogin.json();
      if (resultadoLogin.length > 0) {
        erro.innerText = "Login já em uso!";
        return;
      }

      // verifica se e-mail já existe
      const buscaEmail = await fetch(`${API}/usuarios?email=${email}`);
      const resultadoEmail = await buscaEmail.json();
      if (resultadoEmail.length > 0) {
        erro.innerText = "Email já cadastrado!";
        return;
      }

      const novoUsuario = {
        id: cryptoRandomId(),
        login,
        senha,
        nome,
        email,
        admin: false,  
        favoritos: []   
      };

      await fetch(`${API}/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novoUsuario)
      });

      erro.style.color = "#00ff99";
      erro.innerText = "Conta criada com sucesso! Redirecionando...";

      setTimeout(() => {
        window.location.href = "login.html";
      }, 1500);

    } catch (e) {
      console.error(e);
      erro.innerText = "Erro ao conectar ao servidor!";
    }
  };


  function cryptoRandomId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "id-" + Math.random().toString(36).slice(2, 12);
  }

})();
