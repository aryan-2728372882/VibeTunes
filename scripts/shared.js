const audioPlayer = document.getElementById("audio-player");
const playPauseBtn = document.getElementById("play-pause-btn");
const seekBar = document.getElementById("seek-bar");
const playerTitle = document.getElementById("player-title");
const playerThumbnail = document.getElementById("player-thumbnail");
const volumePercentage = document.getElementById("volume-percentage");

let currentSong = null;
let isRepeat = false;
let manualPause = false;
let wakeLock = null;
let popupTimeout = null;

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

        if (!currentSong.title || !currentSong.link) {
            throw new Error("Invalid song data: missing title or link");
        }

        currentSong.link = validateAndFixUrl(currentSong.link);
        displaySharedSong(currentSong);

        if (!validateAudioUrl(currentSong.link)) {
            throw new Error("Invalid audio file format. Please use a direct link to an MP3, WAV, OGG, or M4A file.");
        }

        if (loadingMessageElement) {
            loadingMessageElement.style.display = "none";
        }

        playSong(currentSong.title, "shared");
    } catch (error) {
        console.error("Error loading shared song:", error);
        showErrorMessage(`Failed to load song: ${error.message}. Use a direct download link (e.g., dl.dropboxusercontent.com for Dropbox).`);
        if (loadingMessageElement) {
            loadingMessageElement.style.display = "none";
        }
    }
}

function validateAudioUrl(url) {
    console.log("Validating audio URL:", url);
    // Check for valid audio file extensions
    const isValid = /\.(mp3|wav|ogg|m4a)$/i.test(url);
    if (!isValid) {
        console.error("Invalid audio file extension for URL:", url);
        return false;
    }
    console.log("Audio URL passed extension validation:", url);
    return true;
}

function displaySharedSong(song) {
    const container = document.getElementById("shared-song-container");
    if (!container) return;

    container.innerHTML = "";
    const songElement = document.createElement("div");
    songElement.className = "song-item";
    songElement.innerHTML = `
        <img src="${song.thumbnail || 'default-thumbnail.png'}" alt="${song.title}" class="thumbnail" onclick="togglePlay()" onerror="this.src='default-thumbnail.png';">
        <div class="song-details">
            <h3>${song.title}</h3>
        </div>
    `;
    container.appendChild(songElement);
}

function validateAndFixUrl(url) {
    if (!url) return "";

    console.log("Validating URL:", url);

    // Handle Dropbox URLs
    if (url.includes("dropbox.com")) {
        url = url.replace("www.dropbox.com", "dl.dropboxusercontent.com")
                 .replace("?dl=0", "")
                 .replace("?dl=1", "");
        console.log("Converted to Dropbox direct URL:", url);
    }

    // Handle GitHub URLs
    if (url.includes("github.com") && !url.includes("raw.githubusercontent.com")) {
        url = url.replace("github.com", "raw.githubusercontent.com")
                 .replace("/raw/", "/")
                 .replace("/blob/", "/");
        console.log("Converted to GitHub raw URL:", url);
    }

    try {
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

async function playSong(title, context) {
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

    audioPlayer.src = currentSong.link;
    audioPlayer.load();

    try {
        await audioPlayer.play();
        updatePlayerUI(currentSong);
        setupMediaSession(currentSong);
        updatePlayPauseButton();
        enableBackgroundPlayback();
    } catch (error) {
        console.error("Playback failed:", error.message);
        showErrorMessage(
            "Unable to play song. Ensure the link is a direct download URL (e.g., dl.dropboxusercontent.com for Dropbox) and points to a valid audio file."
        );
    }
}

function getSongLink(title, context) {
    if (context === "shared" && currentSong && currentSong.link) {
        return currentSong.link;
    }
    return currentSong && currentSong.link ? currentSong.link : "";
}

function updatePlayerUI(song) {
    if (playerTitle) playerTitle.textContent = song.title;
    if (playerThumbnail) {
        playerThumbnail.src = song.thumbnail || "default-thumbnail.png";
        playerThumbnail.style.display = song.thumbnail ? "block" : "none";
        playerThumbnail.onerror = function() {
            this.src = "default-thumbnail.png";
        };
    }
}

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

function enableBackgroundPlayback() {
    audioPlayer.addEventListener("play", requestWakeLock, { once: true });
    audioPlayer.addEventListener("pause", releaseWakeLock, { once: true });
}

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

function togglePlay() {
    console.log("Toggle play called. Paused:", audioPlayer.paused);
    if (!playPauseBtn) {
        console.error("Play/Pause button not found");
        return;
    }

    if (audioPlayer.paused) {
        manualPause = false;
        audioPlayer.play()
            .catch(error => {
                console.error("Play failed:", error);
                showPopup("Failed to play audio. Ensure the link is a direct download URL.");
                updatePlayPauseButton();
            });
    } else {
        manualPause = true;
        audioPlayer.pause();
        updatePlayPauseButton();
    }
}

function updatePlayPauseButton() {
    if (playPauseBtn) {
        playPauseBtn.textContent = audioPlayer.paused ? "▶️" : "⏸️";
    }
}

function updateSeekBar() {
    if (audioPlayer.duration && seekBar) {
        seekBar.value = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    }
}

function seekSong(value) {
    if (audioPlayer.duration) {
        audioPlayer.currentTime = (value / 100) * audioPlayer.duration;
    }
}

function changeVolume(value) {
    audioPlayer.volume = value / 100;
}

function nextSong() {
    showPopup("No next song available in shared mode.");
}

function previousSong() {
    showPopup("No previous song available in shared mode.");
}

function toggleRepeat() {
    isRepeat = !isRepeat;
    audioPlayer.loop = isRepeat;
    const repeatBtn = document.getElementById("repeat-btn");
    if (repeatBtn) repeatBtn.style.opacity = isRepeat ? "1" : "0.5";
    showPopup(isRepeat ? "Repeat mode enabled" : "Repeat mode disabled");
}

function handleSongEnd() {
    if (isRepeat) {
        audioPlayer.currentTime = 0;
        audioPlayer.play();
        showPopup("Repeating song.");
    } else {
        showPopup("Song ended. Click to replay.");
    }
}

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

function initializeSharedPage() {
    const musicPlayer = document.getElementById("music-player");
    const sharedSongContainer = document.getElementById("shared-song-container");

    if (!musicPlayer || !sharedSongContainer || !audioPlayer || !playPauseBtn || !seekBar) {
        console.error("Required DOM elements missing");
        showErrorMessage("Player initialization failed. Please refresh.");
        return;
    }

    playPauseBtn.addEventListener("click", togglePlay);
    audioPlayer.addEventListener("play", updatePlayPauseButton);
    audioPlayer.addEventListener("pause", updatePlayPauseButton);
    audioPlayer.addEventListener("ended", handleSongEnd);
    audioPlayer.addEventListener("timeupdate", updateSeekBar);

    if (seekBar) {
        seekBar.addEventListener("input", handleSeek);
    }

    const repeatBtn = document.getElementById("repeat-btn");
    if (repeatBtn) {
        repeatBtn.addEventListener("click", toggleRepeat);
        repeatBtn.style.opacity = isRepeat ? "1" : "0.5";
    }

    const volumeSlider = document.getElementById("volume-slider");
    if (volumeSlider) {
        volumeSlider.addEventListener("input", handleVolumeChange);
    }

    loadSharedSong();
}

function handleSeek() {
    seekSong(seekBar.value);
}

function handleVolumeChange() {
    const volumeSlider = document.getElementById("volume-slider");
    if (volumeSlider) {
        changeVolume(volumeSlider.value);
    }
}

document.addEventListener("DOMContentLoaded", initializeSharedPage);