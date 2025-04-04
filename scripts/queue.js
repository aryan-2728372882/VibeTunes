// queue.js

// Queue state
let songQueue = [];
let isQueueActive = false;
let isPlayingPromise = null;
let isHandlingEnd = false; // Prevent multiple ended events

// DOM Elements
const queuePanel = document.getElementById("queue-panel");
const queueList = document.getElementById("queue-list");
const queueToggleBtn = document.getElementById("queue-toggle-btn");

// Add song to queue
function addToQueue(song, playNext = false) {
    if (!song || !song.title || !song.link || !song.thumbnail) {
        console.error("Invalid song:", song);
        showPopup("Cannot add invalid song to queue!");
        return;
    }

    // Always check for duplicates regardless of playNext flag
    const isDuplicate = songQueue.some(queuedSong => queuedSong.title === song.title && queuedSong.link === song.link);
    if (isDuplicate) {
        showPopup(`"${song.title}" is already in the queue!`);
        return;
    }

    if (playNext) {
        songQueue.splice(1, 0, song);
    } else {
        songQueue.push(song);
    }
    updateQueueUI();
    showPopup(`Added "${song.title}" to queue${playNext ? " (next)" : ""}`);
    console.log("Queue:", songQueue);
}

// Remove song from queue
function removeFromQueue(index) {
    if (index >= 0 && index < songQueue.length) {
        const removed = songQueue.splice(index, 1)[0];
        updateQueueUI();
        showPopup(`Removed "${removed.title}" from queue`);
        console.log("Removed from queue:", removed);
    }
}

// Clear queue
function clearQueue() {
    songQueue = [];
    isQueueActive = false;
    updateQueueUI();
    showPopup("Queue cleared!");
    console.log("Queue cleared");
}

// Update queue UI
function updateQueueUI() {
    if (!queueList) return;
    queueList.innerHTML = "";

    if (songQueue.length === 0) {
        queueList.innerHTML = "<p class='no-queue'>Queue is empty</p>";
        return;
    }

    songQueue.forEach((song, index) => {
        const item = document.createElement("div");
        item.classList.add("queue-item");
        item.draggable = true;
        item.dataset.index = index;
        item.innerHTML = `
            <img src="${song.thumbnail}" alt="${song.title}" class="queue-thumbnail">
            <span class="queue-title">${song.title}</span>
            <button class="remove-queue-btn" onclick="removeFromQueue(${index})">✖</button>
        `;
        queueList.appendChild(item);
    });

    setupDragAndDrop();
}

// Drag-and-drop for reordering
function setupDragAndDrop() {
    const items = queueList.querySelectorAll(".queue-item");
    items.forEach(item => {
        item.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", item.dataset.index);
            item.classList.add("dragging");
        });

        item.addEventListener("dragend", () => {
            item.classList.remove("dragging");
        });

        item.addEventListener("dragover", (e) => e.preventDefault());

        item.addEventListener("drop", (e) => {
            e.preventDefault();
            const fromIdx = parseInt(e.dataTransfer.getData("text/plain"));
            const toIdx = parseInt(e.target.closest(".queue-item").dataset.index);
            if (fromIdx !== toIdx) {
                const [moved] = songQueue.splice(fromIdx, 1);
                songQueue.splice(toIdx, 0, moved);
                updateQueueUI();
                console.log("Reordered queue:", songQueue);
            }
        });
    });
}

// Toggle queue panel
function toggleQueuePanel() {
    if (queuePanel) {
        const isHidden = queuePanel.style.display === "none" || !queuePanel.style.display;
        queuePanel.style.display = isHidden ? "block" : "none";
        console.log("Queue panel toggled:", queuePanel.style.display);
    }
}

// Handle song end with queue integration
function handleSongEndWithQueue() {
    if (isHandlingEnd) return; // Debounce multiple triggers
    isHandlingEnd = true;

    console.log("Song ended - Queue:", songQueue, "Repeat:", repeatMode);

    if (repeatMode === 2) { // Repeat one
        audioPlayer.currentTime = 0;
        audioPlayer.play().then(() => {
            updatePlayPauseButton();
            preloadNextSong();
            isHandlingEnd = false;
        }).catch(err => {
            console.error("Repeat play error:", err);
            isHandlingEnd = false;
        });
        return;
    }

    if (songQueue.length > 0) {
        isQueueActive = true;
        const nextSong = songQueue.shift();
        updateQueueUI();
        playSong(nextSong.title, "queue", 0, nextSong).finally(() => {
            isHandlingEnd = false;
        });
    } else {
        isQueueActive = false;
        if (repeatMode === 1 || currentSongIndex < currentPlaylist.length - 1) {
            currentSongIndex = (currentSongIndex + 1) % currentPlaylist.length;
        } else {
            if (currentContext === "bhojpuri" && jsonBhojpuriSongs.length > 0) {
                currentPlaylist = jsonBhojpuriSongs;
                currentContext = "json-bhojpuri";
                currentSongIndex = 0;
            } else if (currentContext === "phonk" && jsonPhonkSongs.length > 0) {
                currentPlaylist = jsonPhonkSongs;
                currentContext = "json-phonk";
                currentSongIndex = 0;
            } else if (currentContext === "haryanvi" && jsonHaryanviSongs.length > 0) {
                currentPlaylist = jsonHaryanviSongs;
                currentContext = "json-haryanvi";
                currentSongIndex = 0;
            } else if (currentContext === "search") {
                const lastSong = currentPlaylist[currentSongIndex];
                if (jsonBhojpuriSongs.some(s => s.title === lastSong.title)) {
                    currentPlaylist = jsonBhojpuriSongs;
                    currentContext = "json-bhojpuri";
                    currentSongIndex = jsonBhojpuriSongs.findIndex(s => s.title === lastSong.title) + 1;
                } else if (jsonPhonkSongs.some(s => s.title === lastSong.title)) {
                    currentPlaylist = jsonPhonkSongs;
                    currentContext = "json-phonk";
                    currentSongIndex = jsonPhonkSongs.findIndex(s => s.title === lastSong.title) + 1;
                } else if (jsonHaryanviSongs.some(s => s.title === lastSong.title)) {
                    currentPlaylist = jsonHaryanviSongs;
                    currentContext = "json-haryanvi";
                    currentSongIndex = jsonHaryanviSongs.findIndex(s => s.title === lastSong.title) + 1;
                }
                if (currentSongIndex >= currentPlaylist.length) currentSongIndex = 0;
            } else if (["json-bhojpuri", "json-phonk", "json-haryanvi"].includes(currentContext)) {
                if (currentContext === "json-bhojpuri" && jsonPhonkSongs.length > 0) {
                    currentPlaylist = jsonPhonkSongs;
                    currentContext = "json-phonk";
                    currentSongIndex = 0;
                } else if (currentContext === "json-phonk" && jsonHaryanviSongs.length > 0) {
                    currentPlaylist = jsonHaryanviSongs;
                    currentContext = "json-haryanvi";
                    currentSongIndex = 0;
                } else if (currentContext === "json-haryanvi" && jsonBhojpuriSongs.length > 0) {
                    currentPlaylist = jsonBhojpuriSongs;
                    currentContext = "json-bhojpuri";
                    currentSongIndex = 0;
                } else {
                    console.log("End of playlists, stopping.");
                    showPopup("Song ended");
                    isHandlingEnd = false;
                    return;
                }
            } else {
                console.log("End of playlist, stopping.");
                showPopup("Song ended");
                isHandlingEnd = false;
                return;
            }
        }
        playSong(currentPlaylist[currentSongIndex].title, currentContext).finally(() => {
            isHandlingEnd = false;
        });
    }
}

// Modified playSong for queue
async function playSong(title, context, retryCount = 0, queuedSong = null) {
    if (isPlaying) {
        console.log(`Already playing, queuing: ${title}`);
        showPopup(`"${title}" queued`);
        return;
    }
    isPlaying = true;

    let song;
    if (context === "queue" && queuedSong) {
        song = queuedSong;
    } else {
        switch (context) {
            case "bhojpuri": song = fixedBhojpuri.find(s => s.title === title); currentPlaylist = fixedBhojpuri; currentContext = "bhojpuri"; break;
            case "phonk": song = fixedPhonk.find(s => s.title === title); currentPlaylist = fixedPhonk; currentContext = "phonk"; break;
            case "haryanvi": song = fixedHaryanvi.find(s => s.title === title); currentPlaylist = fixedHaryanvi; currentContext = "haryanvi"; break;
            case "json-bhojpuri": song = jsonBhojpuriSongs.find(s => s.title === title); currentPlaylist = jsonBhojpuriSongs; currentContext = "json-bhojpuri"; break;
            case "json-phonk": song = jsonPhonkSongs.find(s => s.title === title); currentPlaylist = jsonPhonkSongs; currentContext = "json-phonk"; break;
            case "json-haryanvi": song = jsonHaryanviSongs.find(s => s.title === title); currentPlaylist = jsonHaryanviSongs; currentContext = "json-haryanvi"; break;
            case "search": song = currentPlaylist.find(s => s.title === title); currentContext = "search"; break;
        }
    }

    if (!song) {
        console.error(`Song not found: ${title} in ${context}`);
        isPlaying = false;
        return nextSong();
    }

    if (context !== "queue") {
        currentSongIndex = currentPlaylist.findIndex(s => s.title === title);
    }
    console.log(`Playing: ${song.title}, Context: ${context}`);

    try {
        manualPause = false;
        showPopup("Loading...");

        // Ensure clean state
        if (audioPlayer.src) {
            audioPlayer.pause();
            audioPlayer.src = ""; // Clear src to reset state
        }
        audioPlayer.currentTime = 0;
        audioPlayer.src = song.link;
        audioPlayer.load();

        // Wait for any previous play to finish
        if (isPlayingPromise) {
            await isPlayingPromise.catch(() => {}); // Ignore previous errors
        }

        isPlayingPromise = audioPlayer.play();
        await isPlayingPromise;

        document.querySelector(".popup-notification")?.remove();
        playerContainer.style.display = "flex";
        updatePlayerUI(song);
        setupMediaSession(song);
        highlightCurrentSong();
        preloadNextSong();
        clearAudioCache();
        requestWakeLock();
        updateProgress();
        showPopup("Song started playing!");
    } catch (error) {
        console.error(`Playback error for ${song.title}:`, error);
        document.querySelector(".popup-notification")?.remove();
        if (retryCount < 3) {
            showPopup(`Retrying (${retryCount + 1}/3)...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            isPlaying = false;
            return playSong(title, context, retryCount + 1, queuedSong);
        } else {
            showPopup("Failed, skipping...");
            isPlaying = false;
            return nextSong();
        }
    } finally {
        isPlaying = false;
        isPlayingPromise = null;
    }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    if (queueToggleBtn) queueToggleBtn.addEventListener("click", toggleQueuePanel);
    const audioPlayer = document.getElementById("audio-player");
    if (audioPlayer) {
        audioPlayer.removeEventListener("ended", handleSongEnd);
        audioPlayer.addEventListener("ended", handleSongEndWithQueue);
        updateQueueUI();
        console.log("Queue system initialized");
    } else {
        console.error("Audio player element not found in queue.js");
    }
});