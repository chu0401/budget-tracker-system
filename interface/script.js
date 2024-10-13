const apiUrl = "http://localhost:3000";

// Function to fetch and display all expenses
async function getExpenses() {
    const response = await fetch(`${apiUrl}/expenses`);
    const expenses = await response.json();
    const expensesList = document.getElementById('expenses-list');
    expensesList.innerHTML = ''; // Clear existing items

    expenses.forEach(expense => {
        const item = document.createElement('li');
        item.innerHTML = `
            ${expense.description} - RM${expense.amount} (${expense.category}, ${expense.date})
            <button onclick="deleteExpense('${expense.id}')">Delete</button>
            <button onclick="showUpdateForm('${expense.id}', '${expense.description}', '${expense.amount}', '${expense.category}', '${expense.date}')">Update</button>
        `;
        expensesList.appendChild(item);
    });
}

// Function to add a new expense
async function addExpense() {
    const description = document.getElementById('description').value;
    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;

    const newExpense = { id: Date.now().toString(), description, amount: parseFloat(amount), category, date };

    await fetch(`${apiUrl}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpense)
    });

    getExpenses(); // Refresh the expense list
}

// Function to delete an expense
async function deleteExpense(id) {
    await fetch(`${apiUrl}/expenses/${id}`, {
        method: 'DELETE'
    });
    getExpenses(); // Refresh the expense list
}

// Function to show the update form with existing data
function showUpdateForm(id, description, amount, category, date) {
    document.getElementById('description').value = description;
    document.getElementById('amount').value = amount;
    document.getElementById('category').value = category;
    document.getElementById('date').value = date;

    // Update the button to trigger updateExpense instead of addExpense
    const updateButton = document.createElement('button');
    updateButton.innerText = "Save Changes";
    updateButton.onclick = () => updateExpense(id);
    document.getElementById('form-section').appendChild(updateButton);
}

// Function to update an expense
async function updateExpense(id) {
    const description = document.getElementById('description').value;
    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;

    const updatedExpense = { description, amount: parseFloat(amount), category, date };

    await fetch(`${apiUrl}/expenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedExpense)
    });

    getExpenses(); // Refresh the expense list

    // Reset form and remove update button
    document.getElementById('description').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('category').value = '';
    document.getElementById('date').value = '';
    document.querySelector('button[onclick^="updateExpense"]').remove(); // Remove the update button
}

// Function to get total expenses
async function getTotalExpenses() {
    const response = await fetch(`${apiUrl}/expenses/total`);
    const data = await response.json();
    document.getElementById('total-amount').textContent = data.total;
}

// Function to filter expenses by category
async function filterByCategory() {
    const category = document.getElementById('filter-category').value;
    const response = await fetch(`${apiUrl}/expenses/category/${category}`);
    const filteredExpenses = await response.json();

    const expensesList = document.getElementById('expenses-list');
    expensesList.innerHTML = ''; // Clear current list
    filteredExpenses.forEach(expense => {
        const item = document.createElement('li');
        item.textContent = `${expense.description} - RM${expense.amount} (${expense.category}, ${expense.date})`;
        expensesList.appendChild(item);
    });
}

// Function to get monthly summary of expenses
async function getMonthlySummary() {
    const year = document.getElementById('summary-year').value;
    const month = document.getElementById('summary-month').value;
    const response = await fetch(`${apiUrl}/expenses/summary/${year}/${month}`);
    const data = await response.json();

    const summaryResult = document.getElementById('summary-result');
    summaryResult.innerHTML = `<h4>Summary for ${data.month}</h4><p>Total: RM${data.total}</p>`;

    const expensesList = document.createElement('ul');
    data.expenses.forEach(expense => {
        const item = document.createElement('li');
        item.textContent = `${expense.description} - RM${expense.amount} (${expense.category}, ${expense.date})`;
        expensesList.appendChild(item);
    });
    summaryResult.appendChild(expensesList);
}


// Initialize the page with existing expenses
getExpenses();
