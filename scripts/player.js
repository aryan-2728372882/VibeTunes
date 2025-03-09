// Fixed Songs Collections
const fixedBhojpuri = [
    {
        "title": "koiri ke raj chali",
        "link": "https://github.com/aryan-2728372882/TRENDING/raw/main/Kehu%20Ke%20Na%20Daal%20Gali%20Koiri%20Ke%20Raaj%20Chali(Khesari2.IN).mp3",
        "thumbnail": "https://i.ytimg.com/vi/EW_WZlX191Q/hqdefault.jpg"
    },
    {
        "title": "Namariya Kamar Mei Khos Deb",
        "link": "https://github.com/aryan-2728372882/TRENDING/raw/main/%23VIDEO%20%23SAMAR%20SINGH%20%20Namariya%20Kamariya%20Me%20Khos%20Deb%20%20%23Shilpi%20Raj%2C%20%23Akanksha%20Dubey%20%23BhojpuriSong.mp3",
        "thumbnail": "https://i.ytimg.com/vi/sDF_O4OIuwI/maxresdefault.jpg"
    },
    {
        "title": "UdanBaj Rajau",
        "link": "https://github.com/aryan-2728372882/TRENDING/raw/main/%23Viral%20Song%20%20Shilpi%20Raj%20%20%E0%A4%89%E0%A5%9C%E0%A4%A8%E0%A4%AC%E0%A4%9C%20%E0%A4%B0%E0%A4%9C%E0%A4%8A%20%20Feat%20_%20Anisha%20Pandey%20%20Udanbaj%20Rajau%20%20Bhojpuri%20Song%202025.mp3",
        "thumbnail": "https://i.ytimg.com/vi/8Ho2qllF-A4/maxresdefault.jpg"
    },
    {
        "title": "Chuwe Mor Jawani",
        "link": "https://github.com/aryan-2728372882/TRENDING/raw/main/%23video%20%20%E0%A4%9A%E0%A4%B5%20%E0%A4%AE%E0%A4%B0%20%E0%A4%9C%E0%A4%B5%E0%A4%A8%20%20%23samarsingh%20%20Chuwe%20Mor%20Jawani%20%20%23bhojpuri%20Song%202024.mp3",
        "thumbnail": "https://i.ytimg.com/vi/hdgoRaPKyOI/maxresdefault.jpg"
    },
    {
        "title": "Bali rei Umariya kei",
        "link": "https://github.com/aryan-2728372882/TRENDING/raw/main/%23video%20-%20%E0%A4%AC%E0%A4%B2%20%E0%A4%B0%20%E0%A4%89%E0%A4%AE%E0%A4%B0%E0%A4%AF%20%E0%A4%95%20%20Dhananjay%20Dhadkan%20Viral%20Song%202024%20%20Balma%20Kadar%20Na%20Jnae.mp3",
        "thumbnail": "https://i.ytimg.com/vi/BVrJfw2FvBc/maxresdefault.jpg"
    },
    {
        "title": "Babuan",
        "link": "https://github.com/aryan-2728372882/TRENDING/raw/main/Babuaan%20Sooryavansham%20320%20Kbps.mp3",
        "thumbnail": "https://i.ytimg.com/vi/0HiTKE2-NV0/maxresdefault.jpg"
    },
    {
        "title": "Makaiya Mei Raja ji",
        "link": "https://github.com/aryan-2728372882/TRENDING/raw/main/Makaiya%20Me%20Raja%20JI(BhojpuriWap.In).mp3",
        "thumbnail": "https://i.ytimg.com/vi/KO9MHwbV4c8/maxresdefault.jpg"
    },
    {
        "title": "pahin ke chali bikini",
        "link": "https://github.com/aryan-2728372882/TRENDING/raw/main/Pahin%20Ke%20Chali%20Bikini%20Purav%20Jha%20320%20Kbps.mp3",
        "thumbnail": "https://www.lyricsphone.com/wp-content/uploads/2024/11/Pahin-Ke-Chale-Bikini-Lyrics.jpeg"
    },
    {
        "title": "Balamua ke balam",
        "link": "https://github.com/aryan-2728372882/TRENDING/raw/main/Balamuwa%20Ke%20Ballam(KoshalWorld.Com).mp3",
        "thumbnail": "https://i.ytimg.com/vi/oYO3P0CY_V0/maxresdefault.jpg"
    },
    {
        "title": "samastipur jila ha",
        "link": "https://github.com/aryan-2728372882/TRENDING/raw/main/%23video%20Song%20%20%23%E0%A4%B8%E0%A4%AE%E0%A4%B8%E0%A4%A4%E0%A4%AA%E0%A4%B0%20%20%E0%A4%9C%E0%A4%B2%20%E0%A4%B9%20%20%23chandan%20yadav%20or%20%23kajal%20raj%20%E0%A4%95%20%E0%A4%AC%E0%A4%B0%E0%A4%A1%20%E0%A4%97%E0%A4%A8%20%20%20Samastipur%20jila%20ha.mp3",
        "thumbnail": "https://i.ytimg.com/vi/jNDgdhA6-Vg/maxresdefault.jpg"
    }
];

const fixedPhonk = [
    {
        "title": "Phonk Beat 1",
        "link": "PHONK_SONG_LINK_1",
        "thumbnail": "PHONK_THUMBNAIL_1"
    },
    {
        "title": "Phonk Beat 2",
        "link": "PHONK_SONG_LINK_2",
        "thumbnail": "PHONK_THUMBNAIL_2"
    },
    // Add remaining 8 Phonk songs in same format
    // ...
];

// Player State Management
let currentPlaylist = [];
let shuffleMode = false; // ✅ Add this at the top
let currentSongIndex = 0;
let repeatMode = 0; // 0: No repeat, 1: Repeat all, 2: Repeat one
let currentContext = 'bhojpuri'; // 'bhojpuri', 'phonk', or 'search'

const audioPlayer = document.getElementById("audio-player");
const playerContainer = document.getElementById("music-player");
const playPauseBtn = document.getElementById("play-pause-btn");

// Initialize Player
playerContainer.style.display = "none";
audioPlayer.addEventListener('ended', handleSongEnd);
audioPlayer.addEventListener('timeupdate', updateSeekBar);

// Display Fixed Sections
function displayFixedSections() {
    populateSection('bhojpuri-list', fixedBhojpuri, 'bhojpuri');
    populateSection('phonk-list', fixedPhonk, 'phonk');
}

function populateSection(containerId, songs, context) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    songs.forEach(song => {
        const songElement = document.createElement('div');
        songElement.classList.add('song-item');
        songElement.innerHTML = `
            <div class="thumbnail-container" onclick="playSong('${song.title}', '${context}')">
                <img src="${song.thumbnail}" alt="${song.title}" class="thumbnail">
                <div class="hover-play">▶</div>
            </div>
            <div class="song-title">${song.title}</div>
        `;
        container.appendChild(songElement);
    });
}

// Search Implementation
let searchSongsList = [];

function loadSearchSongs() {
    Promise.all([
        fetch("songs.json").then(r => r.json()),
        fetch("phonk.json").then(r => r.json())
    ]).then(([songs, phonk]) => {
        searchSongsList = [...songs, ...phonk];
    }).catch(console.error);
}

function searchSongs(query) {
    const searchContainer = document.getElementById('search-results-container');
    searchContainer.innerHTML = '';  // Clear any previous results

    if (!query.trim()) {
        searchContainer.style.display = 'none';  // Hide results if query is empty
        return;
    }

    const results = searchSongsList.filter(song =>
        song.title.toLowerCase().includes(query.toLowerCase())  // Filter songs based on the query
    );

    if (results.length) {
        results.forEach(song => {
            const songElement = document.createElement('div');
            songElement.classList.add('song-item');
            songElement.innerHTML = `
                <div class="thumbnail-container" onclick="playSong('${song.title}', 'search')">
                    <img src="${song.thumbnail}" alt="${song.title}" class="thumbnail">
                    <div class="hover-play">▶</div>
                </div>
                <div class="song-title">${song.title}</div>
            `;
            searchContainer.appendChild(songElement);
        });

        currentPlaylist = results;
        currentContext = 'search';
        searchContainer.style.display = 'flex';  // Show the search results container
    } else {
        searchContainer.innerHTML = '<p>No songs found</p>';
        searchContainer.style.display = 'flex';  // Show the container even if no results
    }
}

// Playback Control
function playSong(title, context) {
    let song;
    
    switch(context) {
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
        case 'search':
            song = currentPlaylist.find(s => s.title === title);
            break;
    }

    if (!song) return;

    currentSongIndex = currentPlaylist.findIndex(s => s.title === title);
    audioPlayer.src = song.link;
    audioPlayer.play()
        .then(() => {
            playerContainer.style.display = "flex";
            updatePlayerUI(song);
        })
        .catch(error => {
            console.error("Playback failed:", error);
            showPopup("Error playing song!");
        });
}

async function handleSongEnd() {
    console.log("Current Song Index Before:", currentSongIndex);
    console.log("Repeat Mode:", repeatMode);

    // Remove event listener before potentially re-adding it
    audioPlayer.removeEventListener('ended', handleSongEnd);

    if (repeatMode === 2) { // Repeat single
        audioPlayer.currentTime = 0;
        await audioPlayer.play().catch(error => console.error("Playback failed:", error));
        console.log("Repeating the same song...");
        
        // Add the event listener back for the repeated song
        audioPlayer.addEventListener('ended', handleSongEnd);
        updatePlayPauseButton(); // Sync play/pause button after repeating
        return;
    }

    if (repeatMode === 1) { // Repeat all mode
        currentSongIndex = (currentSongIndex + 1) % currentPlaylist.length;
    } else if (currentSongIndex < currentPlaylist.length - 1) { // Normal play mode
        currentSongIndex++;
    } else {
        console.log("Reached the end of the playlist. Stopping.");
        return; // Stop if no repeat and at the end of the playlist
    }

    console.log("Loading Next Song:", currentPlaylist[currentSongIndex].title);

    audioPlayer.src = currentPlaylist[currentSongIndex].link;
    audioPlayer.load();

    let songStarted = false;
    let retries = 0;
    let maxRetries = 5;

    // ✅ Ensure playback before allowing the next transition
    audioPlayer.oncanplay = async () => {
        console.log("Song Fully Loaded:", currentPlaylist[currentSongIndex].title);

        while (retries < maxRetries) {
            try {
                await audioPlayer.play();
                console.log("Playing Successfully:", currentPlaylist[currentSongIndex].title);
                songStarted = true;
                break;
            } catch (error) {
                console.error(`Playback Error (Attempt ${retries + 1}):`, error);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retrying
                retries++;
            }
        }

        if (!songStarted) {
            console.error("Max retries reached! Skipping this song...");
            // Skip to the next song
            currentSongIndex = (currentSongIndex + 1) % currentPlaylist.length;
            playSong(currentPlaylist[currentSongIndex].title, currentContext); // Play the next song
        }

        // Add the event listener back after potentially handling error
        audioPlayer.addEventListener('ended', handleSongEnd);

        updatePlayPauseButton(); // Sync the play/pause button after song change
    };

    // ✅ Confirm that the song is playing before moving forward
    audioPlayer.onplaying = () => {
        console.log("Confirmed: Song is playing:", currentPlaylist[currentSongIndex].title);
        songStarted = true;

        // Add the event listener back after the song starts playing
        audioPlayer.addEventListener('ended', handleSongEnd);
    };

    // Add the event listener back after the song ends
    audioPlayer.addEventListener('ended', handleSongEnd);

    updatePlayerUI(currentPlaylist[currentSongIndex]); // ✅ Ensure UI updates
    updatePlayPauseButton(); // Sync the play/pause button when a new song starts playing
}


// Navigation Controls
function nextSong() {
    currentSongIndex = (currentSongIndex + 1) % currentPlaylist.length;
    playSong(currentPlaylist[currentSongIndex].title, currentContext);
}

function previousSong() {
    currentSongIndex = (currentSongIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
    playSong(currentPlaylist[currentSongIndex].title, currentContext);
}

// Repeat System
function toggleRepeat() {
    repeatMode = (repeatMode + 1) % 3;
    const repeatBtn = document.querySelector("#repeat-btn");
    repeatBtn.textContent = ['🔁', '🔂', '🔄'][repeatMode];
    showPopup(['Repeat Off', 'Repeat All', 'Repeat One'][repeatMode]);
}

function toggleShuffle() {
    shuffleMode = !shuffleMode;
    const shuffleBtn = document.querySelector("#shuffle-btn");
    shuffleBtn.textContent = shuffleMode ? '🔀' : '🔄';
    showPopup(shuffleMode ? 'Shuffle On' : 'Shuffle Off');
    if (shuffleMode) {
        currentPlaylist = shuffleArray(currentPlaylist);
    } else {
        // Reset to default playlist order if shuffle is turned off
        if (currentContext === 'bhojpuri') {
            currentPlaylist = fixedBhojpuri;
        } else if (currentContext === 'phonk') {
            currentPlaylist = fixedPhonk;
        }
    }
    playSong(currentPlaylist[currentSongIndex].title, currentContext);
}

// Shuffle the playlist
function shuffleArray(array) {
    let shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
}


// UI Updates
function updatePlayerUI(song) {
    document.getElementById("player-thumbnail").src = song.thumbnail;
    document.getElementById("player-title").textContent = song.title;
    updatePlayPauseButton();
}

function togglePlay() {
    if (audioPlayer.paused) {
        audioPlayer.play().catch(error => console.error("Playback failed:", error));
    } else {
        audioPlayer.pause();
    }
    // Update the button immediately after play/pause toggle
    updatePlayPauseButton();
}

function updatePlayPauseButton() {
    // Ensure we are accessing the button element correctly
    const playPauseBtn = document.getElementById('play-pause-btn');
    if (playPauseBtn) {
        playPauseBtn.textContent = audioPlayer.paused ? "▶" : "⏸"; // Use ▶ for play, ⏸ for pause
    }
}

// Utility Functions
function showPopup(message) {
    const popup = document.createElement("div");
    popup.className = "popup-notification";
    popup.textContent = message;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 3000);
}

function updateSeekBar() {
    document.getElementById("seek-bar").value = 
        (audioPlayer.currentTime / audioPlayer.duration) * 100 || 0;
}

function seekSong(value) {
    audioPlayer.currentTime = (value / 100) * audioPlayer.duration;
}

function changeVolume(value) {
    audioPlayer.volume = value / 100;
    document.getElementById("volume-percentage").textContent = `${value}%`;
}

// Initialization
document.addEventListener("DOMContentLoaded", () => {
    displayFixedSections();
    loadSearchSongs();
    changeVolume(100);
});