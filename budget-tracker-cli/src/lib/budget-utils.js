function formatCurrency(amount) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB'
  }).format(amount);
}

function parseDate(dateString) {
  return new Date(dateString);
}

module.exports = { formatCurrency, parseDate };
