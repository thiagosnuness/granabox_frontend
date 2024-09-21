// Global variables for drag-and-drop functionality
let draggingItem = null; // Variable to hold the item currently being dragged
let touchStartX = 0; // X-coordinate of the touch start event
let touchStartY = 0; // Y-coordinate of the touch start event

/**
 * Handle drag start event for both mouse and touch inputs.
 * @param {Event} event - The drag or touch event.
 */
function handleItemDragStart(event) {
  draggingItem = event.target.closest('.category-item');

  if (draggingItem && event.type === 'dragstart') {
    event.dataTransfer.setData('text/plain', draggingItem.id);
  } else if (draggingItem && event.type === 'touchstart') {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
  }
}

/**
 * Handle drag end event.
 * Clears the dragging item.
 */
function handleDragEnd() {
  draggingItem = null;
}

/**
 * Handle drop event for both mouse and touch inputs.
 * Appends the dragged item to the column if applicable.
 * @param {Event} event - The drop event.
 */
async function handleDrop(event) {
  event.preventDefault();

  if (draggingItem) {
    const column = event.target.closest(
      '.section-expenses-to-pay, .section-paid-expenses, .section-income'
    );
    if (column) {
      let newStatus;
      if (
        draggingItem.closest('.section-income') &&
        !column.classList.contains('section-income')
      ) {
        return;
      } else if (
        !draggingItem.closest('.section-income') &&
        column.classList.contains('section-income')
      ) {
        return;
      }

      column.appendChild(draggingItem);

      // Determine the new status based on the column
      if (column.classList.contains('section-paid-expenses')) {
        newStatus = 'Pago';
      } else if (column.classList.contains('section-expenses-to-pay')) {
        newStatus = 'A Pagar';
      } else if (column.classList.contains('section-income')) {
        newStatus = 'Rendimentos';
      }

      // Update the item status in the backend
      const itemId = draggingItem.getAttribute('item-id');
      if (itemId && newStatus) {
        await updateItemStatus(itemId, newStatus);
      }
      debouncedUpdateDashboard();
    }
  }
}

/**
 * Allow columns to receive a dropped item.
 * Necessary for both mouse and touch inputs.
 * @param {Event} event - The dragover event.
 */
function handleDragOver(event) {
  event.preventDefault();
}

/**
 * Handle touch move event.
 * Allows the dragged item to follow the touch movement.
 * @param {Event} event - The touchmove event.
 */
async function handleTouchMove(event) {
  if (draggingItem) {
    const touchX = event.touches[0].clientX;
    const touchY = event.touches[0].clientY;
    const targetElement = document.elementFromPoint(touchX, touchY);
    const column = targetElement.closest(
      '.section-expenses-to-pay, .section-paid-expenses, .section-income'
    );

    if (column) {
      if (
        draggingItem.closest('.section-income') &&
        !column.classList.contains('section-income')
      ) {
        return;
      } else if (
        !draggingItem.closest('.section-income') &&
        column.classList.contains('section-income')
      ) {
        return;
      }
      column.appendChild(draggingItem);

      // Determine the new status based on the column
      if (column.classList.contains('section-paid-expenses')) {
        newStatus = 'Pago';
      } else if (column.classList.contains('section-expenses-to-pay')) {
        newStatus = 'A Pagar';
      } else if (column.classList.contains('section-income')) {
        newStatus = 'Rendimentos';
      }

      // Update the item status in the backend
      const itemId = draggingItem.getAttribute('item-id');
      if (itemId && newStatus) {
        await updateItemStatus(itemId, newStatus);
      }
      touchStartX = touchX;
      touchStartY = touchY;
      debouncedUpdateDashboard();
    }
  }
}
