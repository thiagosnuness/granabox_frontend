/**
 * Opens a custom modal for item input based on the specified column.
 * This function dynamically adds the modal structure to the DOM and prepares the form for input.
 * @param {HTMLElement} column - The column where the new item will be added.
 * @param {HTMLElement} [itemToEdit=null] - The item to edit, if any.
 */
function createModal(column, itemToEdit = null) {
  const modal = createModalElement(itemToEdit);
  document.body.appendChild(modal);

  if (!itemToEdit) {
    setTypeSelection(column);
  }

  const itemTypeSelect = document.getElementById('item-type');
  const dueDateLabelElement = document.querySelector(
    'label[for="item-due-date"]'
  );
  if (itemTypeSelect.value === 'income') {
    dueDateLabelElement.textContent = 'Data:';
  } else {
    dueDateLabelElement.textContent = 'Vencimento:';
  }
  // Fetch and populate category options
  getCategoryOptions().then((options) => {
    const categorySelectContainer = document.getElementById(
      'category-select-container'
    );
    categorySelectContainer.innerHTML = createSelectElement(
      'item-label',
      'Categoria:',
      options
    );

    handleCategorySelection();

    if (itemToEdit) {
      populateModalForEdit(itemToEdit);
    }
  });
  handleFormSubmission(itemToEdit);
  handleModalClose();
}

/**
 * Creates the modal element with the required HTML structure.
 * @param {HTMLElement} [itemToEdit=null] - The item to edit, if any.
 * @returns {HTMLElement} - The constructed modal element.
 */
function createModalElement(itemToEdit = null) {
  const modal = document.createElement('div');
  modal.classList.add('modal-overlay');

  let dueDateLabel = 'Vencimento:';
  if (
    itemToEdit &&
    itemToEdit.querySelector('.item-label').classList.contains('income')
  ) {
    dueDateLabel = 'Data:';
  }

  modal.innerHTML = `
        <div class="modal-content">
            <header class="modal-header">
              <h2>${itemToEdit ? 'Editar Item' : 'Adicionar Item'}</h2>
              <div id="error-message"></div>
            </header>    
            <form id="item-form">
                ${createSelectElement('item-type', 'Tipo:', [
                  { value: 'expenses-to-pay', text: 'A pagar' },
                  { value: 'paid-expenses', text: 'Pago' },
                  { value: 'income', text: 'Rendimentos' },
                ])}
                <div id="category-select-container"></div>
                <div id="category-container" style="display: none;">
                  <label for="category">Nova Categoria:</label>
                  <input type="text" id="category" name="category" maxlength="28">
                </div>
                ${createInputElement('item-description', 'Descrição:', 'text', 84)}
                ${createInputElement('item-amount', 'Valor:', 'text', '', '0,00')}
                ${createInputElement('item-due-date', dueDateLabel, 'date')}
                ${createSelectElement('item-recurrence', 'Recorrência:', [
                  { value: 'Única', text: 'Única' },
                  { value: 'Mensal', text: 'Mensal' },
                ])}
                <button type="button" id="submit-item-btn">Salvar</button>
                <button type="button" id="cancel-item-btn">Cancelar</button>
            </form>
        </div>
    `;

  return modal;
}

/**
 * Creates an input element.
 * @param {string} id - The id of the input element.
 * @param {string} labelText - The label text for the input element.
 * @param {string} type - The type of the input element (e.g., text, date).
 * @param {number} maxlength - The maximum length of the input value.
 * @param {string} placeholder - The placeholder text for the input element.
 * @returns {string} - The HTML string for the input element.
 */
function createInputElement(
  id,
  labelText,
  type,
  maxlength = '',
  placeholder = ''
) {
  return `
        <label for="${id}">${labelText}</label>
        <input type="${type}" id="${id}" name="${id}" maxlength="${maxlength}" placeholder="${placeholder}">
    `;
}

/**
 * Gets the category options for the label select element.
 * @returns {Array} - The array of category options.
 */
async function getCategoryOptions() {
  try {
    // Fetch labels from backend
    const labels = await fetchLabels();

    const categoriesFromBackend = labels.map((label) => ({
      value: label.name,
      text: label.name,
    }));

    const staticCategories = [
      { value: 'Adicionar Opção', text: 'Adicionar Opção' },
    ];

    return [...categoriesFromBackend, ...staticCategories];
  } catch (error) {
    console.error('Error loading categories:', error);
    return [];
  }
}

/**
 * Sets the item type selection based on the specified column.
 * @param {HTMLElement} column - The column where the new item will be added.
 */
function setTypeSelection(column) {
  const typeSelect = document.getElementById('item-type');

  const options = [
    { value: 'expenses-to-pay', text: 'A pagar' },
    { value: 'paid-expenses', text: 'Pago' },
    { value: 'income', text: 'Rendimentos' },
  ];

  options.forEach((optionData) => {
    let optionExists = Array.from(typeSelect.options).some(
      (option) => option.value === optionData.value
    );

    if (!optionExists) {
      const newOption = document.createElement('option');
      newOption.value = optionData.value;
      newOption.textContent = optionData.text;
      typeSelect.appendChild(newOption);
    }
  });

  if (column.classList.contains('section-expenses-to-pay')) {
    typeSelect.value = 'expenses-to-pay';
  } else if (column.classList.contains('section-paid-expenses')) {
    typeSelect.value = 'paid-expenses';
  } else if (column.classList.contains('section-income')) {
    typeSelect.value = 'income';
  }
}

/**
 * Handles the category selection, including the display of the new category input.
 */
function handleCategorySelection() {
  const labelSelect = document.getElementById('item-label');
  const newCategoryContainer = document.getElementById('category-container');
  labelSelect.addEventListener('change', function () {
    if (this.value === 'Adicionar Opção') {
      newCategoryContainer.style.display = 'block';
    } else {
      newCategoryContainer.style.display = 'none';
    }
  });
}

/**
 * Validates the category input to ensure it contains only letters and spaces.
 * @param {string} input - The input to be validated.
 * @returns {boolean} - True if the input is valid, otherwise false.
 */
function validateCategoryInput(input) {
  const categoryRegex = /^[A-Za-zÀ-ÿ\s]+$/;
  return categoryRegex.test(input) && input.trim().length > 0;
}

/**
 * Populates the modal with data from the item to be edited.
 * @param {HTMLElement} itemToEdit - The item to edit.
 */
function populateModalForEdit(itemToEdit) {
  // Detect the current column where the item is located and set the correct type
  const currentColumn = itemToEdit.closest('section');

  setTypeSelection(currentColumn);

  const label = itemToEdit.querySelector('.item-label').textContent;
  let labelSelect = document.getElementById('item-label');

  // Check if the labelSelect exists in the DOM
  if (!labelSelect) {
    console.error('Select item-label not found in DOM.');
    return;
  }

  // Check if the label exists in the select options, if not, add it
  let optionExists = Array.from(labelSelect.options).some(
    (option) => option.value === label
  );

  if (!optionExists) {
    let newOption = document.createElement('option');
    newOption.value = label;
    newOption.textContent = label;
    labelSelect.appendChild(newOption);
  }

  labelSelect.value = label;

  // Set the item description
  document.getElementById('item-description').value =
    itemToEdit.querySelector('.item-description').textContent;

  // Set the item amount, removing the currency symbol
  document.getElementById('item-amount').value = itemToEdit
    .querySelector('.item-amount')
    .textContent.replace('R$ ', '');

  // Set the due date in the correct format (YYYY-MM-DD)
  const dueDate = itemToEdit
    .querySelector('.item-due-date')
    .textContent.split('/');
  document.getElementById('item-due-date').value =
    `${dueDate[2]}-${dueDate[1]}-${dueDate[0]}`;

  // Set the recurrence option
  const recurrence = itemToEdit.getAttribute('item-recurrence');
  document.getElementById('item-recurrence').value = recurrence || 'Única';
}

/**
 * Handles the form submission, including validation, and manages item creation or editing.
 * Supports both regular and recurring items.
 * @param {HTMLElement} [itemToEdit=null] - The item to edit, if any.
 */
function handleFormSubmission(itemToEdit = null) {
  document
    .getElementById('submit-item-btn')
    .addEventListener('click', async function (event) {
      event.preventDefault();
      const errorMessage = document.getElementById('error-message');
      errorMessage.style.display = 'none';

      let selectedLabel = document.getElementById('item-label').value;
      const description = document.getElementById('item-description').value;
      const date = document.getElementById('item-due-date').value;
      let amount = document.getElementById('item-amount').value;
      const newRecurrence = document.getElementById('item-recurrence').value;
      let type = document.getElementById('item-type').value;

      // Convert amount to float
      amount = parseFloat(amount.replace(',', '.'));

      if (isNaN(amount)) {
        displayErrorMessage(errorMessage, 'Invalid amount format.');
        return;
      }

      if (selectedLabel === 'Adicionar Opção') {
        selectedLabel = document.getElementById('category').value;
        if (!validateCategoryInput(selectedLabel)) {
          displayErrorMessage(errorMessage, 'Nome inválido para Categoria.');
          return;
        }

        //Check if the label already exists in the backend
        const labels = await fetchLabels();
        if (!labels.some((label) => label.name === selectedLabel)) {
          const newLabel = await createLabel(selectedLabel);
          if (!newLabel) {
            displayErrorMessage(
              errorMessage,
              'Erro ao criar a nova categoria.'
            );
            return;
          }
        }
      }

      let typeStatus = '';
      if (type === 'paid-expenses') {
        typeStatus = 'Pago';
      } else if (type === 'expenses-to-pay') {
        typeStatus = 'A Pagar';
      } else if (type === 'income') {
        typeStatus = 'Rendimentos';
      }

      if (!selectedLabel || !description || !date || !amount) {
        displayErrorMessage(errorMessage, 'Todos os campos são requeridos.');
        return;
      }

      // Fetch the labels from the backend to find the correct label_id
      const labels = await fetchLabels();
      const matchedLabel = labels.find((label) => label.name === selectedLabel);

      if (!matchedLabel) {
        displayErrorMessage(errorMessage, 'Label não encontrado.');
        return;
      }

      const itemData = {
        label_id: matchedLabel.id,
        description: description,
        due_date: date,
        amount: amount,
        recurrence: newRecurrence,
        type: typeStatus,
      };

      if (itemToEdit) {
        // Handle editing an item
        const itemId = itemToEdit.getAttribute('item-id');
        const oldRecurrence = itemToEdit.getAttribute('item-recurrence');

        // If the recurrence is changing from "Mensal" to "Única", remove the existing recurring items
        if (oldRecurrence === 'Mensal' && newRecurrence === 'Única') {
          await deleteRecurringItem(itemId);
        }

        // Check if the user is changing from "Única" to "Mensal"
        if (oldRecurrence === 'Única' && newRecurrence === 'Mensal') {
          // First, delete the original item to prevent duplication
          await deleteItem(itemId);

          // Create recurring items for the selected item
          await createRecurringItem({
            ...itemData,
            id: itemId,
            months: 12,
          });
        } else if (oldRecurrence === 'Mensal' && newRecurrence === 'Mensal') {
          // If the item is recurring, update the recurring item
          await updateRecurringItem(itemId, itemData);
        }

        // Update the item with the new data
        await updateItem(itemId, itemData);
      } else {
        // Handle creating a new item (standard or recurring)
        if (newRecurrence === 'Mensal') {
          await createRecurringItem(itemData);
        } else {
          await createItem(itemData);
        }
      }

      // Close the modal and update the dashboard
      document.body.removeChild(document.querySelector('.modal-overlay'));
      debouncedUpdateDashboard();
    });
}

/**
 * Displays an error message in the modal.
 * @param {HTMLElement} errorMessage - The error message element.
 * @param {string} message - The message to display.
 */
function displayErrorMessage(errorMessage, message) {
  errorMessage.innerText = message;
  errorMessage.style.display = 'block';
  setTimeout(() => {
    errorMessage.style.display = 'none';
  }, 2000);
}

/**
 * Creates a new item element with the specified properties.
 * @param {string} label - The label for the new item.
 * @param {string} description - The description for the new item.
 * @param {string} date - The due date for the new item.
 * @param {string} amount - The amount for the new item.
 * @returns {HTMLElement} - The constructed new item element.
 */
function renderNewItem(
  id,
  recurrence_id,
  recurrence,
  months,
  type,
  description,
  amount,
  due_date,
  due_status,
  transaction_date,
  label,
  label_id
) {
  const newItem = document.createElement('div');
  newItem.classList.add('category-item');
  newItem.setAttribute('draggable', 'true');
  newItem.setAttribute('item-id', id);
  newItem.setAttribute('item-type', type);
  newItem.setAttribute('item-recurrence-id', recurrence_id);
  newItem.setAttribute('item-recurrence', recurrence);
  newItem.setAttribute('item-months', months || 0);
  newItem.setAttribute('item-transaction-date', transaction_date);
  newItem.setAttribute('item-due-status', due_status);
  newItem.setAttribute('label-id', label_id);

  const labelClass = getLabelClass(type);

  const formattedDate = new Date(due_date);
  formattedDate.setMinutes(
    formattedDate.getMinutes() + formattedDate.getTimezoneOffset()
  );

  newItem.setAttribute(
    'item-transaction-date',
    new Date(transaction_date).toLocaleDateString('pt-BR')
  );

  newItem.innerHTML = `
        <span class="item-label ${labelClass}">${label}</span>
        <span class="item-description">${description}</span>
        <span class="item-due-date">${new Date(formattedDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
        <span class="item-due-status">${due_status}</span>
        <span class="item-amount">R$ ${formatCurrency(amount)}</span>
        <button class="remove-item-btn"><img src="assets/icons/remove_icon.svg" width="16" height="16"></button>
        <button class="edit-item-btn"><img src="assets/icons/edit_icon.svg" width="16" height="16"></button>
    `;
  addDueDateWarning(newItem);

  const targetClass = getTypeClass(type);

  const targetColumn = document.querySelector(`.section-${targetClass}`);

  addNewItemToColumn(newItem, type);

  addDragAndDropEvents(newItem);

  return newItem;
}

/**
 * Determines the label class based on the item type.
 * @param {string} type - The item type.
 * @returns {string} - The label class.
 */
function getLabelClass(type) {
  const normalizedType = type.toLowerCase();
  switch (normalizedType) {
    case 'paid-expenses':
    case 'pago':
      return 'paid';
    case 'income':
    case 'rendimentos':
      return 'income';
    default:
      return 'pending';
  }
}

/**
 * Determines the type class based on the item type.
 * @param {string} type - The item type.
 * @returns {string} - The label class.
 */
function getTypeClass(type) {
  const normalizedType = type.toLowerCase();
  switch (normalizedType) {
    case 'paid-expenses':
    case 'pago':
      return 'paid-expenses';
    case 'income':
    case 'rendimentos':
      return 'income';
    default:
      return 'expenses-to-pay';
  }
}

/**
 * Adds the new item to the appropriate column based on its type.
 * @param {HTMLElement} newItem - The new item element.
 */
function addNewItemToColumn(newItem, type) {
  const typeClass = getTypeClass(type);

  const targetColumn = document.querySelector(`.section-${typeClass}`);

  if (targetColumn) {
    targetColumn.appendChild(newItem);
  } else {
    console.error(`Column for type ${type} not found.`);
  }
}

/**
 * Handles the modal close action.
 */
function handleModalClose() {
  const cancelBtn = document.getElementById('cancel-item-btn');
  cancelBtn.addEventListener('click', function () {
    document.body.removeChild(document.querySelector('.modal-overlay'));
  });
}

/**
 * Displays a confirmation modal when attempting to delete an item.
 * Includes a "Don't remind me again" checkbox to save the user's preference.
 * @param {function} onConfirm - The callback function to execute upon confirmation.
 */
function showDeleteConfirmationModal(onConfirm) {
  const dontShowAgain = localStorage.getItem('dontShowDeleteConfirmation');
  if (dontShowAgain === 'true') {
    onConfirm();
    return;
  }

  const modalOverlay = document.createElement('div');
  modalOverlay.classList.add('modal-overlay');

  const modalContent = document.createElement('div');
  modalContent.classList.add('modal-content');
  modalContent.innerHTML = `
    <div class="modal-header">
        <h2 class="modal-title">Confirmar Exclusão</h2>
    </div>
    <div class="modal-body">
        <p class="modal-message">Tem certeza de que deseja excluir este item?</p>
        <label class="modal-checkbox-label">
          <br>
          <input type="checkbox" id="dont-show-again">
          Não me lembrar novamente
        </label>
    </div>
    <div class="modal-footer">
        <button id="confirm-delete-btn">Confirmar</button>
        <button id="cancel-delete-btn">Cancelar</button>
    </div>
`;

  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);

  // Handle confirmation and saving user preference
  document
    .getElementById('confirm-delete-btn')
    .addEventListener('click', () => {
      const dontShowAgainChecked =
        document.getElementById('dont-show-again').checked;
      if (dontShowAgainChecked) {
        localStorage.setItem('dontShowDeleteConfirmation', 'true');
      }
      document.body.removeChild(modalOverlay);
      onConfirm(); // Execute the confirmation callback
    });

  // Handle cancellation
  document.getElementById('cancel-delete-btn').addEventListener('click', () => {
    document.body.removeChild(modalOverlay);
  });
}

function showWelcomeModal() {
  const dontShowAgain = localStorage.getItem('dontShowWelcomeModal');
  const hasSeenModalThisSession = sessionStorage.getItem('hasSeenWelcomeModal');
  if (dontShowAgain === 'true' || hasSeenModalThisSession === 'true') {
    return;
  }

  const modalOverlay = document.createElement('div');
  modalOverlay.classList.add('modal-overlay');

  const modalContent = document.createElement('div');
  modalContent.classList.add('modal-content');
  modalContent.innerHTML = `
    <div class="modal-header">
      <h2>Bem-vindo ao GranaBox!</h2>
      <h3>Gerencie suas finanças de maneira prática e divertida!</h3>
    </div>
    <div class="modal-body">
      <p>Adicione suas despesas e rendimentos, acompanhe suas economias e veja tudo em um só lugar.
      Com nosso sistema dinâmico, você facilmente arrasta suas transações entre as colunas "A Pagar" e "Pago".</p>
      <p>Explore categorias personalizadas e configure recorrências para suas despesas mensais.
      Tudo está ao seu alcance, bastando alguns cliques para manter seu orçamento sob controle.</p>
      <label class="modal-checkbox-label">
        <br>
        <input type="checkbox" id="dont-show-welcome-again">
        Não me mostrar novamente
      </label>
    </div>
    <div class="modal-footer">
      <button id="close-welcome-btn">Começar</button>
    </div>
  `;

  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);

  document.getElementById('close-welcome-btn').addEventListener('click', () => {
    const dontShowAgainChecked = document.getElementById(
      'dont-show-welcome-again'
    ).checked;
    if (dontShowAgainChecked) {
      localStorage.setItem('dontShowWelcomeModal', 'true');
    }
    sessionStorage.setItem('hasSeenWelcomeModal', 'true');
    document.body.removeChild(modalOverlay);
  });
}
