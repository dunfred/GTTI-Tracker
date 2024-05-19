document.addEventListener('DOMContentLoaded', function () {
    const timeDisplay = document.getElementById('time-display');
  
    // Get the time taken from storage and display it
    chrome.storage.local.get(['timeTaken'], function (result) {
      if (result.timeTaken) {
        timeDisplay.textContent = `Time taken: ${result.timeTaken} seconds`;
      } else {
        timeDisplay.textContent = 'Time taken: -- seconds';
      }
      console.log("Initial time taken loaded:", result.timeTaken); // Debugging log
    });
  
    // Handle the start button click
    document.getElementById('start-button').addEventListener('click', function () {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs[0].id) {
          chrome.scripting.executeScript(
            {
              target: { tabId: tabs[0].id },
              files: ['content.js'],
            },
            () => {
              chrome.tabs.sendMessage(tabs[0].id, { action: "startTracking" }, (response) => {
                if (chrome.runtime.lastError) {
                  console.error("Error sending message:", chrome.runtime.lastError);
                } else {
                  console.log("Message sent:", response);
                }
              });
            }
          );
        }
      });
    });
  
    // Handle the copy button click
    document.getElementById('copy-button').addEventListener('click', function () {
      chrome.storage.local.get(['timeTaken'], function (result) {
        const timeTaken = result.timeTaken || '--';
        navigator.clipboard.writeText(timeTaken).then(() => {
          alert('Time copied to clipboard!');
          console.log("Time copied to clipboard:", timeTaken); // Debugging log
        }, (err) => {
          console.error('Could not copy text:', err);
        });
      });
    });
  });
  