// recently-played.js - Handles recently played songs functionality

// Constants
const RECENTLY_PLAYED_KEY = 'vibeTunes_recentlyPlayed';
const PLAY_COUNT_KEY = 'vibeTunes_playCount';
const MAX_RECENTLY_PLAYED = 10;
const DEFAULT_SORT = 'recent'; // 'recent', 'most-played', 'alphabetical'

// State variables
let recentlyPlayedSongs = [];
let playCountData = {};
let currentSort = DEFAULT_SORT;
let maxHistoryItems = MAX_RECENTLY_PLAYED;

// Initialize recently played section
document.addEventListener('DOMContentLoaded', () => {
    // Load play count data
    loadPlayCountData();
    
    // Add event listener to the audio player to track song plays
    const audioPlayer = document.getElementById('audio-player');
    if (audioPlayer) {
        // Track when a song starts playing
        audioPlayer.addEventListener('play', handleSongPlay);
        
        // Also track when a song ends
        audioPlayer.addEventListener('ended', handleSongPlay);
    }
    
    // Add controls to the Recently Played section
    addRecentlyPlayedControls();
    
    // Display recently played songs
    displayRecentlyPlayed();
});

// Function to add controls to the Recently Played section
function addRecentlyPlayedControls() {
    const section = document.getElementById('recently-played-section');
    if (!section) return;
    
    // Create controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'recently-played-controls';
    
    // Add Play All button
    const playAllButton = document.createElement('button');
    playAllButton.className = 'control-button play-all-btn';
    playAllButton.innerHTML = '▶ Play';
    playAllButton.title = 'Play all recently played songs';
    playAllButton.addEventListener('click', playAllRecentlyPlayed);
    
    // Add Clear History button
    const clearButton = document.createElement('button');
    clearButton.className = 'control-button clear-history-btn';
    clearButton.innerHTML = '🗑️ Clear';
    clearButton.title = 'Clear listening history';
    clearButton.addEventListener('click', clearRecentlyPlayed);
    
    // Add Sort dropdown
    const sortContainer = document.createElement('div');
    sortContainer.className = 'sort-container';
    
    const sortLabel = document.createElement('span');
    sortLabel.textContent = 'Sort:';
    sortLabel.className = 'sort-label';
    
    const sortSelect = document.createElement('select');
    sortSelect.className = 'sort-select';
    sortSelect.innerHTML = `
        <option value="recent">Recent</option>
        <option value="most-played">Most Played</option>
        <option value="alphabetical">A-Z</option>
    `;
    sortSelect.value = currentSort;
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        displayRecentlyPlayed();
    });
    
    // Add Max History dropdown
    const maxContainer = document.createElement('div');
    maxContainer.className = 'max-container';
    
    const maxLabel = document.createElement('span');
    maxLabel.textContent = 'Show:';
    maxLabel.className = 'max-label';
    
    const maxSelect = document.createElement('select');
    maxSelect.className = 'max-select';
    
    maxSelect.innerHTML = `
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="15">15</option>
    `;
    
    maxSelect.value = maxHistoryItems;
    maxSelect.addEventListener('change', (e) => {
        maxHistoryItems = parseInt(e.target.value, 10);
        displayRecentlyPlayed();
    });
    
    // Assemble the controls - all in a single row for better visibility
    controlsContainer.appendChild(playAllButton);
    controlsContainer.appendChild(clearButton);
    controlsContainer.appendChild(sortContainer);
    controlsContainer.appendChild(maxContainer);
    
    // Insert controls after the heading
    const heading = section.querySelector('h2');
    if (heading) {
        heading.parentNode.insertBefore(controlsContainer, heading.nextSibling);
    } else {
        section.prepend(controlsContainer);
    }
}

// Function to display recently played songs
function displayRecentlyPlayed() {
    const recentlyPlayedContainer = document.getElementById('recently-played-container');
    if (!recentlyPlayedContainer) {
        console.error('Recently played container not found!');
        return;
    }
    
    // Clear existing content
    recentlyPlayedContainer.innerHTML = '';
    
    // Get recently played songs
    const recentlyPlayed = getRecentlyPlayed();
    
    if (recentlyPlayed.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.textContent = 'No recently played songs';
        emptyMessage.style.padding = '20px';
        emptyMessage.style.color = 'rgba(255, 255, 255, 0.7)';
        recentlyPlayedContainer.appendChild(emptyMessage);
        return;
    }
    
    // Add songs directly to the existing scroll container
    // This matches how the other sections work in the app
    recentlyPlayed.forEach(song => {
        const songItem = createSongItem(song);
        recentlyPlayedContainer.appendChild(songItem);
    });
}

// Function to create a song item in the Recently Played list
function createSongItem(song) {
    // Main container
    const songItem = document.createElement('div');
    songItem.className = 'song-card';
    songItem.style.minWidth = '180px';
    songItem.style.maxWidth = '180px';
    songItem.style.margin = '0 10px';
    songItem.style.cursor = 'pointer';
    songItem.style.position = 'relative';
    songItem.style.boxSizing = 'border-box';
    
    if (song.currentSession) {
        songItem.classList.add('current-session');
    }
    
    // Create thumbnail container
    const thumbnailContainer = document.createElement('div');
    thumbnailContainer.className = 'thumbnail-container';
    thumbnailContainer.style.position = 'relative';
    thumbnailContainer.style.width = '100%';
    thumbnailContainer.style.height = '160px';
    thumbnailContainer.style.borderRadius = '8px';
    thumbnailContainer.style.overflow = 'hidden';
    thumbnailContainer.style.marginBottom = '10px';
    thumbnailContainer.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
    
    // Add play count badge
    const playCountBadge = document.createElement('div');
    playCountBadge.className = 'play-count-badge';
    playCountBadge.style.position = 'absolute';
    playCountBadge.style.top = '5px';
    playCountBadge.style.left = '5px';
    playCountBadge.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    playCountBadge.style.color = 'white';
    playCountBadge.style.padding = '3px 8px';
    playCountBadge.style.borderRadius = '12px';
    playCountBadge.style.fontSize = '12px';
    playCountBadge.style.fontWeight = 'bold';
    playCountBadge.style.zIndex = '2';
    
    // Get play count from localStorage
    let playCount = 1;
    const playCountData = getPlayCountData();
    if (playCountData) {
        // Try to find the song in play count data by title
        const songId = Object.keys(playCountData).find(id => 
            playCountData[id].title === song.title
        );
        if (songId && playCountData[songId] && playCountData[songId].count) {
            playCount = playCountData[songId].count;
        }
    }
    
    playCountBadge.textContent = `${playCount}×`;
    thumbnailContainer.appendChild(playCountBadge);
    
    // Add thumbnail with error handling
    const thumbnail = document.createElement('img');
    thumbnail.style.width = '100%';
    thumbnail.style.height = '100%';
    thumbnail.style.objectFit = 'cover';
    thumbnail.style.borderRadius = '8px';
    thumbnail.src = song.thumbnail || 'images/default-thumbnail.jpg';
    thumbnail.alt = song.title;
    thumbnail.onerror = function() {
        console.log('Thumbnail failed to load, using default:', thumbnail.src);
        this.src = 'images/default-thumbnail.jpg';
    };
    thumbnailContainer.appendChild(thumbnail);
    
    // Add play button overlay on thumbnail
    const playButtonOverlay = document.createElement('div');
    playButtonOverlay.style.position = 'absolute';
    playButtonOverlay.style.top = '0';
    playButtonOverlay.style.left = '0';
    playButtonOverlay.style.width = '100%';
    playButtonOverlay.style.height = '100%';
    playButtonOverlay.style.background = 'rgba(0, 0, 0, 0.3)';
    playButtonOverlay.style.display = 'flex';
    playButtonOverlay.style.alignItems = 'center';
    playButtonOverlay.style.justifyContent = 'center';
    playButtonOverlay.style.opacity = '0';
    playButtonOverlay.style.transition = 'opacity 0.2s';
    playButtonOverlay.style.borderRadius = '8px';
    
    const playIcon = document.createElement('div');
    playIcon.innerHTML = '▶️';
    playIcon.style.fontSize = '40px';
    playIcon.style.color = 'white';
    
    playButtonOverlay.appendChild(playIcon);
    thumbnailContainer.appendChild(playButtonOverlay);
    
    // Show play button on hover
    thumbnailContainer.addEventListener('mouseenter', () => {
        playButtonOverlay.style.opacity = '1';
    });
    
    thumbnailContainer.addEventListener('mouseleave', () => {
        playButtonOverlay.style.opacity = '0';
    });
    
    // Create song info container
    const songInfo = document.createElement('div');
    songInfo.className = 'song-info';
    songInfo.style.width = '100%';
    songInfo.style.overflow = 'hidden';
    
    // Add song title with ellipsis for overflow
    const titleElement = document.createElement('div');
    titleElement.className = 'song-title';
    titleElement.textContent = song.title;
    titleElement.style.fontWeight = 'bold';
    titleElement.style.marginBottom = '5px';
    titleElement.style.whiteSpace = 'nowrap';
    titleElement.style.overflow = 'hidden';
    titleElement.style.textOverflow = 'ellipsis';
    titleElement.style.fontSize = '14px';
    titleElement.style.maxWidth = '100%';
    
    // Add last played time
    const lastPlayedElement = document.createElement('div');
    lastPlayedElement.className = 'last-played';
    lastPlayedElement.textContent = formatTimestamp(song.timestamp);
    lastPlayedElement.style.fontSize = '11px';
    lastPlayedElement.style.color = '#aaa';
    lastPlayedElement.style.whiteSpace = 'nowrap';
    lastPlayedElement.style.overflow = 'hidden';
    lastPlayedElement.style.textOverflow = 'ellipsis';
    
    songInfo.appendChild(titleElement);
    songInfo.appendChild(lastPlayedElement);
    
    // Add elements to the song item
    songItem.appendChild(thumbnailContainer);
    songItem.appendChild(songInfo);
    
    // Add click event to the whole song item
    songItem.addEventListener('click', () => {
        playSongFromHistory(song);
    });
    
    return songItem;
}

// Function to play a song from history
function playSongFromHistory(song) {
    if (!song || !song.title) return;
    
    // Try to find the song in the global arrays
    let found = false;
    
    // Try to find in fixed arrays first
    const fixedArrays = {
        'bhojpuri': window.fixedBhojpuri || [],
        'phonk': window.fixedPhonk || [],
        'haryanvi': window.fixedHaryanvi || []
    };
    
    // Then try JSON arrays
    const jsonArrays = {
        'json-bhojpuri': window.jsonBhojpuriSongs || [],
        'json-phonk': window.jsonPhonkSongs || [],
        'json-haryanvi': window.jsonHaryanviSongs || []
    };
    
    // Try all contexts if song.context is not specified
    const contextsToTry = song.context ? 
        [song.context] : 
        [...Object.keys({...fixedArrays, ...jsonArrays})];
    
    for (const context of contextsToTry) {
        let songArray;
        
        if (fixedArrays[context]) {
            songArray = fixedArrays[context];
        } else if (jsonArrays[context]) {
            songArray = jsonArrays[context];
        } else {
            continue;
        }
        
        // Search for the song by title
        const songIndex = songArray.findIndex(s => s.title === song.title);
        
        if (songIndex !== -1) {
            if (typeof window.playSong === 'function') {
                window.playSong(song.title, context);
                found = true;
                break;
            }
        }
    }
    
    // If not found in any context, try a direct play with the title only
    if (!found && typeof window.playSong === 'function') {
        window.playSong(song.title, song.context || 'bhojpuri');
    }
}

// Function to handle song play events
function handleSongPlay() {
    // Get current song info from the player
    const currentSongTitle = document.querySelector('.player-info .song-title');
    const currentSongThumbnail = document.getElementById('player-thumbnail');
    
    if (currentSongTitle && currentSongTitle.textContent) {
        const title = currentSongTitle.textContent.trim();
        let thumbnail = currentSongThumbnail ? currentSongThumbnail.src : null;
        
        // Get the current context from the player if available
        let context = '';
        if (window.currentPlaylist) {
            context = window.currentPlaylist;
        }
        
        // Try to find in fixed arrays first
        const fixedArrays = {
            'bhojpuri': window.fixedBhojpuri || [],
            'phonk': window.fixedPhonk || [],
            'haryanvi': window.fixedHaryanvi || []
        };
        
        // Then try JSON arrays
        const jsonArrays = {
            'json-bhojpuri': window.jsonBhojpuriSongs || [],
            'json-phonk': window.jsonPhonkSongs || [],
            'json-haryanvi': window.jsonHaryanviSongs || []
        };
        
        // Search all arrays for the song
        for (const arrayName in fixedArrays) {
            const songArray = fixedArrays[arrayName];
            if (!songArray) continue;
            
            const song = songArray.find(s => s.title === title);
            if (song && song.thumbnail) {
                thumbnail = song.thumbnail;
                context = arrayName;
                break;
            }
        }
        
        if (!thumbnail) {
            for (const arrayName in jsonArrays) {
                const songArray = jsonArrays[arrayName];
                if (!songArray) continue;
                
                const song = songArray.find(s => s.title === title);
                if (song && song.thumbnail) {
                    thumbnail = song.thumbnail;
                    context = arrayName;
                    break;
                }
            }
        }
        
        // Debug logging to see what's happening
        console.log('handleSongPlay - Song Title:', title);
        console.log('handleSongPlay - Original Thumbnail:', currentSongThumbnail ? currentSongThumbnail.src : null);
        console.log('handleSongPlay - Found Thumbnail:', thumbnail);
        
        // Add to recently played with the found thumbnail
        addToRecentlyPlayed(null, title, thumbnail, context);
    }
}

// Function to add a song to recently played
function addToRecentlyPlayed(songId, title, thumbnail, context) {
    if (!title) return;
    
    // Load existing recently played songs
    const recentlyPlayed = JSON.parse(localStorage.getItem(RECENTLY_PLAYED_KEY)) || [];
    
    // Check if song already exists in recently played
    const existingIndex = recentlyPlayed.findIndex(song => song.title === title);
    
    // Get current timestamp
    const now = Date.now();
    
    if (existingIndex !== -1) {
        // Update existing song
        const existingSong = recentlyPlayed[existingIndex];
        
        // Update timestamp
        existingSong.timestamp = now;
        
        // Update thumbnail if provided and different
        if (thumbnail && (!existingSong.thumbnail || existingSong.thumbnail !== thumbnail)) {
            existingSong.thumbnail = thumbnail;
        }
        
        // Update context if provided
        if (context && (!existingSong.context || existingSong.context !== context)) {
            existingSong.context = context;
        }
        
        // Move to top of list
        recentlyPlayed.splice(existingIndex, 1);
        recentlyPlayed.unshift(existingSong);
    } else {
        // Add new song
        const newSong = {
            id: songId,
            title: title,
            thumbnail: thumbnail,
            timestamp: now,
            firstPlayed: now,
            context: context,
            currentSession: true
        };
        
        // Add to beginning of array
        recentlyPlayed.unshift(newSong);
    }
    
    // Limit to max recently played
    if (recentlyPlayed.length > MAX_RECENTLY_PLAYED) {
        recentlyPlayed.splice(MAX_RECENTLY_PLAYED);
    }
    
    // Save to localStorage
    localStorage.setItem(RECENTLY_PLAYED_KEY, JSON.stringify(recentlyPlayed));
    
    // Increment play count
    incrementPlayCount(songId, title, thumbnail);
    
    // Update display
    displayRecentlyPlayed();
}

// Function to increment play count for a song
function incrementPlayCount(songId, title, thumbnail) {
    if (!title) return;
    
    // Load play count data
    loadPlayCountData();
    
    // Create a unique ID for the song if not provided
    const id = songId || `song-${title.replace(/\s+/g, '-').toLowerCase()}`;
    
    // Check if song already has play count
    if (playCountData[id]) {
        // Increment count
        playCountData[id].count++;
        // Update last played time
        playCountData[id].lastPlayed = Date.now();
        // Update thumbnail if provided and different
        if (thumbnail && (!playCountData[id].thumbnail || playCountData[id].thumbnail !== thumbnail)) {
            playCountData[id].thumbnail = thumbnail;
        }
    } else {
        // Add new song
        playCountData[id] = {
            title: title,
            count: 1,
            firstPlayed: Date.now(),
            lastPlayed: Date.now(),
            thumbnail: thumbnail
        };
    }
    
    // Save to localStorage
    localStorage.setItem(PLAY_COUNT_KEY, JSON.stringify(playCountData));
}

// Function to load play count data
function loadPlayCountData() {
    playCountData = JSON.parse(localStorage.getItem(PLAY_COUNT_KEY)) || {};
}

// Function to get recently played songs
function getRecentlyPlayed() {
    const recentlyPlayed = JSON.parse(localStorage.getItem(RECENTLY_PLAYED_KEY)) || [];
    
    // Convert any string IDs to objects (backward compatibility)
    return recentlyPlayed.map(item => {
        if (typeof item === 'string') {
            // Try to get song data
            const songData = getSongDataFromId(item);
            return songData ? {
                id: item,
                title: songData.title,
                thumbnail: songData.thumbnail,
                timestamp: Date.now(),
                lastPlayed: formatTimeAgo(Date.now())
            } : null;
        }
        
        // Update lastPlayed for existing items
        if (item && item.timestamp) {
            item.lastPlayed = formatTimeAgo(item.timestamp);
        }
        
        return item;
    }).filter(Boolean); // Remove null entries
}

// Function to get play count for a song
function getPlayCount(title) {
    const songId = Object.keys(playCountData).find(id => playCountData[id].title === title);
    return songId ? playCountData[songId].count : 0;
}

// Function to remove a song from history
function removeSongFromHistory(title) {
    const songId = Object.keys(playCountData).find(id => playCountData[id].title === title);
    if (songId) {
        delete playCountData[songId];
        localStorage.setItem(PLAY_COUNT_KEY, JSON.stringify(playCountData));
    }
    
    const recentlyPlayed = JSON.parse(localStorage.getItem(RECENTLY_PLAYED_KEY)) || [];
    const index = recentlyPlayed.findIndex(item => item.title === title);
    if (index !== -1) {
        recentlyPlayed.splice(index, 1);
        localStorage.setItem(RECENTLY_PLAYED_KEY, JSON.stringify(recentlyPlayed));
    }
}

// Function to get time ago
function getTimeAgo(timestamp) {
    const now = Date.now();
    const seconds = Math.floor((now - timestamp) / 1000);
    
    if (seconds < 60) return 'just now';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    
    const years = Math.floor(days / 365);
    return `${years}y ago`;
}

// Function to get song data from ID (fallback)
function getSongDataFromId(songId) {
    if (!songId) return null;
    
    // Extract context and index from the ID
    const [context, indexStr] = songId.split('-');
    const index = parseInt(indexStr, 10);
    
    // Find the song in the appropriate array
    let songArray;
    switch (context) {
        case 'bhojpuri': songArray = window.fixedBhojpuri; break;
        case 'phonk': songArray = window.fixedPhonk; break;
        case 'haryanvi': songArray = window.fixedHaryanvi; break;
        case 'json-bhojpuri': songArray = window.jsonBhojpuriSongs; break;
        case 'json-phonk': songArray = window.jsonPhonkSongs; break;
        case 'json-haryanvi': songArray = window.jsonHaryanviSongs; break;
        default: return null;
    }
    
    return songArray && songArray[index] ? songArray[index] : null;
}

// Function to play all recently played songs
function playAllRecentlyPlayed() {
    const recentlyPlayed = getRecentlyPlayed();
    if (recentlyPlayed.length === 0) return;
    
    // Play the first song
    const firstSong = recentlyPlayed[0];
    playSongFromHistory(firstSong);
    
    // Add the rest to the queue if available
    if (typeof window.addToQueue === 'function') {
        for (let i = 1; i < recentlyPlayed.length; i++) {
            const song = recentlyPlayed[i];
            
            // Try to find the song in all contexts
            const fixedArrays = {
                'bhojpuri': window.fixedBhojpuri || [],
                'phonk': window.fixedPhonk || [],
                'haryanvi': window.fixedHaryanvi || []
            };
            
            const jsonArrays = {
                'json-bhojpuri': window.jsonBhojpuriSongs || [],
                'json-phonk': window.jsonPhonkSongs || [],
                'json-haryanvi': window.jsonHaryanviSongs || []
            };
            
            let found = false;
            
            for (const context of Object.keys({...fixedArrays, ...jsonArrays})) {
                const songArray = fixedArrays[context] || jsonArrays[context];
                
                // Search for the song by title
                const songIndex = songArray.findIndex(s => s.title === song.title);
                
                if (songIndex !== -1) {
                    window.addToQueue(song.title, context);
                    found = true;
                    break;
                }
            }
            
            // If not found, try with the original context
            if (!found && song.context) {
                window.addToQueue(song.title, song.context);
            }
        }
    }
}

// Function to clear recently played history
function clearRecentlyPlayed() {
    if (confirm('Are you sure you want to clear your listening history?')) {
        localStorage.removeItem(RECENTLY_PLAYED_KEY);
        recentlyPlayedSongs = [];
        displayRecentlyPlayed();
    }
}

// Helper function to format time ago
function formatTimeAgo(timestamp) {
    const now = Date.now();
    const seconds = Math.floor((now - timestamp) / 1000);
    
    if (seconds < 60) return 'just now';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    
    const years = Math.floor(days / 365);
    return `${years}y ago`;
}

// Function to get play count data
function getPlayCountData() {
    return JSON.parse(localStorage.getItem(PLAY_COUNT_KEY)) || {};
}

// Function to format timestamp
function formatTimestamp(timestamp) {
    return new Date(timestamp).toLocaleString();
}