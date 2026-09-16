/**
 * Copy text to clipboard with modern Clipboard API and fallback for non-secure contexts (HTTP/IPs)
 * @param {string} text 
 * @returns {Promise<boolean>}
 */
export async function copyTextToClipboard(text) {
  if (!text) return false;

  // 1. Try modern navigator.clipboard API if available and in secure context
  if (navigator.clipboard && (window.isSecureContext || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('navigator.clipboard.writeText failed, attempting fallback copy:', err);
    }
  }

  // 2. Fallback using execCommand with temporary hidden textarea
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    // Prevent scrolling to bottom on iOS / mobile
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const success = document.execCommand('copy');
    document.body.removeChild(textArea);

    return success;
  } catch (err) {
    console.error('execCommand copy failed:', err);
    return false;
  }
}
