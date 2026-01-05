document.addEventListener('DOMContentLoaded', function () {
    const current_bs_date = NepaliFunctions.GetCurrentBsDate('YYYY-MM-DD');
    const searchInput = document.getElementById('searchInput');
    const tableBody = document.querySelector('table tbody');
    const rows = tableBody.getElementsByTagName('tr');

    searchInput.addEventListener('input', function () {
      const searchText = searchInput.value.toLowerCase();

      for (const row of rows) {
        let found = false;
        const cells = row.getElementsByTagName('td');

        for (const cell of cells) {
          if (cell.textContent.toLowerCase().includes(searchText)) {
            found = true;
            break;
          }
        }

        row.style.display = found ? '' : 'none';
      }
    });
    
    function getCookie(name) {
      var value = "; " + document.cookie;
      var parts = value.split("; " + name + "=");
      if (parts.length === 2) return parts.pop().split(";").shift();
  }

  // Function to set the button state
  function setButtonState($button, status) {
    const buttonText = {
        'Pass Issued': 'Enter',
        'Entered': 'Entered',
        'Exited': 'Exited',
    };

    const text = buttonText[status];
    $button.text(text);
}

// function setButtonState($button, status) {
//   const iconMappings = {
//       'Pass Issued': '<i class="fas fa-check-circle fa-lg"></i>',
//       'Entered': '<i class="fas fa-times-circle fa-lg"></i>',
//       'Exited': '<i class="fas fa-minus-circle fa-lg"></i>',
//   };

//   const icon = iconMappings[status];
//   $button.html(icon);
// }

// Function to handle button click
function handleButtonClick($button, $statusCell, $entryTimeCell, $exitTimeCell, $row, primaryKey, status) {
  const buttonText = {
    'Pass Issued': 'Enter',
    'Entered': 'Entered',
    'Exited': 'Exited',
  };

  const nextStatus = {
    'Enter': 'Entered',
    'Entered': 'Exited',
    'Exited': 'Pass Issued',
  };
  const nextButtonText = buttonText[nextStatus[status]];
  $button.text(nextButtonText);
  if (nextButtonText === 'Exited') {
    $button.prop('disabled', true);
}





  
  const storedColor = localStorage.getItem(`${primaryKey}_color`) || 'blue'; // Default to blue
  if (status === 'Exited') {
      // Prevent button click when the status is "Exited"
      console.log('Button click prevented because the status is "Exited"');
      return;
  }

  const now = new Date(); // Get the current time


  if (status === 'Pass Issued') {
      console.log('Changing to "Entered" state with a green icon');
      setButtonState($button, 'Entered', 'green');
      $statusCell.text('Entered');
      status = 'Entered';
      $row.removeClass('gate-pass').addClass('entered');
      $button.css('color', 'green'); // Set the color to green

  } else if (status === 'Entered') {
      console.log('Changing to "Exited" state with a red icon');
      setButtonState($button, 'Exited', 'red');
      $statusCell.text('Exited');
      status = 'Exited';
      $row.removeClass('entered').addClass('exited');
      $button.css('color', 'red'); // Set the color to red
     
  } else {
      console.log('Changing back to "Pass Issued" state with a blue icon');
      setButtonState($button, 'Pass Issued', 'blue');
      $statusCell.text('Pass Issued');
      status = 'Pass Issued';
      $row.removeClass('exited').addClass('gate-pass');
      $button.css('color', 'blue'); // Set the color to blue

  }

  console.log('Final Current Status:', status);

  localStorage.setItem(primaryKey, status);
  localStorage.setItem(`${primaryKey}_color`, $button.css('color'));


  ///////////////////////////////
  // Check if the status is "Entered" and it has been 24 hours
if (status === 'Entered') {
  const entryTimeString = $entryTimeCell.text();
  const entryTime = new Date(entryTimeString);
  const timeDifference = now - entryTime;
  

  // If 24 hours have passed, change the status to "Exited" and record exit time
  if (timeDifference >= 2 * 60 * 1000) {
    setButtonState($button, 'Exited', 'red');
    $statusCell.text('Exited');
    status = 'Exited';
    $row.removeClass('entered').addClass('exited');
    $button.css('color', 'red'); // Set the color to red

    // Record and display the exit time
    const exitTimeString = now.toLocaleTimeString();
    $exitTimeCell.text(exitTimeString);

    // Save the updated status and exit time in local storage
    localStorage.setItem(primaryKey, status);
    localStorage.setItem(`${primaryKey}_color`, $button.css('color'));
    localStorage.setItem(`${primaryKey}_exit_time`, exitTimeString);

    // Update the server with the new status and exit time via AJAX request
    updateServerStatus(primaryKey, status, exitTimeString);
  }
}

//////////////////////////////////////////////////////

  // $.ajax({
  //     url: '/update_status/',  // URL endpoint to handle the status update
  //     method: 'POST',
  //     data: {
  //         'primary_key': primaryKey,
  //         'new_status': status
  //     },
  //     headers: {
  //         'X-CSRFToken': getCookie('csrftoken')
  //     },
  //     success: function (response) {
  //         // Handle the response from the server if needed
  //     },
  //     error: function (error) {
  //         console.error('Error:', error);
  //     }
  // });
  

  
}

/////////
// Function to update server with the new status and exit time
function updateServerStatus(primaryKey, status, exitTime) {
$.ajax({
  url: '/update_status_and_exit_time/',  // Replace with your server endpoint
  method: 'POST',
  data: {
    'primary_key': primaryKey,
    'new_status': status,
    'exit_time': exitTime
  },
  headers: {
    'X-CSRFToken': getCookie('csrftoken')
  },
  success: function (response) {
    // Handle the response from the server if needed
  },
  error: function (error) {
    console.error('Error:', error);
  }
});
}



// Function to update entry and exit times
function updateEntryExitTimes($row, status) {
  const $entryTimeCell = $row.find('.entry-time');
  const $exitTimeCell = $row.find('.exit-time');

  if (status === 'Entered') {
    const entryTime = new Date();
    $entryTimeCell.text(entryTime.toLocaleString());
  } else if (status === 'Exited') {
    if ($entryTimeCell.text() === '') {
      // Only set exit time if entry time is available
      $exitTimeCell.text('');
    } else {
      const exitTime = new Date();
      $exitTimeCell.text(exitTime.toLocaleString());
    }
  } else {
    $entryTimeCell.text(''); // Clear entry time
    $exitTimeCell.text(''); // Clear exit time
  }
}


// Function to calculate and update the duration of stay
function updateDurationOfStay($row) {
  const $entryTime = $row.find('.entry-time');
  const $exitTime = $row.find('.exit-time');
  const $durationElement = $row.find('.duration-of-stay');

  const entryTimeString = $entryTime.text();
  const exitTimeString = $exitTime.text();

  if (entryTimeString && exitTimeString) {
    const entryTime = new Date(entryTimeString);
    const exitTime = new Date(exitTimeString);
    const duration = calculateDuration(entryTime, exitTime);

    $durationElement.text(duration);
  } else {
    $durationElement.text('N/A'); // Display "N/A" if entry or exit time is missing
  }
}

function calculateDuration(entryTime, exitTime) {
  const durationMs = exitTime - entryTime;

  // Convert milliseconds into hours
  const hours = Math.ceil(durationMs / (1000 * 60 * 60));

  return `${hours} hours`;
}





$('.status-button').each(function () {
const $button = $(this);
const $statusCell = $button.closest('tr').find('.status');

const status = $statusCell.data('status');
// if (status === 'Pass Issued') {
//   $button.css('background-color', 'blue');
// } else if (status === 'Entered') {
//   $button.css('background-color', 'green');
// } else if (status === 'Exited') {
//   $button.css('background-color', 'red');
// }
const $row = $button.closest('tr');
const primaryKey = $row.find('.primary-key').data('primary-key');

// Define $entryTimeCell and $exitTimeCell here
const $entryTimeCell = $row.find('.entry-time');
const $exitTimeCell = $row.find('.exit-time');

// Additional code to get the item date
const itemDateText = $row.find('.date').text();
const itemDateParts = itemDateText.split('/');
const itemDate = new Date(`${itemDateParts[0]}-${itemDateParts[1]}-${itemDateParts[2]}`);
const formattedItemDate = formatDate(itemDate);

const savedStatus = localStorage.getItem(primaryKey);

if (savedStatus) {
    // Use the saved status if available
    setButtonState($button, savedStatus, savedStatus === 'Exited' ? 'red' : (savedStatus === 'Entered' ? 'green' : 'blue'));
    $statusCell.text(savedStatus);
    $row.removeClass('gate-pass entered exited').addClass(savedStatus.toLowerCase());

    // Display entry and exit times if available
    updateEntryExitTimes($row, savedStatus);

    // Retrieve stored button styling
    const storedButtonStyle = JSON.parse(localStorage.getItem(`${primaryKey}_button_style`));
    if (storedButtonStyle) {
        $button.css(storedButtonStyle);
    }
}

const storedColor = localStorage.getItem(`${primaryKey}_color`);
if (storedColor) {
    $button.css('color', storedColor);
}

if (savedStatus !== 'Exited') {
    $button.click(function () {
        handleButtonClick($button, $statusCell, $entryTimeCell, $exitTimeCell, $row, primaryKey, status);
        updateDurationOfStay($row);
    });
}
});


// Initial update of duration of stay
$('table tbody tr').each(function () {
  const $row = $(this);
  updateDurationOfStay($row);
});


  });








  document.addEventListener('DOMContentLoaded', function () {
    const current_bs_date = NepaliFunctions.GetCurrentBsDate('YYYY-MM-DD');
    const searchInput = document.getElementById('searchInput');
    const tableBody = document.querySelector('table tbody');
    const rows = tableBody.getElementsByTagName('tr');

    searchInput.addEventListener('input', function () {
      const searchText = searchInput.value.toLowerCase();

      for (const row of rows) {
        let found = false;
        const cells = row.getElementsByTagName('td');

        for (const cell of cells) {
          if (cell.textContent.toLowerCase().includes(searchText)) {
            found = true;
            break;
          }
        }

        row.style.display = found ? '' : 'none';
      }
    });
    
    function getCookie(name) {
      var value = "; " + document.cookie;
      var parts = value.split("; " + name + "=");
      if (parts.length === 2) return parts.pop().split(";").shift();
  }

  // Function to set the button state
  function setButtonState($button, status) {
    const buttonText = {
        'Pass Issued': 'Enter',
        'Entered': 'Entered',
        'Exited': 'Exited',
    };

    const text = buttonText[status];
    $button.text(text);
}

// function setButtonState($button, status) {
//   const iconMappings = {
//       'Pass Issued': '<i class="fas fa-check-circle fa-lg"></i>',
//       'Entered': '<i class="fas fa-times-circle fa-lg"></i>',
//       'Exited': '<i class="fas fa-minus-circle fa-lg"></i>',
//   };

//   const icon = iconMappings[status];
//   $button.html(icon);
// }

// Function to handle button click
function handleButtonClick($button, $statusCell, $entryTimeCell, $exitTimeCell, $row, primaryKey, status) {
  const buttonText = {
    'Pass Issued': 'Enter',
    'Entered': 'Entered',
    'Exited': 'Exited',
  };

  const nextStatus = {
    'Enter': 'Entered',
    'Entered': 'Exited',
    'Exited': 'Pass Issued',
  };
  const nextButtonText = buttonText[nextStatus[status]];
  $button.text(nextButtonText);
  if (nextButtonText === 'Exited') {
    $button.prop('disabled', true);
}





  
  const storedColor = localStorage.getItem(`${primaryKey}_color`) || 'blue'; // Default to blue
  if (status === 'Exited') {
      // Prevent button click when the status is "Exited"
      console.log('Button click prevented because the status is "Exited"');
      return;
  }

  const now = new Date(); // Get the current time


  if (status === 'Pass Issued') {
      console.log('Changing to "Entered" state with a green icon');
      setButtonState($button, 'Entered', 'green');
      $statusCell.text('Entered');
      status = 'Entered';
      $row.removeClass('gate-pass').addClass('entered');
      $button.css('color', 'green'); // Set the color to green

  } else if (status === 'Entered') {
      console.log('Changing to "Exited" state with a red icon');
      setButtonState($button, 'Exited', 'red');
      $statusCell.text('Exited');
      status = 'Exited';
      $row.removeClass('entered').addClass('exited');
      $button.css('color', 'red'); // Set the color to red
     
  } else {
      console.log('Changing back to "Pass Issued" state with a blue icon');
      setButtonState($button, 'Pass Issued', 'blue');
      $statusCell.text('Pass Issued');
      status = 'Pass Issued';
      $row.removeClass('exited').addClass('gate-pass');
      $button.css('color', 'blue'); // Set the color to blue

  }

  console.log('Final Current Status:', status);

  localStorage.setItem(primaryKey, status);
  localStorage.setItem(`${primaryKey}_color`, $button.css('color'));


  ///////////////////////////////
  // Check if the status is "Entered" and it has been 24 hours
if (status === 'Entered') {
  const entryTimeString = $entryTimeCell.text();
  const entryTime = new Date(entryTimeString);
  const timeDifference = now - entryTime;
  

  // If 24 hours have passed, change the status to "Exited" and record exit time
  if (timeDifference >= 2 * 60 * 1000) {
    setButtonState($button, 'Exited', 'red');
    $statusCell.text('Exited');
    status = 'Exited';
    $row.removeClass('entered').addClass('exited');
    $button.css('color', 'red'); // Set the color to red

    // Record and display the exit time
    const exitTimeString = now.toLocaleTimeString();
    $exitTimeCell.text(exitTimeString);

    // Save the updated status and exit time in local storage
    localStorage.setItem(primaryKey, status);
    localStorage.setItem(`${primaryKey}_color`, $button.css('color'));
    localStorage.setItem(`${primaryKey}_exit_time`, exitTimeString);

    // Update the server with the new status and exit time via AJAX request
    updateServerStatus(primaryKey, status, exitTimeString);
  }
}

//////////////////////////////////////////////////////

  // $.ajax({
  //     url: '/update_status/',  // URL endpoint to handle the status update
  //     method: 'POST',
  //     data: {
  //         'primary_key': primaryKey,
  //         'new_status': status
  //     },
  //     headers: {
  //         'X-CSRFToken': getCookie('csrftoken')
  //     },
  //     success: function (response) {
  //         // Handle the response from the server if needed
  //     },
  //     error: function (error) {
  //         console.error('Error:', error);
  //     }
  // });
  

  
}

/////////
// Function to update server with the new status and exit time
function updateServerStatus(primaryKey, status, exitTime) {
$.ajax({
  url: '/update_status_and_exit_time/',  // Replace with your server endpoint
  method: 'POST',
  data: {
    'primary_key': primaryKey,
    'new_status': status,
    'exit_time': exitTime
  },
  headers: {
    'X-CSRFToken': getCookie('csrftoken')
  },
  success: function (response) {
    // Handle the response from the server if needed
  },
  error: function (error) {
    console.error('Error:', error);
  }
});
}



// Function to update entry and exit times
function updateEntryExitTimes($row, status) {
  const $entryTimeCell = $row.find('.entry-time');
  const $exitTimeCell = $row.find('.exit-time');

  if (status === 'Entered') {
    const entryTime = new Date();
    $entryTimeCell.text(entryTime.toLocaleString());
  } else if (status === 'Exited') {
    if ($entryTimeCell.text() === '') {
      // Only set exit time if entry time is available
      $exitTimeCell.text('');
    } else {
      const exitTime = new Date();
      $exitTimeCell.text(exitTime.toLocaleString());
    }
  } else {
    $entryTimeCell.text(''); // Clear entry time
    $exitTimeCell.text(''); // Clear exit time
  }
}


// Function to calculate and update the duration of stay
function updateDurationOfStay($row) {
  const $entryTime = $row.find('.entry-time');
  const $exitTime = $row.find('.exit-time');
  const $durationElement = $row.find('.duration-of-stay');

  const entryTimeString = $entryTime.text();
  const exitTimeString = $exitTime.text();

  if (entryTimeString && exitTimeString) {
    const entryTime = new Date(entryTimeString);
    const exitTime = new Date(exitTimeString);
    const duration = calculateDuration(entryTime, exitTime);

    $durationElement.text(duration);
  } else {
    $durationElement.text('N/A'); // Display "N/A" if entry or exit time is missing
  }
}

function calculateDuration(entryTime, exitTime) {
  const durationMs = exitTime - entryTime;

  // Convert milliseconds into hours
  const hours = Math.ceil(durationMs / (1000 * 60 * 60));

  return `${hours} hours`;
}





$('.status-button').each(function () {
const $button = $(this);
const $statusCell = $button.closest('tr').find('.status');

const status = $statusCell.data('status');
// if (status === 'Pass Issued') {
//   $button.css('background-color', 'blue');
// } else if (status === 'Entered') {
//   $button.css('background-color', 'green');
// } else if (status === 'Exited') {
//   $button.css('background-color', 'red');
// }
const $row = $button.closest('tr');
const primaryKey = $row.find('.primary-key').data('primary-key');

// Define $entryTimeCell and $exitTimeCell here
const $entryTimeCell = $row.find('.entry-time');
const $exitTimeCell = $row.find('.exit-time');

// Additional code to get the item date
const itemDateText = $row.find('.date').text();
const itemDateParts = itemDateText.split('/');
const itemDate = new Date(`${itemDateParts[0]}-${itemDateParts[1]}-${itemDateParts[2]}`);
const formattedItemDate = formatDate(itemDate);

const savedStatus = localStorage.getItem(primaryKey);

if (savedStatus) {
    // Use the saved status if available
    setButtonState($button, savedStatus, savedStatus === 'Exited' ? 'red' : (savedStatus === 'Entered' ? 'green' : 'blue'));
    $statusCell.text(savedStatus);
    $row.removeClass('gate-pass entered exited').addClass(savedStatus.toLowerCase());

    // Display entry and exit times if available
    updateEntryExitTimes($row, savedStatus);

    // Retrieve stored button styling
    const storedButtonStyle = JSON.parse(localStorage.getItem(`${primaryKey}_button_style`));
    if (storedButtonStyle) {
        $button.css(storedButtonStyle);
    }
}

const storedColor = localStorage.getItem(`${primaryKey}_color`);
if (storedColor) {
    $button.css('color', storedColor);
}

if (savedStatus !== 'Exited') {
    $button.click(function () {
        handleButtonClick($button, $statusCell, $entryTimeCell, $exitTimeCell, $row, primaryKey, status);
        updateDurationOfStay($row);
    });
}
});


// Initial update of duration of stay
$('table tbody tr').each(function () {
  const $row = $(this);
  updateDurationOfStay($row);
});


  });