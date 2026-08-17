// Redirect to login if token not present
if (window.location.pathname.endsWith('index.html') && !localStorage.getItem('token')) {
    window.location.href = 'login.html';
}
function abrirTab(index) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    document.querySelectorAll('.tab-content')[index].classList.add('active');
    document.querySelectorAll('.tab-btn')[index].classList.add('active');

    if (index === 0) {
        listarClientes();
    }
}

function formatarResposta(resultado) {
    if (resultado.erro) {
        return `<div style="color: #721c24; padding: 15px; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px; font-weight: bold;">
                            ⚠️ Erro: ${resultado.erro}
                        </div>`;
    }

    let html = `<div style="padding: 15px; background: #d4edda; color: #155724; border: 1px solid #c3e6cb; border-radius: 5px;">`;
    html += `<h3 style="margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid #c3e6cb; padding-bottom: 5px;">✅ Sucesso</h3>`;
    html += `<ul style="list-style-type: none; padding-left: 0; margin: 0;">`;

    for (const [key, value] of Object.entries(resultado)) {
        // Capitaliza a primeira letra e ajusta o nome (ex: imc -> IMC)
        let label = key.charAt(0).toUpperCase() + key.slice(1);
        if (key.toLowerCase() === 'imc') label = 'IMC';

        html += `<li style="margin-bottom: 8px; font-size: 16px;">
                            <strong style="color: #0b2e13;">${label}:</strong> ${value}
                         </li>`;
    }

    html += `</ul></div>`;
    return html;
}

async function calcularIMC() {
    const dados = {
        nome: document.getElementById("nome").value,
        idade: document.getElementById("idade").value,
        altura: document.getElementById("altura").value,
        peso: document.getElementById("peso").value
    };

    try {
        const res = await fetch("http://localhost:3000/imc", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });

        const resultado = await res.json();
        document.getElementById("resultadoIMC").innerHTML = formatarResposta(resultado);
    } catch (erro) {
        document.getElementById("resultadoIMC").innerHTML = formatarResposta({ erro: "Falha na comunicação com o servidor." });
    }
}

async function cadastrarCliente() {
    const dados = {
        nome: document.getElementById("anime_nome").value,
        genero: document.getElementById("anime_genero").value,
        temporadas: document.getElementById("anime_temporadas").value,
        classificacao: document.getElementById("anime_classificacao").value
    };

    try {
        const res = await fetch("http://localhost:3000/clientes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });

        const resultado = await res.json();
        document.getElementById("resultadoCliente").innerHTML = formatarResposta(resultado);
    } catch (erro) {
        document.getElementById("resultadoCliente").innerHTML = formatarResposta({ erro: "Falha na comunicação com o servidor." });
    }
}

async function login() {
    const dados = {
        user: document.getElementById("user").value,
        senha: document.getElementById("senha").value
    }

    try {
        const res = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });

        const resultado = await res.json();
        if (resultado.token) {
            localStorage.setItem("token", resultado.token);
            window.location.href = "index.html";
        } else {
            alert("Login inválido!");
        }
    } catch (erro) {
        alert("Falha na comunicação com o servidor.");
    }
}

async function cadastrarUsuario() {
    const dados = {
        nome: document.getElementById("nome").value,
        email: document.getElementById("email").value,
        senha: document.getElementById("senha").value
    }

    try {
        const res = await fetch("http://localhost:3000/usuarios", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });

        const resultado = await res.json();
        if (resultado.token) {
            localStorage.setItem("token", resultado.token);
            window.location.href = "index.html";
        } else {
            alert("Cadastro inválido!");
        }
    } catch (erro) {
        alert("Falha na comunicação com o servidor.");
    }
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

async function listarClientes() {
    // Limpar o input de busca
    const buscaInput = document.getElementById("busca_nome");
    if (buscaInput) buscaInput.value = "";

    try {
        const res = await fetch("http://localhost:3000/clientes");
        const clientes = await res.json();
        renderizarClientes(clientes);
    } catch (erro) {
        const container = document.getElementById("listaClientes");
        if (container) {
            container.innerHTML = `<div style="color: #721c24; padding: 15px; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px;">⚠️ Falha ao carregar clientes do servidor.</div>`;
        }
    }
}

async function buscarClientes() {
    const nomeBusca = document.getElementById("busca_nome").value.trim();
    if (!nomeBusca) {
        listarClientes();
        return;
    }

    try {
        const res = await fetch("http://localhost:3000/clientes");
        const clientes = await res.json();
        
        // Filtrar pelo CPF ignorando caracteres não numéricos
        const nomeLimpo = nomeBusca.replace(/\D/g, '');
        const filtrados = clientes.filter(c => c.cpf && c.cpf.replace(/\D/g, '') === nomeLimpo);
        renderizarClientes(filtrados);
    } catch (erro) {
        const container = document.getElementById("listaClientes");
        if (container) {
            container.innerHTML = `<div style="color: #721c24; padding: 15px; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px;">⚠️ Falha ao buscar cliente.</div>`;
        }
    }
}

function renderizarClientes(animes) {
    const container = document.getElementById("listaClientes");
    if (!container) return;

    if (!animes || animes.length === 0) {
        container.innerHTML = `<div class="no-clients">Nenhum cliente encontrado.</div>`;
        return;
    }

    let html = "";
    animes.forEach(animes => {
        html += `
            <div class="client-card">
                <h3>${animes.nome || 'Sem Nome'}</h3>
                <p><strong>CPF:</strong> ${animes.genero || '-'}</p>
                <p><strong>Idade:</strong> ${animes.temporadas || '-'} anos</p>
                <p><strong>Contato:</strong> ${animes.classificacao || '-'}</p>
            </div>
        `;
    });
    container.innerHTML = html;
}

// Carregar lista de clientes automaticamente ao abrir index.html
if (window.location.pathname.endsWith('index.html') && localStorage.getItem('token')) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', listarClientes);
    } else {
        listarClientes();
    }
}