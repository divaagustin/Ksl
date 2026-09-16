/**
 * Security Helper Functions
 */

/**
 * Escapes unsafe HTML characters to prevent XSS vulnerabilities
 * @param {string} str - Raw string
 * @returns {string} Sanitized safe string
 */
export function sanitizeHTML(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"']/g, (match) => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return map[match];
  });
}

/**
 * Validates allowed file extensions for temporary upload
 * @param {string} filename 
 * @returns {boolean} True if safe extension
 */
export function isSafeFileType(filename) {
  const dangerousExts = ['.exe', '.sh', '.bat', '.cmd', '.php', '.phtml', '.vbs', '.js', '.jar'];
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return !dangerousExts.includes(ext);
}
