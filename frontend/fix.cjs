const fs = require('fs');
const files = [
  'src/features/expenses/components/ExpenseForm.tsx',
  'src/features/incomes/components/IncomeForm.tsx'
];
files.forEach(f => {
  let text = fs.readFileSync(f, 'utf8');
  text = text.replace('/\\\\s\\\\(\\\\d+\\\\/\\\\d+\\\\)$/', '/\\s\\(\\d+\\/\\d+\\)$/');
  fs.writeFileSync(f, text);
});
