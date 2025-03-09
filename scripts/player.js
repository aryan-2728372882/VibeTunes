// Music player functionality

const fixedSongs = [
    {"title": "koiri ke raj chali", "link": "https://github.com/aryan-2728372882/TRENDING/raw/main/Kehu%20Ke%20Na%20Daal%20Gali%20Koiri%20Ke%20Raaj%20Chali(Khesari2.IN).mp3", "thumbnail": "https://i.ytimg.com/vi/EW_WZlX191Q/hqdefault.jpg?sqp=-oaymwEmCOADEOgC8quKqQMa8AEB-AGoA4AC8AGKAgwIABABGGUgVShVMA8=&rs=AOn4CLA1ablAkj1tDfzSINw2TJnYgqkRnQ"},
    {"title": "Namariya Kamar Mei Khos Deb", "link": "https://github.com/aryan-2728372882/TRENDING/raw/main/%23VIDEO%20%23SAMAR%20SINGH%20%20Namariya%20Kamariya%20Me%20Khos%20Deb%20%20%23Shilpi%20Raj%2C%20%23Akanksha%20Dubey%20%23BhojpuriSong.mp3", "thumbnail": "https://i.ytimg.com/vi/sDF_O4OIuwI/maxresdefault.jpg"},
    {"title": "UdanBaj Rajau", "link": "https://github.com/aryan-2728372882/TRENDING/raw/main/%23Viral%20Song%20%20Shilpi%20Raj%20%20%E0%A4%89%E0%A5%9C%E0%A4%A8%E0%A4%AC%E0%A4%9C%20%E0%A4%B0%E0%A4%9C%E0%A4%8A%20%20Feat%20_%20Anisha%20Pandey%20%20Udanbaj%20Rajau%20%20Bhojpuri%20Song%202025.mp3", "thumbnail": "https://i.ytimg.com/vi/8Ho2qllF-A4/maxresdefault.jpg"},
    {"title": "Chuwe Mor Jawani", "link": "https://github.com/aryan-2728372882/TRENDING/raw/main/%23video%20%20%E0%A4%9A%E0%A4%B5%20%E0%A4%AE%E0%A4%B0%20%E0%A4%9C%E0%A4%B5%E0%A4%A8%20%20%23samarsingh%20%20Chuwe%20Mor%20Jawani%20%20%23bhojpuri%20Song%202024.mp3", "thumbnail": "https://i.ytimg.com/vi/hdgoRaPKyOI/maxresdefault.jpg"},
    {"title": "Bali rei Umariya kei", "link": "https://github.com/aryan-2728372882/TRENDING/raw/main/%23video%20-%20%E0%A4%AC%E0%A4%B2%20%E0%A4%B0%20%E0%A4%89%E0%A4%AE%E0%A4%B0%E0%A4%AF%20%E0%A4%95%20%20Dhananjay%20Dhadkan%20Viral%20Song%202024%20%20Balma%20Kadar%20Na%20Jnae.mp3", "thumbnail": "https://i.ytimg.com/vi/BVrJfw2FvBc/maxresdefault.jpg"},
    {"title": "Babuan", "link": "https://github.com/aryan-2728372882/TRENDING/raw/main/Babuaan%20Sooryavansham%20320%20Kbps.mp3", "thumbnail": "https://i.ytimg.com/vi/0HiTKE2-NV0/maxresdefault.jpg"},
    {"title": "Makaiya Mei Raja ji", "link": "https://github.com/aryan-2728372882/TRENDING/raw/main/Makaiya%20Me%20Raja%20JI(BhojpuriWap.In).mp3", "thumbnail": "https://i.ytimg.com/vi/KO9MHwbV4c8/maxresdefault.jpg"},
    {"title": "pahin ke chali bikini", "link": "https://github.com/aryan-2728372882/TRENDING/raw/main/Pahin%20Ke%20Chali%20Bikini%20Purav%20Jha%20320%20Kbps.mp3", "thumbnail": "https://www.lyricsphone.com/wp-content/uploads/2024/11/Pahin-Ke-Chale-Bikini-Lyrics.jpeg"},
    {"title": "Balamua ke balam", "link": "https://github.com/aryan-2728372882/TRENDING/raw/main/Balamuwa%20Ke%20Ballam(KoshalWorld.Com).mp3", "thumbnail": "https://i.ytimg.com/vi/oYO3P0CY_V0/maxresdefault.jpg"},
    {"title": "samastipur jila ha", "link": "https://github.com/aryan-2728372882/TRENDING/raw/main/Samastipur%20Jila%20H%20(PenduJatt.Com.Se).mp3", "thumbnail": "https://i.ytimg.com/vi/jNDgdhA6-Vg/maxresdefault.jpg"}
];

let fullSongList = []; // Stores songs from `songs.json`
let currentSongIndex = 0;
let isShuffle = false;
let isRepeat = false;

const audioPlayer = document.getElementById("audio-player");
const playerContainer = document.getElementById("music-player");
const playPauseBtn = document.getElementById("play-pause-btn");
const volumePercentage = document.getElementById("volume-percentage");

// Ensure the music controller is hidden on page load
playerContainer.style.display = "none";

// Fetch songs from `songs.json` but do not display them initially
fetch("songs.json")
    .then(response => response.json())
    .then(data => {
        fullSongList = data; // Store all songs for searching only
    })
    .catch(error => console.error("Error loading songs:", error));

// Display only the 10 fixed songs at the start
function displayFixedSongs() {
    const songContainer = document.getElementById('song-list');

    if (!songContainer) {
        console.error("Error: #song-list container not found.");
        return;
    }

    songContainer.innerHTML = ''; // Clear only when necessary

    fixedSongs.forEach((song, index) => {
        const songElement = document.createElement('div');
        songElement.classList.add('song-item');
        songElement.innerHTML = `
            <div class="thumbnail-container" onclick="playSong('${song.title}')">
                <img src="${song.thumbnail}" alt="${song.title}" class="thumbnail">
                <div class="hover-play">▶</div>
            </div>
            <div class="song-title">${song.title}</div>
        `;
        songContainer.appendChild(songElement);
    });
}

// Ensure 10 fixed songs are loaded on page refresh
document.addEventListener("DOMContentLoaded", () => {
    displayFixedSongs();
});

// Search function to fetch songs from `songs.json`
function searchSongs(query) {
    const songContainer = document.getElementById('song-list');

    if (!query.trim()) {
        displayFixedSongs(); // Reset to default 10 fixed songs
        return;
    }

    const filteredSongs = fullSongList.filter(song =>
        song.title.toLowerCase().includes(query.toLowerCase())
    );

    if (filteredSongs.length === 0) {
        songContainer.innerHTML = "<p>No songs found</p>"; // Show message if no songs match
        return;
    }

    songContainer.innerHTML = ''; // Clear song list before adding search results

    filteredSongs.forEach((song, index) => {
        const songElement = document.createElement('div');
        songElement.classList.add('song-item');
        songElement.innerHTML = `
            <div class="thumbnail-container" onclick="playSong('${song.title}', true)">
                <img src="${song.thumbnail}" alt="${song.title}" class="thumbnail">
                <div class="hover-play">▶</div>
            </div>
            <div class="song-title">${song.title}</div>
        `;
        songContainer.appendChild(songElement);
    });
}

// Play a selected song
function playSong(title, fromSearch = false) {
    let song = fixedSongs.find(s => s.title === title);

    // If the song is not in fixedSongs, check in searched results
    if (!song && fromSearch) {
        song = fullSongList.find(s => s.title === title);
    }

    if (!song) {
        console.error("Song not found!");
        return;
    }

    // Set the audio source and attempt to play it
    audioPlayer.src = song.link;

    // Ensure that the audio plays
    audioPlayer.play().then(() => {
        playerContainer.style.display = "flex";  // Show the music player when a song starts playing
        updatePlayerUI(song);
    }).catch(error => {
        console.error("Playback failed:", error);
        showPopup("Error playing song!");  // Show an error if playback fails
    });
}

// Update the player UI (thumbnail, title, etc.)
function updatePlayerUI(song) {
    document.getElementById("player-thumbnail").src = song.thumbnail;
    document.getElementById("player-title").textContent = song.title;
    updatePlayPauseButton();  // Assuming you have a play/pause button that updates UI
}

// Toggle Play/Pause
function togglePlay() {
    if (audioPlayer.paused) {
        audioPlayer.play();
    } else {
        audioPlayer.pause();
    }
    updatePlayPauseButton(); // Update the play/pause button
}

// Update Play/Pause button state
function updatePlayPauseButton() {
    playPauseBtn.textContent = audioPlayer.paused ? "▶" : "⏸";
}

// Show a 3-second popup notification
function showPopup(message) {
    const popup = document.createElement("div");
    popup.classList.add("popup-notification");
    popup.textContent = message;
    document.body.appendChild(popup);

    setTimeout(() => {
        popup.remove();
    }, 3000);
}

// Toggle shuffle mode
function toggleShuffle() {
    isShuffle = !isShuffle;
    showPopup(`Shuffle ${isShuffle ? "Enabled" : "Disabled"}`);
}

// Toggle repeat mode
function toggleRepeat() {
    isRepeat = !isRepeat;
    showPopup(`Repeat ${isRepeat ? "Enabled" : "Disabled"}`);
}

// Handle song end (repeat or next)
function handleSongEnd() {
    if (isRepeat) {
        playSong(fixedSongs[currentSongIndex].title);
    } else {
        nextSong();
    }
}

// Seek bar update
function updateSeekBar() {
    document.getElementById("seek-bar").value = (audioPlayer.currentTime / audioPlayer.duration) * 100 || 0;
}

// Seek song position
function seekSong(value) {
    audioPlayer.currentTime = (value / 100) * audioPlayer.duration;
}

// Change volume
function changeVolume(value) {
    audioPlayer.volume = value / 100;
    volumePercentage.textContent = `${value}%`; // Update volume percentage display
}

// Set initial volume display
volumePercentage.textContent = `${audioPlayer.volume * 100}%`;
