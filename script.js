const initialStock = {
  "Alface": 100,
  "Tomate": 150,
  "Cenoura": 120,
  "Batata": 200,
  "Couve": 80
};

let stock = JSON.parse(localStorage.getItem("vegetableStock")) || { ...initialStock };
let records = JSON.parse(localStorage.getItem("discardRecords")) || [];

const form = document.getElementById("discardForm");
const vegetable = document.getElementById("vegetable");
const quantity = document.getElementById("quantity");
const reason = document.getElementById("reason");
const stockInfo = document.getElementById("stockInfo");
const message = document.getElementById("message");

function save() {
  localStorage.setItem("vegetableStock", JSON.stringify(stock));
  localStorage.setItem("discardRecords", JSON.stringify(records));
}

function showMessage(text, type) {
  message.textContent = text;
  message.className = `message ${type}`;
  setTimeout(() => message.className = "message hidden", 3500);
}

function updateStockInfo() {
  const name = vegetable.value;

  if (!name) {
    stockInfo.textContent = "Selecione uma hortaliça para consultar o estoque.";
    return;
  }

  stockInfo.textContent = `Estoque disponível de ${name}: ${stock[name].toFixed(2)} kg`;
}

function render() {
  const totalStock = Object.values(stock).reduce((a, b) => a + b, 0);
  const totalDiscarded = records.reduce((sum, item) => sum + item.quantity, 0);

  document.getElementById("totalStock").textContent = `${totalStock.toFixed(2)} kg`;
  document.getElementById("totalDiscarded").textContent = `${totalDiscarded.toFixed(2)} kg`;
  document.getElementById("totalRecords").textContent = records.length;

  const maxStock = Math.max(...Object.values(initialStock));

  document.getElementById("stockList").innerHTML = Object.entries(stock).map(([name, value]) => {
    const percent = Math.max(0, Math.min(100, (value / initialStock[name]) * 100));
    return `
      <div class="stock-row">
        <div class="stock-top">
          <strong>${name}</strong>
          <span>${value.toFixed(2)} kg</span>
        </div>
        <div class="bar">
          <div class="fill" style="width:${percent}%"></div>
        </div>
      </div>
    `;
  }).join("");

  const history = document.getElementById("history");

  if (!records.length) {
    history.innerHTML = '<div class="empty">Nenhum descarte registrado.</div>';
    return;
  }

  history.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Data</th>
          <th>Hortaliça</th>
          <th>Quantidade</th>
          <th>Motivo</th>
        </tr>
      </thead>
      <tbody>
        ${records.slice().reverse().map(item => `
          <tr>
            <td>${item.date}</td>
            <td>${item.vegetable}</td>
            <td>${item.quantity.toFixed(2)} kg</td>
            <td>${item.reason}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const name = vegetable.value;
  const amount = Number(quantity.value);
  const selectedReason = reason.value;

  if (!name || !selectedReason || amount <= 0) {
    showMessage("Preencha todos os campos corretamente.", "error");
    return;
  }

  if (amount > stock[name]) {
    showMessage(`Não é possível descartar ${amount} kg. O estoque possui apenas ${stock[name].toFixed(2)} kg.`, "error");
    return;
  }

  stock[name] -= amount;

  records.push({
    vegetable: name,
    quantity: amount,
    reason: selectedReason,
    date: new Date().toLocaleString("pt-BR")
  });

  save();
  form.reset();
  updateStockInfo();
  render();

  showMessage(`Descarte de ${amount.toFixed(2)} kg de ${name} registrado com sucesso.`, "success");
});

vegetable.addEventListener("change", updateStockInfo);

document.getElementById("resetBtn").addEventListener("click", () => {
  if (!confirm("Deseja restaurar o estoque inicial e apagar o histórico?")) return;

  stock = { ...initialStock };
  records = [];
  save();
  render();
  updateStockInfo();
  showMessage("Estoque e histórico restaurados.", "success");
});

render();
updateStockInfo();
