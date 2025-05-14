//checking wheather is string is number or not
function isNumber(str) {
    return !isNaN(str) && str.trim() !== '';
  }

//showing availability dynamically using js
function availability(ele){
  const avail=ele.querySelector('h3 span');
  avail.innerHTML=isNumber(items[ele.dataset.itemid-1].availability) ? `(${items[ele.dataset.itemid-1].availability})` : "";
  // console.log(isNumber(items[ele.dataset.itemid-1].availability),items[ele.dataset.itemid-1].availability);
}


// for adding to sales
function getDateTime() {
  const now = new Date();

  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const year = now.getFullYear();

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  return [`${day}-${month}-${year}`,`${hours}:${minutes}`];
}


function addItem(ele){
  ask_save=true;
  const itemid=ele.dataset.itemid
  const billit= document.getElementById('billing')
  const item=items[itemid-1];
  // reducing the availability of an item which can be...
  if (item["availability"]!=="yes" && item["availability"]!=="no"){
    if (item["availability"]-0>0){
    item["availability"]=item["availability"]-1+"";
      availability(ele);
    } else{
      availability(ele);
      ele.classList.add("menu-item-disabled")
      ele.classList.remove("menu-item")
      return 
    }
  }
  qty[itemid] = (qty[itemid] || 0)+1;


  const itemtot=qty[itemid]*(item.price-0-item.offer-0);

  const data=`<tr id="blling-${itemid}">
                  <td>${item.name}</td>
                  <td>${qty[itemid]}</td>
                  <td>${item.price}</td>
                  <td>${(qty[itemid]*(item.offer-0)).toFixed(2)}</td>
                  <td>${itemtot.toFixed(2)}</td>
                  <td class="print-hide"><button class="delete-btn" data-id="blling-2" data-itemid="${itemid}" onclick="removeItem(this)">×</button></td>
              </tr>`;
  tot+=item.price-0-item.offer-0;
  total_offer+=item.offer-0;

  if (isFirst) {
    billit.innerHTML=data
    isFirst=false;
  }else{
    if(qty[itemid]>1){
    document.getElementById(`blling-${itemid}`).remove();
    }
    billit.innerHTML+=data;
  }

  if (settings.tax_on_every===true){
    taxamt+=item.tax-0
  }

  // updating total
  subtotal.textContent=`₹${tot.toFixed(2)}`;
  tax.textContent=`₹${taxamt.toFixed(2)}`;
  offer.textContent=`₹${total_offer.toFixed(2)}`
  total.textContent=`₹${(tot+taxamt).toFixed(2)}`;

  // console.log(getDateTime());
  const [date,time] = getDateTime();
      // subtotal,tax,grandtotal
  let done;
  sale.forEach((sal)=>{
    if (sal.item==item.name){
     sal.quantity+=1;
     sal.total+=itemtot;
     done=true;
    }
  })
  if (!done){
    sale.push({"item":item.name,"quantity":qty[itemid],"price":item.price,"total":itemtot,"subtotal":tot.toFixed(2),"tax":taxamt.toFixed(2),"grandtotal":(tot+taxamt).toFixed(2)});
    // console.log(sale)
  }
  // console.log(sale)


}

function removeItem(ele){
  const itemid=ele.dataset.itemid;
  const item=items[itemid-1];
  qty[itemid]-=1;
  const itemtot=qty[itemid]*(item.price-0-item.offer-0);

  const data=`<tr id="blling-${itemid}">
                  <td>${item.name}</td>
                  <td>${qty[itemid]}</td>
                  <td>${item.price}</td>
                  <td>${(qty[itemid]*(item.offer-0)).toFixed(2)}</td>
                  <td>${itemtot.toFixed(2)}</td>
                  <td class="print-hide"><button class="delete-btn" data-id="blling-2" data-itemid="${itemid}" onclick="removeItem(this)">×</button></td>
              </tr>`;

  tot-=item.price-0-item.offer-0;
  total_offer-=item.offer-0;

  if (settings.tax_on_every===true){
    taxamt-=item.tax-0
  }


  subtotal.textContent=`₹${tot.toFixed(2)}`;
  tax.textContent=`₹${taxamt.toFixed(2)}`;
  total.textContent=`₹${(tot+taxamt).toFixed(2)}`;

  if (item["availability"]!=="yes" && item["availability"]!=="no"){
    item.availability=  item.availability-0+1+''; 
    const bele = document.querySelector(`[data-itemid="${itemid}"].menu-item, [data-itemid="${itemid}"].menu-item-disabled`);
    if (item.availability-0===1){
      bele.classList.add("menu-item")
      bele.classList.remove("menu-item-disabled")
    }
    availability(bele);
  }

  let noneed;
  for (let i = sale.length - 1; i >= 0; i--) {
    const sal = sale[i];
    if (sal.item === item.name) {
      sal.quantity -= 1;
      sal.total -= itemtot;
      if (sal.quantity === 0) {
        sale.splice(i, 1); // safely remove item
        noneed=true;
        break
      }
    }
  }
  // console.log(sale);
  if(noneed!==true){
    ele.parentElement.parentElement.innerHTML = data;
  } else if (sale.length===0){
    isFirst=true;
    ele.parentElement.parentElement.innerHTML= `<tr>
                                                      <td>-</td>
                                                      <td>-</td>
                                                      <td>-</td>
                                                      <td>-</td>
                                                      <td>-</td>
                                                  </tr>`;
  }else {
    ele.parentElement.parentElement.remove();
  }
}


// for date and time
function updateDateTime(from) {
      if(from!==to) return false//if it is called by pos.js and the route changes this function stops
      const ele=dt_el;
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
      if (ele)
      setTimeout(() => updateDateTime(from), msleft);
      else console.log("stoped apacalipse")
    }

//print handling
function printHandle(){
  if (tot > 1) {

        if ((askDetailsCheckbox.checked===true) && ((!name && !phone) || (!(name.length>=0 && phone.length===10)))){
          showToast("Add costomer details or uncheck 'Ask Customer Details' to update bill without costomer deatils.",8000,true)
          return
        }

        window.print();
        //changing clear confirm overlay to clear after print
          cancelbtn.textContent='Bill Print Failed!';
          clearbtn.textContent='Bill Printed Successfully';
          //show clear confirm overlay
          document.getElementById('clearConfirmModal').style.display = 'flex';

          cancelbtn.addEventListener('click',hideconf);
          
          clearbtn.addEventListener('click', handleSuccess);
      

          
      } else {
        showToast('Please add items to PRINT BILL',3000,true);
      }        
}
  function handleSuccess(){
    console.log(sale)
    const subtotal = sale.at(-1).subtotal
    const tax = sale.at(-1).tax
    const grandtotal = sale.at(-1).total

    sale.forEach((sal)=>{
      sal.id=parseInt(sales.at(-1).id,10)+1
      const [ date, time ] = getDateTime();
      sal.date = date;
      sal.time = time;
      // subtotal,tax,grandtotal
      sal.subtotal=subtotal;
      sal.tax=tax;
      sal.grandtotal=grandtotal;
            // costomer details
      sal.name = name;
      sal.phone = phone;
    });

    // sending items to python to update inventory and sales
    eel.setInventory(items)();
    eel.addSales(sale);
    //hide clear confirm overlay
    confirmClear();
          
    console.log(sales);
    btnTextBack();
  }

// clear confirm function utilities

  function btnTextBack(){
    cancelbtn.textContent='No';
    clearbtn.textContent='Yes';
  }

  //hide clear confirm overlay
  function hideconf(bol){
      document.getElementById('clearConfirmModal').style.display = 'none';
      cancelbtn.removeEventListener('click',hideconf);
      clearbtn.removeEventListener('click',confirmClear);
      btnTextBack();
  }
  //handling clear bill
  function confirmClear(bol){

      document.getElementById('billing').innerHTML=`<tr>
                                                      <td>-</td>
                                                      <td>-</td>
                                                      <td>-</td>
                                                      <td>-</td>
                                                      <td>-</td>
                                                  </tr>`;
      subtotal.textContent=`₹0.00`;
      tax.textContent=`₹0.00`;
      total.textContent=`₹0.00`;
      qty={};
      isFirst=true;
      tot=0;
      sale=[];
      ask_save=false;
      hideconf();
      
  }

// clear btn function
function clearbill(fromprnt=false){

  //show clear confirm overlay
  document.getElementById('clearConfirmModal').style.display = 'flex';

  cancelbtn.addEventListener('click',hideconf);
  
  clearbtn.addEventListener('click', confirmClear);
  if (fromprnt===true){

  }
}

function renderMenu(){
  //adding inventory item to menu
  const menucont=document.getElementById('menu-container');
  let items_id=0;
  for (item of items){
    items_id+=1;
    avail=isNumber(item.availability) ? `(${item.availability})` : "";
    if(item.availability==='yes'||item.availability>0){
      const menu_item=`<div class="menu-item" data-itemid="${items_id}" >
                          <h3>${item.name}<span title="Availability">${avail}</span></h3>
                          <p>₹${item.price}</p>
                      </div>`;
      menucont.innerHTML+=menu_item;
    }
  }
}

function askDetails(resolve){
  
}


function customer_detail_menu() {
  const header = costumer_container.querySelector('.dropdown-header-pos');
  const content = costumer_container.querySelector('.dropdown-content-pos');
  const icon = costumer_container.querySelector('.dropdown-icon');
  const nameInput = costumer_container.querySelector('#customerName');
  const phoneInput = costumer_container.querySelector('#customerPhone');

  costumer_container.style.display= 'block'; 

  // toggle dropdown content
  let isExpanded = false;
  header.addEventListener('click', () => {
    isExpanded = !isExpanded;
    content.style.display = isExpanded ? 'block' : 'none';
    icon.textContent = isExpanded ? '▼' : '►';
  });

  // phone-only, max-10 digits
  phoneInput.addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '').slice(0, 10);
  });

  // blur logging
  nameInput.addEventListener('blur', (el)=>{
    if (el.target.value.length < 3) {
      alert('Name must be at least 3 characters long.');
    } else {
      console.log('Name:', el.target.value);
      name = el.target.value
      document.getElementById("pos-put-name").textContent=name;

    }
  });
  phoneInput.addEventListener('blur',  (el)=>{
    if ((parseInt(el.target.value,10)+"").length !== 10) {
      alert('Phone must contain only numbers without +91.');
    } else {
      console.log('Name:', parseInt(el.target.value.length,10));
      phone = el.target.value
    }
  });

  // initialize visibility on load
  costumer_container.style.display = askDetailsCheckbox.checked ? 'block' : 'none';

}


function callback_ask_details() {
  if (askDetailsCheckbox.checked) {
      customer_detail_menu();
      document.getElementById("purchasor-name").style.display='';

      // Code to show customer details form or modal
      console.log('Ask details checkbox checked - add your functionality here');
      // You can trigger a modal or expand a form section here
  } else {
      document.getElementById("purchasor-name").style.display='none';
      costumer_container.style.display = 'none'; // Hide the customer details form or modal
      // Code to hide customer details form or modal
      console.log('Ask details checkbox unchecked');
  }
}



  // MAIN FUNC CALLED AS ROOT
  let items;
  let sale = [];
  let qty = {};
  let isFirst = true;
  let tot = 0;

  // Elements for summary
  let summary;
  let subtotal;
  let tax;
  let total;
  let offer;

  // Clear confirmation buttons
  let cancelbtn;
  let clearbtn;

  let sales; 

  let first=true;

  let taxamt;

  let dt_el; //for date time element change handling

  let total_offer=0;

  let name,phone;

  async function globals_pos() {
      console.time("avil");
      taxamt = settings.base_tax;

      if (first===true){
        items = await eel.getInventory()();
        sales = await eel.getSales()();
        first=false;
      }
      // sales.at(-1).id;
      // console.log(sales.at(-1).id);
      // console.log(items);
      renderMenu();

      // Call this function after renderMenu() in your existing code
      addSearchFunctionality();

      document.getElementById('pos-bill-id').innerHTML=`#${sales.at(-1).id-0+1}`;

      costumer_container = document.querySelector('#customer-details-container');


      askDetailsCheckbox = document.getElementById('askDetailsCheckbox');
      askDetailsCheckbox.checked = settings.ask_customer_details;
      callback_ask_details()
      askDetailsCheckbox.addEventListener('change', callback_ask_details);


      // showing availability
      // document.querySelectorAll('.menu-item').forEach((ele) => availability(ele));

      // initialize summary elements
      summary = document.getElementById('bill-summary');
      subtotal = summary.querySelector('#subtotal');
      tax = summary.querySelector('#tax');
      total = summary.querySelector('#total');
      offer = summary.querySelector('#offer')

      // adding functionality to menu items
      document.querySelectorAll('.menu-item').forEach((ele) => ele.addEventListener('click', () => addItem(ele)));

      // for date and time
      dt_el=document.getElementById('date-time');
      updateDateTime(to);

      // handling print
      document.getElementById('print').addEventListener('click', printHandle);

      // clear confirm function utilities
      document.getElementById('clear').addEventListener('click', clearbill);
      console.timeEnd("avil");

  }


  // Add search functionality
function addSearchFunctionality() {
  // Wait for DOM to be fully loaded
  document.addEventListener('DOMContentLoaded', () => {
    initSearchFunctionality();
  });
  
  // If DOM is already loaded, initialize immediately
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initSearchFunctionality();
  }
}

function initSearchFunctionality() {
  // Get menu container
  const menuContainer = document.getElementById('menu-container');
  
  // If menu container doesn't exist yet, retry after a short delay
  if (!menuContainer) {
    console.log('Menu container not found, retrying in 500ms...');
    setTimeout(initSearchFunctionality, 500);
    return;
  }
  
  // Check if search is already added to avoid duplicates
  if (document.getElementById('menu-search')) {
    return;
  }
  
  // Create search input element
  const searchContainer = document.createElement('div');
  searchContainer.className = 'search-container';
  
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.id = 'menu-search';
  searchInput.placeholder = 'Search menu items...';
  searchInput.className = 'menu-search-input';
  
  // Create search icon (optional)
  const searchIcon = document.createElement('span');
  searchIcon.className = 'search-icon';
  searchIcon.innerHTML = '🔍';
  
  // Append elements
  searchContainer.appendChild(searchIcon);
  searchContainer.appendChild(searchInput);
  
  // Insert search before the menu items
  menuContainer.insertBefore(searchContainer, menuContainer.firstChild);
  
  // Add event listeners for search functionality
  searchInput.addEventListener('input', filterMenuItems);
  
  // Focus on search input when any key is pressed (if not already focused on an input)
  document.addEventListener('keydown', (e) => {
    // Don't trigger if user is already typing in an input or if it's a special key
    if (document.activeElement.tagName !== 'INPUT' && 
        !e.ctrlKey && !e.altKey && !e.metaKey && 
        e.key.length === 1) { // Only for printable characters
      searchInput.focus();
    }
  });
}

// Filter menu items based on search query
function filterMenuItems() {
  const searchQuery = document.getElementById('menu-search').value.toLowerCase();
  const menuItems = document.querySelectorAll('.menu-item');
  
  menuItems.forEach(item => {
    const itemName = item.querySelector('h3').textContent.toLowerCase();
    
    if (itemName.includes(searchQuery)) {
      item.style.display = ''; // Show the item
    } else {
      item.style.display = 'none'; // Hide the item
    }
  });
}



// You can call this function to clear the search
function clearSearch() {
  const searchInput = document.getElementById('menu-search');
  if (searchInput) {
    searchInput.value = '';
    filterMenuItems();
  }
}

// globals_pos(); //test calling this helps in csr