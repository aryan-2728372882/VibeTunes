// downloads.js

// Function to add download button to context menu
function addDownloadButtonToMenu() {
    const contextMenus = document.querySelectorAll('.context-menu:not([data-download-added="true"])');
    contextMenus.forEach(menu => {
        // Check if download button already exists to avoid duplicates
        if (menu.querySelector('.download-btn')) return;

        const songId = menu.dataset.songId;
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'menu-option download-btn';
        downloadBtn.textContent = 'Download';
        downloadBtn.addEventListener('click', () => downloadSong(songId));
        
        // Add below share button
        const shareBtn = menu.querySelector('.share-btn');
        if (shareBtn) {
            shareBtn.parentNode.insertBefore(downloadBtn, shareBtn.nextSibling);
        } else {
            menu.appendChild(downloadBtn);
        }
        // Mark menu as processed to prevent duplicate processing
        menu.setAttribute('data-download-added', 'true');
    });
}

// Function to download a song
function downloadSong(songId) {
    const song = getSongData(songId);
    if (!song || !song.link) {
        showPopup('Error: Song data not found or no link available.');
        console.error('Song data not found or no link for ID:', songId);
        return;
    }

    // Check if running in Chrome browser
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    if (isChrome) {
        browserDownload(song);
    } else {
        // Assuming app environment if not Chrome - this is a placeholder
        appDownload(song);
    }
    showPopup('Download started: ' + (song.title || 'Unknown Song'));
}

// Browser download for Chrome
function browserDownload(song) {
    const link = document.createElement('a');
    link.href = song.link;
    link.download = song.title ? song.title + '.mp3' : 'song.mp3'; // Fallback filename if title is missing
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Placeholder for app download
function appDownload(song) {
    // This would be implemented in an app environment
    console.log('App download not implemented');
}

// Initialize download button on page load
document.addEventListener('DOMContentLoaded', () => {
    // Add download button to existing context menus
    addDownloadButtonToMenu();
    
    // Set up observer for dynamically added context menus
    const observer = new MutationObserver(() => {
        addDownloadButtonToMenu();
    });
    observer.observe(document.body, { childList: true, subtree: true });
});

// Function to show popup message
function showPopup(message) {
    // Check if popup container exists, if not create it
    let popupContainer = document.getElementById('popup-container');
    if (!popupContainer) {
        popupContainer = document.createElement('div');
        popupContainer.id = 'popup-container';
        popupContainer.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; font-family: Arial, sans-serif;';
        document.body.appendChild(popupContainer);
    }
    
    // Create popup
    const popup = document.createElement('div');
    popup.className = 'popup';
    popup.textContent = message;
    popup.style.cssText = 'background: rgba(0,0,0,0.8); color: white; padding: 10px 15px; border-radius: 5px; margin-bottom: 10px; animation: fadeOut 0.5s ease-out forwards; animation-delay: 2s;';
    popupContainer.appendChild(popup);
    
    // Remove popup after animation
    setTimeout(() => popup.remove(), 2500);
}

// Attempt to fetch song data from global data sources
function getSongData(songId) {
    // Attempt to fetch song data from global data sources used in player.js
    console.log('Fetching song data for ID: ', songId);
    // Try window.songData first, then fall back to a global songs array if available
    const song = window.songData ? window.songData[songId] : (typeof songs !== 'undefined' ? songs.find(s => s.id === songId) : null);
    if (song) {
        console.log('Found song data for ID:', songId);
        return song;
    } else {
        console.warn('Song data not found in global sources for ID:', songId);
        // Fallback to dummy data only if no global data is available - ideally, avoid this
        return {
            title: 'Song ' + songId,
            link: '#', // Placeholder link - replace with actual song URL if needed
            thumbnail: '' // Placeholder thumbnail - replace with actual thumbnail URL if needed
        };
    }
}
