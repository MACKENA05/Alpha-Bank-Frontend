# Banking App Frontend

A modern, responsive banking application frontend built with React and TypeScript. This app provides user authentication, account management, transaction handling, and an admin panel for managing users and transactions.

---

## Features

- User authentication with login, registration, and protected routes
- User dashboard with account overview, transaction trends, and recent transactions
- Account management: view, filter, and create bank accounts
- Transaction management: transfer money, withdraw, deposit (admin only), and view transaction history
- Admin panel with dashboards, user management, and transaction oversight
- Responsive UI built with Tailwind CSS and Headless UI components
- PDF export and CSV parsing capabilities
- Real-time notifications using react-hot-toast

---

## Tech Stack

- React 19 (beta)
- TypeScript
- React Router DOM for routing
- Tailwind CSS for styling
- Recharts for charts and data visualization
- Lucide React for icons
- react-hot-toast for notifications
- jspdf and html2canvas for PDF export
- papaparse for CSV parsing
- Jest and React Testing Library for testing

---

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd alpha-bank-frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`

---

## Folder Structure

- `src/` - Main source code
  - `components/` - React components organized by feature (auth, accounts, admin, dashboard, transactions, profile, layout, common)
  - `context/` - React context providers (e.g., AuthContext)
  - `services/` - API service modules and utility functions
  - `styles/` - Global styles (if any)
  - `utils/` - Utility functions
- `public/` - Static assets and HTML template
- `tests/` or alongside components - Test files (e.g., `App.test.tsx`)

---

## Usage

- **Authentication:** Users can register and log in. Protected routes ensure only authenticated users access sensitive pages.
- **Dashboard:** Displays account balances, transaction trends, quick stats, and recent transactions.
- **Accounts:** View all bank accounts, filter by type or status, toggle balance visibility, and create new accounts.
- **Transactions:** Transfer money, withdraw funds, and view transaction history.
- **Admin Panel:** Admin users can access dashboards, view all transactions, manage users, and see detailed user information.

---

## Testing

Run tests with:

```bash
npm test
```

---

## Deployment

The app is configured for deployment on Render.com. The homepage URL is set to:

```
https://your-app-name.onrender.com
```

Build the app for production with:

```bash
npm run build
```

---

## Contributing

Contributions are welcome! Please fork the repository and submit pull requests for improvements or bug fixes.

---

## License

This project is licensed under the MIT License.
