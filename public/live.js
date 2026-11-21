const events = new EventSource('/live');

const status = document.querySelector('.status');
const statusText = document.getElementById('connection-status');
const livePrice = document.getElementById('live-price');
const investForm = document.getElementById('invest-form')

events.addEventListener('open', () => {
  status.dataset.state = 'connected';
  statusText.textContent = 'connected';
});

events.addEventListener('error', () => {
  status.dataset.state = 'reconnecting';
  statusText.textContent = 'reconnecting';
});

events.onmessage = (event) => {
  livePrice.value = event.data;
};

const amountInput = document.getElementById('investment-amount');

const parseAmount = (value) => Number(value.replace(/,/g, '').trim());

investForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const amount = parseAmount(amountInput.value);
  const price = Number(livePrice.value);

  if (!Number.isFinite(amount) || amount <= 0) {
    window.alert('Enter a valid amount to invest.');
    amountInput.focus();
    return;
  }

  if (!Number.isFinite(price) || price <= 0) {
    window.alert('Waiting for a live price. Try again in a moment.');
    return;
  }

  const purchased = amount / price;
  const ounces = new Intl.NumberFormat('en-US', { maximumFractionDigits: 6 }).format(purchased);
  const formattedPrice = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(price);
  const timestamp = new Date(Date.now()).toISOString();
  window.alert(`${timestamp}: purchased ${ounces} oz. of gold at $${formattedPrice} per oz.`);
  const purchase = {
    timestamp: timestamp,
    ounces: ounces,
    price: formattedPrice
  }
  await fetch('/log', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(purchase)
  })
})
