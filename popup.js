document.addEventListener('DOMContentLoaded', function () {
    const timeDisplay = document.getElementById('time-display');
  
    chrome.storage.local.get(['timeTaken'], function (result) {
      if (result.timeTaken) {
        timeDisplay.textContent = `Time taken: ${result.timeTaken} seconds`;
      } else {
        timeDisplay.textContent = 'Time taken: -- seconds';
      }
      console.log("Initial time taken loaded:", result.timeTaken);
    });
  
    document.getElementById('start-button').addEventListener('click', function () {
      chrome.storage.local.set({ timeTaken: '--' });
      timeDisplay.textContent = 'Time taken: -- seconds';
  
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
  
    document.getElementById('copy-button').addEventListener('click', function () {
      chrome.storage.local.get(['timeTaken'], function (result) {
        const timeTaken = result.timeTaken || '--';
        navigator.clipboard.writeText(timeTaken).then(() => {
          alert('Time copied to clipboard!');
          console.log("Time copied to clipboard:", timeTaken);
        }, (err) => {
          console.error('Could not copy text:', err);
        });
      });
    });
  
    chrome.runtime.onMessage.addListener(function (message) {
      if (message.action === "updateTime") {
        timeDisplay.textContent = `Time taken: ${message.time} seconds`;
      } else if (message.action === "finalTime") {
        timeDisplay.textContent = `Final time taken: ${message.time} seconds`;
      }
    });
  });
  