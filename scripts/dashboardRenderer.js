/**
 * Renders the Financial Progress section dynamically.
 */
async function updateFinancialProgressSection(year, month) {
  // Fetch Financial Overview filtered by year and month from the backend
  const overview = await fetchFinancialOverview(year, month);

  if (!overview) {
    console.error('Failed to load financial overview');
    return;
  }

  const { total_income, total_expenses, savings } = overview;

  const maxTotal = Math.max(total_income, total_expenses);

  const percentageIncome =
    total_income > 0 ? (total_income / maxTotal) * 100 : 0;
  const percentageExpenses =
    total_expenses > 0 ? (total_expenses / maxTotal) * 100 : 0;
  const percentageSavings =
    savings > 0
      ? (savings / maxTotal) * 100
      : total_income > 0
        ? (savings / maxTotal) * 100
        : 0;

  const financialProgressSection = document.querySelector(
    '.financial-progress .progress-group'
  );
  // Clear the section to avoid duplicates
  financialProgressSection.innerHTML = '';

  const progressData = [
    {
      label: 'Renda',
      amount: `R$ ${formatCurrency(total_income)}`,
      total: `R$ ${formatCurrency(total_income)}`,
      percentage: percentageIncome,
      class: 'income',
    },
    {
      label: 'Despesa',
      amount: `R$ ${formatCurrency(total_expenses)}`,
      total: `R$ ${formatCurrency(total_income)}`,
      percentage: percentageExpenses,
      class: 'expenses',
    },
    {
      label: 'Economia',
      amount: `R$ ${formatCurrency(savings)}`,
      total: `R$ ${formatCurrency(total_income)}`,
      percentage: percentageSavings < 0 ? 0 : percentageSavings,
      class: 'savings',
    },
  ];

  // Add the elements to the DOM
  progressData.forEach((data) => {
    const progressItem = document.createElement('div');
    progressItem.classList.add('progress-item');

    progressItem.innerHTML = `
      <div class="progress-info">
        <span>${data.label}</span>
        <span>${data.amount} / ${data.total}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill ${data.class}" style="width: ${data.percentage}%"></div>
      </div>
    `;

    financialProgressSection.appendChild(progressItem);
  });
}

/**
 * Updates the progress bar for a specific financial category.
 */
function updateProgressBar(section, type, percentage, total) {
  const progressItem = section.querySelector(`.progress-fill.${type}`);
  if (progressItem) {
    progressItem.style.width = `${percentage}%`;
    progressItem
      .closest('.progress-item')
      .querySelector('.progress-info span:nth-child(2)').textContent =
      `R$ ${formatCurrency(total)}`;
  }
}

/**
 * Renders the Recent Transactions section dynamically, pulling data from the backend.
 */
async function updateRecentTransactionsSection(year, month) {
  const transactionList = document.querySelector(
    '.recent-transactions .transaction-list'
  );

  // Clear the current list of transactions
  transactionList.innerHTML = '';

  try {
    // Fetch items filtered by year and month from the backend
    const items = await fetchItemsByDate(year, month);

    // Separate paid items and income items
    const paidItems = items.filter((item) => item.type === 'Pago');
    const incomeItems = items.filter((item) => item.type === 'Rendimentos');

    // Render only the new items
    paidItems.forEach((item) => addTransaction(item, 'Pago'));
    incomeItems.forEach((item) => addTransaction(item, 'Adicionado'));
  } catch (error) {
    console.error('Error fetching transactions:', error);
  }
}

/**
 * Adds a transaction to the transaction list.
 */
function addTransaction({ label, amount, transaction_date }, type) {
  const transactionList = document.querySelector(
    '.recent-transactions .transaction-list'
  );

  const listItem = document.createElement('li');
  const formattedDate = new Date(transaction_date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  listItem.innerHTML = `
    <span class="transaction-date">${formattedDate}</span>
    <span class="transaction-detail">${type} R$ ${formatCurrency(amount)} de <strong>${label}</strong></span>
  `;

  transactionList.appendChild(listItem);
}

/**
 * Parses a currency string into a float value.
 * @param {string} currencyStr - The currency string to parse.
 * @returns {number} - The parsed float value.
 */
function parseCurrency(currencyStr) {
  return parseFloat(
    currencyStr.replace('R$', '').replace('.', '').replace(',', '.').trim()
  );
}

/**
 * Formats a float value into a currency string.
 * @param {number} value - The value to format.
 * @returns {string} - The formatted currency string.
 */
function formatCurrency(value) {
  return value.toFixed(2).replace('.', ',');
}

/**
 * Updates the entire dashboard based on the selected month and year.
 * This includes fetching and rendering financial progress, recent transactions, and filtering items.
 * @async
 */
async function updateDashboard() {
  // Get the selected month and year or use the current one as a fallback
  const selectedYearElement = document.getElementById('year-select');
  const selectedMonthElement = document.getElementById('month-select');

  if (!selectedYearElement || !selectedMonthElement) {
    console.error('The month or year selectors were not found in the DOM.');
    return;
  }

  const selectedYear = selectedYearElement.value;
  const selectedMonth = selectedMonthElement.value;

  // Filter and render the items without modifying the selector
  await updateFinancialProgressSection(selectedYear, selectedMonth);
  await updateRecentTransactionsSection(selectedYear, selectedMonth);
  await filterItemsByDate(selectedMonth, selectedYear);
}

/**
 * Debounces a function to prevent it from being called multiple times in quick succession.
 * This ensures that the function is only executed after the specified wait time has passed
 * since the last time it was called.
 *
 * @param {Function} func - The function to debounce.
 * @param {number} wait - The amount of time (in milliseconds) to wait before executing the function.
 * @returns {Function} - A debounced version of the original function.
 */
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Debounce applied to updateDashboard with a wait time of 300ms
const debouncedUpdateDashboard = debounce(updateDashboard, 300);
