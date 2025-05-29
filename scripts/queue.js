let queueIndex = 0;
let preQueueSongIndex = -1; // Track playlist index before queue starts

const queueList = document.getElementById("queue-list");
const clearQueueBtn = document.getElementById("clear-queue-btn");
const toggleQueueBtn = document.getElementById("queue-toggle-btn");
const queuePanel = document.getElementById("queue-panel");
const closeQueueBtn = document.getElementById("close-queue-btn");

function addToQueue(song, playImmediately = false) {
    if (!song || !song.title || !song.link || !song.thumbnail) {
        console.error("Invalid song data for queue:", song);
        showPopup("Cannot add invalid song to queue.");
        return;
    }

    if (playImmediately) {
        songQueue = [song, ...songQueue];
        queueIndex = 0;
        isQueueActive = true;
        // Save current playlist index before queue starts
        preQueueSongIndex = currentSongIndex;
        playSong(song.title, getSongContext(song));
    } else {
        if (!isQueueActive) {
            // Save current playlist index when queue becomes active
            preQueueSongIndex = currentSongIndex;
        }
        songQueue.push(song);
        isQueueActive = true;
        updateQueueUI();
        showPopup(`Added "${song.title}" to queue`);
    }
}

function clearQueue() {
    songQueue = [];
    queueIndex = 0;
    isQueueActive = false;
    preQueueSongIndex = -1; // Reset pre-queue index
    updateQueueUI();
    showPopup("Queue cleared!");
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
        showPopup("Queue UI not available.");
    }
}

function updateQueueUI() {
    if (!queueList) {
        console.error("Queue list element not found!");
        showPopup("Queue UI not available.");
        return;
    }
    queueList.innerHTML = "";
    songQueue.forEach((song, index) => {
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
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const index = parseInt(btn.dataset.index);
            console.log("Removing queue item at index:", index);
            songQueue.splice(index, 1);
            if (index < queueIndex) queueIndex--;
            if (songQueue.length === 0) {
                isQueueActive = false;
                preQueueSongIndex = currentSongIndex; // Preserve current index
            }
            updateQueueUI();
            showPopup("Song removed from queue.");
        });
    });

    if (songQueue.length === 0 && queueList) {
        queueList.innerHTML = "<p>No songs in queue.</p>";
    }
}

function handleSongEndWithQueue() {
    console.log(`Song ended - Queue:`, songQueue, `Repeat: ${repeatMode}, QueueIndex: ${queueIndex}, CurrentSongIndex: ${currentSongIndex}, PreQueueSongIndex: ${preQueueSongIndex}`);

    if (repeatMode === 2) {
        audioPlayer.currentTime = 0;
        audioPlayer.play().then(() => {
            updatePlayPauseButton();
            preloadNextSong();
        }).catch(err => {
            console.error("Repeat one error:", err);
            showPopup("Failed to repeat song, skipping...");
            nextSong();
        });
        return;
    }

    if (isQueueActive && songQueue.length > 0 && queueIndex < songQueue.length) {
        const nextSong = songQueue[queueIndex];
        console.log("Playing next song from queue:", nextSong.title);
        playSong(nextSong.title, getSongContext(nextSong));
        queueIndex++;
        if (queueIndex >= songQueue.length) {
            songQueue = [];
            queueIndex = 0;
            isQueueActive = false;
            // Restore playlist index for next song
            if (preQueueSongIndex >= 0 && preQueueSongIndex < currentPlaylist.length - 1) {
                currentSongIndex = preQueueSongIndex; // Start from pre-queue song
            }
        }
        updateQueueUI();
    } else {
        isQueueActive = false;
        queueIndex = 0;
        songQueue = [];
        // Restore playlist index or increment from pre-queue position
        if (preQueueSongIndex >= 0 && preQueueSongIndex < currentPlaylist.length - 1) {
            currentSongIndex = preQueueSongIndex + 1; // Next song after pre-queue song
        } else if (currentSongIndex >= currentPlaylist.length - 1) {
            currentSongIndex = 0; // Loop back to start if at end
        }
        preQueueSongIndex = -1; // Reset pre-queue index
        updateQueueUI();
        console.log("Queue empty, transitioning to playlist with CurrentSongIndex:", currentSongIndex);
        handleSongEnd();
    }
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

async function playSong(title, context) {
    if (isPlaying) {
        console.log(`Already playing, ignoring new request for: ${title}`);
        showPopup("Please wait, another song is playing.");
        return;
    }
    isPlaying = true;

    let song;
    switch (context) {
        case 'bhojpuri': song = fixedBhojpuri.find(s => s.title === title); currentPlaylist = fixedBhojpuri; currentContext = 'bhojpuri'; break;
        case 'phonk': song = fixedPhonk.find(s => s.title === title); currentPlaylist = fixedPhonk; currentContext = 'phonk'; break;
        case 'haryanvi': song = fixedHaryanvi.find(s => s.title === title); currentPlaylist = fixedHaryanvi; currentContext = 'haryanvi'; break;
        case 'json-bhojpuri': song = jsonBhojpuriSongs.find(s => s.title === title); currentPlaylist = jsonBhojpuriSongs; currentContext = 'json-bhojpuri'; break;
        case 'json-phonk': song = jsonPhonkSongs.find(s => s.title === title); currentPlaylist = jsonPhonkSongs; currentContext = 'json-phonk'; break;
        case 'json-haryanvi': song = jsonHaryanviSongs.find(s => s.title === title); currentPlaylist = jsonHaryanviSongs; currentContext = 'json-haryanvi'; break;
        case 'json-remixes': song = jsonRemixSongs.find(s => s.title === title); currentPlaylist = jsonRemixSongs; currentContext = 'json-remixes'; break;
        case 'search': song = currentPlaylist.find(s => s.title === title); currentContext = 'search'; break;
    }

    if (!song || !isValidSong(song)) {
        console.error(`Song not found or invalid: ${title} in context ${context}`);
        isPlaying = false;
        showPopup(`Song "${title}" not found, skipping...`);
        return handleSongEndWithQueue();
    }

    currentSongIndex = currentPlaylist.findIndex(s => s.title === title);
    console.log(`Playing: ${song.title}, Context: ${context}, URL: ${song.link}, Index: ${currentSongIndex}`);

    try {
        manualPause = false;
        showPopup("Loading song...");
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        audioPlayer.src = song.link;
        audioPlayer.load();
        await audioPlayer.play();
        document.querySelector(".popup-notification")?.remove();
        playerContainer.style.display = "flex";
        updatePlayerUI(song);
        setupMediaSession(song);
        highlightCurrentSong();
        preloadNextSong();
        clearAudioCache();
        requestWakeLock();
        updateProgress();
    } catch (error) {
        console.error(`Playback error for ${song.title}:`, error);
        document.querySelector(".popup-notification")?.remove();
        showPopup(`Song "${song.title}" failed to play, skipping...`);
        isPlaying = false;
        handleSongEndWithQueue();
    } finally {
        isPlaying = false;
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
    
    audioPlayer.onended = handleSongEndWithQueue;

    console.log("Queue system initialized");
});