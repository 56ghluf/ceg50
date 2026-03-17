const copyText = 'set parametric;set trange [0:1];unset border;unset xtics;unset ytics;unset key;unset title;set size ratio -1;plot t-1, 2*t + 4 w l lw 6, -0.5 * t - 0.5, 4 w l lw 6, t - 1.5, 2*t+2 w l lw 6, -0.5*t-1,2 w l lw 6, t-2,2*t w l lw 6, -t+1,2*t+4 w l lw 6, 0.5*t+0.5,4 w l lw 6, -t+1.5,2*t+2 w l lw 6, 0.5*t+1,2 w l lw 6, -t+2,2*t w l lw 6, -4*t+2,0 w l lw 6, -0.25,1.5*t-1.5 w l lw 6, 0.25,1.5*t-1.5 w l lw 6, -0.5*t+0.25,-1.5 w l lw 6';

const copyButton = document.getElementById("copyButton");

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

copyButton.addEventListener('click', () => copyTextToClipboard(copyText));
