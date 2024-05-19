document.addEventListener('DOMContentLoaded', function () {
    const timeDisplay = document.getElementById('time-display');
    const containerCountDisplay = document.getElementById('container-count');
    const statusDisplay = document.getElementById('status');
    const startButton = document.getElementById('start-button');
    const stopButton = document.getElementById('stop-button');
    const copyButton = document.getElementById('copy-button');
  
    chrome.storage.local.get(['timeTaken', 'tracking'], function (result) {
      if (result.timeTaken) {
        timeDisplay.textContent = `Time taken: ${result.timeTaken} seconds`;
      } else {
        timeDisplay.textContent = 'Time taken: -- seconds';
      }
      console.log("Initial time taken loaded:", result.timeTaken);
  
      if (result.tracking) {
        statusDisplay.textContent = 'Status: Tracking...';
        startButton.style.display = 'none';
        stopButton.style.display = 'block';
      } else {
        statusDisplay.textContent = 'Status: Not tracking';
        startButton.style.display = 'block';
        stopButton.style.display = 'none';
      }
    });
  
    const startTracking = () => {
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
              if (chrome.runtime.lastError) {
                console.error("Error injecting content script:", chrome.runtime.lastError);
              } else {
                chrome.tabs.sendMessage(tabs[0].id, { action: "startTracking" }, (response) => {
                  if (chrome.runtime.lastError) {
                    console.error("Error sending message:", chrome.runtime.lastError.message);
                  } else if (response && response.status === "tracking_started") {
                    console.log("Tracking started successfully");
                    statusDisplay.textContent = 'Status: Tracking...';
                    startButton.style.display = 'none';
                    stopButton.style.display = 'block';
                  } else {
                    console.error("Unexpected response:", response);
                  }
                });
              }
            }
          );
        }
      });
    };
  
    const stopTracking = () => {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs[0].id) {
          chrome.tabs.sendMessage(tabs[0].id, { action: "stopTracking" }, (response) => {
            if (chrome.runtime.lastError) {
              console.error("Error sending message:", chrome.runtime.lastError.message);
            } else if (response && response.status === "tracking_stopped") {
              console.log("Tracking stopped successfully");
              statusDisplay.textContent = 'Status: Not tracking';
              startButton.style.display = 'block';
              stopButton.style.display = 'none';
            } else {
              console.error("Unexpected response:", response);
            }
          });
        }
      });
    };
  
    startButton.addEventListener('click', startTracking);
  
    stopButton.addEventListener('click', stopTracking);
  
    copyButton.addEventListener('click', function () {
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
        timeDisplay.textContent = `Total time taken: ${message.time} seconds`;
        statusDisplay.textContent = 'Status: Not tracking';
        startButton.style.display = 'block';
        stopButton.style.display = 'none';
      } else if (message.action === "updateContainerCount") {
        containerCountDisplay.textContent = `Turn: ${message.count}`;
      }
    });
  });
  