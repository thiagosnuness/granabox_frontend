/**
 * The base URL for the API endpoints used in the application.
 * Modify this value to point to the correct backend server.
 */
const API_URL = 'http://127.0.0.1:5000';

/**
 * Creates a new label in the backend.
 * @param {string} labelName - The name of the label to be created.
 * @param {boolean} isDefault - Indicates if the label is a default label.
 * @returns {Promise<Object|null>} - A promise that resolves to the created label or null if an error occurs.
 */
async function createLabel(labelName, isDefault = false) {
  try {
    const response = await fetch(`${API_URL}/label`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        name: labelName,
        is_default: isDefault.toString(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error creating label:', errorData);
      return null;
    }

    const newLabel = await response.json();

    return newLabel;
  } catch (error) {
    console.error('Error creating label:', error);
    return null;
  }
}

/**
 * Creates a new item in the backend.
 * @param {Object} itemData - The data of the item to be created.
 * @returns {Promise<Object|null>} - A promise that resolves to the created item or null if an error occurs.
 */
async function createItem(itemData) {
  try {
    const response = await fetch(`${API_URL}/item`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(itemData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Backend error:', errorData);
      throw new Error('Failed to create item in the backend.');
    }

    const newItem = await response.json();
    return newItem;
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Creates a new recurring item in the backend.
 * @param {Object} itemData - The data of the recurring item to be created.
 * @returns {Promise<Array|null>} - A promise that resolves to the created items or null if an error occurs.
 */
async function createRecurringItem(itemData) {
  try {
    const response = await fetch(`${API_URL}/item/recurring`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        label_id: itemData.label_id,
        type: itemData.type,
        description: itemData.description,
        amount: itemData.amount,
        due_date: itemData.due_date,
        months: 12,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Backend error:', errorData);
      throw new Error('Failed to create recurring item in the backend.');
    }

    const createdItems = await response.json();
    return createdItems;
  } catch (error) {
    console.error('Error in createRecurringItem:', error);
    return null;
  }
}

/**
 * Fetches all labels from the backend.
 * @returns {Promise<Array>} - A promise that resolves to an array of labels.
 */
async function fetchLabels() {
  try {
    const response = await fetch(`${API_URL}/labels`);
    if (!response.ok) {
      throw new Error('Failed to fetch labels from the backend.');
    }
    const labels = await response.json();
    return labels;
  } catch (error) {
    console.error(error);
    return [];
  }
}

/**
 * Fetches all items from the backend.
 * @returns {Promise<Array>} - A promise that resolves to an array of items.
 */
async function fetchItems() {
  try {
    const response = await fetch(`${API_URL}/items`);
    if (!response.ok) {
      throw new Error('Failed to fetch items from the backend.');
    }
    const items = await response.json();
    return items;
  } catch (error) {
    console.error(error);
    return [];
  }
}

/**
 * Fetches a single item by its ID from the backend.
 * @param {string} itemId - The ID of the item to fetch.
 * @returns {Promise<Object|null>} - A promise that resolves to the item or null if not found.
 */
async function fetchItemById(itemId) {
  try {
    const response = await fetch(`${API_URL}/item?id=${itemId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch item from the backend.');
    }
    const item = await response.json();
    return item;
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Fetch items filtered by year, month, and optional type from the backend.
 * @param {string} year - The selected year.
 * @param {string} month - The selected month.
 * @param {string} [type=''] - Optional item type to filter by.
 * @returns {Promise<Array>} - A promise that resolves to the list of filtered items.
 */
async function fetchItemsByDate(year, month, type = '') {
  try {
    const url = new URL(`${API_URL}/items/date`);
    url.searchParams.append('year', year);
    url.searchParams.append('month', month);
    if (type) {
      url.searchParams.append('type', type);
    }

    // Get the user's local timezone
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const response = await fetch(url, {
      headers: {
        TimeZone: userTimeZone, // Add the TimeZone header
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch items by date from the backend.');
    }
    const items = await response.json();
    return items;
  } catch (error) {
    console.error(error);
    return [];
  }
}

/**
 * Fetches available years from the backend.
 * @returns {Promise<Object>} - A promise that resolves to an object with minYear and maxYear.
 */
async function fetchAvailableYears() {
  try {
    const response = await fetch(`${API_URL}/items/years`);
    if (!response.ok) {
      throw new Error('Failed to fetch available years');
    }
    const data = await response.json();

    // If no years are found, return the current year as a fallback
    if (!data.min_year || !data.max_year) {
      const currentYear = new Date().getFullYear();
      return { minYear: currentYear, maxYear: currentYear };
    }

    return { minYear: data.min_year, maxYear: data.max_year };
  } catch (error) {
    console.error('Error fetching available years:', error);
    const currentYear = new Date().getFullYear();
    return {
      minYear: currentYear,
      maxYear: currentYear,
    };
  }
}

/**
 * Fetches financial overview filtered by year and month from the backend.
 * @param {string} year - The selected year.
 * @param {string} month - The selected month.
 * @returns {Promise<Object|null>} - A promise that resolves to the financial overview or null if an error occurs.
 */
async function fetchFinancialOverview(year, month) {
  try {
    const url = new URL(`${API_URL}/items/overview`);
    url.searchParams.append('year', year);
    url.searchParams.append('month', month);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch financial overview from the backend.');
    }

    const overview = await response.json();
    return overview;
  } catch (error) {
    console.error('Error fetching financial overview:', error);
    return null;
  }
}

/**
 * Updates the status of an item in the backend.
 * @param {string} itemId - The ID of the item to update.
 * @param {string} newStatus - The new status of the item.
 * @returns {Promise<Object|null>} - A promise that resolves to the updated item or null if an error occurs.
 */
async function updateItemStatus(itemId, newStatus) {
  try {
    const response = await fetch(`${API_URL}/item/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        id: itemId,
        type: newStatus,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error updating item status:', errorData);
      throw new Error('Failed to update item status in the backend.');
    }

    const updatedItem = await response.json();
    return updatedItem;
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Updates an item in the backend.
 * @param {string} itemId - The ID of the item to update.
 * @param {Object} itemData - The updated data of the item.
 * @returns {Promise<Object|null>} - A promise that resolves to the updated item or null if an error occurs.
 */
async function updateItem(itemId, itemData) {
  try {
    const response = await fetch(`${API_URL}/item`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ id: itemId, ...itemData }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Backend error:', errorData);
      throw new Error('Failed to update item in the backend.');
    }

    const updatedItem = await response.json();
    return updatedItem;
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Updates a recurring item in the backend.
 * @param {string} itemId - The ID of the recurring item to update.
 * @param {Object} itemData - The updated data of the recurring item.
 * @returns {Promise<Object|null>} - A promise that resolves to the updated item or null if an error occurs.
 */
async function updateRecurringItem(itemId, itemData) {
  try {
    const response = await fetch(`${API_URL}/item/recurring`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        id: itemId,
        label_id: itemData.label_id,
        type: itemData.type,
        description: itemData.description,
        amount: itemData.amount,
        due_date: itemData.due_date,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error editing recurring item:', errorData);
      throw new Error('Failed to edit recurring item in the backend.');
    }

    const updatedItem = await response.json();
    return updatedItem;
  } catch (error) {
    console.error('Error in editRecurringItem:', error);
    return null;
  }
}

/**
 * Deletes an item from the backend.
 * @param {string} itemId - The ID of the item to delete.
 * @returns {Promise<Object|null>} - A promise that resolves to the result of the deletion or null if an error occurs.
 */
async function deleteItem(itemId) {
  try {
    const response = await fetch(`${API_URL}/item?id=${itemId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete item in the backend.');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Deletes a recurring item from the backend.
 * @param {string} itemId - The ID of the recurring item to delete.
 * @returns {Promise<Object|null>} - A promise that resolves to the result of the deletion or null if an error occurs.
 */
async function deleteRecurringItem(itemId) {
  try {
    const response = await fetch(`${API_URL}/item/recurring?id=${itemId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete recurring item in the backend.');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error deleting recurring item:', error);
    return null;
  }
}
