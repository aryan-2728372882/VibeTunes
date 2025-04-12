// shared.js

// Audio Player Elements
const audioPlayer = document.getElementById("audio-player");
const playPauseBtn = document.getElementById("play-pause-btn"); // Fetch static button
const seekBar = document.getElementById("seek-bar");
const playerTitle = document.getElementById("player-title");
const playerThumbnail = document.getElementById("player-thumbnail");
const volumePercentage = document.getElementById("volume-percentage");

// Playback Variables
let currentSong = null;
let isRepeat = false;
let manualPause = false;
let wakeLock = null;
let popupTimeout = null;

// Load Shared Song
async function loadSharedSong() {
    const urlParams = new URLSearchParams(window.location.search);
    const songParam = urlParams.get("song");
    const loadingMessageElement = document.getElementById("loading-message");

    if (loadingMessageElement) {
        loadingMessageElement.textContent = "Loading song...";
        loadingMessageElement.style.display = "block";
    }

    if (!songParam) {
        console.error("No song parameter found in URL");
        showErrorMessage("No song specified. Please check your link.");
        if (playPauseBtn) {
            playPauseBtn.disabled = true;
            playPauseBtn.style.opacity = "0.5";
            playPauseBtn.style.cursor = "not-allowed";
        }
        return;
    }

    try {
        const decodedParam = decodeURIComponent(songParam);
        console.log("Decoded song parameter:", decodedParam);
        currentSong = JSON.parse(decodedParam);
        console.log("Parsed song object:", currentSong);

        if (!currentSong.title || !currentSong.link) {
            throw new Error("Invalid song data: missing title or link");
        }

        currentSong.link = validateAndFixUrl(currentSong.link);
        displaySharedSong(currentSong); // Show song details even if playback fails

        try {
            await validateAudioUrl(currentSong.link);
        } catch (validationError) {
            console.warn("Validation failed, but proceeding anyway due to potential CORS issue:", validationError);
            // Proceed to play even if validation fails, especially for Dropbox links
        }
        if (loadingMessageElement) {
            loadingMessageElement.style.display = "none";
        }

        playSong(currentSong.title, "shared");
    } catch (error) {
        console.error("Error loading shared song:", error);
        showErrorMessage(`Failed to load song: ${error.message}. The file name may contain unsupported characters.`);
        if (loadingMessageElement) {
            loadingMessageElement.style.display = "none";
        }
    }
}

// Validate Audio URL
async function validateAudioUrl(url) {
    console.log("Validating audio URL:", url);
    // Skip validation for Dropbox links due to CORS issues
    if (url.includes("dropbox.com")) {
        console.log("Skipping validation for Dropbox link due to CORS restrictions");
        return;
    }
    try {
        const response = await fetch(url, { method: "HEAD" });
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
        }
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.startsWith("audio/")) {
            throw new Error("URL does not point to a valid audio file");
        }
        console.log("Audio URL validated successfully:", url);
    } catch (error) {
        console.error("Audio URL validation failed:", error);
        throw new Error(`Cannot access audio file: ${error.message}`);
    }
}

// Display Shared Song
function displaySharedSong(song) {
    const container = document.getElementById("shared-song-container");
    if (!container) return;

    container.innerHTML = "";

    const songElement = document.createElement("div");
    songElement.className = "song-item";
    songElement.innerHTML = `
        <img src="${song.thumbnail || 'default-thumbnail.png'}" alt="${song.title}" class="thumbnail" onclick="togglePlay()" onerror="this.src='default-thumbnail.png'; console.error('Thumbnail failed to load:', '${song.thumbnail}');">
        <div class="song-details">
            <h3>${song.title}</h3>
        </div>
    `;
    container.appendChild(songElement);
    console.log("Thumbnail set for shared song:", song.thumbnail);
}

// Validate and Fix URL
function validateAndFixUrl(url) {
    if (!url) return "";

    console.log("Validating URL:", url);

    // Handle GitHub URLs
    if (url.includes("github.com") && !url.includes("raw.githubusercontent.com")) {
        // Convert to raw.githubusercontent.com and fix path
        url = url
            .replace("github.com", "raw.githubusercontent.com")
            .replace("/raw/", "/") // Remove /raw/ from path
            .replace("/blob/", "/"); // Remove /blob/ if present
        console.log("Converted to GitHub raw URL:", url);
    }

    try {
        // Sanitize problematic characters
        let sanitizedUrl = url.replace(/#/g, "%23").replace(/,/g, "%2C");
        const urlObj = new URL(sanitizedUrl);
        return urlObj.href;
    } catch (error) {
        console.error("Invalid URL, attempting to fix:", error);
        let fixedUrl = url.replace(/ /g, "%20");
        if (!fixedUrl.startsWith("http://") && !fixedUrl.startsWith("https://")) {
            fixedUrl = "https://" + fixedUrl;
        }
        try {
            const urlObj = new URL(fixedUrl);
            return urlObj.href;
        } catch (e) {
            console.error("Failed to fix URL:", e);
            return url;
        }
    }
}

// Play Song
async function playSong(title, context, retryCount = 0) {
    console.log("Playing song:", title, "Context:", context, "Current song:", currentSong);

    if (context !== "shared" && (!currentSong || currentSong.title !== title)) {
        currentSong = {
            title,
            link: getSongLink(title, context),
            thumbnail: currentSong ? currentSong.thumbnail : "default-thumbnail.png",
        };
    }

    if (!currentSong || !currentSong.link) {
        console.error("No valid song link found");
        showErrorMessage("No valid song link found. Please try again.");
        return;
    }

    currentSong.link = validateAndFixUrl(currentSong.link);
    console.log("Setting audio source to:", currentSong.link);

    // Try direct link first, if it fails due to CORS, attempt a proxy
    audioPlayer.src = currentSong.link;
    audioPlayer.load();

    try {
        await audioPlayer.play();
        updatePlayerUI(currentSong);
        setupMediaSession(currentSong);
        updatePlayPauseButton();
        enableBackgroundPlayback();
    } catch (error) {
        console.error("Playback failed:", error);
        if (retryCount < 1) {
            console.log("Retrying playback with proxy, attempt", retryCount + 1);
            // Try using a CORS proxy for services like Dropbox that block direct access
            if (currentSong.link.includes('dropbox.com')) {
                // Use a public CORS proxy (warning: these can be unreliable or have rate limits)
                const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(currentSong.link)}`;
                console.log("Trying with CORS proxy:", proxyUrl);
                currentSong.link = proxyUrl;
                setTimeout(() => playSong(title, context, retryCount + 1), 1000);
            } else {
                setTimeout(() => playSong(title, context, retryCount + 1), 1000);
            }
        } else {
            console.error("Failed to play after retry");
            showErrorMessage(
                "Unable to play song. The file may be invalid, inaccessible due to CORS restrictions, or contain unsupported characters."
            );
        }
    }
}

// Get Song Link
function getSongLink(title, context) {
    if (context === "shared" && currentSong && currentSong.link) {
        console.log("Using link from shared song:", currentSong.link);
        return currentSong.link;
    }
    return currentSong && currentSong.link ? currentSong.link : "";
}

// Update Player UI
function updatePlayerUI(song) {
    if (playerTitle) playerTitle.textContent = song.title;
    if (playerThumbnail) {
        playerThumbnail.src = song.thumbnail || "default-thumbnail.png";
        playerThumbnail.style.display = song.thumbnail ? "block" : "none";
        playerThumbnail.onerror = function() {
            this.src = "default-thumbnail.png";
            console.error("Player thumbnail failed to load:", song.thumbnail);
        };
        console.log("Player thumbnail updated:", song.thumbnail);
    }
}

// Setup Media Session
function setupMediaSession(song) {
    if ("mediaSession" in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: song.title,
            artist: "VibeTunes",
            artwork: [
                {
                    src: song.thumbnail || "default-thumbnail.png",
                    sizes: "512x512",
                    type: "image/png",
                },
            ],
        });
        navigator.mediaSession.setActionHandler("play", () => audioPlayer.play());
        navigator.mediaSession.setActionHandler("pause", () => audioPlayer.pause());
    }
}

// Enable Background Playback
function enableBackgroundPlayback() {
    audioPlayer.addEventListener("play", requestWakeLock, { once: true });
    audioPlayer.addEventListener("pause", releaseWakeLock, { once: true });
}

// Request Wake Lock
async function requestWakeLock() {
    if ("wakeLock" in navigator && navigator.wakeLock) {
        try {
            wakeLock = await navigator.wakeLock.request("screen");
            console.log("Wake Lock acquired");
        } catch (error) {
            console.log("Wake Lock failed:", error);
        }
    }
}

// Release Wake Lock
async function releaseWakeLock() {
    if (wakeLock) {
        try {
            await wakeLock.release();
            wakeLock = null;
            console.log("Wake Lock released");
        } catch (error) {
            console.log("Error releasing Wake Lock:", error);
        }
    }
}

// Toggle Play/Pause (Fixed)
function togglePlay() {
    console.log("Toggle play called. Current paused state:", audioPlayer.paused);
    if (!playPauseBtn) {
        console.error("Play/Pause button not found");
        return;
    }

    if (audioPlayer.paused) {
        console.log("Attempting to play...");
        manualPause = false;
        audioPlayer.play()
            .catch(error => {
                console.error("Play failed:", error);
                showPopup("Failed to play audio. Please try again.");
                updatePlayPauseButton(); // Ensure update even if play fails
            });
    } else {
        console.log("Attempting to pause...");
        manualPause = true;
        try {
            audioPlayer.pause();
            console.log("Pause command executed. New paused state:", audioPlayer.paused);
        } catch (error) {
            console.error("Error during pause():", error);
        }
        // Update immediately after calling pause()
        updatePlayPauseButton();
    }
}

// Update Play/Pause Button (Fixed)
function updatePlayPauseButton() {
    console.log("Updating play/pause button:", playPauseBtn, "Paused state:", audioPlayer.paused);
    if (playPauseBtn) {
        playPauseBtn.textContent = audioPlayer.paused ? "▶️" : "⏸️";
    } else {
        console.error("Play/Pause button reference is null or undefined during update");
    }
}

// Update Seek Bar
function updateSeekBar() {
    if (audioPlayer.duration && seekBar) {
        seekBar.value = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    }
}

// Seek Song
function seekSong(value) {
    if (audioPlayer.duration) {
        audioPlayer.currentTime = (value / 100) * audioPlayer.duration;
    }
}

// Change Volume
function changeVolume(value) {
    audioPlayer.volume = value / 100;
}

// Next Song
function nextSong() {
    showPopup("No next song available in shared mode.");
}

// Previous Song
function previousSong() {
    showPopup("No previous song available in shared mode.");
}

// Toggle Repeat
function toggleRepeat() {
    isRepeat = !isRepeat;
    audioPlayer.loop = isRepeat;
    const repeatBtn = document.getElementById("repeat-btn");
    if (repeatBtn) repeatBtn.style.opacity = isRepeat ? "1" : "0.5";
    showPopup(isRepeat ? "Repeat mode enabled" : "Repeat mode disabled");
}

// Handle Song End
function handleSongEnd() {
    if (isRepeat) {
        audioPlayer.currentTime = 0;
        audioPlayer.play();
        showPopup("Repeating song.");
    } else {
        showPopup("Song ended. Click to replay.");
    }
}

// Show Popup
function showPopup(message) {
    let popup = document.querySelector(".popup-notification");
    if (!popup) {
        popup = document.createElement("div");
        popup.className = "popup-notification";
        document.body.appendChild(popup);
    }
    popup.textContent = message;
    popup.style.display = "block";
    if (popupTimeout) clearTimeout(popupTimeout);
    popupTimeout = setTimeout(() => {
        popup.style.display = "none";
        popupTimeout = null;
    }, 3000);
}

// Show Error Message
function showErrorMessage(message) {
    const container = document.getElementById("shared-song-container");
    if (container) {
        container.innerHTML = `
            <div class="error-message" style="text-align: center; padding: 20px; background-color: rgba(255, 0, 0, 0.1); border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #ff5555;">Error</h3>
                <p>${message}</p>
                <p style="margin-top: 15px;"><a href="index.html" style="color: #9333ea; text-decoration: underline;">Return to Home</a></p>
            </div>
        `;
    }
    showPopup(message);
}

// Initialize
function initializeSharedPage() {
    const musicPlayer = document.getElementById("music-player");
    const sharedSongContainer = document.getElementById("shared-song-container");

    // Basic check for essential elements
    if (!musicPlayer || !sharedSongContainer || !audioPlayer || !playPauseBtn || !seekBar) {
        console.error("Required DOM elements missing. Ensure controls are present in shared.html");
        showErrorMessage("Player initialization failed. Please check HTML structure or refresh.");
        return;
    }

    // Re-verify playPauseBtn reference just in case
    if (!playPauseBtn) {
        console.error("playPauseBtn STILL not found after page load!");
        return;
    }

    // Add listener to the statically fetched button
    playPauseBtn.removeEventListener("click", togglePlay);
    playPauseBtn.addEventListener("click", togglePlay);
    console.log("Click listener added to static playPauseBtn:", playPauseBtn);

    if (audioPlayer) {
        audioPlayer.removeEventListener("play", updatePlayPauseButton);
        audioPlayer.removeEventListener("pause", updatePlayPauseButton);
        audioPlayer.removeEventListener("ended", handleSongEnd);
        audioPlayer.removeEventListener("timeupdate", updateSeekBar);

        audioPlayer.addEventListener("play", () => {
            updatePlayPauseButton();
            console.log("Play event triggered update");
        });
        audioPlayer.addEventListener("pause", () => {
            updatePlayPauseButton();
            console.log("Pause event triggered update");
        });
        audioPlayer.addEventListener("ended", handleSongEnd);
        audioPlayer.addEventListener("timeupdate", updateSeekBar);
    }

    if (seekBar) {
        seekBar.removeEventListener("input", handleSeek);
        seekBar.addEventListener("input", handleSeek);
    }

    // Add listener for repeat button if it exists statically
    const repeatBtn = document.getElementById("repeat-btn");
    if (repeatBtn) {
        repeatBtn.removeEventListener("click", toggleRepeat);
        repeatBtn.addEventListener("click", toggleRepeat);
        repeatBtn.style.opacity = isRepeat ? "1" : "0.5"; // Initial style
    }

    loadSharedSong();
}

// Seek Handler
function handleSeek() {
    seekSong(seekBar.value);
}

// Volume Handler
function handleVolumeChange() {
    changeVolume(volumeSlider.value);
}

// DOM Loaded
document.addEventListener("DOMContentLoaded", initializeSharedPage);