// Firebase Auth and Firestore (assumed included elsewhere)
auth.onAuthStateChanged(user => {
    if (!user) {
        console.warn("No user logged in, skipping song tracking.");
    } else {
        console.log("User detected:", user.email);
        setupSongTracking(user.uid);
    }
});

function setupSongTracking(uid) {
    const audioPlayer = document.getElementById("audio-player");
    if (!audioPlayer) return;

    let totalPlayTime = 0;
    let lastPlayTime = 0;
    let songStarted = false;

    audioPlayer.addEventListener("play", () => {
        if (!songStarted) {
            lastPlayTime = Date.now();
            songStarted = true;
        }
    });

    audioPlayer.addEventListener("pause", () => {
        if (lastPlayTime) {
            totalPlayTime += (Date.now() - lastPlayTime) / 1000; // Seconds
            lastPlayTime = 0;
            songStarted = false;
        }
    });

    audioPlayer.addEventListener("ended", () => {
        if (lastPlayTime) {
            totalPlayTime += (Date.now() - lastPlayTime) / 1000; // Seconds
            lastPlayTime = 0;
            songStarted = false;
        }
        if (totalPlayTime >= 60) { // 1 minute threshold
            updateUserStats(uid, Math.floor(totalPlayTime / 60));
        }
        totalPlayTime = 0; // Reset for next song
    });
}

function updateUserStats(uid, minutesPlayed) {
    if (!uid || minutesPlayed < 1) return;
    const userRef = db.collection("users").doc(uid);
    userRef.update({
        songsPlayed: firebase.firestore.FieldValue.increment(1),
        minutesListened: firebase.firestore.FieldValue.increment(minutesPlayed)
    }).then(() => console.log(`Updated: +1 song, +${minutesPlayed} minutes`))
      .catch(error => console.error("Error updating user stats:", error));
}

// Song Lists (fixedBhojpuri, fixedPhonk, fixedHaryanvi remain unchanged)

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
let currentPlaylist = [];
let jsonBhojpuriSongs = [];
let jsonPhonkSongs = [];
let jsonHaryanviSongs = [];
let currentSongIndex = 0;
let repeatMode = 0;
let currentContext = 'bhojpuri';
let preloadedAudio = null;
let wakeLock = null;
let manualPause = false;

const audioPlayer = document.getElementById("audio-player");
const playerContainer = document.getElementById("music-player");
const playPauseBtn = document.getElementById("play-pause-btn");
const seekBar = document.getElementById("seek-bar");

playerContainer.style.display = "none";
audioPlayer.addEventListener('ended', handleSongEnd);

// Throttle function for UI updates
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

audioPlayer.addEventListener('timeupdate', throttle(() => {
    updateSeekBar();
    if ('mediaSession' in navigator) updateMediaSessionPosition(); // Updates lock screen seek bar
}, 200));

// Background Playback and Wake Lock
function enableBackgroundPlayback() {
    audioPlayer.setAttribute('preload', 'auto');
    let wasPlayingBeforeHide = false; // Track state before visibility change

    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
            wasPlayingBeforeHide = !audioPlayer.paused; // Remember if it was playing
            if (wasPlayingBeforeHide) {
                audioPlayer.play().catch(err => console.log("Background playback error:", err));
                requestWakeLock();
            }
        } else if (document.visibilityState === "visible") {
            console.log("Screen visible, respecting current state...");
            if (!audioPlayer.paused) {
                requestWakeLock(); // Keep wake lock if playing
            }
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
                console.log("Wake Lock released, re-requesting if playing and visible...");
                wakeLock = null;
                if (document.visibilityState === "visible" && !audioPlayer.paused) {
                    requestWakeLock();
                }
            });
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
    preloadedAudio = new Audio(url);
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
            <div class="thumbnail-container" onclick="playSong('${song.title}', '${context}')">
                <img src="${song.thumbnail}" alt="${song.title}" class="thumbnail">
                <div class="hover-play">▶</div>
            </div>
            <div class="song-title">${song.title}</div>
        `;
        container.appendChild(songElement);
    });
}

let searchSongsList = [];
async function loadSearchSongs() {
    try {
        searchSongsList = [...jsonBhojpuriSongs, ...jsonPhonkSongs, ...jsonHaryanviSongs];
        
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
                <div class="thumbnail-container" onclick="playSong('${song.title}', 'search')">
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

async function playSong(title, context) {
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
        return nextSong();
    }

    currentSongIndex = currentPlaylist.findIndex(s => s.title === title);
    console.log(`Playing: ${song.title}, Context: ${context}, URL: ${song.link}`);

    try {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        audioPlayer.src = song.link;
        audioPlayer.load();
        await audioPlayer.play();
        playerContainer.style.display = "flex";
        updatePlayerUI(song);
        highlightCurrentSong();
        preloadNextSong();
        clearAudioCache();
        requestWakeLock();
        if ('mediaSession' in navigator) updateMediaSession(); // Ensure Media Session is updated
    } catch (error) {
        console.error(`Playback error for ${song.title}:`, error);
        showPopup("Error playing song, skipping...");
        nextSong();
    }
}

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

// Event Listeners
audioPlayer.addEventListener("play", () => {
    console.log("Playback started at:", audioPlayer.currentTime);
    requestWakeLock();
});

audioPlayer.addEventListener("pause", () => {
    console.log("Playback paused at:", audioPlayer.currentTime);

});

audioPlayer.addEventListener('error', (e) => {
    console.error("Audio error:", e.target.error);
    showPopup("Song failed to play, skipping...");
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

    playPauseBtn.addEventListener('click', togglePlay);
    seekBar.addEventListener('input', () => seekSong(seekBar.value));
});

// Replace your existing Media Session block
if ('mediaSession' in navigator) {
    function updateMediaSession() {
        if (!currentPlaylist[currentSongIndex]) return;
        const song = currentPlaylist[currentSongIndex];
        navigator.mediaSession.metadata = new MediaMetadata({
            title: song.title,
            artist: "Unknown Artist",
            album: "VibeTunes",
            artwork: [{ src: song.thumbnail, sizes: "512x512", type: "image/jpeg" }]
        });

        // Set initial position state
        updateMediaSessionPosition();

        // Action handlers for lock screen controls
        navigator.mediaSession.setActionHandler('play', () => {
            audioPlayer.play().catch(err => console.error("Media play error:", err));
            updatePlayPauseButton();
            requestWakeLock();
        });
        navigator.mediaSession.setActionHandler('pause', () => {
            audioPlayer.pause();
            updatePlayPauseButton();
        });
        navigator.mediaSession.setActionHandler('nexttrack', nextSong);
        navigator.mediaSession.setActionHandler('previoustrack', previousSong);
        navigator.mediaSession.setActionHandler('seekto', (details) => {
            audioPlayer.currentTime = details.seekTime; // Seek from lock screen
            updateSeekBar(); // Sync in-page seek bar (keeps your original behavior)
            updateMediaSessionPosition(); // Sync lock screen seek bar
        });
    }

    function updateMediaSessionPosition() {
        if (!isNaN(audioPlayer.duration) && audioPlayer.duration > 0) {
            navigator.mediaSession.setPositionState({
                duration: audioPlayer.duration,
                playbackRate: audioPlayer.playbackRate,
                position: audioPlayer.currentTime
            });
        }
    }

    // Update Media Session on key events
    audioPlayer.addEventListener("loadedmetadata", updateMediaSession);
    audioPlayer.addEventListener("play", updateMediaSession);
}

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
    const repeatBtn = document.getElementById("repeat-btn");
    if (repeatBtn) {
        repeatBtn.textContent = ['🔁', '🔂', '🔄'][repeatMode];
    } else {
        console.error("Repeat button not found!");
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
    setTimeout(() => {
        popup.remove();
        console.log("Popup removed");
    }, 3000);
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
            manualPause = false; // Reset flag when playing
            audioPlayer.play()
                .then(() => {
                    console.log("Playing");
                    updatePlayPauseButton();
                })
                .catch(error => {
                    console.error("Toggle play error:", error);
                    showPopup("Click again to play");
                });
        }
    } else {
        manualPause = true; // Set flag when pausing
        audioPlayer.pause();
        console.log("Paused");
        updatePlayPauseButton();
    }
}

audioPlayer.addEventListener('play', () => {
    if (manualPause) {
        audioPlayer.pause();
        console.log("Blocked unwanted play after manual pause, triggered from:", new Error().stack);
    } else {
        console.log("Play event allowed (not manual pause)");
    }
});

document.querySelectorAll('.scroll-container').forEach(container => {
    const items = container.querySelectorAll('.song-item').length;
    const bufferWidth = Math.max(20, items * 5);
    container.style.setProperty('--buffer-width', `${bufferWidth}rem`);
});

function updatePlayPauseButton() {
    const playPauseBtn = document.getElementById('play-pause-btn');
    if (playPauseBtn) {
        playPauseBtn.textContent = audioPlayer.paused ? "▶" : "⏸";
    }
}

function updateSeekBar() {
    seekBar.value = (audioPlayer.currentTime / audioPlayer.duration) * 100 || 0;
}

function seekSong(value) {
    audioPlayer.currentTime = (value / 100) * audioPlayer.duration;
    if ('mediaSession' in navigator) updateMediaSessionPosition();
}

function changeVolume(value) {
    audioPlayer.volume = value / 100;
    document.getElementById("volume-percentage").textContent = `${value}%`;
}

console.log('Audio Player State:', audioPlayer.paused ? 'Paused' : 'Playing');