// to add offer elim add , "offer_on_items": false in settings; todo
let del_prev;
let file;


function handleFileChange(event, type) {
    const file = event.target.files[0];
    if (file) {
      console.log(type + " file selected:", file.name);
      // Handle file upload or any processing here
    }
  }
function getfile(){
  const inputel=document.createElement("input");
  inputel.type='file';
  inputel.style.opacity="0";
  inputel.click()
}

function settings_globals(){

  // Toggle askDetails on items
  const askDetailsToggle = document.getElementById('ask-details');
  askDetailsToggle.checked=settings.ask_customer_details;
  askDetailsToggle.addEventListener('change', function() {
    settings.ask_customer_details=askDetailsToggle.checked;
  });

  // // Toggle offer on items
  // const offerItemsToggle = document.getElementById('item-offer');
  // offerItemsToggle.checked=settings.offer_on_items;
  // offerItemsToggle.addEventListener('change', function() {
  //   settings.offer_on_items=offerItemsToggle.checked;
  // });

  // Base tax input handling
  const baseTaxInput = document.getElementById('base-tax');
  baseTaxInput.value=settings.base_tax;
  baseTaxInput.addEventListener('change', function() {
      settings.base_tax=this.value;
  });

  // Toggle tax on items
  const taxOnItemsToggle = document.getElementById('tax-on-items');
  taxOnItemsToggle.checked=settings.tax_on_every;
  taxOnItemsToggle.addEventListener('change', function() {
    settings.tax_on_every=taxOnItemsToggle.checked;
  });

  // File path click handlers
  const invenpath=document.getElementById('inventory-path')
  invenpath.querySelector("#inventoryloc").textContent=settings.inventory_direct;
  invenpath.addEventListener('click', function() {
      eel.openData("inventory");
      // In a real implementation, this would open the file manager
      showToast('Opening inventory');
  });

  const salespath=document.getElementById('sales-path')
  salespath.querySelector("#salesloc").textContent=settings.sales_direct;

  salespath.addEventListener('click', function() {
      eel.openData("sales");
      // In a real implementation, this would open the file manager
      showToast('Opening sales');
  });

  // toggle for uploads
  const uploadToggle = document.getElementById('del_prev');
  uploadToggle.addEventListener('change', function() {
      del_prev=this.checked;
      console.log('del upload toggled:', this.checked);
  });

  // upload buttons
  document.getElementById('upload-inventory').addEventListener('click', function() {
      render_sample(items);
      showToast("Make sure that your csv have exactly same heading as this",10000)

      // In a real implementation, this would trigger the upload
      // alert('Inventory.csv upload started');
  });

  document.getElementById('upload-sales').addEventListener('click', function() {
      render_sample(sales);
      showToast("Make sure that your csv have exactly same heading as this",10000)
      // In a real implementation, this would trigger the upload
      // alert('Sales.csv upload started');
  });

  // Download buttons
  document.getElementById('download-inventory').addEventListener('click', function() {
      console.log('Downloading inventory.csv');
      eel.serve("inventory.csv","False")().then((content)=>{
        console.log(content)
        download(content,"1");
      });

  });

  document.getElementById('download-sales').addEventListener('click', function() {
      console.log('Downloading sales.csv');
      eel.serve("sales.csv","False")().then((content)=>{
        console.log(content)
        download(content,"2");
      });
  });

  // Save settings
  document.getElementById('save-settings').addEventListener('click', function() {
    eel.setSettings(settings)().then(()=>showToast("Settings Saved Successfully!"));
    if (file){
      try{
        const reader = new FileReader();
        reader.onload = function(e) {
          const csvText = e.target.result;

          eel.process_csv("inventory",csvText,del_prev?"True":"False")().then((rtn)=>showToast(JSON.stringify(rtn)))
        };
        reader.readAsText(file);
        showToast("Data Upload Saved Successfully!")
        
      } catch(e){
        showToast("Error: "+e);
        console.error(e);
      }
    }
      });

}

function download(content,to){
  const name= to=="1"?"inventory.csv":"sales.csv";

  // Create a Blob from the content
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });

  // Create a temporary anchor element
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", name); // name of the file to download
  link.style.visibility = 'hidden';
  document.body.appendChild(link);

  // Trigger the download
  link.click();

  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

 function render_sample(sample) {
    // ───── Pagination state ─────
    let currentPage    = 1;
    const itemsPerPage = 5;
    const totalPages   = Math.ceil(sample.length / itemsPerPage);

    // ───── Create & show overlay ─────
    const overlay = document.createElement('div');
    overlay.className   = 'table-overlay';
    overlay.style.display = 'block';
    document.body.appendChild(overlay);

    // ───── Show the table window ─────
    const tableWindow = document.querySelector('.table-window');
    tableWindow.style.display = 'block';

    // ───── Build dynamic header ─────
    const headerRow = document.getElementById('table-header');
    headerRow.innerHTML = ''; 
    if (sample.length > 0) {
      Object.keys(sample[0]).forEach(key => {
        const th = document.createElement('th');
        // Capitalize header text
        th.textContent = key.charAt(0).toUpperCase() + key.slice(1);
        headerRow.appendChild(th);
      });
    }

    // ───── Helper to render the current page ─────
    function renderPage() {
      const start    = (currentPage - 1) * itemsPerPage;
      const pageData = sample.slice(start, start + itemsPerPage);
      const tbody    = document.querySelector('#transactionData');
      tbody.innerHTML = '';

      if (!pageData.length) {
        tbody.innerHTML = `<tr>
          <td colspan="${Object.keys(sample[0]||{}).length}" style="text-align:center">
            No records
          </td>
        </tr>`;
      } else {
        pageData.forEach(tx => {
          const row = document.createElement('tr');

          Object.entries(tx).forEach(([key, val]) => {
            const td = document.createElement('td');
            if (key === 'status' && typeof val === 'string') {
              const span = document.createElement('span');
              span.className = `status-badge status-${val}`;
              span.textContent = val;
              td.appendChild(span);
            } else {
              td.textContent = val;
            }
            row.appendChild(td);
          });

          tbody.appendChild(row);
        });
      }

      // Update pager UI
      document.querySelector('#pageInfo').textContent =
        `Page ${currentPage} of ${totalPages}`;
      document.querySelector('#prevPage').disabled = currentPage === 1;
      document.querySelector('#nextPage').disabled = currentPage === totalPages;
    }

    // ───── Initial draw ─────
    renderPage();

    // ───── Button handlers ─────
    document.querySelector('#prevPage').addEventListener('click', () => {
      if (currentPage > 1) { currentPage--; renderPage(); }
    });
    document.querySelector('#nextPage').addEventListener('click', () => {
      if (currentPage < totalPages) { currentPage++; renderPage(); }
    });
    document.querySelector('.btn-refresh').addEventListener('click', () => {
      const tbody = document.querySelector('#transactionData');
      tbody.style.opacity = '0.5';
      setTimeout(() => {
        renderPage();
        tbody.style.opacity = '1';
      }, 500);
    });
    document.querySelector(".table-overlay").addEventListener("click",()=>{
      tableWindow.style.display = 'none';
      overlay.style.display     = 'none';
    })
    document.querySelector('.btn-close').addEventListener('change', () => {
      tableWindow.style.display = 'none';
      overlay.style.display     = 'none';
      const dispel=document.querySelector("#selected-file")
      dispel.style.display="unset";
      dispel.innerHTML="Selected File: "+"<b>"+event.target.files[0].name+"</b>"
      console.log(event.target.files[0]);
      file=event.target.files[0];



    }, { once: true });
}


// Show the window by default for demo purposes
// showTableWindow();