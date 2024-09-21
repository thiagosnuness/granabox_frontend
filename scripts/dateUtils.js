/**
 * Filters items based on the selected month and year from the date selector.
 * @param {string} selectedMonth - The selected month to filter items by (optional).
 * @param {string} selectedYear - The selected year to filter items by (optional).
 */
async function filterItemsByDate(selectedMonth = null, selectedYear = null) {
  // Get the current month and year as fallback values
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
  const currentYear = new Date().getFullYear();

  // Check if the selectors are present and fallback to current month/year if not
  selectedMonth =
    selectedMonth ||
    document.getElementById('month-select')?.value ||
    currentMonth;
  selectedYear =
    selectedYear ||
    document.getElementById('year-select')?.value ||
    currentYear;

  try {
    // Fetch items filtered by year and month from the backend
    const filteredItems = await fetchItemsByDate(selectedYear, selectedMonth);

    const columns = document.querySelectorAll('.category-item');
    columns.forEach((column) => column.remove());

    filteredItems.forEach((item) => {
      renderNewItem(
        item.id,
        item.recurrence_id,
        item.recurrence,
        item.months,
        item.type,
        item.description,
        item.amount,
        item.due_date,
        item.due_status,
        item.transaction_date,
        item.label,
        item.label_id
      );
    });
  } catch (error) {
    console.error('Error fetching items by date:', error);
  }
}

/**
 * Adds a warning message to an item indicating if it is overdue, due today, or due in a certain number of days.
 * Fetches the due_status from the backend based on the item's due_date.
 * @param {HTMLElement} item - The item element where the warning message will be added or updated.
 */
async function addDueDateWarning(item) {
  const dueStatusElement = item.querySelector('.item-due-status');

  // Remove any previous warning classes
  dueStatusElement.classList.remove(
    'overdue',
    'due-soon',
    'payment-due',
    'paid-status'
  );

  // Check the status and apply the correct class
  const dueStatus = dueStatusElement.textContent.trim();

  let warningClass = '';
  if (dueStatus === 'VENCIDO') {
    warningClass = 'overdue';
  } else if (
    dueStatus === 'VENCE HOJE' ||
    dueStatus === 'VENCE AMANHÃ' ||
    dueStatus.startsWith('A VENCER EM')
  ) {
    warningClass = 'due-soon';
  } else if (dueStatus === 'PAGO') {
    warningClass = 'paid-status';
  } else {
    warningClass = 'payment-due';
  }

  // Apply the correct style class
  if (warningClass) {
    dueStatusElement.classList.add(warningClass);
  }
}
