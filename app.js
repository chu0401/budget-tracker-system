const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('interface')); // Serve static files from the "interface" folder


const dataFile = 'expenses.json';

// Load expenses from file, or initialize an empty array if file doesn't exist
let expenses = [];
try {
    const data = fs.readFileSync(dataFile, 'utf-8');
    expenses = JSON.parse(data);
} catch (error) {
    console.log("No existing data file found; starting with an empty expense list.");
}

// Function to save expenses to file
const saveExpenses = () => {
    fs.writeFileSync(dataFile, JSON.stringify(expenses, null, 2));
};

// Route to get all expenses
app.get('/expenses', (req, res) => {
    res.json(expenses);
});

// Route to add a new expense
app.post('/expenses', (req, res) => {
    const { id, description, amount, category, date } = req.body;
    const newExpense = { id, description, amount, category, date };
    expenses.push(newExpense);
    saveExpenses();  // Save to file after adding
    res.status(201).json(newExpense);
});

// Route to update an expense
app.put('/expenses/:id', (req, res) => {
    const id = req.params.id;
    const { description, amount, category, date } = req.body;
    const expense = expenses.find(exp => exp.id === id);

    if (expense) {
        expense.description = description;
        expense.amount = amount;
        expense.category = category;
        expense.date = date;
        saveExpenses();  // Save to file after updating
        res.json(expense);
    } else {
        res.status(404).send("Expense not found");
    }
});

// Route to delete an expense
app.delete('/expenses/:id', (req, res) => {
    const id = req.params.id;
    const initialLength = expenses.length;
    expenses = expenses.filter(expense => expense.id !== id);

    if (expenses.length < initialLength) {
        saveExpenses();  // Save to file after deleting
        res.status(204).send();
    } else {
        res.status(404).send("Expense not found");
    }
});

// Route to calculate total amount of all expenses
app.get('/expenses/total', (req, res) => {
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    res.json({ total: totalAmount });
});

// Route to filter expenses by category
app.get('/expenses/category/:category', (req, res) => {
    const category = req.params.category;
    const filteredExpenses = expenses.filter(expense => expense.category.toLowerCase() === category.toLowerCase());
    res.json(filteredExpenses);
});

// Route to get a summary of expenses for a specific month and year
app.get('/expenses/summary/:year/:month', (req, res) => {
    const { year, month } = req.params;
    const monthlyExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getFullYear() === parseInt(year) && (expenseDate.getMonth() + 1) === parseInt(month);
    });

    const totalAmount = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    res.json({ month: `${year}-${month}`, total: totalAmount, expenses: monthlyExpenses });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
