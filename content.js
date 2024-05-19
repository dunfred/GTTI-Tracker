let startTime;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "startTracking") {
    console.log("Tracking started"); // Debugging log

    // XPath for the input field
    const inputFieldXPath = '//*[@id="app-root"]/main/side-navigation-v2/bard-sidenav-container/bard-sidenav-content/div/div/div[2]/chat-window/div[1]/div[2]/div[1]/input-area-v2/div/div/div[1]/div/div[1]/rich-textarea';
    // XPath for the submit button
    const submitButtonXPath = '//*[@id="app-root"]/main/side-navigation-v2/bard-sidenav-container/bard-sidenav-content/div/div/div[2]/chat-window/div[1]/div[2]/div[1]/input-area-v2/div/div/div[3]/div/div/button';

    const responseContainerSelector = "[class^='response-container-content']"; // Select elements with class names starting with 'response-container-content'

    // Get the input field using XPath
    const inputField = document.evaluate(inputFieldXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    // Get the submit button using XPath
    const submitButton = document.evaluate(submitButtonXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

    console.log("Input field found:", inputField); // Debugging log
    console.log("Submit button found:", submitButton); // Debugging log
    
    if (inputField && submitButton) {
      console.log("Input field and submit button found"); // Debugging log

      inputField.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' && !event.shiftKey) {
          startTime = Date.now();
          console.log("Enter key pressed, start time:", startTime); // Debugging log
        }
      });

      submitButton.addEventListener('click', function () {
        startTime = Date.now();
        console.log("Submit button clicked, start time:", startTime); // Debugging log
      });

      const observer = new MutationObserver((mutations) => {
        for (let mutation of mutations) {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            // Check only the last added node
            const lastNode = mutation.addedNodes[mutation.addedNodes.length - 1];
            console.log("New node added:", lastNode); // Debugging log
            if (lastNode.nodeType === Node.ELEMENT_NODE && lastNode.matches(responseContainerSelector)) {
              const textContent = lastNode.textContent.trim();
              if (startTime && (textContent === "Analyzing..." || /^[A-Za-z].*/.test(textContent))) {
                const endTime = Date.now();
                const timeTaken = ((endTime - startTime) / 1000).toFixed(2); // time in seconds, rounded to 2 decimal places
                chrome.storage.local.set({ timeTaken: timeTaken });
                console.log("Response detected, time taken:", timeTaken); // Debugging log
                startTime = null;
              }
            } else if (lastNode.nodeType === Node.ELEMENT_NODE) {
              // Check if the last node contains any elements matching the response container selector
              const responseContainer = lastNode.querySelector(responseContainerSelector);
              if (responseContainer) {
                const textContent = responseContainer.textContent.trim();
                if (startTime && (textContent === "Analyzing..." || /^[A-Za-z].*/.test(textContent))) {
                  const endTime = Date.now();
                  const timeTaken = ((endTime - startTime) / 1000).toFixed(2); // time in seconds, rounded to 2 decimal places
                  chrome.storage.local.set({ timeTaken: timeTaken });
                  console.log("Response detected in child, time taken:", timeTaken); // Debugging log
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
      console.log("Mutation observer set up"); // Debugging log
    } else {
      console.error('Input field or submit button not found');
    }
  }
});
