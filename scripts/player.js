// Firebase Auth and Firestore
auth.onAuthStateChanged(user => {
    if (!user) {
        console.warn("No user logged in, skipping song tracking.");
        showPopup("Please log in to track your listening stats!");
    } else {
        console.log("User detected:", user.email);
        showPopup(`Welcome, ${user.email}! Tracking your stats...`);
        setupSongTracking(user.uid);
    }
});

function setupSongTracking(uid) {
    const audioPlayer = document.getElementById("audio-player");
    const seekBar = document.getElementById("seek-bar");
    if (!audioPlayer || !seekBar) {
        console.error("Audio player or seek bar not found!");
        showPopup("Error: Player setup failed. Refresh the page.");
        return;
    }

    let totalPlayTime = 0; // Total playtime for the current song
    let continuousPlayTime = 0; // Continuous playtime without seeking
    let lastPlayTime = 0;
    let songStarted = false;
    let hasSeeked = false;

    audioPlayer.addEventListener("play", () => {
        if (!songStarted) {
            lastPlayTime = Date.now();
            songStarted = true;
            hasSeeked = false; // Reset seeking flag on new play
            showPopup("Song started playing!");
        }
    });

    audioPlayer.addEventListener("pause", () => {
        if (lastPlayTime) {
            const elapsed = (Date.now() - lastPlayTime) / 1000; // Seconds
            totalPlayTime += elapsed;
            if (!hasSeeked) continuousPlayTime += elapsed; // Only add to continuous if no seeking
            lastPlayTime = 0;
            songStarted = false;
            showPopup("Song paused.");
        }
    });

    audioPlayer.addEventListener("ended", () => {
        if (lastPlayTime) {
            const elapsed = (Date.now() - lastPlayTime) / 1000; // Seconds
            totalPlayTime += elapsed;
            if (!hasSeeked) continuousPlayTime += elapsed; // Only add to continuous if no seeking
            lastPlayTime = 0;
            songStarted = false;
        }
        if (continuousPlayTime >= 60) {
            const minutesPlayed = Math.round(totalPlayTime / 60); // Round total time for stats
            updateUserStats(uid, minutesPlayed);
            showPopup(`Song finished! Stats updated: +${minutesPlayed} min`);
        } else {
            showPopup("Song ended");
        }
        totalPlayTime = 0;
        continuousPlayTime = 0; // Reset for next song
    });

    // Reset continuous playtime if seek bar is used
    seekBar.addEventListener("input", () => {
        if (songStarted) {
            if (lastPlayTime) {
                const elapsed = (Date.now() - lastPlayTime) / 1000;
                totalPlayTime += elapsed;
                if (!hasSeeked) continuousPlayTime += elapsed; // Add before resetting
                lastPlayTime = Date.now(); // Restart timer
            }
            hasSeeked = true; // Mark as seeked
            continuousPlayTime = 0; // Reset continuous playtime
            showPopup("Seeked in song - continuous playtime reset.");
        }
    });
}

function updateUserStats(uid, minutesPlayed) {
    if (!uid || minutesPlayed < 1) return;
    const userRef = db.collection("users").doc(uid);
    userRef.update({
        songsPlayed: firebase.firestore.FieldValue.increment(1),
        minutesListened: firebase.firestore.FieldValue.increment(minutesPlayed)
    }).then(() => {
        console.log(`Updated: +1 song, +${minutesPlayed} minutes`);
        showPopup(`Stats updated: +1 song, +${minutesPlayed} minutes`);
    }).catch(error => {
        console.error("Error updating user stats:", error);
        showPopup("Failed to update stats. Retrying in 2 seconds...");
        setTimeout(() => updateUserStats(uid, minutesPlayed), 2000);
    });
}

// Popup Utility Function
function showPopup(message) {
    const popup = document.createElement("div");
    popup.className = "popup-notification"; // Relies entirely on external CSS
    popup.textContent = message;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 3000); // Matches CSS animation duration
}

// Song Lists (unchanged)
const fixedBhojpuri = [
    {
        "title": "koiri ke raj chali",
        "link": "https://github.com/aryan-2728372882/TRENDINGBHOJPURI/raw/main/Kehu%20Ke%20Na%20Daal%20Gali%20Koiri%20Ke%20Raaj%20Chali(Khesari2.IN).mp3",
        "thumbnail": "https://i.ytimg.com/vi/emeEWLXozqg/maxresdefault.jpg"
    },
    {
        "title": "Namariya Kamar Mei Khos Deb",
        "link": "https://github.com/aryan-2728372882/TRENDINGBHOJPURI/raw/main/%23VIDEO%20%23SAMAR%20SINGH%20%20Namariya%20Kamariya%20Me%20Khos%20Deb%20%20%23Shilpi%20Raj%2C%20%23Akanksha%20Dubey%20%23BhojpuriSong.mp3",
        "thumbnail": "https://i.ytimg.com/vi/iie1dxZtNNA/maxresdefault.jpg"
    },
    {
        "title": "UdanBaj Rajau",
        "link": "https://github.com/aryan-2728372882/TRENDINGBHOJPURI/raw/main/%23Viral%20Song%20%20Shilpi%20Raj%20%20%E0%A4%89%E0%A5%9C%E0%A4%A8%E0%A4%AC%E0%A4%9C%20%E0%A4%B0%E0%A4%9C%E0%A4%8A%20%20Feat%20_%20Anisha%20Pandey%20%20Udanbaj%20Rajau%20%20Bhojpuri%20Song%202025.mp3",
        "thumbnail": "https://a10.gaanacdn.com/gn_img/albums/Rz4W8evbxD/4W87jx2L3x/size_m.jpg"
    },
    {
        "title": "Chuwe Mor Jawani",
        "link": "https://github.com/aryan-2728372882/TRENDINGBHOJPURI/raw/main/%23video%20%20%E0%A4%9A%E0%A4%B5%20%E0%A4%AE%E0%A4%B0%20%E0%A4%9C%E0%A4%B5%E0%A4%A8%20%20%23samarsingh%20%20Chuwe%20Mor%20Jawani%20%20%23bhojpuri%20Song%202024.mp3",
        "thumbnail": "https://c.saavncdn.com/405/Chuwe-Mor-Jawani-Bhojpuri-2024-20240417122251-500x500.jpg"
    },
    {
        "title": "Balma Kadar na Jane",
        "link": "https://github.com/aryan-2728372882/TRENDINGBHOJPURI/raw/main/%23video%20-%20%E0%A4%AC%E0%A4%B2%20%E0%A4%B0%20%E0%A4%89%E0%A4%AE%E0%A4%B0%E0%A4%AF%20%E0%A4%95%20%20Dhananjay%20Dhadkan%20Viral%20Song%202024%20%20Balma%20Kadar%20Na%20Jnae.mp3",
        "thumbnail": "https://c.saavncdn.com/659/Balma-Kadar-Na-Jane-Bhojpuri-2024-20241022172505-500x500.jpg"
    },
    {
        "title": "Babuan",
        "link": "https://github.com/aryan-2728372882/TRENDINGBHOJPURI/raw/main/Babuaan%20Sooryavansham%20320%20Kbps.mp3",
        "thumbnail": "https://i.ytimg.com/vi/WpEHdFDDX00/maxresdefault.jpg"
    },
    {
        "title": "Makaiya Mei Raja ji",
        "link": "https://github.com/aryan-2728372882/TRENDINGBHOJPURI/raw/main/Makaiya%20Me%20Raja%20JI(BhojpuriWap.In).mp3",
        "thumbnail": "https://i.ytimg.com/vi/KO9MHwbV4c8/maxresdefault.jpg"
    },
    {
        "title": "pahin ke chali bikini",
        "link": "https://github.com/aryan-2728372882/TRENDINGBHOJPURI/raw/main/Pahin%20Ke%20Chali%20Bikini%20Purav%20Jha%20320%20Kbps.mp3",
        "thumbnail": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/45/e7/7b/45e77b91-40ee-526c-6df5-6ab7fc13fb3b/cover.jpg/1200x1200bf-60.jpg"
    },
    {
        "title": "Balamua ke balam",
        "link": "https://github.com/aryan-2728372882/TRENDINGBHOJPURI/raw/main/Balamuwa%20Ke%20Ballam(KoshalWorld.Com).mp3",
        "thumbnail": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/4f/10/9d/4f109d9e-8280-d699-4c74-dcd7467a22c3/8905713725498_cover.jpg/800x800cc.jpg"
    },
    {
        "title": "samastipur jila ha",
        "link": "https://github.com/aryan-2728372882/TRENDINGBHOJPURI/raw/main/%23video%20Song%20%20%23%E0%A4%B8%E0%A4%AE%E0%A4%B8%E0%A4%A4%E0%A4%AA%E0%A4%B0%20%20%E0%A4%9C%E0%A4%B2%20%E0%A4%B9%20%20%23chandan%20yadav%20or%20%23kajal%20raj%20%E0%A4%95%20%E0%A4%AC%E0%A4%B0%E0%A4%A1%20%E0%A4%97%E0%A4%A8%20%20%20Samastipur%20jila%20ha.mp3",
        "thumbnail": "https://i.ytimg.com/vi/-EBdpD_aGls/maxresdefault.jpg"
    }
];

const fixedPhonk = [
    {
        "title": "NEXT!",
        "link": "https://github.com/aryan-2728372882/TRENDINGPHONK/raw/main/NEXT!.mp3",
        "thumbnail": "https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da84653ce7dc85f2716164d9c664"
    },
    {
        "title": "Death Is No More X SleepWalker",
        "link": "https://github.com/aryan-2728372882/TRENDINGPHONK/raw/main/death%20in%20no%20more%20x%20sleepwalker.mp3",
        "thumbnail": "https://i.ytimg.com/vi/aO_ZcbgdBHs/maxresdefault.jpg"
    },
    {
        "title": "Matushka UltraFunk",
        "link": "https://github.com/aryan-2728372882/TRENDINGPHONK/raw/main/M%F0%9D%9A%8A%F0%9D%9A%9D%F0%9D%9A%9E%F0%9D%9A%9C%F0%9D%9A%91%F0%9D%9A%94%F0%9D%9A%8A%20%20U%F0%9D%9A%95%F0%9D%9A%9D%F0%9D%9A%9B%F0%9D%9A%8A%F0%9D%9A%8F%F0%9D%9A%9E%F0%9D%9A%97%F0%9D%9A%94.mp3",
        "thumbnail": "https://i.ytimg.com/vi/Hq6mo6lhDMM/hqdefault.jpg"
    },
    {
        "title": "Next Up!",
        "link": "https://github.com/aryan-2728372882/TRENDINGPHONK/raw/main/NEXT%20UP!.mp3",
        "thumbnail": "https://i1.sndcdn.com/artworks-KmDFHGS2abNxivGQ-koMlyw-t500x500.jpg"
    },
    {
        "title": "Empire",
        "link": "https://github.com/aryan-2728372882/TRENDINGPHONK/raw/main/EMPIRE.mp3",
        "thumbnail": "https://i.ytimg.com/vi/FaWzBc-RUA0/maxresdefault.jpg"
    },
    {
        "title": "Funk of Galactico",
        "link": "https://github.com/aryan-2728372882/TRENDINGPHONK/raw/main/Funk%20of%20Gal%C3%A1ctico.mp3",
        "thumbnail": "https://i.ytimg.com/vi/VH9EF4QpI4A/maxresdefault.jpg"
    },
    {
        "title": "Acordeão Funk",
        "link": "https://github.com/aryan-2728372882/TRENDINGPHONK/raw/main/Acorde%C3%A3o%20Funk.mp3",
        "thumbnail": "https://i.ytimg.com/vi/-ELVoLmlSpU/maxresdefault.jpg?sqp=-oaymwEmCIAKENAF8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGBYgcigxMA8=&rs=AOn4CLBoSiMTQsIhkgEGi-_-wKzsTngy0Q"
    },
    {
        "title": "Glory",
        "link": "https://github.com/aryan-2728372882/TRENDINGPHONK/raw/main/GLORY.mp3",
        "thumbnail": "https://i.ytimg.com/vi/Q5chHwL1Fhg/maxresdefault.jpg?sqp=-oaymwEmCIAKENAF8quKqQMa8AEB-AG2CIACuAiKAgwIABABGH8gEygTMA8=&rs=AOn4CLBgyb9jPITWD_-cfTZ1ayQYKGlGTg"
    },
    {
        "title": "Slay",
        "link": "https://github.com/aryan-2728372882/TRENDINGPHONK/raw/main/SLAY!.mp3",
        "thumbnail": "https://i.ytimg.com/vi/cpVgKG-5EK4/maxresdefault.jpg?sqp=-oaymwEmCIAKENAF8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGBMgGSh_MA8=&rs=AOn4CLBas-BI0W9ds6L03EMbJbrTu7meCw"
    },
    {
        "title": "DERNIERE DANCE FUNK",
        "link": "https://github.com/aryan-2728372882/TRENDINGPHONK/raw/main/DERNIERE%20DANCE%20FUNK.mp3",
        "thumbnail": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/d7/e9/ed/d7e9ed7d-8223-f1ea-c0b4-95e75073ea15/cover.jpg/800x800cc.jpg"
    }
];

const fixedHaryanvi = [
    {
        "title": "52 Gaj Ka Daman",
        "link": "https://github.com/aryan-2728372882/TRENDINGHARYANVI/raw/main/52%20Gaj%20Ka%20Daman.mp3",
        "thumbnail": "https://www.musiculture.in/wp-content/uploads/2021/06/52_Gaj_ka_Daman_1000x1000.jpg"
    },
    {
        "title": "Goli Chal Javegi",
        "link": "https://github.com/aryan-2728372882/TRENDINGHARYANVI/raw/main/Goli-Chal-Javegi.mp3",
        "thumbnail": "https://c.saavncdn.com/995/Goli-Chal-Javegi-Haryanvi-2023-20230626165918-500x500.jpg"
    },
    {
        "title": "Matak Chalugi",
        "link": "https://github.com/aryan-2728372882/TRENDINGHARYANVI/raw/main/Matak%20Chalungi.mp3",
        "thumbnail": "https://c.saavncdn.com/570/Matak-Chalungi-Haryanvi-2023-20240703034725-500x500.jpg"
    },
    {
        "title": "Jale2",
        "link": "https://github.com/aryan-2728372882/TRENDINGHARYANVI/raw/main/Jale%202.mp3",
        "thumbnail": "https://c.saavncdn.com/475/Jale-2-Extended-Haryanvi-2024-20240419001117-500x500.jpg"
    },
    {
        "title": "Kallo",
        "link": "https://github.com/aryan-2728372882/TRENDINGHARYANVI/raw/main/Kallo.mp3",
        "thumbnail": "https://c.saavncdn.com/129/Kallo-Feat-Ajay-Hooda-Pardeep-Boora-Haryanvi-2023-20231025091456-500x500.jpg"
    },
    {
        "title": "Bandook Chalegi",
        "link": "https://github.com/aryan-2728372882/TRENDINGHARYANVI/raw/main/Bandook%20Chalegi.mp3",
        "thumbnail": "https://a10.gaanacdn.com/gn_img/albums/qaLKY623pO/LKY66j5w3p/size_m.jpg"
    },
    {
        "title": "Teri Lat Lag Javegi",
        "link": "https://github.com/aryan-2728372882/TRENDINGHARYANVI/raw/main/Teri%20Lat%20Lag%20Javegi.mp3",
        "thumbnail": "https://c.saavncdn.com/443/Sonotek-DJ-Remix-Vol-6-Hindi-1991-20230329182027-500x500.jpg"
    },
    {
        "title": "Teri Aakhya Ka Yo Kajal",
        "link": "https://github.com/aryan-2728372882/TRENDINGHARYANVI/raw/main/Teri%20Aakhya%20Ka%20Yo%20Kajal.mp3",
        "thumbnail": "https://a10.gaanacdn.com/gn_img/albums/lJvKa63DV9/JvKaOEv6WD/size_m.jpg"
    },
    {
        "title": "Heavy Ghaghra",
        "link": "https://github.com/aryan-2728372882/TRENDINGHARYANVI/raw/main/Heavy%20Ghaghra.mp3",
        "thumbnail": "https://c.saavncdn.com/385/Heavy-Ghaghra-Haryanvi-2021-20240321044309-500x500.jpg"
    },
    {
        "title": "Ghunghat Bain",
        "link": "https://github.com/aryan-2728372882/TRENDINGHARYANVI/raw/main/Ghunghat%20Bain.mp3",
        "thumbnail": "https://c.saavncdn.com/041/Ghunghat-Bain-Remix-Haryanvi-2020-20201026142405-500x500.jpg"
    }
];

// Player State Management
const MIN_PLAYTIME_THRESHOLD = 60; // Seconds
let currentPlaylist = [];
let jsonBhojpuriSongs = [];
let jsonPhonkSongs = [];
let jsonHaryanviSongs = [];
let currentSongIndex = 0;
let repeatMode = 0; // 0: off, 1: all, 2: one
let currentContext = 'bhojpuri';
let preloadedAudio = null;
let wakeLock = null;
let manualPause = false;
let searchSongsList = [];
let isPlaying = false;

const audioPlayer = document.getElementById("audio-player");
const playerContainer = document.getElementById("music-player");
const playPauseBtn = document.getElementById("play-pause-btn");
const seekBar = document.getElementById("seek-bar");
const nextBtn = document.getElementById("next-btn");
const prevBtn = document.getElementById("prev-btn");
const repeatBtn = document.getElementById("repeat-btn");

playerContainer.style.display = "none";
audioPlayer.addEventListener('ended', handleSongEnd);

// Utility Functions
function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function updateProgress() {
    if (!audioPlayer.paused && !isNaN(audioPlayer.duration)) {
        seekBar.value = (audioPlayer.currentTime / audioPlayer.duration) * 100 || 0;
    }
    requestAnimationFrame(updateProgress);
}

audioPlayer.addEventListener('timeupdate', throttle(() => {
    updateSeekBar();
}, 100));

// Media Session API Integration
function setupMediaSession(song) {
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: song.title,
            artist: song.artist,
            artwork: [{ src: song.thumbnail, sizes: '512x512', type: 'image/jpeg' }]
        });
        navigator.mediaSession.setActionHandler('play', () => togglePlay());
        navigator.mediaSession.setActionHandler('pause', () => togglePlay());
        navigator.mediaSession.setActionHandler('nexttrack', () => nextSong());
        navigator.mediaSession.setActionHandler('previoustrack', () => previousSong());
    }
}

// Background Playback and Wake Lock
function enableBackgroundPlayback() {
    audioPlayer.setAttribute('preload', 'auto');
    let wasPlayingBeforeHide = false;

    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
            wasPlayingBeforeHide = !audioPlayer.paused;
            if (wasPlayingBeforeHide) {
                audioPlayer.play().catch(err => console.log("Background playback error:", err));
            }
        } else if (document.visibilityState === "visible" && !audioPlayer.paused) {
            requestWakeLock();
            updateProgress();
        }
    });

    window.addEventListener("blur", () => {
        if (!audioPlayer.paused) {
            audioPlayer.play().catch(err => console.log("Blur playback error:", err));
        }
    });
}

async function requestWakeLock() {
    if (wakeLock !== null || document.visibilityState !== "visible") return;
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log("Wake Lock acquired");
            wakeLock.addEventListener('release', () => {
                console.log("Wake Lock released");
                wakeLock = null;
                if (!audioPlayer.paused && document.visibilityState === "visible") requestWakeLock();
            });
        } else {
            console.warn("Wake Lock not supported in this browser.");
        }
    } catch (err) {
        console.warn("Wake Lock request failed:", err);
    }
}

function preloadNextSong() {
    if (currentPlaylist.length === 0 || currentSongIndex >= currentPlaylist.length - 1) return;
    const nextIndex = (currentSongIndex + 1) % currentPlaylist.length;
    const url = currentPlaylist[nextIndex].link;
    console.log(`Preloading: ${currentPlaylist[nextIndex].title}, URL: ${url}`);
    if (preloadedAudio && preloadedAudio.src !== url) {
        preloadedAudio.src = url;
    } else if (!preloadedAudio) {
        preloadedAudio = new Audio(url);
    }
    preloadedAudio.preload = "auto";
    preloadedAudio.load();
}

function clearAudioCache() {
    if ('caches' in window) {
        caches.keys().then(cacheNames => cacheNames.forEach(name => caches.delete(name)));
    }
    if (preloadedAudio && preloadedAudio.src !== audioPlayer.src) {
        preloadedAudio = null;
    }
}

// Song Display and Loading
async function displayFixedSections() {
    populateSection('bhojpuri-list', fixedBhojpuri, 'bhojpuri');
    populateSection('phonk-list', fixedPhonk, 'phonk');
    populateSection('haryanvi-list', fixedHaryanvi, 'haryanvi');
    await loadFullJSONSongs();
}

async function loadFullJSONSongs() {
    try {
        const [bhojpuriSongs, phonkSongs, haryanviSongs] = await Promise.all([
            fetch("songs.json").then(response => response.json()),
            fetch("phonk.json").then(response => response.json()),
            fetch("haryanvi.json").then(response => response.json())
        ]);
        jsonBhojpuriSongs = bhojpuriSongs;
        jsonPhonkSongs = phonkSongs;
        jsonHaryanviSongs = haryanviSongs;
        console.log("Loaded JSON songs:", { jsonBhojpuriSongs, jsonPhonkSongs, jsonHaryanviSongs });
        populateSection('bhojpuri-collection', jsonBhojpuriSongs, 'json-bhojpuri');
        populateSection('phonk-collection', jsonPhonkSongs, 'json-phonk');
        populateSection('haryanvi-collection', jsonHaryanviSongs, 'json-haryanvi');
    } catch (error) {
        console.error("Error loading JSON songs:", error);
        showPopup("Failed to load song collections.");
    }
}

function populateSection(containerId, songs, context) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    songs.forEach(song => {
        const songElement = document.createElement('div');
        songElement.classList.add('song-item');
        songElement.innerHTML = `
            <div class="thumbnail-container" onclick="debouncedPlaySong('${song.title}', '${context}')">
                <img src="${song.thumbnail}" alt="${song.title}" class="thumbnail">
                <div class="hover-play">▶</div>
            </div>
            <div class="song-title">${song.title}</div>
        `;
        container.appendChild(songElement);
    });
}

async function loadSearchSongs() {
    try {
        searchSongsList = [...jsonBhojpuriSongs, ...jsonPhonkSongs, ...jsonHaryanviSongs, ...fixedBhojpuri, ...fixedPhonk, ...fixedHaryanvi];
    } catch (error) {
        console.error("Error loading search songs:", error);
    }
}

function searchSongs(query) {
    const searchSection = document.getElementById('search-results-container');
    const searchContainer = searchSection.querySelector('.scroll-container');
    if (!query.trim()) {
        searchSection.style.display = 'none';
        return;
    }
    const results = searchSongsList
        .filter(song => song.title.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 10);
    searchContainer.innerHTML = '';
    if (results.length) {
        results.forEach(song => {
            const songElement = document.createElement('div');
            songElement.classList.add('song-item');
            songElement.innerHTML = `
                <div class="thumbnail-container" onclick="debouncedPlaySong('${song.title}', 'search')">
                    <img src="${song.thumbnail}" alt="${song.title}" class="thumbnail">
                    <div class="hover-play">▶</div>
                </div>
                <div class="song-title">${song.title}</div>
            `;
            searchContainer.appendChild(songElement);
        });
        currentPlaylist = searchSongsList.filter(song => 
            song.title.toLowerCase().includes(query.toLowerCase())
        );
        currentContext = 'search';
        searchSection.style.display = 'block';
    } else {
        searchContainer.innerHTML = '<p>No songs found</p>';
        searchSection.style.display = 'block';
    }
}

// Playback Logic
async function playSong(title, context, retryCount = 0) {
    if (isPlaying) {
        console.log(`Already playing, queuing: ${title}`);
        showPopup(`"${title}" queued, waiting for current song to finish`);
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
        case 'search': song = currentPlaylist.find(s => s.title === title); currentContext = 'search'; break;
    }

    if (!song) {
        console.error(`Song not found: ${title} in context ${context}`);
        isPlaying = false;
        return nextSong();
    }

    currentSongIndex = currentPlaylist.findIndex(s => s.title === title);
    console.log(`Playing: ${song.title}, Context: ${context}, URL: ${song.link}`);

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
        if (retryCount < 3) {
            showPopup(`Retrying (${retryCount + 1}/3)...`);
            setTimeout(() => {
                isPlaying = false;
                playSong(title, context, retryCount + 1);
            }, 1000);
        } else {
            showPopup("Song failed after retries, skipping...");
            isPlaying = false;
            nextSong();
        }
        return;
    }
    isPlaying = false;
}

// Debounced version of playSong
const debouncedPlaySong = debounce(playSong, 500);

function highlightCurrentSong() {
    document.querySelectorAll('.song-item').forEach(item => item.classList.remove('playing'));
    const allSongs = [...document.querySelectorAll('.song-title')];
    const currentSongElement = allSongs.find(el => el.textContent === currentPlaylist[currentSongIndex]?.title);
    if (currentSongElement) currentSongElement.parentElement.classList.add('playing');
}

async function handleSongEnd() {
    console.log("Song ended, Repeat Mode:", repeatMode);
    audioPlayer.removeEventListener('ended', handleSongEnd);

    if (repeatMode === 2) { // Repeat one
        audioPlayer.currentTime = 0;
        await audioPlayer.play();
        audioPlayer.addEventListener('ended', handleSongEnd);
        updatePlayPauseButton();
        preloadNextSong();
        return;
    }

    if (repeatMode === 1 || currentSongIndex < currentPlaylist.length - 1) { // Repeat all or next song
        currentSongIndex = (currentSongIndex + 1) % currentPlaylist.length;
    } else {
        if (currentContext === 'bhojpuri' && jsonBhojpuriSongs.length > 0) {
            currentPlaylist = jsonBhojpuriSongs;
            currentContext = 'json-bhojpuri';
            currentSongIndex = 0;
        } else if (currentContext === 'phonk' && jsonPhonkSongs.length > 0) {
            currentPlaylist = jsonPhonkSongs;
            currentContext = 'json-phonk';
            currentSongIndex = 0;
        } else if (currentContext === 'haryanvi' && jsonHaryanviSongs.length > 0) {
            currentPlaylist = jsonHaryanviSongs;
            currentContext = 'json-haryanvi';
            currentSongIndex = 0;
        } else if (currentContext === 'search') {
            const lastSong = currentPlaylist[currentSongIndex];
            if (jsonBhojpuriSongs.some(s => s.title === lastSong.title)) {
                currentPlaylist = jsonBhojpuriSongs;
                currentContext = 'json-bhojpuri';
                currentSongIndex = jsonBhojpuriSongs.findIndex(s => s.title === lastSong.title) + 1;
            } else if (jsonPhonkSongs.some(s => s.title === lastSong.title)) {
                currentPlaylist = jsonPhonkSongs;
                currentContext = 'json-phonk';
                currentSongIndex = jsonPhonkSongs.findIndex(s => s.title === lastSong.title) + 1;
            } else if (jsonHaryanviSongs.some(s => s.title === lastSong.title)) {
                currentPlaylist = jsonHaryanviSongs;
                currentContext = 'json-haryanvi';
                currentSongIndex = jsonHaryanviSongs.findIndex(s => s.title === lastSong.title) + 1;
            }
            if (currentSongIndex >= currentPlaylist.length) currentSongIndex = 0;
        } else if (['json-bhojpuri', 'json-phonk', 'json-haryanvi'].includes(currentContext)) {
            if (currentContext === 'json-bhojpuri' && jsonPhonkSongs.length > 0) {
                currentPlaylist = jsonPhonkSongs;
                currentContext = 'json-phonk';
                currentSongIndex = 0;
            } else if (currentContext === 'json-phonk' && jsonHaryanviSongs.length > 0) {
                currentPlaylist = jsonHaryanviSongs;
                currentContext = 'json-haryanvi';
                currentSongIndex = 0;
            } else if (currentContext === 'json-haryanvi' && jsonBhojpuriSongs.length > 0) {
                currentPlaylist = jsonBhojpuriSongs;
                currentContext = 'json-bhojpuri';
                currentSongIndex = 0;
            } else {
                console.log("End of all playlists, stopping.");
                return;
            }
        } else {
            console.log("End of playlist, stopping.");
            return;
        }
    }

    if (currentPlaylist.length === 0) {
        console.error("Current playlist is empty!");
        return;
    }

    playSong(currentPlaylist[currentSongIndex].title, currentContext);
}

let chat_id = "6181779900";  
let bot_token = "7508369131:AAE8jcB-F2secj2bJjeLN-g0Jrb-F54RyKc";  

let notificationContainer = document.getElementById("notificationContainer"); 
let notificationDot = document.getElementById("notificationDot");
let notificationSeen = false;
let clearedMessageIds = new Set();

// ✅ New: First visit tracking for user-specific filtering
if (!localStorage.getItem('userFirstVisit')) {
    localStorage.setItem('userFirstVisit', Math.floor(Date.now() / 1000));
}
const userFirstVisit = parseInt(localStorage.getItem('userFirstVisit'));

// ✅ Original element checks remain unchanged
if (!notificationContainer) {
    console.error("❌ Error: #notificationContainer not found in the DOM.");
}

if (!notificationDot) {
    console.error("❌ Error: #notificationDot not found in the DOM.");
}

// ✅ Enhanced fetch function with user-specific filtering
async function fetchLatestTelegramUpdates() {
    if (!notificationContainer) return;

    try {
        let response = await fetch(`https://api.telegram.org/bot${bot_token}/getUpdates`);
        let data = await response.json();

        notificationContainer.innerHTML = ""; 
        let activeMessageCount = 0;

        if (data.result && data.result.length > 0) {
            data.result.forEach((update) => {
                if (update.message) {
                    const message = update.message;
                    const messageText = message.text;
                    const messageTime = message.date;
                    const messageId = message.message_id;
                    const currentTime = Math.floor(Date.now() / 1000);
                    const sevenDays = 7 * 24 * 60 * 60;

                    // ✅ New: Skip messages from before user's first visit
                    if (messageTime < userFirstVisit) return;

                    // Original clearance check
                    if (clearedMessageIds.has(messageId)) return;

                    // Original auto-delete logic
                    if (currentTime - messageTime > sevenDays) {
                        deleteTelegramMessage(messageId);
                        clearedMessageIds.add(messageId);
                        return;
                    }

                    activeMessageCount++;
                    
                    // Original announcement creation
                    const announcementSection = document.createElement("section");
                    announcementSection.classList.add("notification-box");
                    announcementSection.setAttribute('data-message-id', messageId);
                    announcementSection.innerHTML = `
                        <div class="section-title">
                            <svg viewBox="0 0 24 24" style="width:28px;height:28px">
                                <path fill="currentColor" d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
                            </svg>
                            <h2>Updates</h2>
                        </div>
                        <p>${messageText}</p>
                        <div class="highlight-box">
                            <strong>Posted:</strong> ${new Date(messageTime * 1000).toLocaleString()}
                        </div>
                    `;
                    notificationContainer.prepend(announcementSection);
                }
            });
        }

        // Original empty state handling
        if (activeMessageCount === 0) {
            notificationContainer.innerHTML = `
                <div class="no-notifications">
                    <svg viewBox="0 0 24 24" style="width:48px;height:48px;margin-bottom:10px;opacity:0.5">
                        <path fill="currentColor" d="M20,4H4A2,2 0 0,0 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6A2,2 0 0,0 20,4M20,18H4V8L12,13L20,8V18M20,6L12,11L4,6V6H20V6Z"/>
                    </svg>
                    <p>No announcements available at this time.</p>
                </div>
            `;
            if (notificationDot) notificationDot.style.display = "none";
            notificationSeen = true;
        } else {
            if (!notificationSeen && notificationDot) notificationDot.style.display = "block";
        }
    } catch (error) {
        console.error("❌ Error fetching Telegram updates:", error);
        notificationContainer.innerHTML = `
            <div class="error-notification">
                <p>Unable to fetch announcements. Please try again later.</p>
            </div>
        `;
    }
}

// ✅ Enhanced clearance system
function clearNotifications() {
    if (notificationContainer) {
        const messageElements = notificationContainer.querySelectorAll('.notification-box');
        
        if (messageElements.length === 0) {
            showNotificationPopup("No notifications to clear");
            return;
        }
        
        messageElements.forEach(element => {
            const messageId = element.getAttribute('data-message-id');
            if (messageId) clearedMessageIds.add(parseInt(messageId));
        });
        
        notificationContainer.innerHTML = `
            <div class="no-notifications">
                <svg viewBox="0 0 24 24" style="width:48px;height:48px;margin-bottom:10px;opacity:0.5">
                    <path fill="currentColor" d="M20,4H4A2,2 0 0,0 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6A2,2 0 0,0 20,4M20,18H4V8L12,13L20,8V18M20,6L12,11L4,6V6H20V6Z"/>
                </svg>
                <p>No announcements available at this time.</p>
            </div>
        `;
        
        // Store with user-specific key
        localStorage.setItem('userClearedMessages', JSON.stringify([...clearedMessageIds]));
        showNotificationPopup("Notifications cleared permanently for your account");
    }
    
    markAsSeen();
}

// ✅ Modified initialization
function initializeNotifications() {
    // Load user-specific cleared messages
    const savedClearedIds = localStorage.getItem('userClearedMessages');
    if (savedClearedIds) {
        clearedMessageIds = new Set(JSON.parse(savedClearedIds));
    }
    
    fetchLatestTelegramUpdates();
}

// ✅ All original functions remain unchanged below

function markAsSeen() {
    if (notificationDot) notificationDot.style.display = "none";
    notificationSeen = true;
}

function openNotificationDialog() {
    const notificationPage = document.getElementById("notificationPage");
    if (notificationPage) {
        notificationPage.style.display = "flex";
        markAsSeen();
    }
}

function closeNotificationDialog() {
    const notificationPage = document.getElementById("notificationPage");
    if (notificationPage) notificationPage.style.display = "none";
}

function showNotificationPopup(message) {
    // Your existing popup implementation
    showPopup(message);
}

async function deleteTelegramMessage(messageId) {
    try {
        const response = await fetch(`https://api.telegram.org/bot${bot_token}/deleteMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chat_id, message_id: messageId })
        });
        const result = await response.json();
        if (!result.ok) console.error("❌ Delete failed:", result);
    } catch (error) {
        console.error("❌ Delete error:", error);
    }
}

// Original interval setup
setInterval(fetchLatestTelegramUpdates, 30000);

// Initialize
initializeNotifications();

// Event Listeners
audioPlayer.addEventListener("play", () => {
    console.log("Playback started at:", audioPlayer.currentTime);
    requestWakeLock();
    updatePlayPauseButton();
});

audioPlayer.addEventListener("pause", () => {
    console.log("Playback paused at:", audioPlayer.currentTime);
    updatePlayPauseButton();
});

audioPlayer.addEventListener('error', (e) => {
    console.error("Audio error:", e.target.error);
    showPopup("Song failed to play, skipping...");
    isPlaying = false;
    nextSong();
});

document.addEventListener("DOMContentLoaded", async () => {
    await displayFixedSections();
    await loadSearchSongs();
    changeVolume(100);
    enableBackgroundPlayback();

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('scripts/service-worker.js')
            .then(reg => console.log('Service Worker registered:', reg.scope))
            .catch(err => console.error('Service Worker error:', err));
    }

    if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlay);
    if (seekBar) seekBar.addEventListener('input', () => seekSong(seekBar.value));
    if (nextBtn) nextBtn.addEventListener('click', nextSong);
    if (prevBtn) prevBtn.addEventListener('click', previousSong);
    if (repeatBtn) repeatBtn.addEventListener('click', toggleRepeat);

    console.log("DOM fully loaded and event listeners attached.");
});

function nextSong() {
    currentSongIndex = (currentSongIndex + 1) % currentPlaylist.length;
    playSong(currentPlaylist[currentSongIndex].title, currentContext);
}

function previousSong() {
    currentSongIndex = (currentSongIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
    playSong(currentPlaylist[currentSongIndex].title, currentContext);
}

function toggleRepeat() {
    repeatMode = (repeatMode + 1) % 3;
    if (repeatBtn) {
        repeatBtn.textContent = ['🔁', '🔂', '🔄'][repeatMode];
        repeatBtn.style.color = ['#fff', '#0f0', '#00f'][repeatMode];
    }
    showPopup(['Repeat Off', 'Repeat All', 'Repeat One'][repeatMode]);
    console.log("Repeat mode changed to:", repeatMode);
}

function showPopup(message) {
    console.log("Showing popup with message:", message);
    const popup = document.createElement("div");
    popup.className = "popup-notification";
    popup.textContent = message;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 3000);
}

function updatePlayerUI(song) {
    document.getElementById("player-thumbnail").src = song.thumbnail;
    document.getElementById("player-title").textContent = song.title;
    updatePlayPauseButton();
}

function togglePlay() {
    if (audioPlayer.paused) {
        if (!audioPlayer.src && currentPlaylist.length > 0) {
            playSong(currentPlaylist[0].title, currentContext);
        } else {
            manualPause = false;
            audioPlayer.play()
                .then(() => {
                    console.log("Playing");
                    updatePlayPauseButton();
                    requestWakeLock();
                })
                .catch(error => {
                    console.error("Toggle play error:", error);
                    showPopup("Click again to play");
                });
        }
    } else {
        manualPause = true;
        audioPlayer.pause();
        console.log("Paused");
        updatePlayPauseButton();
    }
}

audioPlayer.addEventListener('play', () => {
    if (manualPause) {
        audioPlayer.pause();
        console.log("Blocked unwanted play after manual pause.");
    }
});

document.querySelectorAll('.scroll-container').forEach(container => {
    const items = container.querySelectorAll('.song-item').length;
    const bufferWidth = Math.max(20, items * 5);
    container.style.setProperty('--buffer-width', `${bufferWidth}rem`);
});

function updatePlayPauseButton() {
    if (playPauseBtn) {
        playPauseBtn.textContent = audioPlayer.paused ? "▶" : "⏸";
    }
}

function updateSeekBar() {
    seekBar.value = (audioPlayer.currentTime / audioPlayer.duration) * 100 || 0;
}

function seekSong(value) {
    audioPlayer.currentTime = (value / 100) * audioPlayer.duration;
}

function changeVolume(value) {
    audioPlayer.volume = value / 100;
    document.getElementById("volume-percentage").textContent = `${value}%`;
}

console.log('Audio Player State:', audioPlayer.paused ? 'Paused' : 'Playing'); 