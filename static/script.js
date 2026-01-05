$(document).ready(function() {
    // Initialize Nepali Datepicker
    $('.nepali-datepicker').nepaliDatePicker({
      dateFormat: 'YYYY-MM-DD',  // Set the desired date format
      disableDaysBefore: 0, 
      disableDaysAfter: 7  
    });
  });

//   $(document).ready(function() {
//     $("#id_vehicle_number").hide();

//     // Toggle the visibility on checkbox change
//     $(".toggle-vehicle").change(function() {
//         if (this.checked) {
//             $("#id_vehicle_number").fadeIn();  // Show the field
//         } else {
//             $("#id_vehicle_number").fadeOut();  // Hide the field
//         }
//     });
// });

//   $(document).ready(function() {
//     $(".toggle-vehicle").change(function() {
//         if (this.checked) {
//             $("#id_vehicle_number").show();  // Show the field
//         } else {
//             $("#id_vehicle_number").hide();  // Hide the field
//         }
//     });
// });

document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.getElementById("id_date");
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().slice(0, 10); // Extract and format current date

    dateInput.setAttribute("data-date-start-date", formattedDate);

    
  });

  document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("export-button").addEventListener("click", function () {
        // Collect the selected filter values
        const statusFilter = document.getElementById("current_status-filter").value;
        const officeFilter = document.getElementById("group-filter").value;

        // Send the filter values to the server via an AJAX request
        const xhr = new XMLHttpRequest();
        xhr.open("GET", `/export-to-excel/?status=${statusFilter}&office=${officeFilter}`, true);
        xhr.responseType = "blob"; // To receive a binary response
        xhr.onload = function () {
            if (this.status === 200) {
                const blob = new Blob([this.response], { type: "application/ms-excel" });
                const link = document.createElement("a");
                link.href = window.URL.createObjectURL(blob);
                link.download = "exported_data.xlsx";
                link.click();
            }
        };
        xhr.send();
    });
});

 // Function to format date as "YYYY-MM-DD"
 function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
//     document.addEventListener('DOMContentLoaded', function () {
//       const current_bs_date = NepaliFunctions.GetCurrentBsDate('YYYY-MM-DD');
//       const searchInput = document.getElementById('searchInput');
//       const tableBody = document.querySelector('table tbody');
//       const rows = tableBody.getElementsByTagName('tr');
  
//       searchInput.addEventListener('input', function () {
//         const searchText = searchInput.value.toLowerCase();
  
//         for (const row of rows) {
//           let found = false;
//           const cells = row.getElementsByTagName('td');
  
//           for (const cell of cells) {
//             if (cell.textContent.toLowerCase().includes(searchText)) {
//               found = true;
//               break;
//             }
//           }
  
//           row.style.display = found ? '' : 'none';
//         }
//       });
      
//       function getCookie(name) {
//         var value = "; " + document.cookie;
//         var parts = value.split("; " + name + "=");
//         if (parts.length === 2) return parts.pop().split(";").shift();
//     }
  
//     // Function to set the button state
//     function setButtonState($button, status) {
//       const buttonText = {
//           'Pass Issued': 'Enter',
//           'Entered': 'Entered',
//           'Exited': 'Exited',
//       };
  
//       const text = buttonText[status];
//       $button.text(text);
//   }
  
//   // function setButtonState($button, status) {
//   //   const iconMappings = {
//   //       'Pass Issued': '<i class="fas fa-check-circle fa-lg"></i>',
//   //       'Entered': '<i class="fas fa-times-circle fa-lg"></i>',
//   //       'Exited': '<i class="fas fa-minus-circle fa-lg"></i>',
//   //   };
  
//   //   const icon = iconMappings[status];
//   //   $button.html(icon);
//   // }
  
//   // Function to handle button click
//   function handleButtonClick($button, $statusCell, $entryTimeCell, $exitTimeCell, $row, primaryKey, status) {
//     const buttonText = {
//       'Pass Issued': 'Enter',
//       'Entered': 'Entered',
//       'Exited': 'Exited',
//     };

//     const nextStatus = {
//       'Enter': 'Entered',
//       'Entered': 'Exited',
//       'Exited': 'Pass Issued',
//     };
//     const nextButtonText = buttonText[nextStatus[status]];
//     $button.text(nextButtonText);
//     if (nextButtonText === 'Exited') {
//       $button.prop('disabled', true);
//   }



  

    
//     const storedColor = localStorage.getItem(`${primaryKey}_color`) || 'blue'; // Default to blue
//     if (status === 'Exited') {
//         // Prevent button click when the status is "Exited"
//         console.log('Button click prevented because the status is "Exited"');
//         return;
//     }
  
//     const now = new Date(); // Get the current time
  
  
//     if (status === 'Pass Issued') {
//         console.log('Changing to "Entered" state with a green icon');
//         setButtonState($button, 'Entered', 'green');
//         $statusCell.text('Entered');
//         status = 'Entered';
//         $row.removeClass('gate-pass').addClass('entered');
//         $button.css('color', 'green'); // Set the color to green
  
//     } else if (status === 'Entered') {
//         console.log('Changing to "Exited" state with a red icon');
//         setButtonState($button, 'Exited', 'red');
//         $statusCell.text('Exited');
//         status = 'Exited';
//         $row.removeClass('entered').addClass('exited');
//         $button.css('color', 'red'); // Set the color to red
       
//     } else {
//         console.log('Changing back to "Pass Issued" state with a blue icon');
//         setButtonState($button, 'Pass Issued', 'blue');
//         $statusCell.text('Pass Issued');
//         status = 'Pass Issued';
//         $row.removeClass('exited').addClass('gate-pass');
//         $button.css('color', 'blue'); // Set the color to blue
  
//     }
  
//     console.log('Final Current Status:', status);
  
//     localStorage.setItem(primaryKey, status);
//     localStorage.setItem(`${primaryKey}_color`, $button.css('color'));


//     ///////////////////////////////
//     // Check if the status is "Entered" and it has been 24 hours
//   if (status === 'Entered') {
//     const entryTimeString = $entryTimeCell.text();
//     const entryTime = new Date(entryTimeString);
//     const timeDifference = now - entryTime;
    

//     // If 24 hours have passed, change the status to "Exited" and record exit time
//     if (timeDifference >= 2 * 60 * 1000) {
//       setButtonState($button, 'Exited', 'red');
//       $statusCell.text('Exited');
//       status = 'Exited';
//       $row.removeClass('entered').addClass('exited');
//       $button.css('color', 'red'); // Set the color to red

//       // Record and display the exit time
//       const exitTimeString = now.toLocaleTimeString();
//       $exitTimeCell.text(exitTimeString);

//       // Save the updated status and exit time in local storage
//       localStorage.setItem(primaryKey, status);
//       localStorage.setItem(`${primaryKey}_color`, $button.css('color'));
//       // localStorage.setItem(`${primaryKey}_exit_time`, exitTimeString);

//       // Update the server with the new status and exit time via AJAX request
//       updateServerStatus(primaryKey, status);
//     }
//   }
  
//   //////////////////////////////////////////////////////
  
//     // $.ajax({
//     //     url: '/update_status/',  // URL endpoint to handle the status update
//     //     method: 'POST',
//     //     data: {
//     //         'primary_key': primaryKey,
//     //         'new_status': status
//     //     },
//     //     headers: {
//     //         'X-CSRFToken': getCookie('csrftoken')
//     //     },
//     //     success: function (response) {
//     //         // Handle the response from the server if needed
//     //     },
//     //     error: function (error) {
//     //         console.error('Error:', error);
//     //     }
//     // });
    

    
//   }

//   /////////
//   // Function to update server with the new status and exit time
// function updateServerStatus(primaryKey, status) {
//   $.ajax({
//     url: '/update_status/',  // Replace with your server endpoint
//     method: 'POST',
//     data: {
//       'primary_key': primaryKey,
//       'new_status': status,
//       'exit_time': exitTime
//     },
//     headers: {
//       'X-CSRFToken': getCookie('csrftoken')
//     },
//     success: function (response) {
//       // Handle the response from the server if needed
//     },
//     error: function (error) {
//       console.error('Error:', error);
//     }
//   });
// }


  
//   // Function to update entry and exit times
//   function updateEntryExitTimes($row, status) {
//     const $entryTimeCell = $row.find('.entry-time');
//     const $exitTimeCell = $row.find('.exit-time');
  
//     if (status === 'Entered') {
//       const entryTime = new Date();
//       $entryTimeCell.text(entryTime.toLocaleString());
//     } else if (status === 'Exited') {
//       if ($entryTimeCell.text() === '') {
//         // Only set exit time if entry time is available
//         $exitTimeCell.text('');
//       } else {
//         const exitTime = new Date();
//         $exitTimeCell.text(exitTime.toLocaleString());
//       }
//     } else {
//       $entryTimeCell.text(''); // Clear entry time
//       $exitTimeCell.text(''); // Clear exit time
//     }
//   }
  
  
//   // Function to calculate and update the duration of stay
//   function updateDurationOfStay($row) {
//     const $entryTime = $row.find('.entry-time');
//     const $exitTime = $row.find('.exit-time');
//     const $durationElement = $row.find('.duration-of-stay');
  
//     const entryTimeString = $entryTime.text();
//     const exitTimeString = $exitTime.text();
  
//     if (entryTimeString && exitTimeString) {
//       const entryTime = new Date(entryTimeString);
//       const exitTime = new Date(exitTimeString);
//       const duration = calculateDuration(entryTime, exitTime);
  
//       $durationElement.text(duration);
//     } else {
//       $durationElement.text('N/A'); // Display "N/A" if entry or exit time is missing
//     }
// }

// function calculateDuration(entryTime, exitTime) {
//     const durationMs = exitTime - entryTime;

//     // Convert milliseconds into hours
//     const hours = Math.ceil(durationMs / (1000 * 60 * 60));

//     return `${hours} hours`;
// }



  
  
// $('.status-button').each(function () {
//   console.log('INSIDE script.js');

//   const $button = $(this);
//   const $statusCell = $button.closest('tr').find('.status');

//   const status = $statusCell.data('status');
//   // if (status === 'Pass Issued') {
//   //   $button.css('background-color', 'blue');
//   // } else if (status === 'Entered') {
//   //   $button.css('background-color', 'green');
//   // } else if (status === 'Exited') {
//   //   $button.css('background-color', 'red');
//   // }
//   const $row = $button.closest('tr');
//   const primaryKey = $row.find('.primary-key').data('primary-key');

//   // Define $entryTimeCell and $exitTimeCell here
//   const $entryTimeCell = $row.find('.entry-time');
//   const $exitTimeCell = $row.find('.exit-time');

//   // Additional code to get the item date
//   const itemDateText = $row.find('.date').text();
//   const itemDateParts = itemDateText.split('-');
//   const itemDate = new Date(`${itemDateParts[0]}-${itemDateParts[1]}-${itemDateParts[2]}`);
//   const formattedItemDate = formatDate(itemDate);
//   console.log('formattedItemDate',formattedItemDate);
//   console.log('current_bs_date',current_bs_date);


//   const savedStatus = localStorage.getItem(primaryKey);

//   if (savedStatus) {
//       // Use the saved status if available
//       setButtonState($button, savedStatus, savedStatus === 'Exited' ? 'red' : (savedStatus === 'Entered' ? 'green' : 'blue'));
//       $statusCell.text(savedStatus);
//       $row.removeClass('gate-pass entered exited').addClass(savedStatus.toLowerCase());

//       // Display entry and exit times if available
//       updateEntryExitTimes($row, savedStatus);

//       // Retrieve stored button styling
//       const storedButtonStyle = JSON.parse(localStorage.getItem(`${primaryKey}_button_style`));
//       if (storedButtonStyle) {
//           $button.css(storedButtonStyle);
//       }
//   }

//   const storedColor = localStorage.getItem(`${primaryKey}_color`);
//   if (storedColor) {
//       $button.css('color', storedColor);
//   }

//   if (savedStatus !== 'Exited') {
//       $button.click(function () {
//           handleButtonClick($button, $statusCell, $entryTimeCell, $exitTimeCell, $row, primaryKey, status);
//           updateDurationOfStay($row);
//       });
//   }
// });

  
//   // Initial update of duration of stay
//   $('table tbody tr').each(function () {
//     const $row = $(this);
//     updateDurationOfStay($row);
//   });
  
  
//     });

    $(document).ready(function() {
      $('.detail-button').on('click', function(event) {
        event.preventDefault();
        // Get the item ID from the data attribute
        const itemId = $(this).data('item-id');
        // Trigger the modal to show
        $(`#detailsModal${itemId}`).modal('show');
      });
    
      $('.close-modal').on('click', function() {
        // Get the item ID from the modal ID
        const itemId = $(this).closest('.modal').attr('id').replace('detailsModal', '');
        // Trigger the modal to close
        $(`#detailsModal${itemId}`).modal('hide');
      });
        
      });

      $(document).ready(function() {
        $(".delete-item").click(function() {
          var itemId = $(this).data("item-id");
          var $row = $(this).closest("tr");
    
          // Show a confirmation dialog
          var confirmDelete = confirm("Are you sure you want to delete this item?");
          
          if (confirmDelete) {
            // User clicked OK in the confirmation dialog
            $.ajax({
              url: '/delete-form/' + itemId + '/',  // Replace with your delete view URL
              method: 'DELETE',
              headers: {
                'X-CSRFToken': getCookie('csrftoken')
              },
              success: function() {
                // Remove the row from the table on success
                $row.remove();
              },
              error: function(error) {
                console.error('Error:', error);
              }
            });
          }
        });
    
        function getCookie(name) {
          var value = "; " + document.cookie;
          var parts = value.split("; " + name + "=");
          if (parts.length === 2) return parts.pop().split(";").shift();
        }
      });

      document.addEventListener('DOMContentLoaded', function () {
        const rows = document.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
          if (row.classList.contains('exited')) {
            const entryTime = row.querySelector('.entry-date').textContent;
            const exitTime = row.querySelector('.exit-time').textContent;
            
            if (entryTime && exitTime) {
              const entryTimestamp = new Date(entryTime).getTime();
              const exitTimestamp = new Date(exitTime).getTime();
              const timeDifference = (exitTimestamp - entryTimestamp) / 1000; // Time difference in seconds
              const timeSpentCell = row.querySelector('.time-spent');
              timeSpentCell.textContent = formatTimeDifference(timeDifference);
            }
          }
    
           // Convert Gregorian date to Nepali date
           const dateCell = row.querySelector('.date');
           const gregorianDate = new Date(dateCell.textContent);
           const nepaliDate = NepaliFunctions.ad2bs(gregorianDate.getFullYear(), gregorianDate.getMonth() + 1, gregorianDate.getDate());
           const nepaliDateString = `${nepaliDate.bsYear}/${nepaliDate.bsMonth}/${nepaliDate.bsDate}`;
           dateCell.textContent = nepaliDateString;
    
    
        });
      });

      $(document).ready(function() {
        $('#group-filter').on('change', function() {
          var selectedGroup = $(this).val();
          if (selectedGroup === 'all') {
            // Show all rows if "all" is selected
            $('table tbody tr').show();
          } else {
              // Hide rows that don't match the selected group
            $('table tbody tr').each(function() {
              var itemGroup = $(this).find('.group').text(); // Get the group from the table cell
              if (itemGroup === selectedGroup) {
                $(this).show();
              } else {
                $(this).hide();
              }
            });
          }
        });
       
        $('#current_status-filter').on('change', function () {
          var selectedStatus = $(this).val();
          if (selectedStatus === 'all') {
            // Show all rows if "all" is selected
            $('table tbody tr').show();
          } else {
            // Hide rows that don't match the selected status
            $('table tbody tr').each(function () {
              var itemStatus = $(this).find('.status').text();
              if (itemStatus === selectedStatus) {
                $(this).show();
              } else {
                $(this).hide();
              }
            });
          }
        });
      });


      // display.css ***END


        //     $button.click(function () {
        //      handleButtonClick($button, $statusCell, $entryTimeCell, $exitTimeCell, $row, primaryKey, status);
        //      updateDurationOfStay($row);
        //  });
  
          //Check if the current_bs_date is same as item.date
           if (current_bs_date == formattedItemDate){
            $button.click(function (){
              handleButtonClick($button, $statusCell, $entryTimeCell, $exitTimeCell, $row, primaryKey, status);
              updateDurationOfStay($row);
  
             });
           } 
           else{

            $button.attr('disabled', true); // Disable the button
            $button.css('cursor', 'not-allowed'); // Change cursor style
            $button.attr('title', 'Status can only be updated on the specified date.'); // Display a tooltip
  
           }
  
