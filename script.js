const copyText = `
p_{1}=\\left(0,6\\right)
p_{2}=\\left(-1,4\\right)
p_{3}=\\left(-0.5,4\\right)
p_{4}=\\left(-1.5,2\\right)
p_{5}=\\left(-1,2\\right)
p_{6}=\\left(-2,0\\right)
p_{7}=\\left(1,4\\right)
p_{8}=\\left(0.5,4\\right)
p_{9}=\\left(1.5,2\\right)
p_{10}=\\left(1,2\\right)
p_{11}=\\left(2,0\\right)
p_{12}=\\left(-0.25,0\\right)
p_{13}=\\left(-0.25,-1.5\\right)
p_{14}=\\left(0.25,0\\right)
p_{15}=\\left(0.25,-1.5\\right)
tp_{1}+\\left(1-t\\right)p_{2}\\left\\{0\\le t\\le1\\right\\}
tp_{2}+\\left(1-t\\right)p_{3}\\left\\{0\\le t\\le1\\right\\}
tp_{3}+\\left(1-t\\right)p_{4}\\left\\{0\\le t\\le1\\right\\}
tp_{4}+\\left(1-t\\right)p_{5}\\left\\{0\\le t\\le1\\right\\}
tp_{5}+\\left(1-t\\right)p_{6}\\left\\{0\\le t\\le1\\right\\}
tp_{1}+\\left(1-t\\right)p_{7}\\left\\{0\\le t\\le1\\right\\}
tp_{7}+\\left(1-t\\right)p_{8}\\left\\{0\\le t\\le1\\right\\}
tp_{8}+\\left(1-t\\right)p_{9}\\left\\{0\\le t\\le1\\right\\}
tp_{9}+\\left(1-t\\right)p_{10}\\left\\{0\\le t\\le1\\right\\}
tp_{10}+\\left(1-t\\right)p_{11}\\left\\{0\\le t\\le1\\right\\}
tp_{6}+\\left(1-t\\right)p_{11}\\left\\{0\\le t\\le1\\right\\}
tp_{12}+\\left(1-t\\right)p_{13}\\left\\{0\\le t\\le1\\right\\}
tp_{14}+\\left(1-t\\right)p_{15}\\left\\{0\\le t\\le1\\right\\}
tp_{13}+\\left(1-t\\right)p_{15}\\left\\{0\\le t\\le1\\right\\}
`;

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
