# Supermarket point of sale and POS billing system

pos-SuperMarket is a desktop supermarket point of sale and retail checkout web app for billing, inventory management, and sales reporting.

This POS billing system connects a Python backend with a browser interface through Eel. It runs locally on port 1234, renders views inside Google Chrome application mode, and stores transactions directly in CSV and JSON files on disk.

## Architecture

The application has two layers: a Python backend and a web frontend.

* Backend runtime: Python 3 runs an Eel server on `http://localhost:1234` with Bottle and Gevent WebSocket. Python functions expose methods to the frontend through WebSocket remote procedure calls.
* Frontend client: The interface runs in Google Chrome or Chromium in application mode without browser navigation controls. The frontend uses HTML5, CSS3, vanilla JavaScript, and Chart.js version 3.9.1.
* Storage layer: The application stores data in flat files under the `data/` directory. It uses no external database.
  * `data/inventory.csv` stores item names, stock counts, prices, and discounts.
  * `data/sales.csv` stores individual sales records, item quantities, line totals, tax amounts, and timestamps.
  * `data/settings.json` stores tax values and display paths.

## Setup

### Prerequisites

* Python 3.8 or higher.
* Google Chrome or Chromium installed on the host operating system.
* Git command line client.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/devsanthoshmk/pos-SuperMarket.git
   cd pos-SuperMarket
   ```

2. Create a virtual environment:
   ```bash
   python3 -m venv venv
   ```

3. Activate the virtual environment:
   * On Linux and macOS:
     ```bash
     source venv/bin/activate
     ```
   * On Windows Command Prompt:
     ```cmd
     venv\Scripts\activate.bat
     ```
   * On Windows PowerShell:
     ```powershell
     venv\Scripts\Activate.ps1
     ```

4. Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

Start the application with Python:

```bash
python main.py
```

The script starts the web server on `http://localhost:1234` and opens the desktop interface in Chrome.

The application contains four main views:

### Point of sale

The checkout screen opens by default.
* Search and selection: Type in the search box to filter products by name. Pressing any letter key on the keyboard focuses the search input. Click a product card to add one unit to the bill table.
* Stock deduction: When a product has a numeric stock count in `data/inventory.csv`, clicking the product decreases the stock by 1. When stock reaches 0, the card becomes disabled.
* Price calculations: The bill calculates subtotal, discounts from the offer field, tax, and the final total in Indian Rupees.
* Printing and recording: Click Print Bill to open the print dialog. The print stylesheet hides navigation bars and formats the receipt. Confirming the print dialog appends the transaction to `data/sales.csv` and writes updated stock levels to `data/inventory.csv`.
* Discarding: Click Clear or the table header cancel icon to empty the current bill.

### Inventory

Open the inventory tab from the sidebar to manage items.
* Inline editing: Click any cell in the table to edit item names, stock counts, or prices.
* Add items: Click Add New Item to insert a blank row.
* Save changes: Click Save or press Ctrl+S to save edits to `data/inventory.csv`.

### Dashboard

Open the dashboard tab to review sales metrics computed from `data/sales.csv`.
* Key metrics: Cards display daily average, weekly average, monthly average, and total sales revenue.
* Trend charts: A Chart.js line graph displays revenue grouped by day, week, or month.
* Product breakdown: A doughnut chart displays sales share by product, and a table lists total units sold and revenue per item.
* Export: Click Export CSV to download the sales file.

### Settings

Open the settings tab to configure taxes and manage data files.
* Tax configuration: Set base tax percentage and toggle whether tax applies to every item.
* File management: Click inventory.csv or sales.csv to open the file in the default system viewer.
* Data transfer: Download current files or upload new CSV files to append or overwrite inventory and sales data.

## Configuration

The application stores settings in `data/settings.json`.

```json
{
  "base_tax": 0,
  "tax_on_every": false,
  "inventory_direct": "pos-for-teashop/data/inventory.csv",
  "sales_direct": "pos-for-teashop/data/sales.csv"
}
```

Configuration fields:

* `base_tax`: Numeric tax rate added to the bill.
* `tax_on_every`: Boolean switch. When true, the POS calculates item tax on each line item. When false, the POS adds only `base_tax`.
* `inventory_direct`: Relative path reference to the inventory CSV file.
* `sales_direct`: Relative path reference to the sales CSV file.

### Inventory data schema

`data/inventory.csv` uses four comma-separated columns:

1. `name`: Product display name.
2. `availability`: Stock status. Set to `yes` for unlimited stock, `no` for out of stock, or an integer for tracked stock counts.
3. `price`: Unit retail price in Indian Rupees.
4. `offer`: Discount amount subtracted from the unit price.

### Sales data schema

`data/sales.csv` uses ten comma-separated columns:

1. `id`: Transaction numerical identifier.
2. `date`: Transaction date in DD-MM-YYYY format.
3. `time`: Transaction time in HH:MM 24-hour format.
4. `item`: Product name.
5. `quantity`: Number of units purchased.
6. `price`: Base unit price before discounts.
7. `total`: Line total after subtracting the discount.
8. `subtotal`: Combined total for all line items on the bill.
9. `tax`: Tax amount applied to the bill.
10. `grandtotal`: Final amount paid.
