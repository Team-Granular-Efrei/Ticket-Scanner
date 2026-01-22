# Ticket Scanner

Ticket Scanner is a web application designed to **scan receipts** and **manage expenses** automatically using Artificial Intelligence. It leverages Mistral AI to extract detailed data from images and provides a comprehensive dashboard to track spending habits.

## Key Features

- **AI-Powered Scanning:** Capture receipts via camera or gallery. The app uses **Mistral AI** (OCR + Chat) to extract merchant details, dates, line items, prices, and tax information.
- **Smart Editor:** A robust interface to review and modify extracted data:
  - Edit Merchant name, address, and category.
  - Manage line items (name, quantity, price, category).
  - Handle VAT, Discounts, and Service Charges (with distribution logic).
  - View AI-generated insights about the spending.
- **Transaction History:** View recent activity with detailed cards showing total spend, item counts, and breakdown by expense type.
- **Analytics Dashboard:** Visualize expenses with interactive charts (powered by Recharts):
  - Daily Spend (Bar Chart).
  - Category Breakdown (Donut Chart).
  - Statistics (Average ticket, total transactions).
- **Wallet Management:** Group transactions and categorize items using a predefined budget taxonomy (Groceries, Tech, Dining, etc.).

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Styling:** Tailwind CSS v4
- **AI & OCR:** Mistral AI SDK (`mistral-ocr-latest` & `mistral-small-latest`)
- **Validation:** Zod
- **Visualization:** Recharts
- **State Management:** React Context & Server Actions
- **Backend (Mock):** JSON Server

## Prerequisites

- **Node.js**: Version 20 or higher is recommended.
- **Package Manager**: npm, pnpm, or yarn.

## Installation & Setup

1.  **Clone the repository:**

    ```bash
    git clone [https://github.com/Team-Granular-Efrei/Ticket-Scanner.git](https://github.com/Team-Granular-Efrei/Ticket-Scanner.git)
    cd Ticket-Scanner
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    pnpm install
    ```

3.  **Environment Configuration:**
    Create a `.env.local` file in the root directory and add the following required variables:

    ```env
    # Required for AI Analysis
    MISTRAL_API_KEY=your_mistral_api_key_here

    # URL for the JSON Server
    NEXT_PUBLIC_API_URL=http://localhost:3001

    # App Metadata
    NEXT_PUBLIC_APP_NAME="Ticket Scanner"
    ```

4.  **Start the Development Server:**
    Run both server and backend in concurrent mode. 
    Ensure your JSON server is running on port 3001 to handle data persistence.

    ```bash
    npm run dev
    ```

    The application will be accessible at `http://localhost:3000`.

## Usage Guide

### 1. Scanning a Receipt

- Navigate to the home page.
- Open the creation drawer and select **"Create transaction from receipt"**.
- Choose **Camera** to take a photo directly (optimized for mobile) or **Gallery** to upload an image.
- The AI will process the image and extract data automatically.

### 2. Editing & Validation

- Once scanned, the **Receipt Editor** opens.
- Review the extracted items. You can change categories, adjust prices, or add missing items manually.
- Toggle **VAT** or **Discount** options if applicable.
- The AI provides a brief "Insight" note about the receipt content.

### 3. Analytics

- Click the **Analytics** button in the settings menu inside the dashboard drawer.
- Toggle between **Overview** (Weekly spending trends) and **Breakdown** (Spending by category) to understand your financial habits.

### 4. Managing Transactions

- View your history on the main page.
- Click on any transaction to edit details.
- Delete transactions via the settings menu inside the receipt view.

## Technologies Utilisées

- React 19, Next.js 16, TypeScript
- Tailwind CSS v4
- Mistral AI (OCR + Chat)
- JSON Server (local)
