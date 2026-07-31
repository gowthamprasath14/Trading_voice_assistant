# Trading_voice_assistant

### Speech-Driven TradingView Drawing Assistant

Trading_voice_assistant is a Chrome Extension that enables traders to create **TradingView Horizontal Rays** using **voice commands** or **manual price input**. The extension is designed to improve accessibility by eliminating the need to precisely click on chart price levels.

---

## Features

- 🎤 Speech Recognition using Web Speech API
- ⌨️ Manual Price Entry
- 📈 Automatically Creates TradingView Horizontal Rays
- 🔗 Works with TradingView Embedded Charts
- 🏦 Supports Multiple Brokerage Platforms
- ⚡ Lightweight Chrome Extension
- ♿ Accessibility Focused

---

## Supported Platforms

- TradingView
- Dhan
- Zerodha Kite
- Groww
- Angel One
- Upstox

> Additional brokers can be supported by simply adding their TradingView iframe URL to `manifest.json`.

---

## Project Architecture

```
User
   │
   ▼
Speech / Manual Input
   │
   ▼
content.js
   │
   ▼
background.js
   │
   ▼
frame.js
   │
   ▼
pageScript.js
   │
   ▼
TradingView API
   │
   ▼
Horizontal Ray Created
```

---

## Project Structure

```
VoiceChart/
│
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
│
├── content.js
├── frame.js
├── background.js
├── pageScript.js
├── priceParser.js
├── content.css
├── manifest.json
└── README.md
```

---

## Technologies Used

- JavaScript (ES6)
- HTML
- CSS
- Chrome Extension Manifest V3
- TradingView Charting Library
- Web Speech API
- Chrome Runtime Messaging API

---

## How It Works

### 1. Voice Recognition

The extension uses the browser's **Web Speech API** to recognize spoken prices.

Example:

```
One Twenty Five
```

↓

```
125
```

---

### 2. Price Parsing

The spoken text is converted into a valid numeric value using `priceParser.js`.

Example:

```
One Hundred Twenty Seven Point Five
```

↓

```
127.5
```

---

### 3. Background Communication

```
content.js
        │
        ▼
background.js
        │
        ▼
frame.js
```

Chrome Runtime Messaging is used to communicate between the broker webpage and the TradingView iframe.

---

### 4. TradingView API

Inside the TradingView iframe, `pageScript.js` accesses the TradingView widget and executes:

```javascript
chart.createShape(
    {
        time: visibleRange.from,
        price: price
    },
    {
        shape: "horizontal_ray"
    }
);
```

This creates the horizontal ray directly on the chart.

---

## Installation

### Step 1

Clone the repository

```bash
git clone https://github.com/gowthamprasath14/Trading_voice_assistant.git
```

or download the ZIP.

---

### Step 2

Open Chrome

```
chrome://extensions
```

Enable

```
Developer Mode
```

---

### Step 3

Click

```
Load Unpacked
```

Select the project folder.

---

### Step 4

Open any supported broker or TradingView.

The floating microphone button will appear.

---

## Usage

1. Open a supported TradingView chart.
2. Click the floating microphone.
3. Speak the desired price.
4. Alternatively type the price manually.
5. Press **Submit**.
6. A Horizontal Ray is automatically created.

---

## Supported Voice Examples

```
One Twenty
```

↓

```
120
```

```
One Hundred Twenty Five
```

↓

```
125
```

```
One Hundred Twenty Point Five
```

↓

```
120.5
```

```
Ninety Eight Point Seven Five
```

↓

```
98.75
```

---

## Extension Workflow

```
Speech Input
        │
        ▼
Speech Recognition
        │
        ▼
Price Parser
        │
        ▼
Chrome Runtime Messaging
        │
        ▼
TradingView API
        │
        ▼
Horizontal Ray
```

---

## Future Improvements

- Voice-controlled Trend Line
- Fibonacci Retracement
- Horizontal Line
- Vertical Line
- Rectangle Tool
- Circle Tool
- Trend Channel
- Multi-language Speech Recognition
- Voice Confirmation Before Drawing
- AI-powered Command Recognition
- Keyboard Shortcuts
- Drawing Management (Delete/Edit)

---

## Known Limitations

- Requires Chromium-based browsers.
- Requires microphone permission for voice input.
- Only supports TradingView-based chart interfaces.
- Browser must support the Web Speech API.

---

## Accessibility

Trading_voice_assistant is designed to assist users who have difficulty using a mouse or precisely selecting chart price levels, making technical analysis more accessible through speech-based interaction.

---

## License

This project is licensed under the MIT License.

---

## Author

**Gowtham Prasath K**

B.Tech Information Technology

Trading_voice_assistant – Speech-Driven TradingView Drawing Assistant
