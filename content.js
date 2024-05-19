(function() {
    let startTime;
    let intervalId;
  
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      if (request.action === "startTracking") {
        console.log("Tracking started");
  
        const inputFieldXPath = '//*[@id="app-root"]/main/side-navigation-v2/bard-sidenav-container/bard-sidenav-content/div/div/div[2]/chat-window/div[1]/div[2]/div[1]/input-area-v2/div/div/div[1]/div/div[1]/rich-textarea';
        const submitButtonXPath = '//*[@id="app-root"]/main/side-navigation-v2/bard-sidenav-container/bard-sidenav-content/div/div/div[2]/chat-window/div[1]/div[2]/div[1]/input-area-v2/div/div/div[3]/div/div/button';
  
        const responseContainerSelector = "[class^='response-container-content']";
  
        const inputField = document.evaluate(inputFieldXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        const submitButton = document.evaluate(submitButtonXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  
        console.log("Input field found:", inputField);
        console.log("Submit button found:", submitButton);
        
        if (inputField && submitButton) {
          console.log("Input field and submit button found");
  
          const startTracking = () => {
            startTime = Date.now();
            clearInterval(intervalId);
            intervalId = setInterval(() => {
              const currentTime = ((Date.now() - startTime) / 1000).toFixed(2);
              chrome.runtime.sendMessage({ action: "updateTime", time: currentTime });
            }, 100);
          };
  
          inputField.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' && !event.shiftKey) {
              startTracking();
            }
          });
  
          submitButton.addEventListener('click', function () {
            startTracking();
          });
  
          const observer = new MutationObserver((mutations) => {
            for (let mutation of mutations) {
              if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                const lastNode = mutation.addedNodes[mutation.addedNodes.length - 1];
                console.log("New node added:", lastNode);
                if (lastNode.nodeType === Node.ELEMENT_NODE && lastNode.matches(responseContainerSelector)) {
                  const textContent = lastNode.textContent.trim();
                  if (startTime && (textContent === "Analyzing..." || /^[A-Za-z].*/.test(textContent))) {
                    const endTime = Date.now();
                    const timeTaken = ((endTime - startTime) / 1000).toFixed(2);
                    chrome.storage.local.set({ timeTaken: timeTaken });
                    chrome.runtime.sendMessage({ action: "finalTime", time: timeTaken });
                    clearInterval(intervalId);
                    console.log("Response detected, time taken:", timeTaken);
                    startTime = null;
                  }
                } else if (lastNode.nodeType === Node.ELEMENT_NODE) {
                  const responseContainer = lastNode.querySelector(responseContainerSelector);
                  if (responseContainer) {
                    const textContent = responseContainer.textContent.trim();
                    if (startTime && (textContent === "Analyzing..." || /^[A-Za-z].*/.test(textContent))) {
                      const endTime = Date.now();
                      const timeTaken = ((endTime - startTime) / 1000).toFixed(2);
                      chrome.storage.local.set({ timeTaken: timeTaken });
                      chrome.runtime.sendMessage({ action: "finalTime", time: timeTaken });
                      clearInterval(intervalId);
                      console.log("Response detected in child, time taken:", timeTaken);
                      startTime = null;
                    }
                  }
                }
              }
            }
          });
  
          const config = { childList: true, subtree: true };
          const targetNode = document.body;
          observer.observe(targetNode, config);
          console.log("Mutation observer set up");
        } else {
          console.error('Input field or submit button not found');
        }
      }
    });
  })();
  