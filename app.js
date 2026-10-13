/* BankFlow France — simulation front-end uniquement. Les données restent dans ce navigateur. */
(() => {
  "use strict";
  const ALLOWED_EMAIL = "janujacqvirement@gmail.com";
  const ALLOWED_PASSWORD = "COESY@1basse-terre";
  const INITIAL_BALANCE = 387721.62;
  const KEYS = { session: "bankflow_demo_session", balance: "bankflow_demo_balance", history: "bankflow_demo_history" };
  const $ = (selector) => document.querySelector(selector);
  const page = document.body.dataset.page || "login";
  let toastTimer;
  let amountsVisible = false;

  function getBalance() { const stored = localStorage.getItem(KEYS.balance); if (stored === null || !Number.isFinite(Number(stored))) { localStorage.setItem(KEYS.balance, String(INITIAL_BALANCE)); return INITIAL_BALANCE; } return Number(stored); }
  function setBalance(value) { localStorage.setItem(KEYS.balance, value.toFixed(2)); }
  function getHistory() { try { const data = JSON.parse(localStorage.getItem(KEYS.history) || "[]"); return Array.isArray(data) ? data : []; } catch { return []; } }
  function setHistory(history) { localStorage.setItem(KEYS.history, JSON.stringify(history)); }
  function euro(value) { return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(value); }
  function dateTime(iso) { return new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "medium" }).format(new Date(iso)); }
  function mask(value) { return "••••••••" + (String(value).includes("€") ? " €" : ""); }
  function showToast(message, type = "success") { const toast = $("#toast"); if (!toast) return; clearTimeout(toastTimer); toast.textContent = message; toast.className = `toast show ${type === "error" ? "error-toast" : "success"}`; toastTimer = setTimeout(() => toast.classList.remove("show"), 3200); }
  function isLoggedIn() { return localStorage.getItem(KEYS.session) === ALLOWED_EMAIL; }
  function protectPage() { if (page !== "login" && !isLoggedIn()) window.location.replace("index.html"); if (page === "login" && isLoggedIn()) window.location.replace("dashboard.html"); }
  function setupHeader() { const email = $("#userEmail"); if (email) email.textContent = localStorage.getItem(KEYS.session) || ""; const logout = $("#logoutBtn"); if (logout) logout.addEventListener("click", () => { localStorage.removeItem(KEYS.session); window.location.replace("index.html"); }); }

  function applyVisibility() {
    document.querySelectorAll("[data-sensitive]").forEach((element) => {
      const value = element.dataset.value || "";
      element.textContent = amountsVisible ? value : mask(value);
    });
    document.querySelectorAll("[data-visibility-toggle]").forEach((button) => {
      button.setAttribute("aria-pressed", String(amountsVisible));
      button.setAttribute("aria-label", amountsVisible ? "Masquer les montants" : "Afficher les montants");
      if (button.classList.contains("panel-visibility")) button.textContent = amountsVisible ? "◉ Masquer les montants" : "◉ Afficher les montants";
      else button.textContent = amountsVisible ? "◉" : "◌";
    });
  }
  function setupVisibility() { document.querySelectorAll("[data-visibility-toggle]").forEach((button) => button.addEventListener("click", () => { amountsVisible = !amountsVisible; applyVisibility(); })); }
  function addSensitiveCell(parent, value, className = "") { const cell = document.createElement("td"); cell.className = `${className} sensitive`; cell.dataset.sensitive = "true"; cell.dataset.value = value; parent.append(cell); return cell; }

  function renderDashboard() {
    const balance = getBalance(); const history = getHistory();
    const balanceEl = $("#balance"); if (balanceEl) { balanceEl.dataset.value = `${euro(balance)}`; balanceEl.innerHTML = ""; balanceEl.dataset.sensitive = "true"; }
    if ($("#transferCount")) $("#transferCount").textContent = String(history.length);
    if ($("#historyCount")) $("#historyCount").textContent = `${history.length} opération${history.length > 1 ? "s" : ""}`;
    applyVisibility();
  }

  function renderTransfer() {
    const balance = getBalance(); const available = $("#availableSmall");
    if (available) { available.dataset.value = euro(balance); available.dataset.sensitive = "true"; }
    const amount = $("#amount"); if (amount) amount.max = balance.toFixed(2);
    applyVisibility();
  }

  function renderHistory() {
    const history = getHistory();
    if ($("#historyCount")) $("#historyCount").textContent = `${history.length} opération${history.length > 1 ? "s" : ""}`;
    if ($("#emptyState")) $("#emptyState").classList.toggle("hidden", history.length > 0);
    if ($("#historyTableWrap")) $("#historyTableWrap").classList.toggle("hidden", history.length === 0);
    if ($("#clearHistoryBtn")) $("#clearHistoryBtn").classList.toggle("hidden", history.length === 0);
    const rows = $("#historyRows"); if (!rows) return; rows.replaceChildren();
    history.slice().reverse().forEach((tx) => { const tr = document.createElement("tr"); const beneficiary = document.createElement("td"); const name = document.createElement("strong"); name.textContent = tx.beneficiary; const iban = document.createElement("small"); iban.textContent = tx.iban; beneficiary.append(name, iban); tr.append(beneficiary); const date = document.createElement("td"); date.textContent = dateTime(tx.date); tr.append(date); addSensitiveCell(tr, `− ${euro(tx.amount)}`, "debit"); addSensitiveCell(tr, euro(tx.balanceAfter)); rows.append(tr); });
    applyVisibility();
  }

  function setupLogin() {
    const form = $("#loginForm"); if (!form) return;
    form.addEventListener("submit", (event) => { event.preventDefault(); const email = $("#email").value.trim().toLowerCase(); const password = $("#password").value; const error = $("#loginError"); error.textContent = ""; if (email !== ALLOWED_EMAIL) { error.textContent = "Adresse non autorisée."; showToast("Connexion refusée : adresse e-mail non autorisée.", "error"); return; } if (password !== ALLOWED_PASSWORD) { error.textContent = "Mot de passe incorrect."; showToast("Connexion refusée : mot de passe incorrect.", "error"); return; } localStorage.setItem(KEYS.session, ALLOWED_EMAIL); window.location.replace("dashboard.html"); });
  }

  function setupTransfer() {
    const form = $("#transferForm"); if (!form) return;
    form.addEventListener("submit", (event) => { event.preventDefault(); const error = $("#transferError"); error.textContent = ""; const beneficiary = $("#beneficiary").value.trim(); const iban = $("#iban").value.trim().replace(/\s+/g, "").toUpperCase(); const amount = Number($("#amount").value); const balance = getBalance(); if (!beneficiary || !iban || !Number.isFinite(amount) || amount <= 0) { error.textContent = "Veuillez saisir un bénéficiaire, un RIB/IBAN et un montant valide."; return; } if (iban.length < 14 || iban.length > 34) { error.textContent = "Vérifiez la longueur du RIB/IBAN (14 à 34 caractères)."; return; } if (amount > balance) { error.textContent = "Solde insuffisant pour ce virement."; showToast("Solde insuffisant.", "error"); return; } const newBalance = Math.round((balance - amount + Number.EPSILON) * 100) / 100; const history = getHistory(); history.push({ id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`, date: new Date().toISOString(), beneficiary, iban, amount: Math.round(amount * 100) / 100, balanceAfter: newBalance }); setBalance(newBalance); setHistory(history); form.reset(); renderTransfer(); showToast(`Virement de ${euro(amount)} effectué avec succès.`); });
  }

  function setupHistory() { const button = $("#clearHistoryBtn"); if (button) button.addEventListener("click", () => { if (!confirm("Effacer l’historique des virements ? Le solde actuel ne sera pas modifié.")) return; setHistory([]); renderHistory(); showToast("Historique effacé."); }); }

  protectPage();
  if (page === "login") setupLogin();
  else { setupHeader(); setupVisibility(); if (page === "dashboard") renderDashboard(); if (page === "transfer") { renderTransfer(); setupTransfer(); } if (page === "history") { renderHistory(); setupHistory(); } }
})();
