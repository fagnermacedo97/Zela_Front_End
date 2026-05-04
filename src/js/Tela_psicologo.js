/* ==========================================
   ZELA - Dashboard
   script.js
   ========================================== */

/* ---- ESTADO GLOBAL ---- */
const timerSegundos   = {};
const timerIntervalos = {};

const solicitacoes = [
    { id: 1, nome: 'Maria Oliveira', foto: 'https://randomuser.me/api/portraits/women/1.jpg' },
    { id: 2, nome: 'Ana Costa',      foto: 'https://randomuser.me/api/portraits/women/2.jpg' },
    { id: 3, nome: 'Juliana Santos', foto: 'https://randomuser.me/api/portraits/women/3.jpg' },
    { id: 4, nome: 'Fernanda Lima',  foto: 'https://randomuser.me/api/portraits/women/4.jpg' },
];

/* ---- UTILITÁRIOS ---- */
function fmt(seg) {
    return String(Math.floor(seg / 60)).padStart(2, '0') + ':' +
           String(seg % 60).padStart(2, '0');
}

function sanitizar(str) {
    return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ---- NAVEGAÇÃO ---- */
function trocarTela(id, linkEl) {
    document.querySelectorAll('.tela-conteudo').forEach(t => t.style.display = 'none');

    const alvo = document.getElementById('secao-' + id);
    if (alvo) {
        alvo.style.display = 'block';
        if (id === 'solicitacoes') renderizarSolicitacoes();
        if (id === 'inicio') {
            gerarCalendario();
            atualizarContador();
        }
    }

    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    if (linkEl) linkEl.classList.add('active');

    // 👉 SALVA A TELA ATUAL
    localStorage.setItem('telaAtual', id);
}

function toggleSidebar() {
    document.body.classList.toggle('sidebar-hidden');
}

/* ---- TIMERS DE ESPERA ---- */
function iniciarTimerEspera(id) {
    if (timerSegundos[id] === undefined) timerSegundos[id] = 0;
    if (timerIntervalos[id]) return;

    timerIntervalos[id] = setInterval(() => {
        timerSegundos[id]++;
        const el = document.getElementById('timer-' + id);
        if (el) el.textContent = 'tempo de espera: ' + fmt(timerSegundos[id]);
    }, 1000);
}

/* ---- ATENDER ---- */
function atender(id) {
    const btn = document.querySelector(`#card-${id} .btn-atender-zela`);
    if (btn) {
        btn.innerText = '✓ Em atendimento';
        btn.style.background = '#4CAF50';
        btn.disabled = true;
    }
}

/* ---- ENVIAR MENSAGEM ---- */
window.enviarMensagem = function () {
    const input     = document.getElementById('msgInput');
    const container = document.querySelector('.chat-container');
    const footer    = document.querySelector('.chat-footer-meia-tela');

    if (!input || input.value.trim() === '') return;

    const novoBalao = `
        <div class="balao-wrapper psicologo-wrapper">
            <div class="avatar-chat">Dr</div>
            <div class="balao psicologo-msg">${sanitizar(input.value)}</div>
        </div>`;

    footer.insertAdjacentHTML('beforebegin', novoBalao);
    input.value = '';
    container.scrollTop = container.scrollHeight;
};

/* ---- SALVAR PRONTUÁRIO ---- */
window.enviarProntuario = function () {
    const campo = document.querySelector('.relatorio-box-prontuario textarea');
    const btn   = document.querySelector('.btn-salvar-final');

    if (!campo || !btn) return;

    if (campo.value.trim() === '') {
        campo.style.border = '2px solid red';
        setTimeout(() => campo.style.border = '2px solid var(--lilas)', 2000);
        return;
    }

    const original = btn.innerText;
    btn.innerText = '✓ Salvo';
    btn.style.background = '#4CAF50';
    btn.disabled = true;

    setTimeout(() => {
        btn.innerText = original;
        btn.style.background = '';
        btn.disabled = false;
        campo.value = '';
    }, 2000);
};

/* ---- CONTADOR ---- */
function atualizarContador() {
    const el = document.getElementById('contagem-espera');
    if (el) el.innerText = solicitacoes.length;
}

/* ---- RENDERIZAR SOLICITAÇÕES ---- */
function renderizarSolicitacoes() {
    const colEsq = document.getElementById('col-esquerda');
    const colDir = document.getElementById('col-direita');
    if (!colEsq || !colDir) return;

    colEsq.innerHTML = '';
    colDir.innerHTML = '';

    solicitacoes.forEach((p, i) => {
        const html = `
        <div class="card-user-zela" id="card-${p.id}">
            <div class="foto-frame">
                <img src="${p.foto}" alt="${sanitizar(p.nome)}"
                     onerror="this.style.display='none'">
            </div>
            <div class="card-content-zela">
                <div class="user-header-zela">
                    <span class="user-name-zela">${sanitizar(p.nome)}</span>
                    <span class="user-timer-zela" id="timer-${p.id}">tempo de espera: 00:00</span>
                </div>
                <button class="btn-atender-zela" onclick="atender(${p.id})">Atender</button>
            </div>
        </div>`;

        (i < 2 ? colEsq : colDir).innerHTML += html;
    });

    solicitacoes.forEach(p => iniciarTimerEspera(p.id));
}

/* ---- CALENDÁRIO ---- */
function gerarCalendario() {
    const wrapper = document.getElementById('calendar-wrapper');
    if (!wrapper) return;

    const d     = new Date();
    const mes   = d.getMonth();
    const ano   = d.getFullYear();
    const hoje  = d.getDate();
    const nomes = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
                   "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
    const ini   = new Date(ano, mes, 1).getDay();
    const total = new Date(ano, mes + 1, 0).getDate();

    let html = `<div class="calendar-container">
        <div class="calendar-header">${nomes[mes].toUpperCase()} ${ano}</div>
        <div class="calendar-grid">
            <div class="day-name">DOM</div><div class="day-name">SEG</div>
            <div class="day-name">TER</div><div class="day-name">QUA</div>
            <div class="day-name">QUI</div><div class="day-name">SEX</div>
            <div class="day-name">SÁB</div>`;

    for (let i = 0; i < ini; i++)    html += `<div class="day-number empty"></div>`;
    for (let d = 1; d <= total; d++) html += `<div class="day-number ${d === hoje ? 'today' : ''}">${d}</div>`;
    html += `</div></div>`;

    wrapper.innerHTML = html;
}

/* ---- INIT ---- */
window.onload = () => {
    const telaSalva = localStorage.getItem('telaAtual') || '';

    const link = document.querySelector(`.nav-link[onclick*="${telaSalva}"]`);

    trocarTela(telaSalva, link);
};