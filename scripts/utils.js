// utils.js

// Utility function to get song data from available sources
function getSongData(songId) {
    console.log('Fetching song data for ID:', songId);
    const song = window.songData ? window.songData[songId] : (typeof songs !== 'undefined' ? songs.find(s => s.id === songId) : null);
    if (song) {
        console.log('Found song data for ID:', songId);
        return song;
    } else {
        console.warn('Song data not found in global sources for ID:', songId);
        return null;
    }
}

// Utility function to download a song
function downloadSong(songId) {
    const song = getSongData(songId);
    if (!song || !song.link) {
        showPopup('Error: Song data not found or no link available.');
        console.error('Song data not found or no link for ID:', songId);
        return;
    }

    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    if (isChrome) {
        const link = document.createElement('a');
        link.href = song.link;
        link.download = song.title ? song.title + '.mp3' : 'song.mp3';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        console.log('Non-Chrome environment download not fully implemented');
        window.open(song.link, '_blank');
    }
    showPopup('Download started: ' + (song.title || 'Unknown Song'));
}

// Utility function to show popup messages
function showPopup(message) {
    let popupContainer = document.getElementById('popup-container');
    if (!popupContainer) {
        popupContainer = document.createElement('div');
        popupContainer.id = 'popup-container';
        popupContainer.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; font-family: Arial, sans-serif; max-width: 300px;';
        document.body.appendChild(popupContainer);
    }
    
    const popup = document.createElement('div');
    popup.className = 'popup';
    popup.textContent = message;
    popup.style.cssText = 'background: rgba(0,0,0,0.8); color: white; padding: 10px 15px; border-radius: 5px; margin-bottom: 10px; animation: fadeOut 0.5s ease-out forwards; animation-delay: 2s; word-wrap: break-word;';
    popupContainer.appendChild(popup);
    
    setTimeout(() => popup.remove(), 2500);
}

// Utility function to debounce other functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Utility function to handle clipboard copy with fallback
function copyToClipboard(text, successMessage, failureMessage) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showPopup(successMessage);
        }, () => {
            showPopup(failureMessage);
            console.error('Clipboard copy failed');
            fallbackCopy(text);
        });
    } else {
        showPopup(failureMessage + ' Manual copy required.');
        fallbackCopy(text);
    }
}

// Fallback for clipboard copy
function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand('copy');
        showPopup('Copied to clipboard manually!');
    } catch (err) {
        showPopup('Manual copy failed. Select and copy this link.');
        console.error('Manual copy failed', err);
    }
    document.body.removeChild(textArea);
}
