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

## Prerequisites
Before running this application, ensure you have the following installed:

- Node.js (v18 or higher)
- npm or yarn package manager
- Git for version control
- Alpha Bank Backend running [https://github.com/MACKENA05/Alpha-Bank-Backend]

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

4. Environment Configuration
Create a `.env` file in the root directory:

```bash
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:3000/api/v1
REACT_APP_API_TIMEOUT=30000

# Application Configuration
REACT_APP_APP_NAME=Alpha Bank
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=development

```

5. Open your browser and navigate to `http://localhost:3000`

---

## Folder Structure

```bash
-Alpha-Bank-Frontend/
├── public/                     # Static assets
│   ├── index.html             # HTML template
│   ├── favicon.ico            # App favicon
│   ├── manifest.json          # PWA manifest
│   └── assets/                # Images, icons, etc.
├── src/                       # Source code
│   ├── components/            # React components
│   │   ├── auth/              # Authentication components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── ForgotPassword.tsx
│   │   ├── dashboard/         # Dashboard components
│   │   │   ├── DashboardOverview.tsx
│   │   │   ├── AccountSummary.tsx
│   │   │   ├── TransactionChart.tsx
│   │   │   └── QuickActions.tsx
│   │   ├── accounts/          # Account management
│   │   │   ├── AccountList.tsx
│   │   │   ├── AccountCard.tsx
│   │   │   ├── CreateAccount.tsx
│   │   │   └── AccountDetails.tsx
│   │   ├── transactions/      # Transaction components
│   │   │   ├── TransactionForm.tsx
│   │   │   ├── TransactionHistory.tsx
│   │   │   ├── TransferMoney.tsx
│   │   │   └── WithdrawMoney.tsx
│   │   ├── admin/             # Admin panel components
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── UserManagement.tsx
│   │   │   ├── TransactionOversight.tsx
│   │   │   └── SystemAnalytics.tsx
│   │   ├── profile/           # User profile components
│   │   │   ├── ProfileView.tsx
│   │   │   ├── EditProfile.tsx
│   │   │   └── SecuritySettings.tsx
│   │   ├── layout/            # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Layout.tsx
│   │   └── common/            # Shared components
│   │       ├── Button.tsx
│   │       ├── Modal.tsx
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorBoundary.tsx
│   │       └── ProtectedRoute.tsx
│   ├── context/               # React Context providers
│   │   ├── AuthContext.tsx    # Authentication context
│   │   ├── ThemeContext.tsx   # Theme management
│   │   └── NotificationContext.tsx
│   ├── services/              # API services
│   │   ├── api.ts             # API client configuration
│   │   ├── authService.ts     # Authentication API calls
│   │   ├── accountService.ts  # Account management API
│   │   ├── transactionService.ts # Transaction API
│   │   └── adminService.ts    # Admin API calls
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAuth.ts         # Authentication hook
│   │   ├── useApi.ts          # API calling hook
│   │   ├── useLocalStorage.ts # Local storage hook
│   │   └── useDebounce.ts     # Debounce hook
│   ├── utils/                 # Utility functions
│   │   ├── formatters.ts      # Data formatting utilities
│   │   ├── validators.ts      # Form validation
│   │   ├── constants.ts       # App constants
│   │   ├── helpers.ts         # General helper functions
│   │   └── exportUtils.ts     # PDF/CSV export utilities
│   ├── types/                 # TypeScript type definitions
│   │   ├── auth.types.ts      # Authentication types
│   │   ├── account.types.ts   # Account types
│   │   ├── transaction.types.ts # Transaction types
│   │   └── api.types.ts       # API response types
│   ├── styles/                # Global styles
│   │   ├── globals.css        # Global CSS
│   │   └── components.css     # Component-specific styles
│   ├── App.tsx                # Main App component
│   ├── App.test.tsx           # App tests
│   ├── index.tsx              # Application entry point
│   └── setupTests.ts          # Test configuration
├── tests/                     # Test files
│   ├── __mocks__/             # Test mocks
│   ├── components/            # Component tests
│   ├── services/              # Service tests
│   └── utils/                 # Utility tests
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── jest.config.js             # Jest testing configuration
└── README.md                  # Project documentation

```
---

## Usage

- **Authentication:** Users can register and log in. Protected routes ensure only authenticated users access sensitive pages.
- **Dashboard:** Displays account balances, transaction trends, quick stats, and recent transactions.
- **Accounts:** View all bank accounts, filter by type or status, toggle balance visibility, and create new accounts.
- **Transactions:** Transfer money, withdraw funds, and view transaction history.
- **Admin Panel:** Admin users can access dashboards, view all transactions, manage users, and see detailed user information.

---



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


## Getting Started

1. Fork the repository
2. Create a feature branch: git checkout -b feature/amazing-feature
3. Follow the coding standards and conventions
4. Write tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

---

## License

This project is licensed under the MIT License.

## 🗺️ Roadmap

- [ ] Mobile app integration
- [ ] Real-time notifications
- [ ] Multi-currency support
- [ ] Advanced analytics dashboard
- [ ] Loan management system
- [ ] Credit card processing
- [ ] Investment portfolio management
