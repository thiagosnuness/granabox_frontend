/**
 * Handle item click events, such as removing or editing items.
 * @param {Event} event - The click event.
 */
function handleItemClick(event) {
  const target = event.target;
  if (target.closest('.remove-item-btn')) {
    const item = target.closest('.category-item');
    if (item) {
      const itemId = item.getAttribute('item-id');
      const recurrence = item.getAttribute('item-recurrence');

      const confirmDeletion = async () => {
        // Remove the recurrence related to this item
        if (recurrence && recurrence !== 'Única') {
          await deleteRecurringItem(itemId);
        }

        // Proceed with deleting the individual item
        await deleteItem(itemId);
        debouncedUpdateDashboard();
      };

      // Show the confirmation modal with the option not to be reminded again
      showDeleteConfirmationModal(confirmDeletion);
    }
  } else if (target.closest('.edit-item-btn')) {
    const item = target.closest('.category-item');
    const column = item.closest('section');
    createModal(column, item);
  }
}

/**
 * Waits for the year and month selectors to be ready in the DOM before updating the dashboard.
 * Uses a setInterval to repeatedly check for the presence of the selectors.
 */
function waitForSelectorsToBeReady() {
  const interval = setInterval(() => {
    const selectedYearElement = document.getElementById('year-select');
    const selectedMonthElement = document.getElementById('month-select');

    // Check if selectors are available in the DOM
    if (selectedYearElement && selectedMonthElement) {
      debouncedUpdateDashboard();
      clearInterval(interval);
    } else {
      console.log('Waiting for selectors to be ready in the DOM...');
    }
  }, 100);
}

/**
 * Attach necessary drag-and-drop events to an item.
 * @param {Element} item - The item to attach events to.
 */
function addDragAndDropEvents(item) {
  // Make the item draggable
  item.setAttribute('draggable', true);

  // Handle drag start (mouse and touch)
  item.addEventListener('dragstart', handleItemDragStart);
  item.addEventListener('touchstart', handleItemDragStart, { passive: true });

  // Handle drag end (mouse and touch)
  item.addEventListener('dragend', handleDragEnd);
  item.addEventListener('touchend', handleDragEnd, { passive: true });

  // Handle touch move
  item.addEventListener('touchmove', handleTouchMove, { passive: true });

  // Handle item click events
  item.addEventListener('click', handleItemClick);
}

/**
 * Initialize drag-and-drop functionality and set up event listeners
 * when the DOM is fully loaded.
 */
document.addEventListener('DOMContentLoaded', function () {
  // Initialize drag-and-drop events for all category items
  document.querySelectorAll('.category-item').forEach(addDragAndDropEvents);

  // Set up event listeners for "Add Item" buttons
  document.querySelectorAll('.add-item-btn').forEach((button) => {
    button.addEventListener('click', function () {
      const column = this.closest('section');
      createModal(column);
    });
  });

  // Set up drop functionality for columns
  const columns = document.querySelectorAll(
    '.section-expenses-to-pay, .section-paid-expenses, .section-income'
  );
  columns.forEach((column) => {
    column.addEventListener('dragover', (event) => handleDragOver(event), {
      passive: false,
    }); // Allow items to be dragged over
    column.addEventListener('drop', handleDrop); // Handle the drop event
    column.addEventListener('touchmove', handleTouchMove, { passive: true }); // Handle touch move
  });

  waitForSelectorsToBeReady();
  showWelcomeModal();
});
