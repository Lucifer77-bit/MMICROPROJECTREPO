# SmartSpend - Personal Finance Dashboard

SmartSpend is a polished, frontend-only prototype of a personal finance web application built with React, Vite, TypeScript, and Tailwind CSS. 

## Features
- **Dashboard Overview**: Visualizes total spending, income, and balance with interactive Recharts.
- **Transactions Management**: Add, view, and delete transactions with local state persistence.
- **Budget Planner**: Track category limits and simulate adjustments with a "What-if" budget simulator.
- **Behavioral Insights**: View detected spending patterns and a "Spending Health Score".
- **Smart Recommendations**: Interactive suggestions to improve savings.
- **Goal Tracking**: Create and fund financial goals with visual progress bars.
- **Responsive Design**: Mobile-friendly navigation and layouts.

## Installation & Running Locally

1. Clone or download this project.
2. Ensure you have Node.js installed.
3. Open a terminal in the project directory.
4. Run the following commands:

```bash
npm install
npm run dev
```

5. Open your browser to the URL shown in the terminal (usually `http://localhost:5173`).

## Mock Data Architecture
Currently, all data is generated and stored locally in the browser memory for demo purposes. 
- You can find the raw demo data in `src/data/mockData.ts`.
- Data fetching and simulated delays are handled in `src/services/api.ts`.
- Actions such as adding a transaction update React local state but will be reset upon page reload.

## Future REST API Integration
To connect this frontend to a real MERN backend (MongoDB, Express, React, Node.js), you only need to modify the `src/services/api.ts` file. 

Each function in the service layer is already structured to return Promises. Replace the `setTimeout` mock implementations with actual `fetch` or `axios` calls to your backend endpoints. 

For example, replace:
```typescript
export const getTransactions = async (): Promise<Transaction[]> => {
  return new Promise((resolve) => setTimeout(() => resolve([...mockTransactions]), 500));
};
```
With:
```typescript
export const getTransactions = async (): Promise<Transaction[]> => {
  const response = await axios.get('/api/transactions');
  return response.data;
};
```

No UI or component restructuring is required to connect the backend.
