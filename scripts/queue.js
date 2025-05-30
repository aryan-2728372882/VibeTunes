// queue.js
let queueIndex = 0;
let preQueueSongIndex = -1; // Track playlist index before queue starts
let songQueue = []; // Explicitly initialize songQueue
let isQueueActive = false; // Track if queue is active
let isPlaying = false; // Prevent overlapping playback
let currentSongIndex = 0; // Current index in currentPlaylist
let currentPlaylist = []; // Current playlist (e.g., fixedBhojpuri)
let currentContext = ''; // Current context (e.g., 'bhojpuri')
let repeatMode = 0; // 0 = no repeat, 1 = repeat all, 2 = repeat one
let manualPause = false; // Track manual pause state

// DOM elements
const queueList = document.getElementById("queue-list");
const clearQueueBtn = document.getElementById("clear-queue-btn");
const toggleQueueBtn = document.getElementById("queue-toggle-btn");
const queuePanel = document.getElementById("queue-panel");
const closeQueueBtn = document.getElementById("close-queue-btn");
// Assume audioPlayer and seekBar are defined elsewhere
// Assume fixedBhojpuri, fixedPhonk, etc., are defined elsewhere

function addToQueue(song, playImmediately = false) {
    if (!song || !song.title || !song.link || !song.thumbnail) {
        console.error("Invalid song data for queue:", song);
        console.log("Cannot add invalid song to queue.");
        return;
    }

    if (playImmediately) {
        songQueue = [song, ...songQueue];
        queueIndex = 0;
        isQueueActive = true;
        preQueueSongIndex = currentSongIndex;
        playSong(song.title, getSongContext(song));
    } else {
        if (!isQueueActive) {
            preQueueSongIndex = currentSongIndex;
        }
        songQueue.push(song);
        isQueueActive = true;
        updateQueueUI();
        console.log(`Added "${song.title}" to queue`);
    }
}

function clearQueue() {
    songQueue = [];
    queueIndex = 0;
    isQueueActive = false;
    preQueueSongIndex = -1;
    updateQueueUI();
    console.log("Queue cleared!");
}

function toggleQueuePanel() {
    console.log("toggleQueuePanel called, queuePanel:", queuePanel);
    if (queuePanel) {
        const currentDisplay = queuePanel.style.display;
        queuePanel.style.display = currentDisplay === "none" || !currentDisplay ? "block" : "none";
        console.log("Queue panel display set to:", queuePanel.style.display);
        if (queuePanel.style.display === "block") {
            updateQueueUI();
        }
    } else {
        console.error("Queue panel not found in DOM!");
        console.log("Queue UI not available.");
    }
}

function updateQueueUI() {
    if (!queueList) {
        console.error("Queue list element not found!");
        console.log("Queue UI not available.");
        return;
    }
    queueList.innerHTML = "";
    songQueue.forEach((song, index) => {
        if (!song || !song.title || !song.thumbnail) {
            console.warn("Skipping invalid song in queue at index:", index);
            return;
        }
        const queueItem = document.createElement("div");
        queueItem.className = "queue-item";
        queueItem.innerHTML = `
            <img src="${song.thumbnail}" alt="${song.title}" class="queue-thumbnail">
            <span>${song.title}</span>
            <button class="remove-queue-btn" data-index="${index}">🗑️</button>
        `;
        queueItem.addEventListener("click", () => {
            console.log("Queue item clicked:", index, song.title);
            queueIndex = index;
            playSong(song.title, getSongContext(song));
            updateQueueUI();
        });
        queueList.appendChild(queueItem);
    });

    document.querySelectorAll(".remove-queue-btn").forEach(btn => {
        btn.removeEventListener("click", removeQueueItemHandler); // Cleanup old listeners
        btn.addEventListener("click", removeQueueItemHandler);
    });

    if (songQueue.length === 0 && queueList) {
        queueList.innerHTML = "<p>No songs in queue.</p>";
    }
}

// Handler for remove queue item to avoid duplicate listeners
function removeQueueItemHandler(e) {
    e.stopPropagation();
    const index = parseInt(e.target.dataset.index);
    console.log("Removing queue item at index:", index);
    songQueue.splice(index, 1);
    if (index < queueIndex) queueIndex--;
    if (songQueue.length === 0) {
        isQueueActive = false;
        preQueueSongIndex = currentSongIndex;
    }
    updateQueueUI();
    console.log("Song removed from queue.");
}

function handleSongEndWithQueue() {
    console.log(`Song ended - Queue:`, songQueue, `Repeat: ${repeatMode}, QueueIndex: ${queueIndex}, CurrentSongIndex: ${currentSongIndex}, PreQueueSongIndex: ${preQueueSongIndex}`);

    if (repeatMode === 2) {
        audioPlayer.currentTime = 0;
        seekBar.value = 0;
        audioPlayer.play()
            .then(() => {
                updatePlayPauseButton();
                preloadNextSong();
            })
            .catch(err => {
                console.error("Repeat one error:", err);
                console.log("Failed to repeat song, skipping...");
                nextSong();
            });
        return;
    }

    // Use 500ms delay to ensure audio state is settled
    setTimeout(() => {
        if (isQueueActive && songQueue.length > 0 && queueIndex < songQueue.length) {
            const nextSong = songQueue[queueIndex];
            console.log("Playing next song from queue:", nextSong.title);
            playSong(nextSong.title, getSongContext(nextSong));
            queueIndex++;
            if (queueIndex >= songQueue.length) {
                songQueue = [];
                queueIndex = 0;
                isQueueActive = false;
                // Resume from the song after the one playing before queue started
                if (preQueueSongIndex >= 0 && preQueueSongIndex < currentPlaylist.length - 1) {
                    currentSongIndex = preQueueSongIndex + 1;
                } else if (preQueueSongIndex >= currentPlaylist.length - 1) {
                    currentSongIndex = 0;
                }
                preQueueSongIndex = -1;
            }
            updateQueueUI();
        } else {
            isQueueActive = false;
            queueIndex = 0;
            songQueue = [];
            // Continue normal playlist playback
            if (currentSongIndex < currentPlaylist.length - 1) {
                currentSongIndex += 1;
            } else {
                currentSongIndex = 0;
            }
            preQueueSongIndex = -1;
            updateQueueUI();
            console.log("Queue empty, transitioning to playlist with CurrentSongIndex:", currentSongIndex);
            if (currentPlaylist.length > 0 && currentSongIndex < currentPlaylist.length) {
                playSong(currentPlaylist[currentSongIndex].title, currentContext);
            }
        }
    }, 500);
}

function getSongContext(song) {
    if (fixedBhojpuri.some(s => s.title === song.title)) return 'bhojpuri';
    if (fixedPhonk.some(s => s.title === song.title)) return 'phonk';
    if (fixedHaryanvi.some(s => s.title === song.title)) return 'haryanvi';
    if (jsonBhojpuriSongs.some(s => s.title === song.title)) return 'json-bhojpuri';
    if (jsonPhonkSongs.some(s => s.title === song.title)) return 'json-phonk';
    if (jsonHaryanviSongs.some(s => s.title === song.title)) return 'json-haryanvi';
    if (jsonRemixSongs.some(s => s.title === song.title)) return 'json-remixes';
    return 'search';
}

async function playSong(title, context, retryCount = 0) {
    const maxRetries = 3;
    if (isPlaying) {
        if (retryCount >= maxRetries) {
            console.log(`Max retries reached for: ${title}, skipping...`);
            isPlaying = false;
            handleSongEndWithQueue();
            return;
        }
        console.log(`Waiting to play: ${title}, retry ${retryCount + 1}`);
        // Exponential backoff: 500ms, 1000ms, 2000ms
        setTimeout(() => playSong(title, context, retryCount + 1), 500 * Math.pow(2, retryCount));
        return;
    }
    isPlaying = true;

    let song;
    switch (context) {
        case 'bhojpuri':
            song = fixedBhojpuri.find(s => s.title === title);
            currentPlaylist = fixedBhojpuri;
            currentContext = 'bhojpuri';
            break;
        case 'phonk':
            song = fixedPhonk.find(s => s.title === title);
            currentPlaylist = fixedPhonk;
            currentContext = 'phonk';
            break;
        case 'haryanvi':
            song = fixedHaryanvi.find(s => s.title === title);
            currentPlaylist = fixedHaryanvi;
            currentContext = 'haryanvi';
            break;
        case 'json-bhojpuri':
            song = jsonBhojpuriSongs.find(s => s.title === title);
            currentPlaylist = jsonBhojpuriSongs;
            currentContext = 'json-bhojpuri';
            break;
        case 'json-phonk':
            song = jsonPhonkSongs.find(s => s.title === title);
            currentPlaylist = jsonPhonkSongs;
            currentContext = 'json-phonk';
            break;
        case 'json-haryanvi':
            song = jsonHaryanviSongs.find(s => s.title === title);
            currentPlaylist = jsonHaryanviSongs;
            currentContext = 'json-haryanvi';
            break;
        case 'json-remixes':
            song = jsonRemixSongs.find(s => s.title === title);
            currentPlaylist = jsonRemixSongs;
            currentContext = 'json-remixes';
            break;
        case 'search':
            song = currentPlaylist.find(s => s.title === title);
            currentContext = 'search';
            break;
    }

    if (!song || !isValidSong(song)) {
        console.error(`Song not found or invalid: ${title} in context ${context}`);
        isPlaying = false;
        console.log(`Song "${title}" not found, skipping...`);
        handleSongEndWithQueue();
        return;
    }

    currentSongIndex = currentPlaylist.findIndex(s => s.title === title);
    console.log(`Playing: ${song.title}, Context: ${context}, URL: ${song.link}, Index: ${currentSongIndex}`);

    try {
        manualPause = false;
        console.log(`Loading song: ${song.title}`);
        // Reset audioPlayer state
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        audioPlayer.src = ''; // Clear previous source
        seekBar.value = 0;

        // Validate URL accessibility
        const response = await fetch(song.link, { method: 'HEAD' });
        if (!response.ok) {
            throw new Error(`Invalid song URL: ${song.link}, status: ${response.status}`);
        }

        audioPlayer.src = song.link;
        audioPlayer.load();
        await audioPlayer.play();
        playerContainer.style.display = "flex";
        updatePlayerUI(song);
        setupMediaSession(song);
        highlightCurrentSong();
        preloadNextSong();
        clearAudioCache();
        requestWakeLock();
        updateProgress();
        isPlaying = false; // Reset after successful play
    } catch (error) {
        console.error(`Playback error for ${song.title}:`, error);
        console.log(`Song "${song.title}" failed to play, retrying...`);
        isPlaying = false;
        if (retryCount < maxRetries) {
            setTimeout(() => playSong(title, context, retryCount + 1), 500 * Math.pow(2, retryCount));
        } else {
            console.log(`Max retries reached for ${song.title}, skipping...`);
            handleSongEndWithQueue();
        }
    }
}

function isValidSong(song) {
    return song && song.title && song.link && song.thumbnail;
}

// Helper to preload next song
function preloadNextSong() {
    let nextSong;
    if (isQueueActive && queueIndex < songQueue.length) {
        nextSong = songQueue[queueIndex];
    } else {
        const nextIndex = (currentSongIndex + 1) % currentPlaylist.length;
        nextSong = currentPlaylist[nextIndex];
    }
    if (nextSong && nextSong.link) {
        const preloadAudio = new Audio(nextSong.link);
        preloadAudio.preload = 'auto';
        console.log(`Preloaded: ${nextSong.title}`);
    }
}

// Helper to play next song
function nextSong() {
    if (isQueueActive && queueIndex < songQueue.length) {
        const nextSong = songQueue[queueIndex];
        playSong(nextSong.title, getSongContext(nextSong));
        queueIndex++;
        updateQueueUI();
    } else {
        isQueueActive = false;
        queueIndex = 0;
        songQueue = [];
        currentSongIndex = (currentSongIndex + 1) % currentPlaylist.length;
        playSong(currentPlaylist[currentSongIndex].title, currentContext);
        updateQueueUI();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("Attaching queue event listeners...");
    if (clearQueueBtn) {
        clearQueueBtn.addEventListener("click", clearQueue);
        console.log("Clear queue button listener attached");
    } else {
        console.error("Clear queue button not found!");
    }
    if (toggleQueueBtn) {
        toggleQueueBtn.addEventListener("click", toggleQueuePanel);
        console.log("Toggle queue button listener attached");
    } else {
        console.error("Toggle queue button not found!");
    }
    if (closeQueueBtn) {
        closeQueueBtn.addEventListener("click", toggleQueuePanel);
        console.log("Close queue button listener attached");
    } else {
        console.error("Close queue button not found!");
    }

    if (audioPlayer) {
        audioPlayer.onended = handleSongEndWithQueue;
        console.log("Audio player onended listener attached");
    } else {
        console.error("Audio player not found!");
    }

    console.log("Queue system initialized");
});

// Cleanup event listeners on page unload
window.addEventListener("unload", () => {
    if (clearQueueBtn) clearQueueBtn.removeEventListener("click", clearQueue);
    if (toggleQueueBtn) toggleQueueBtn.removeEventListener("click", toggleQueuePanel);
    if (closeQueueBtn) closeQueueBtn.removeEventListener("click", toggleQueuePanel);
    if (audioPlayer) audioPlayer.onended = null;
});