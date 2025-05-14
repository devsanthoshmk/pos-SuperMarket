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

// Replace a single bill‐card in the DOM with an updated one.
function reRenderBillCard(billId) {
  console.log(billId);
  const bill = billsData.find(b => b.id === billId);
  if (!bill) return;
  const oldCard = document.querySelector(`.bill-card[data-bill-id="${billId}"]`);
  const newCard = createBillCard(bill);
  oldCard.replaceWith(newCard);
}

// helper: append a new item to a bill and refresh its card
function addItemToBill(billId, item) {
  const bill = billsData.find(b => b.id === billId);
  if (!bill) return;
  // push with parsed numbers
  bill.items.push({
    name: item.name,
    quantity: 1,
    price: parseFloat(item.price),
    total: parseFloat(item.price)
  });
  // recalc totals
  bill.subtotal = bill.items.reduce((sum, i) => sum + i.total, 0);
  bill.grandtotal = parseFloat((bill.subtotal + bill.tax).toFixed(2));
  // re‐render everything (or just that one card if you prefer)
  reRenderBillCard(bill.id);
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

    card.appendChild(header);
    card.appendChild(customer);
    card.appendChild(itemsContainer);
    card.appendChild(summary);
    card.appendChild(actions);

      // ── ADD-ITEM DROPDOWN ──
    const addContainer = document.createElement('div');
    addContainer.className = 'add-item-container';

    const addBtn = document.createElement('button');
    addBtn.className = 'add-item-btn';
    addBtn.textContent = 'Add Item ▼';

    // build the list
    const dropdown = document.createElement('ul');
    dropdown.className = 'item-dropdown';
    items.forEach(it => {
      const li = document.createElement('li');
      li.textContent = `${it.name} — ₹${it.price}`;
      li.addEventListener('click', e => {
        e.stopPropagation();
        dropdown.classList.remove('open');
        addItemToBill(bill.id, it);
      });
      dropdown.appendChild(li);
    });

    // toggle open/close
    addBtn.addEventListener('click', e => {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });

    addContainer.append(addBtn, dropdown);
    actions.appendChild(addContainer);


    // Add event listeners for input changes
    const inputs = card.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('change', () => {
            updateBillData(bill.id, input.dataset.field, input.value);
        });
    });

    const dlBtn = document.createElement('button');
    dlBtn.className = 'download-btn';
    dlBtn.textContent = 'Print';
    dlBtn.style.marginLeft = '8px';
    dlBtn.addEventListener('click', () => printIt(bill));
    card.querySelector('.bill-actions').appendChild(dlBtn);

    recentBillsGrid.appendChild(card);

    return card;
}

// Function to update bill data when inputs change
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

    // if someone manually sets quantity to 0, drop that item:
    if (propName === 'quantity' && typedValue === 0) {
      bill.items.splice(index, 1);
      reRenderBillCard(billId);
      return
      // no need to recalc that one row
    } else {
      // original logic: update name/price/quantity

      // Update item
      bill.items[index][propName] = typedValue;

      // Recalculate row total if qty/price changed
      if (propName === 'quantity' || propName === 'price') {
        bill.items[index].total = bill.items[index].quantity * bill.items[index].price;
      }
    }

    // 2) Recompute subtotal & grandtotal
    bill.subtotal = bill.items.reduce((sum, i) => sum + i.total, 0);
    bill.grandtotal = parseFloat((bill.subtotal + bill.tax).toFixed(2));

    // 3) Update the DOM
    const card = document.querySelector(`.bill-card[data-bill-id="${billId}"]`);
    // Update item's Total cell
    const row = card.querySelector(`input[data-field="${field}"]`).closest('tr');
    row.querySelector('td:last-child').textContent = `₹${bill.items[index].total.toFixed(2) || 0}`;
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
      if ((parseInt(value,10)+"").length !== 10) {
        alert('Phone must contain only numbers without +91.');
      }
      bill.phone = value;
      document.querySelector(`.bill-card[data-bill-id="${billId}"] .customer-phone`)
              .value = value;
    }
  }

  ask_save=true;
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
  sales = flattenBills(billsData); //sales===flatBills
  eel.setSales(sales);
  ask_save=false;
}

function immidDateTime(ele){
      const now = new Date();

      // Options for date
      const dateOptions = { day: '2-digit', month: 'short', year: 'numeric' };
      // e.g. "01 May 2025"
      const formattedDate = now
        .toLocaleDateString('en-GB', dateOptions)
        .replace(',', '');

      // Options for time
      const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
      // e.g. "12:39 AM"
      const formattedTime = now.toLocaleTimeString('en-US', timeOptions);

      ele.innerHTML = `<div><span>Date: ${formattedDate}</span><span> | </span><span>Time: ${formattedTime}</span></div>`;

      // Schedule next update right at the top of the next second
      const secLeft = 60 -  now.getSeconds();
      const msleft = secLeft * 1000 - now.getMilliseconds();
}

function populateBill(bill) {
  // 1) Header
  document.getElementById('pos-bill-id').textContent = bill.id;

  // 3) Billing rows
  const tbody = document.getElementById('billing');
  tbody.innerHTML = '';  // clear existing

  bill.items.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>${item.price.toFixed(2)}</td>
      <td>${item.offer?item.offer.toFixed(2):"-"}</td>
      <td>${item.total.toFixed(2)}</td>
      <td class="print-hide"></td>
    `;
    tbody.appendChild(tr);
  });

  // 4) Summary
  document.getElementById('subtotal').textContent   = bill.subtotal.toFixed(2);
  document.getElementById('offer').textContent      = bill.tot_offer?bill.tot_offer.toFixed(2):'-';                // no offers
  document.getElementById('tax').textContent        = bill.tax.toFixed(2);
  document.getElementById('total').textContent      = bill.grandtotal.toFixed(2);

  const name_cont= document.querySelector('#purchasor-name');
  const name_ptag=name_cont.querySelector("#pos-put-name");
  if (bill.name && bill.phone){
    name_cont.style.display="unset";
    name_ptag.textContent=bill.name;
  } else {
    name_cont.style.display="none";
  }
}


// --- print A BILL ---
function printIt(billId){
    immidDateTime(document.getElementById('date-time'));
    populateBill(billId);
    window.print();


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
    searchResultsGrid.appendChild(card);
  });
  searchResultsSection.style.display = 'block';
  // auto-open the dropdown
  const icon = searchResultsHeader.querySelector('.dropdown-icon');
  searchResultsContent.style.display = 'block';
  icon.textContent = '▼';
  icon.classList.add('open');
}

// --- INITIAL RENDER OF RECENT BILLS ---
function renderRecentBills() {
  recentBillsGrid.innerHTML = '';
  billsData.forEach(bill => {
    const card = createBillCard(bill);
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
// sortSelect,
saveAllBtn;

function bills_globals(){

  flatBills = sales;

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
  // sortSelect = document.getElementById('sortSelect');
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