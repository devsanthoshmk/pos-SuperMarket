function showToast(message,duration = 3000,danger=false) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  // Pass duration to CSS animation (for fadeOut delay)
  toast.style.setProperty('--duration', duration + 'ms');
  if (danger===true){
    toast.style.backgroundColor = "var(--danger)";
  }

  container.appendChild(toast);

  // Remove the toast element after it has fully faded out
  setTimeout(() => {
    container.removeChild(toast);
  }, duration + 500); // duration + fadeOut time
}

// Render inventory table
function renderInventory() {
    // Clear existing rows
    inventoryList.innerHTML = '';
    
    // Add rows for each inventory item
    inventoryData.forEach((item, index) => {
        const row = document.createElement('tr');
        
        // Name cell
        const nameCell = document.createElement('td');
        const nameEditable = document.createElement('div');
        nameEditable.className = 'editable';
        nameEditable.contentEditable = true;
        nameEditable.textContent = item.name;
        nameEditable.dataset.index = index;
        nameEditable.dataset.field = 'name';
        nameEditable.addEventListener('blur', updateInventoryItem);
        nameCell.appendChild(nameEditable);
        
        // Availability cell
        const availabilityCell = document.createElement('td');
        const availabilityEditable = document.createElement('div');
        availabilityEditable.className = 'editable';
        availabilityEditable.contentEditable = true;
        availabilityEditable.textContent = item.availability;
        availabilityEditable.dataset.index = index;
        availabilityEditable.dataset.field = 'availability';
        availabilityEditable.addEventListener('blur', updateInventoryItem);
        availabilityCell.appendChild(availabilityEditable);
        
        // Price cell
        const priceCell = document.createElement('td');
        const priceEditable = document.createElement('div');
        priceEditable.className = 'editable';
        priceEditable.contentEditable = true;
        priceEditable.textContent = item.price;
        priceEditable.dataset.index = index;
        priceEditable.dataset.field = 'price';
        priceEditable.addEventListener('blur', updateInventoryItem);
        priceCell.appendChild(priceEditable);
        
        // Actions cell
        const actionsCell = document.createElement('td');
        actionsCell.className = 'actions-cell';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-delete';
        deleteBtn.textContent = 'Delete';
        deleteBtn.dataset.index = index;
        deleteBtn.addEventListener('click', deleteInventoryItem);
        
        actionsCell.appendChild(deleteBtn);
        
        // Append cells to row
        row.appendChild(nameCell);
        row.appendChild(availabilityCell);
        row.appendChild(priceCell);
        row.appendChild(actionsCell);
        
        // Append row to table
        inventoryList.appendChild(row);
    });
}

// Update inventory item when edited
function updateInventoryItem(event) {
    ask_save=true;
    const index = parseInt(event.target.dataset.index);
    const field = event.target.dataset.field;
    const value = event.target.textContent.trim();
    
    // Update the data
    inventoryData[index][field] = field === 'price' ? parseFloat(value) || 0 : value;
    
    if (to_edit[index]===true && inventoryData[index]['name']!=="Tap to edit" && inventoryData[index]['price']!==0){
        to_edit[index]===false;
        delete to_edit[index];
    }    
}

// Delete inventory item
function deleteInventoryItem(event) {
    ask_save=true;
    const index = parseInt(event.target.dataset.index);
    
    // Log the deletion
    console.log(`Deleted item: ${inventoryData[index].name}`);
    
    // Remove from array
    inventoryData.splice(index, 1);
    
    // Re-render the table
    renderInventory();
}

// Add new inventory item
function addInventoryItem() {
    // Add new blank item
    inventoryData.push({
        name: "Tap to edit",
        availability: "yes",
        price: 0
    });

    to_edit[inventoryData.length-1]=true;

    // Log the addition
    console.log("Added new row to inventory");
    
    // Re-render the table
    renderInventory();
    
    // Scroll to bottom to see new item
    inventoryList.parentElement.parentElement.scrollTop = inventoryList.parentElement.parentElement.scrollHeight;
}

function cancelit(){
    overlay.style.display = 'none';
    cancelbtn.removeEventListener('click',cancelit)
}

function confirmSave(){
    Object.keys(to_edit).forEach(dind=>{
        if (to_edit[dind]===true){
            inventoryData.splice(dind,1);
        }
    })
    items = structuredClone(inventoryData)
    eel.setInventory(items);
    showToast('Changes Saved!', 3000)
    if(overlay){
        overlay.style.display = 'none';
        clearbtn.removeEventListener('click',cancelit)
    }
}

//asking wheather they are confirm to save?
function saving(notyet=false){
    
    const title = overlay.querySelector('h3');
    const message = overlay.querySelector('p');
    // already defined in pos
    // const cancelBtn = overlay.querySelector('#cancelClear');
    // const confirmBtn = overlay.querySelector('#confirmClear');

    overlay.style.display = 'flex';

    const not = notyet?"DONN'T":""

    title.textContent= "Confirm Save";
    message.innerHTML= `Are you sure you ${not} want to save those changes?${not?"":"<br>(Press ctrl/cmd+s to save directly)"}<br>P.S: This is irreversible!`;

    if (notyet===false){
        cancelbtn.addEventListener('click',cancelit)
        clearbtn.addEventListener('click',confirmSave)
    }

}


let inventoryData; // for cloning inventoory data
let inventoryList, savebtn, addItemBtn, overlay; //for global dom elements
const to_edit={}; //used to check is there are any empty row created


function globals_inventory(){

    // Initialize inventory data
    inventoryData = structuredClone(items); 


    dt_el=document.getElementById("date-time");
    updateDateTime(to);

      
    // console.log(items);
     // DOM elements
    inventoryList = document.getElementById('inventoryList');
    addItemBtn = document.getElementById('addItemBtn');
    savebtn = document.getElementById('savebtn')

    // Event listeners
    addItemBtn.addEventListener('click', addInventoryItem);

    
    savebtn.onclick = function(){
        // conform clear overlay
        saving()

    }

    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault(); // Prevent browser's save dialog
        confirmSave()
      }
    });


    // Initial render
    renderInventory();

}