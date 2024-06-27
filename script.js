document.getElementById('csvFile').addEventListener('change', function(e) {
  var file = e.target.files[0];
  if (!file) return;

  var reader = new FileReader();
  reader.onload = function(e) {
      var contents = e.target.result;
      processData(contents); // Process CSV data
  };
  reader.readAsText(file);
});
function fetchCSV() {
  var csvUrl = 'https://raw.githubusercontent.com/asianstanley/TEST12345/main/GetDataFromXML.csv';
  fetch(csvUrl)
    .then(response => response.text())
    .then(data => processData(data))
    .catch(error => console.error('Error fetching the CSV file:', error));
}
function toggleMenu() {
  var menuPopup = document.getElementById('menuPopup');
  var menuOverlay = document.getElementById('menuOverlay');
  if (menuPopup.style.right === '0px') {
    menuPopup.style.right = '-300px';
    menuOverlay.style.display = 'none';
  } else {
    menuPopup.style.right = '0';
    menuOverlay.style.display = 'block';
  }
}

// Function to close the menu popup
function closeMenu() {
  document.getElementById('menuPopup').style.right = '-300px';
  document.getElementById('menuOverlay').style.display = 'none';
}

// Function to process CSV data
function processData(csvData) {
  var lines = csvData.split('\n');
  var data = [];
  var headers = lines[0].split(','); // Assuming headers are in the first line

  for (var i = 1; i < lines.length; i++) {
      var values = lines[i].split(',');
      if (values.length === headers.length) {
          var entry = {};
          for (var j = 0; j < headers.length; j++) {
              entry[headers[j].trim()] = values[j].trim();
          }
          data.push(entry);
      }
  }

  // Save data array to use for searching later
  window.csvData = data;
  window.csvHeaders = headers;
  console.log(window.csvData);  // Debugging: print the data to the console
}
window.onload = fetchCSV;
function exportCSV() {
  var table = document.getElementById('resultsTable');

  if (!table) {
      console.error('ไม่พบตารางที่มี id="resulttable"');
      return;
  }

  var csv = [];
  var rows = table.rows;

  for (var i = 0; i < rows.length; i++) { //rows.length คือจำนวนแถวในตาราง resultsTable.
      var row = []; //row เป็นอาร์เรย์ที่ใช้เพื่อเก็บข้อมูลแต่ละเซลล์ในแถวปัจจุบันของตาราง.
      var cells = rows[i].cells; //cells เป็นคอลเล็กชันของเซลล์ในแถวปัจจุบัน (rows[i]). 

      for (var j = 0; j < cells.length; j++) { //วนลูปผ่านเซลล์ในแต่ละแถว (cells):
          var cellText = cells[j].innerText.replace(/"/g, '""'); // cells[j].innerText คือข้อความที่อยู่ในเซลล์ที่ j ในแถวปัจจุบัน. replace(/"/g, '""') ใช้เพื่อแทนที่เครื่องหมาย " ด้วย "" เพื่อป้องกันการขัดแย้งกับตัวครอบข้อมูลใน CSV.
          row.push('"' + cellText + '"');//เพิ่มข้อความที่ผ่านการป้องกันแล้วเข้าไปในอาร์เรย์ row โดยใส่เครื่องหมายคำพูดครอบข้อมูล.
      }

      csv.push(row.join(','));//row.join(',') จะเชื่อมข้อมูลในอาร์เรย์ row เข้าด้วยกันโดยใช้เครื่องหมาย , เป็นตัวคั่น และเพิ่มแถว CSV ที่เกิดจากการเชื่อมข้อมูลนั้นลงในอาร์เรย์ csv.
  }

  var csvContent = csv.join('\n');
  var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  // สร้าง URL สำหรับ Blob object
  var url = URL.createObjectURL(blob);

  // สร้าง element <a> เพื่อลิงก์ไปยัง URL และทำการดาวน์โหลดไฟล์
  var a = document.createElement('a');
  a.href = url;
  a.download = 'resultsearch.csv';

  // เพิ่ม element <a> เข้าไปใน DOM แต่ยังไม่ทำการ append ไปยัง document.body
  // สามารถใช้ setTimeout เพื่อให้ browser มีเวลาในการเตรียมตัวสำหรับการดาวน์โหลด
  setTimeout(function() {
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  }, 100);
}
// Function to handle search button click
function searchICSCode() {
  var searchInput = document.getElementById('searchInput').value.trim().toLowerCase(); // แปลงค่าเป็นตัวพิมพ์เล็กทั้งหมด
  var resultsList = document.getElementById('resultsList');
  var resultsList2 = document.getElementById('resultsList2');
  var resultsTableBody = document.getElementById('resultsTable').getElementsByTagName('tbody')[0];
  
  resultsList.innerHTML = '';
  resultsList2.innerHTML = '';
  resultsTableBody.innerHTML = '';
  
  if (!window.csvData) {
      alert('No CSV data available.');
      return;
  }

  // Search for approximate matches in ICS Code, Part Name, and other details
  var foundIndexes = [];
  for (var i = 0; i < window.csvData.length; i++) {
      var matchFound = false;
      // Check ICS Code, Part Name, and other details for approximate match
      if (window.csvData[i]['ICS Code'].toLowerCase().includes(searchInput) ||
          window.csvData[i]['Part Name'].toLowerCase().includes(searchInput)) {
          foundIndexes.push(i);
          matchFound = true;
      } else {
          // Check each property for approximate match
          for (var prop in window.csvData[i]) {
              if (window.csvData[i].hasOwnProperty(prop)) {
                  var value = window.csvData[i][prop].toString().toLowerCase();
                  // Perform approximate match check
                  if (value.includes(searchInput)) {
                      foundIndexes.push(i);
                      matchFound = true;
                      break; // Once a match is found, no need to check further
                  }
              }
          }
      }
  }

  if (foundIndexes.length > 0) {
      // Display unique ICS Code and Part Name
      var uniqueResults = {}; // To store unique ICS Code and Part Name
      foundIndexes.forEach(function(index) {
          var icsCode = window.csvData[index]['ICS Code'];
          var partName = window.csvData[index]['Part Name'];
          if (!uniqueResults[icsCode]) {
              var option = document.createElement('option');
              option.text = icsCode;
              resultsList.add(option);
              uniqueResults[icsCode] = true;
          }
          if (!uniqueResults[partName]) {
              var option2 = document.createElement('option');
              option2.text = partName;
              resultsList2.add(option2);
              uniqueResults[partName] = true;
          }
      });

      // Display all Program Names and Line Nos that match the criteria
      foundIndexes.forEach(function(index) {
          var row = resultsTableBody.insertRow();
          var cell1 = row.insertCell(0);
          var cell2 = row.insertCell(1);
          var cell3 = row.insertCell(2);
          var cell4 = row.insertCell(3);
          var cell5 = row.insertCell(4);
          var cell6 = row.insertCell(5);
          var cell7 = row.insertCell(6);
          var cell8 = row.insertCell(7);
          cell1.textContent = window.csvData[index]['Program Name'];
          cell2.textContent = window.csvData[index]['Feeder Type'];
          cell3.textContent = window.csvData[index]['Machine No.'];
          cell4.textContent = window.csvData[index]['Line No.'];
          cell5.textContent = window.csvData[index]['ICS Code'];
          cell6.textContent = window.csvData[index]['Part Name'];
          cell7.textContent = window.csvData[index]['No. Points'];
          cell8.textContent = window.csvData[index]['Position'];
      });

  } else {
      alert('No matching data found.');
  }
}
function copySelectedOptions(selectId) {
  var select = document.getElementById(selectId);
  var selectedOptions = Array.from(select.selectedOptions).map(option => option.text).join('\n');
  var textarea = document.createElement('textarea');
  textarea.value = selectedOptions;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
  alert('Copied to clipboard: \n' + selectedOptions);
}
function inserttable() {
    // Get search input value
    var searchInput = document.getElementById('searchInput').value.trim().toLowerCase(); // Convert to lowercase
    
    // Search for matching data
    var foundIndexes = [];
    if (window.csvData) {
      for (var i = 0; i < window.csvData.length; i++) {
        var matchFound = false;
        // Check ICS Code, Part Name, and other details for approximate match
        if (window.csvData[i]['ICS Code'].toLowerCase().includes(searchInput) ||
            window.csvData[i]['Part Name'].toLowerCase().includes(searchInput)) {
          foundIndexes.push(i);
          matchFound = true;
        } else {
          // Check each property for approximate match
          for (var prop in window.csvData[i]) {
            if (window.csvData[i].hasOwnProperty(prop)) {
              var value = window.csvData[i][prop].toString().toLowerCase();
              // Perform approximate match check
              if (value.includes(searchInput)) {
                foundIndexes.push(i);
                matchFound = true;
                break; // Once a match is found, no need to check further
              }
            }
          }
        }
      }
    }
  
    // If no matching data found, alert and return
    if (foundIndexes.length === 0) {
      alert('No matching data found.');
      return;
    }
    
    // Get the tbody of the results table
    var tableBody = document.getElementById('resultsTable').getElementsByTagName('tbody')[0];
    
    // Display all matching data in the table without clearing existing rows
    foundIndexes.forEach(function(index) {
      var newRow = tableBody.insertRow();
      var cell1 = newRow.insertCell(0);
      var cell2 = newRow.insertCell(1);
      var cell3 = newRow.insertCell(2);
      var cell4 = newRow.insertCell(3);
      var cell5 = newRow.insertCell(4);
      var cell6 = newRow.insertCell(5);
      var cell7 = newRow.insertCell(6);
      var cell8 = newRow.insertCell(7);

      cell1.textContent = window.csvData[index]['Program Name'];
      cell2.textContent = window.csvData[index]['Feeder Type'];
      cell3.textContent = window.csvData[index]['Machine No.'];
      cell4.textContent = window.csvData[index]['Line No.'];
      cell5.textContent = window.csvData[index]['ICS Code'];
      cell6.textContent = window.csvData[index]['Part Name'];
      cell7.textContent = window.csvData[index]['No. Points'];
      cell8.textContent = window.csvData[index]['Position'];
      
      var icsCode = window.csvData[index]['ICS Code'];
      if (!resultsList.querySelector('option[value="' + icsCode + '"]')) {
        var option = document.createElement('option');
        option.value = icsCode;
        option.textContent = icsCode;
        resultsList.appendChild(option);
      }
      
      // Insert into resultsList2 (Part Name)
      var partName = window.csvData[index]['Part Name'];
      if (!resultsList2.querySelector('option[value="' + partName + '"]')) {
        var option2 = document.createElement('option');
        option2.value = partName;
        option2.textContent = partName;
        resultsList2.appendChild(option2);
      }
    });
  
    // Optional: Scroll to the newly added row (if needed)
    if (tableBody.rows.length > 0) {
      tableBody.rows[tableBody.rows.length - 1].scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
    }
  
    // Optional: Display success message (if needed)
    alert('Data inserted successfully.');
  }
  
 
