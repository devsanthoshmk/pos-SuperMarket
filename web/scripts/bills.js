    // 2) Grouping function to produce nested billsData[]
function groupBills(flat) {
    const map = {};
    flat.forEach(b => {
      if (!map[b.id]) {
        map[b.id] = {
          id: b.id,
          name: b.name,
          phone: b.phone,
          date: b.date,
          time: b.time,
          items: [],
          tax: parseFloat(b.tax)
        };
      }
      map[b.id].items.push({
        name: b.item,
        quantity: parseInt(b.quantity, 10),
        price: parseFloat(b.price),
        total: parseFloat(b.total)
      });
    });
    // compute subtotal & grandtotal
    Object.values(map).forEach(b => {
      b.subtotal = b.items.reduce((sum, i) => sum + i.total, 0);
      b.grandtotal = parseFloat((b.subtotal + b.tax).toFixed(2));
    });
    return Object.values(map);
}

// Function to toggle dropdown sections
function toggleDropdown(header, content) {
    const icon = header.querySelector('.dropdown-icon');
    
    if (content.style.display === 'block') {
        content.style.display = 'none';
        icon.textContent = '►';
        icon.classList.remove('open');
    } else {
        content.style.display = 'block';
        icon.textContent = '▼';
        icon.classList.add('open');
    }
}

// Function to create a bill card
function createBillCard(bill) {
    const card = document.createElement('div');
    card.className = 'bill-card fade-in';
    card.dataset.billId = bill.id;

    const header = document.createElement('div');
    header.className = 'bill-header';
    header.innerHTML = `
        <span class="bill-id">Bill #${bill.id}</span>
        <span class="bill-date">${bill.date} ${bill.time}</span>
    `;

    const customer = document.createElement('div');
    customer.className = 'bill-customer';
    customer.innerHTML = `
        <input type="text" class="customer-name" value="${bill.name}" data-field="name">
        <input type="text" class="customer-phone" value="${bill.phone}" data-field="phone">
    `;

    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'bill-items';

    const itemsTable = document.createElement('table');
    itemsTable.innerHTML = `
        <thead>
            <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    `;

    const tbody = itemsTable.querySelector('tbody');
    bill.items.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="text" value="${item.name}" data-field="items[${index}].name"></td>
            <td><input type="number" value="${item.quantity}" min="1" data-field="items[${index}].quantity"></td>
            <td><input type="number" value="${item.price}" min="0" data-field="items[${index}].price"></td>
            <td>₹${item.total.toFixed(2)}</td>
        `;
        tbody.appendChild(row);
    });

    itemsContainer.appendChild(itemsTable);

    const summary = document.createElement('div');
    summary.className = 'bill-summary';
    summary.innerHTML = `
        <div class="summary-row">
            <span>Subtotal:</span>
            <span>₹${bill.subtotal.toFixed(2)}</span>
        </div>
        <div class="summary-row">
            <span>Tax:</span>
            <span>₹${bill.tax.toFixed(2)}</span>
        </div>
        <div class="summary-row total">
            <span>Total:</span>
            <span>₹${bill.grandtotal.toFixed(2)}</span>
        </div>
    `;

    const actions = document.createElement('div');
    actions.className = 'bill-actions';

    const saveBtn = document.createElement('button');
    saveBtn.className = 'save-btn';
    saveBtn.textContent = 'Save';
    saveBtn.addEventListener('click', () => saveBill(bill.id));

    actions.appendChild(saveBtn);

    card.appendChild(header);
    card.appendChild(customer);
    card.appendChild(itemsContainer);
    card.appendChild(summary);
    card.appendChild(actions);

    // Add event listeners for input changes
    const inputs = card.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('change', () => {
            updateBillData(bill.id, input.dataset.field, input.value);
        });
    });

    return card;
}

// Function to update bill data when inputs change
// Replace your current updateBillData with this:
function updateBillData(billId, field, value) {
  const bill = billsData.find(b => b.id === billId);
  if (!bill) return;

  // 1) Handle nested item fields like items[0].quantity or items[2].name
  if (field.includes('[')) {
    const [arrayName, rest] = field.split('[');
    const index = parseInt(rest.split(']')[0], 10);
    const propName = rest.split('.')[1];

    // Cast value to correct type
    let typedValue = propName === 'quantity'
      ? parseInt(value, 10)
      : propName === 'price'
        ? parseFloat(value)
        : value;

    // Update item
    bill.items[index][propName] = typedValue;

    // Recalculate row total if qty/price changed
    if (propName === 'quantity' || propName === 'price') {
      bill.items[index].total = bill.items[index].quantity * bill.items[index].price;
    }

    // 2) Recompute subtotal & grandtotal
    bill.subtotal = bill.items.reduce((sum, i) => sum + i.total, 0);
    bill.grandtotal = parseFloat((bill.subtotal + bill.tax).toFixed(2));

    // 3) Update the DOM
    const card = document.querySelector(`.bill-card[data-bill-id="${billId}"]`);
    // Update item's Total cell
    const row = card.querySelector(`input[data-field="${field}"]`).closest('tr');
    row.querySelector('td:last-child').textContent = `₹${bill.items[index].total.toFixed(2)}`;
    // Update summary lines
    const summary = card.querySelector('.bill-summary');
    summary.innerHTML = `
      <div class="summary-row">
        <span>Subtotal:</span>
        <span>₹${bill.subtotal.toFixed(2)}</span>
      </div>
      <div class="summary-row">
        <span>Tax:</span>
        <span>₹${bill.tax.toFixed(2)}</span>
      </div>
      <div class="summary-row total">
        <span>Total:</span>
        <span>₹${bill.grandtotal.toFixed(2)}</span>
      </div>
    `;
  }
  // 4) Handle direct fields: name or phone
  else {
    if (field === 'name') {
      bill.name = value;
      document.querySelector(`.bill-card[data-bill-id="${billId}"] .customer-name`)
              .value = value;
    }
    if (field === 'phone') {
      bill.phone = value;
      document.querySelector(`.bill-card[data-bill-id="${billId}"] .customer-phone`)
              .value = value;
    }
  }
}


// --- SAVE A SINGLE BILL ---
function saveBill(billId) {
  const bill = billsData.find(b => b.id === billId);
  if (!bill) return alert('Bill not found');
  // TODO: replace with your own API / persistence call
  console.log('Saving bill', bill);
  alert(`Bill #${billId} saved.`);
}

// --- SAVE ALL BILLS ---
function saveAllBills() {
  // TODO: replace with batch-save API
  console.log('Saving all bills', billsData);
  alert('All bills saved.');
}

// --- DOWNLOAD A BILL ---
function downloadBill(billId, format = 'pdf') {
  const bill = billsData.find(b => b.id === billId);
  if (!bill) return;
  // Simple CSV fallback; swap in your PDF generator if needed
  if (format === 'csv') {
    const rows = [
      ['Item','Qty','Price','Total'],
      ...bill.items.map(i => [i.name, i.quantity, i.price, i.total])
    ];
    let csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bill_${billId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
  // PDF branch could go here…
}

// --- SEARCH BILLS ---
function filterBills(query, field) {
  query = query.toLowerCase();
  return billsData.filter(b => {
    const value = (b[field] || '').toString().toLowerCase();
    return value.includes(query);
  });
}

function performSearch() {
  const q = billSearch.value.trim();
  const opt = document.querySelector('input[name="searchOption"]:checked').value;
  if (!q) {
    searchResultsSection.style.display = 'none';
    return;
  }
  const results = filterBills(q, opt);
  searchResultsGrid.innerHTML = '';
  results.forEach(bill => {
    const card = createBillCard(bill);
    // change the Save button in search to also say “Download”
    const dl = document.createElement('button');
    dl.className = 'save-btn';
    dl.textContent = 'Download';
    dl.style.marginLeft = '8px';
    dl.addEventListener('click', () => downloadBill(bill.id, 'csv'));
    card.querySelector('.bill-actions').appendChild(dl);
    searchResultsGrid.appendChild(card);
  });
  searchResultsSection.style.display = 'block';
  // auto-open the dropdown
  toggleDropdown(searchResultsHeader, searchResultsContent);
}

// --- INITIAL RENDER OF RECENT BILLS ---
function renderRecentBills() {
  recentBillsGrid.innerHTML = '';
  billsData.forEach(bill => {
    const card = createBillCard(bill);

    // add Download button (CSV)
    const dlBtn = document.createElement('button');
    dlBtn.className = 'download-btn';
    dlBtn.textContent = 'Print';
    dlBtn.style.marginLeft = '8px';
    dlBtn.addEventListener('click', () => downloadBill(bill.id, 'csv'));
    card.querySelector('.bill-actions').appendChild(dlBtn);

    recentBillsGrid.appendChild(card);
  });
}

function flattenBills(nestedBills) {
  const flat = [];
  
  nestedBills.forEach(bill => {
    bill.items.forEach(item => {
      flat.push({
        id: bill.id,
        date: bill.date,
        time: bill.time,
        item: item.name,
        quantity: item.quantity.toString(),
        price: item.price.toString(),
        total: item.total.toString(),
        subtotal: bill.subtotal.toString(),
        tax: bill.tax.toString(),
        grandtotal: bill.grandtotal.toString(),
        name: bill.name,
        phone: bill.phone
      });
    });
  });
  
  return flat;
}


let flatBills,
billsData,
recentBillsHeader,
recentBillsContent,
recentBillsGrid,
searchResultsSection,
searchResultsHeader,
searchResultsContent,
searchResultsGrid,
billSearch,
sortSelect,
saveAllBtn;

function bills_globals(){

  flatBills = structuredClone(sales);

  // 3) Replace billsData with the grouped version
  billsData = groupBills(flatBills);

  // DOM elements
  recentBillsHeader = document.getElementById('recentBillsHeader');
  recentBillsContent = document.getElementById('recentBillsContent');
  recentBillsGrid = document.getElementById('recentBillsGrid');
  searchResultsSection = document.getElementById('searchResultsSection');
  searchResultsHeader = document.getElementById('searchResultsHeader');
  searchResultsContent = document.getElementById('searchResultsContent');
  searchResultsGrid = document.getElementById('searchResultsGrid');
  billSearch = document.getElementById('billSearch');
  sortSelect = document.getElementById('sortSelect');
  saveAllBtn = document.getElementById('saveAllBtn');

  // Add event listeners for dropdowns
  recentBillsHeader.addEventListener('click', () => toggleDropdown(recentBillsHeader, recentBillsContent)
      );
  searchResultsHeader.addEventListener('click', () => toggleDropdown(searchResultsHeader, searchResultsContent));

  // Save-all button
  saveAllBtn.addEventListener('click', saveAllBills);

  // Search input / option listeners
  billSearch.addEventListener('input', performSearch);
  document.querySelectorAll('input[name="searchOption"]').forEach(
    r => r.addEventListener('change', performSearch)
    );

  // When DOM is ready, render bills and open the Recent Bills section
  renderRecentBills();

  // open the Recent Bills dropdown
  recentBillsContent.style.display = 'block';
  const icon = recentBillsHeader.querySelector('.dropdown-icon');
  icon.textContent = '▼';
  icon.classList.add('open');


}