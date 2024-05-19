# Gemini Time to Trigger ICE Tracker Extension

This Google Chrome extension tracks the time it takes trigger ICE when a prompt is submitted. It measures the duration from when a user submits a prompt until the text `"Analyzing..."` or any other specified text appears in a response container.

## Features

- Tracks time in seconds with high precision.
- Displays the current time taken in a popup.
- Shows the current `Turn` number in the popup.
- Allows users to start and stop tracking time.
- Automatically stops tracking when the event is detected.
- Copies the time taken to the clipboard.

## How It Works

1. When the user clicks "Start Tracking" in the popup, the extension begins listening for the event.
2. The timer starts when the user submits a prompt (by clicking the submit button or pressing Enter).
3. The extension monitors changes in the response containers on the webpage.
4. When the specified text (`"Analyzing..."` or any other text) appears in the response container, the timer stops.
5. The time taken is displayed in the popup and can be copied to the clipboard.
6. The extension shows the current number of the `Turn`.

## Installation

1. Clone this repository or download the code files.

    ```bash
    git clone https://github.com/dunfred/GTTI-Tracker.git
    cd GTTI-Tracker
    ```

2. Open Google Chrome and navigate to `chrome://extensions/`.

3. Enable "Developer mode" by toggling the switch in the upper-right corner.

4. Click "Load unpacked" and select the directory where you cloned/downloaded the extension files.

5. The extension should now appear in the list of installed extensions.

## Usage

1. Click on the extension icon in the Chrome toolbar to open the popup.
2. Click the "Start Tracking" button.
3. Submit a prompt on the target webpage.
4. The timer will start, and the popup will display the current time taken.
5. When the specified text appears in a response container, the timer will automatically stop.
6. Click "Copy Time" to copy the time taken to the clipboard.
7. Click "Stop Tracking" to manually stop the tracking at any time.

## Files

- `manifest.json`: Configuration file for the Chrome extension.
- `popup.html`: HTML file for the popup UI.
- `popup.js`: JavaScript file for the popup logic.
- `content.js`: Content script that runs on the target webpage to track the event.

## Manifest Configuration

The `manifest.json` file configures the extension and its permissions:

```json
{
    "manifest_version": 3,
    "name": "GTTI Timing Tracker",
    "version": "2.1.0",
    "description": "Tracks the time taken to trigger ICE.",
    "permissions": [
        "activeTab",
        "scripting",
        "storage",
        "webNavigation",
        "windows"
        ],
    "background": {
        "service_worker": "background.js"
    },
    "action": {
        "default_popup": "popup.html",
        "default_popup_width": 300,
        "default_popup_height": 200
        },
    "content_scripts": [
        {
        "matches": ["<all_urls>"],
        "js": ["content.js"]
        }
    ]
}

