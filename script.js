import { ethers } from "./ethers.min.js";

// *****Constants*****
const TXHASH = '0xbbaf754ca8862f0cab2d963b10f17b2f78c3d897e329b442a9115f6a816339f0';
const RPCURL = 'https://eth.drpc.org';

// *****State*****
let storedPassword = null;

// *****DOM root*****
const app = document.getElementById("app");

// *****UI RENDER FUNCTIONS*****
function showWelcome() {
  app.innerHTML = `
    <h1>Welcome!</h1>
    <div>Enter password:</div>
    <input id="passwordInput" type="text" />
    <button id="submitBtn">Continue</button>
  `;

  const input = document.getElementById("passwordInput");
  const button = document.getElementById("submitBtn");

  input.focus();

  async function submit() {
    storedPassword = input.value.toLowerCase();
    await startFlow();
  }

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submit();
  });

  button.onclick = submit;
}

function showLoading(message) {
  app.innerHTML = `<div>${message}</div>`;
}

function showSuccess(message) {
  const lines = message.split(/\r?\n/);

  while (lines.length && lines[lines.length - 1].trim() === "") {
    lines.pop();
  }

  const lastLine = lines.pop();

  const displayedMessage = lines.join("\n");

  app.innerHTML = `
    <h1>Decrypted message</h1>
    <div class="decrypted-text">${displayedMessage}</div>

    <div class="button-unit">
      <div class="button-label">
        For a surprise, press the button, and then paste into the text box
      </div>
      <button id="goBtn">Go</button>
    </div>

    <div class="button-unit">
      <div class="button-label">
        See transaction on blockchain
      </div>
      <button id="rawBtn">Go</button>
    </div>
  `;

  const goBtn = document.getElementById("goBtn");
  goBtn.onclick = () => {
    copyTextToClipboard(lastLine);
    window.location.href = 'https://www.tools-online.app/tools/gnuplot';
  };

  const rawBtn = document.getElementById("rawBtn");
  rawBtn.onclick = () => {
    window.location.href = 'https://etherscan.io/tx/0xbbaf754ca8862f0cab2d963b10f17b2f78c3d897e329b442a9115f6a816339f0';
  };
}

function showErrorRetrieve() {
  app.innerHTML = `
    <div>Could not retrieve data from blockchain</div>
    <button id="retry">Try again</button>
  `;

  document.getElementById("retry").onclick = startFlow;
}

function showErrorKey() {
  app.innerHTML = `
    <div>
      Unable to retrieve key from url. Has the url been modified? Revert and reload page
    </div>
  `;
}

function showErrorDecrypt() {
  app.innerHTML = `
    <div>Failed to decrypt message. Are you sure you entered the right password?</div>
    <button id="retry">Enter password again</button>
  `;

  document.getElementById("retry").onclick = showWelcome;
}

// *****FLOW*****
async function startFlow() {
  try {
    showLoading("Retrieving encrypted message...");
    await delay(500);

    let hexData;
    try {
      hexData = await getTransactionData(TXHASH, RPCURL);
    } catch (e) {
      return showErrorRetrieve();
    }

    showLoading("Decrypting message...");
    await delay(500);

    let key;
    try {
      const keyString = getKeyFromUrlFragment();
      key = await importKeyFromUrlString(keyString);
    } catch (e) {
      return showErrorKey();
    }

    try {
      const base64 = hexToBase64(hexData);
      const plaintext = await decrypt(key, base64, storedPassword);
      showSuccess(plaintext);
    } catch (e) {
      showErrorDecrypt();
    }

  } catch (e) {
    console.error(e);
  }
}

// *****UTIL*****
function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

// *****Browser utilities*****
function getKeyFromUrlFragment() {
  const hash = window.location.hash;
  if (!hash) return null;

  const params = new URLSearchParams(hash.slice(1));

  return params.get('key');
}

function copyTextToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert("Text copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        fallbackCopyTextToClipboard(text);
      });
  } else {
    fallbackCopyTextToClipboard(text);
  }
}

function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;

  textArea.style.position = 'fixed';
  textArea.style.top = '-9999px';
  textArea.style.left = '-9999px';

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    if (successful) {
      alert('Text copied to clipboard (fallback)!')
    } else {
      alert('Unable to copy text. Please copy manually.');
    }
  } catch (err) {
    console.error('Fallback: oops, unable to copy', err);
  }

  document.body.removeChild(textArea);
}

// *****Retrieve data from eth mainnet*****
async function getTransactionData(txHash, rpcUrl) {
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    const tx = await provider.getTransaction(txHash);

    if (!tx) {
        throw new Error("Transaction not found");
    }

    return tx.data;
}

// *****Encryption functions*****
async function decompressBytesToStr(buffer) {
  const stream = new DecompressionStream("gzip");

  const responsePromise = new Response(stream.readable).arrayBuffer();

  const writer = stream.writable.getWriter();
  await writer.write(new Uint8Array(buffer));
  await writer.close();

  const decompressed = await responsePromise;

  return new TextDecoder().decode(decompressed);
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes.buffer;
}

function padBase64(base64) {
  let padded = base64
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  while (padded.length % 4) {
    padded += '=';
  }

  return padded;
}

async function importKeyFromUrlString(keyString) {
  const rawKey = base64ToBytes(padBase64(keyString));
  return crypto.subtle.importKey(
    "raw",
    rawKey,
    { name: "AES-GCM" },
    true, // extractable
    ["encrypt", "decrypt"]
  );
}

async function stringToIv(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);

  const hash  = await crypto.subtle.digest("SHA-256", data);

  return new Uint8Array(hash).slice(0, 12);
}

async function decrypt(key, base64Ciphertext, iv_str) {
  const iv = await stringToIv(iv_str);
  const ciphertext = base64ToBytes(base64Ciphertext);

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    ciphertext,
  );

  return await decompressBytesToStr(decryptedBuffer);
}

function hexToBase64(hex) {
    if (hex.startsWith("0x")) {
        hex = hex.slice(2);
    }

    let raw = '';
    for (let i = 0; i < hex.length; i += 2) {
        raw += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }

    return btoa(raw);
}

// ******Retrieve message and decrypt*****
async function retrievePlaintextMsg(iv_str) {
  // FAIL POINT 1
  const hexData = await getTransactionData(TXHASH, RPCURL);

  // FAIL POINT 2
  const key = await importKeyFromUrlString(getKeyFromUrlFragment());
  const base64 = hexToBase64(hexData);

  // FAIL POINT 3
  return await decrypt(key, base64, iv_str);
}

(async () => {
  console.log(await retrievePlaintextMsg('catherine esther reid'));
})();

// *****INIT*****
showWelcome();
