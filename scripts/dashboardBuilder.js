/**
 * Creates a section of the dashboard with a title and optional button.
 * @param {string} className - The class name to be assigned to the section.
 * @param {string} title - The title of the section.
 * @param {boolean} hasButton - Determines whether the section should have a button.
 * @param {string} buttonIcon - The path to the button icon (if hasButton is true).
 * @param {string} buttonClass - The class name to be assigned to the button (if hasButton is true).
 * @returns {HTMLElement} - The created section element.
 */
function createSection(
  className,
  title,
  hasButton = false,
  buttonIcon = '',
  buttonClass = ''
) {
  const section = document.createElement('section');
  section.className = `section ${className}`;
  section.setAttribute('aria-label', title);

  const h2 = document.createElement('h2');
  h2.textContent = title;

  if (hasButton) {
    const button = document.createElement('button');
    button.className = buttonClass;
    const img = document.createElement('img');
    img.src = buttonIcon;
    img.width = 24;
    img.height = 24;
    button.appendChild(img);
    h2.appendChild(button);
  }

  section.appendChild(h2);

  if (className === 'recent-transactions') {
    const ul = document.createElement('ul');
    ul.className = 'transaction-list';
    section.appendChild(ul);
  } else {
    const div = document.createElement('div');
    div.className = 'progress-group';
    section.appendChild(div);
  }

  return section;
}

/**
 * Initializes the main container, header, and footer of the dashboard.
 */
function initializeLayout() {
  const container = document.createElement('div');
  container.className = 'container';

  // Create and append the header
  const header = document.createElement('header');
  const h1 = document.createElement('h1');
  h1.textContent = 'GranaBox';
  header.appendChild(h1);

  container.appendChild(header);

  // Create and append the dashboard structure
  const dashboard = document.createElement('div');
  dashboard.className = 'dashboard';
  container.appendChild(dashboard);

  // Create and append the footer
  const footer = document.createElement('footer');
  footer.textContent = '© 2024 GranaBox';
  container.appendChild(footer);

  // Append the entire container to the body
  document.body.appendChild(container);

  // Initialize the dashboard sections
  initializeDashboard();
}

/**
 * Creates a select element with specified options.
 * @param {string} id - The id of the select element.
 * @param {string} labelText - The label text for the select element.
 * @param {Array} options - The array of options for the select element.
 * @returns {string} - The HTML string for the select element.
 */
function createSelectElement(id, labelText, options) {
  const optionsHTML = options
    .map((option) => `<option value="${option.value}">${option.text}</option>`)
    .join('');

  return `
        <label for="${id}">${labelText}</label>
        <select id="${id}" name="${id}">
            ${optionsHTML}
        </select>
    `;
}

/**
 * Creates and populates a date selector element with month and year dropdowns.
 * The month dropdown defaults to the current month, and the year dropdown includes a range based on backend data.
 * This selector is appended to the header.
 */
async function createDateSelector() {
  // Array of month names
  const months = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  // Get the current year
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Get the available year range from the backend
  const { minYear, maxYear } = await fetchAvailableYears();

  // Retrieves the month and year saved in localStorage (or uses the current value as a fallback)
  const savedYear = sessionStorage.getItem('selectedYear') || currentYear;
  const savedMonth = sessionStorage.getItem('selectedMonth') || currentMonth;

  // Create the container for the date selector
  const dateSelector = document.createElement('div');
  dateSelector.classList.add('date-selector');

  // Create the label and select elements for the month
  const monthLabel = document.createElement('label');
  monthLabel.setAttribute('for', 'month-select');
  monthLabel.textContent = 'Mês:';

  const monthSelect = document.createElement('select');
  monthSelect.id = 'month-select';
  monthSelect.name = 'month-select';

  // Populate the month select with options
  months.forEach((month, index) => {
    const option = document.createElement('option');
    option.value = String(index + 1).padStart(2, '0');
    option.textContent = month;
    if (index + 1 === parseInt(savedMonth)) {
      option.selected = true; // Select the month saved in localStorage
    }
    monthSelect.appendChild(option);
  });

  // Create the label and select elements for the year
  const yearLabel = document.createElement('label');
  yearLabel.setAttribute('for', 'year-select');
  yearLabel.textContent = 'Ano:';

  const yearSelect = document.createElement('select');
  yearSelect.id = 'year-select';
  yearSelect.name = 'year-select';

  // Populate the year select with options for the current year and the next two years
  for (let year = minYear; year <= maxYear + 2; year++) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    if (year === parseInt(savedYear)) {
      option.selected = true; // Select the year saved in localStorage
    }
    yearSelect.appendChild(option);
  }

  // Append the created elements to the date selector container
  dateSelector.appendChild(monthLabel);
  dateSelector.appendChild(monthSelect);
  dateSelector.appendChild(yearLabel);
  dateSelector.appendChild(yearSelect);

  // Append the date selector to the header
  const header = document.querySelector('header');
  header.appendChild(dateSelector);

  // Event listeners to save month and year selection to localStorage
  monthSelect.addEventListener('change', function () {
    sessionStorage.setItem('selectedMonth', this.value);
    debouncedUpdateDashboard();
  });

  yearSelect.addEventListener('change', function () {
    sessionStorage.setItem('selectedYear', this.value);
    debouncedUpdateDashboard();
  });
}

/**
 * Default labels to be created in the backend
 */
async function initializeDefaultLabels() {
  const defaultLabels = [
    { value: 'Habitação', text: 'Habitação' },
    { value: 'Saúde', text: 'Saúde' },
    { value: 'Transporte', text: 'Transporte' },
    { value: 'Carro', text: 'Carro' },
    { value: 'Despesas Pessoais', text: 'Despesas Pessoais' },
    { value: 'Lazer', text: 'Lazer' },
    { value: 'Cartões de Crédito', text: 'Cartões de Crédito' },
    { value: 'Dependentes', text: 'Dependentes' },
    { value: 'Salário', text: 'Salário' },
    { value: 'Investimento', text: 'Investimento' },
    { value: 'Honorário', text: 'Honorário' },
  ];

  // Fetch existing labels from backend
  const existingLabels = await fetchLabels();

  // Check for missing labels and create them if they don't exist
  for (const label of defaultLabels) {
    if (
      !existingLabels.some(
        (existingLabel) => existingLabel.name === label.value
      )
    ) {
      await createLabel(label.value, true);
    }
  }
}

/**
 * Initializes the dashboard by creating and appending the necessary sections.
 */
async function initializeDashboard() {
  const dashboard = document.querySelector('.dashboard');

  const sections = [
    {
      className: 'section-expenses-to-pay',
      title: 'A Pagar',
      hasButton: true,
      buttonIcon: 'assets/icons/add_icon.svg',
      buttonClass: 'add-item-btn',
    },
    {
      className: 'section-paid-expenses',
      title: 'Pago',
      hasButton: true,
      buttonIcon: 'assets/icons/add_icon.svg',
      buttonClass: 'add-item-btn',
    },
    {
      className: 'section-income',
      title: 'Rendimentos',
      hasButton: true,
      buttonIcon: 'assets/icons/add_icon.svg',
      buttonClass: 'add-item-btn',
    },
    {
      className: 'financial-progress',
      title: 'Visão Geral',
      hasButton: true,
      buttonIcon: 'assets/icons/chart_icon.svg',
      buttonClass: 'chart-item-btn',
    },
    { className: 'recent-transactions', title: 'Transações', hasButton: false },
  ];

  sections.forEach((section) => {
    const sectionElement = createSection(
      section.className,
      section.title,
      section.hasButton,
      section.buttonIcon,
      section.buttonClass
    );
    dashboard.appendChild(sectionElement);
  });

  // Call the function to create the date selector when the page loads
  createDateSelector();

  // Ensure default labels exist
  await initializeDefaultLabels();

  // Fetch items from backend and render them
  const items = await fetchItems();
  items.forEach((item) => {
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
}

/**
 * Initializes the dashboard by creating and appending the necessary sections.
 * Also ensures default labels exist and fetches items from the backend to populate the dashboard.
 */
initializeLayout();
