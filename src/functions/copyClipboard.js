import React from 'react';

export const copyClipboard = (targetClass) => {
  const value = document.querySelector(targetClass).value;
  if (window.clipboardData && window.clipboardData.setData) {
// IE specific code path to prevent textarea being shown while dialog is visible.
    return window.clipboardData.setData("Text", value);
  }
  else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
    var textarea = document.createElement("textarea");
    textarea.textContent = value;
    textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
    document.body.appendChild(textarea);
    textarea.select();
    try {
        return document.execCommand("copy"); // Security exception may be thrown by some browsers.
    } catch (ex) {
        console.warn("Copy to clipboard failed.", ex);
        return false;
    } finally {
        document.body.removeChild(textarea);
    }
  }
}
