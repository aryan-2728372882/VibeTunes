// Fixed Songs Collections

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
    
    if (!audioPlayer) {
        console.warn("Audio player not found.");
        return;
    }

    let totalPlayTime = 0;  // Stores the total playtime (in milliseconds)
    let lastPlayTime = 0;    // Stores the last play timestamp

    // ✅ When the song starts or resumes
    audioPlayer.addEventListener("play", () => {
        lastPlayTime = Date.now(); // Capture the time when song starts playing
    });

    // ✅ When the song is paused
    audioPlayer.addEventListener("pause", () => {
        if (lastPlayTime) {
            totalPlayTime += (Date.now() - lastPlayTime); // Add elapsed time
            lastPlayTime = 0; // Reset last play timestamp
        }
    });

    // ✅ When the song finishes playing
    audioPlayer.addEventListener("ended", () => {
        if (lastPlayTime) {
            totalPlayTime += (Date.now() - lastPlayTime); // Final playtime update
            lastPlayTime = 0;
        }

        let minutesPlayed = Math.floor(totalPlayTime / 60000); // Convert ms to minutes
        totalPlayTime = 0; // Reset total playtime after updating

        if (minutesPlayed > 0) {
            updateUserStats(uid, minutesPlayed);
        }
    });
}

// ✅ Only Update Firestore with the Correct Value
function updateUserStats(uid, minutesPlayed) {
    if (!uid) {
        console.warn("Cannot update stats: No user ID provided.");
        return;
    }

    if (minutesPlayed < 1) {
        console.warn("Playtime is less than 1 minute, not updating Firestore.");
        return; // Ignore updates for playtime less than 1 minute
    }

    const userRef = db.collection("users").doc(uid);
    userRef.update({
        songsPlayed: firebase.firestore.FieldValue.increment(1),
        minutesListened: firebase.firestore.FieldValue.increment(minutesPlayed)
    }).then(() => console.log(`Updated: +1 song, +${minutesPlayed} minutes`))
      .catch(error => console.error("Error updating user stats:", error));
}


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
    },
    // Add remaining 8 Phonk songs in same format
    // ...
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
let repeatMode = 0; // 0: No repeat, 1: Repeat all, 2: Repeat one
let currentContext = 'bhojpuri'; // 'bhojpuri', 'phonk', or 'search'

const audioPlayer = document.getElementById("audio-player");
const playerContainer = document.getElementById("music-player");
const playPauseBtn = document.getElementById("play-pause-btn");

// Initialize Player
playerContainer.style.display = "none";
audioPlayer.addEventListener('ended', handleSongEnd);
audioPlayer.addEventListener('timeupdate', updateSeekBar);


// ✅ Display Fixed Sections
// ✅ Display Fixed Sections
async function displayFixedSections() {
    // ✅ Load Fixed Bhojpuri & Phonk Sections (No Changes)
    populateSection('bhojpuri-list', fixedBhojpuri, 'bhojpuri');
    populateSection('phonk-list', fixedPhonk, 'phonk');
    // Add Haryanvi trending section
    populateSection('haryanvi-list', fixedHaryanvi, 'haryanvi');

    // ✅ Load Dynamic Bhojpuri & Phonk Collection from JSON
    await loadFullJSONSongs();
}

// ✅ Keep original loadFullJSONSongs intact with additions
async function loadFullJSONSongs() {
    try {
        const [bhojpuriSongs, phonkSongs, haryanviSongs] = await Promise.all([
            fetch("songs.json").then(response => response.json()),
            fetch("phonk.json").then(response => response.json()),
            fetch("haryanvi.json").then(response => response.json())
        ]);

        // Store JSON songs in global variables
        jsonBhojpuriSongs = bhojpuriSongs;
        jsonPhonkSongs = phonkSongs;
        jsonHaryanviSongs = haryanviSongs;

        // Original population remains unchanged
        populateSection('bhojpuri-collection', jsonBhojpuriSongs, 'json-bhojpuri'); 
        populateSection('phonk-collection', jsonPhonkSongs, 'json-phonk'); 
        // Add Haryanvi population
        populateSection('haryanvi-collection', jsonHaryanviSongs, 'json-haryanvi');

    } catch (error) {
        console.error("Error loading songs from JSON:", error);
    }
}

function populateSection(containerId, songs, context) {
    const container = document.getElementById(containerId);
    container.innerHTML = ''; // Clear old content

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
// Search Implementation
async function loadSearchSongs() {
    try {
        // We'll load songs directly in the searchSongs function instead
        console.log("Search functionality ready");
    } catch (error) {
        console.error("Error preparing search:", error);
    }
}

// ✅ Updated searchSongs function (preserve original structure)
function searchSongs(query) {
    const searchSection = document.getElementById('search-results-container');
    const searchContainer = searchSection.querySelector('.scroll-container');

    if (!query.trim()) {
        searchSection.style.display = 'none';
        return;
    }

    // Create a new array for search results that includes source information
    const results = [];
    
    // Check Bhojpuri songs
    jsonBhojpuriSongs.forEach(song => {
        if (song.title.toLowerCase().includes(query.toLowerCase())) {
            results.push({...song, source: 'json-bhojpuri'});
        }
    });
    
    // Check Phonk songs
    jsonPhonkSongs.forEach(song => {
        if (song.title.toLowerCase().includes(query.toLowerCase())) {
            results.push({...song, source: 'json-phonk'});
        }
    });
    
    // Check Haryanvi songs
    jsonHaryanviSongs.forEach(song => {
        if (song.title.toLowerCase().includes(query.toLowerCase())) {
            results.push({...song, source: 'json-haryanvi'});
        }
    });
    
    // Check fixed Bhojpuri songs
    fixedBhojpuri.forEach(song => {
        if (song.title.toLowerCase().includes(query.toLowerCase())) {
            results.push({...song, source: 'bhojpuri'});
        }
    });
    
    // Check fixed Phonk songs
    fixedPhonk.forEach(song => {
        if (song.title.toLowerCase().includes(query.toLowerCase())) {
            results.push({...song, source: 'phonk'});
        }
    });
    
    // Check fixed Haryanvi songs
    fixedHaryanvi.forEach(song => {
        if (song.title.toLowerCase().includes(query.toLowerCase())) {
            results.push({...song, source: 'haryanvi'});
        }
    });
    
    // Limit to top 10 results
    const topResults = results.slice(0, 10);
    
    searchContainer.innerHTML = '';

    if (topResults.length) {
        topResults.forEach(song => {
            const songElement = document.createElement('div');
            songElement.classList.add('song-item');
            songElement.innerHTML = `
                <div class="thumbnail-container" onclick="playSearchSong('${song.title}', '${song.source}')">
                    <img src="${song.thumbnail}" alt="${song.title}" class="thumbnail">
                    <div class="hover-play">▶</div>
                </div>
                <div class="song-title">${song.title}</div>
            `;
            searchContainer.appendChild(songElement);
        });

        currentPlaylist = topResults; // Keep track of search results
        currentContext = 'search';
        searchSection.style.display = 'block';
    } else {
        searchContainer.innerHTML = '<p>No songs found</p>';
        searchSection.style.display = 'block';
    }
}

// Also update the playSong function to ensure context is properly maintained
function playSong(title, context) {
    let song;
    let sourcePlaylist;
    
    // Find the song in its original source
    switch (context) {
        case 'bhojpuri':
            song = fixedBhojpuri.find(s => s.title === title);
            sourcePlaylist = fixedBhojpuri;
            break;
        case 'phonk':
            song = fixedPhonk.find(s => s.title === title);
            sourcePlaylist = fixedPhonk;
            break;
        case 'haryanvi':
            song = fixedHaryanvi.find(s => s.title === title);
            sourcePlaylist = fixedHaryanvi;
            break;
        case 'json-bhojpuri':
            song = jsonBhojpuriSongs.find(s => s.title === title);
            sourcePlaylist = jsonBhojpuriSongs;
            break;
        case 'json-phonk':
            song = jsonPhonkSongs.find(s => s.title === title);
            sourcePlaylist = jsonPhonkSongs;
            break;
        case 'json-haryanvi':
            song = jsonHaryanviSongs.find(s => s.title === title);
            sourcePlaylist = jsonHaryanviSongs;
            break;
        case 'search':
            song = currentPlaylist.find(s => s.title === title);
            sourcePlaylist = currentPlaylist;
            break;
    }
    
    if (!song) {
        console.error("Song not found:", title);
        return;
    }
    
    // Use the original source playlist for continuous playback
    currentPlaylist = sourcePlaylist;
    currentContext = context;
    currentSongIndex = currentPlaylist.findIndex(s => s.title === title);
    
    if (currentSongIndex === -1) {
        console.error("Song index not found in source playlist");
        return;
    }
    
    console.log(`Playing "${title}" from ${context} (index: ${currentSongIndex})`);
    
    audioPlayer.src = song.link;
    audioPlayer.play()
        .then(() => {
            playerContainer.style.display = "flex";
            updatePlayerUI(song);
            highlightCurrentSong();
            showPopup(`Playing from ${context.replace('json-', '')}`);
        })
        .catch(error => {
            console.error("Playback failed:", error);
            showPopup("Error playing song!");
        });
}


// Smart title splitting with fallback
function balanceSongTitles() {
    document.querySelectorAll('.song-title').forEach(title => {
        const text = title.textContent.trim();
        if (text.length > 25) {
            const third = Math.floor(text.length / 3);
            const firstBreak = text.indexOf(' ', third);
            const secondBreak = text.indexOf(' ', third * 2);
            
            let formatted = text;
            if (firstBreak > -1 && secondBreak > -1) {
                formatted = [
                    text.slice(0, firstBreak),
                    text.slice(firstBreak+1, secondBreak),
                    text.slice(secondBreak+1)
                ].join('\n');
            }
            title.innerHTML = formatted.replace(/\n/g, '<br>');
        }
    });
}

// Run on load and resize
window.addEventListener('load', balanceSongTitles);
window.addEventListener('resize', balanceSongTitles);

// ✅ Updated playSong function (keep original cases)
function playSearchSong(title, source) {
    let song;
    let sourcePlaylist;
    
    // Find the song in its original source
    switch (source) {
        case 'bhojpuri':
            song = fixedBhojpuri.find(s => s.title === title);
            sourcePlaylist = fixedBhojpuri;
            break;
        case 'phonk':
            song = fixedPhonk.find(s => s.title === title);
            sourcePlaylist = fixedPhonk;
            break;
        case 'haryanvi':
            song = fixedHaryanvi.find(s => s.title === title);
            sourcePlaylist = fixedHaryanvi;
            break;
        case 'json-bhojpuri':
            song = jsonBhojpuriSongs.find(s => s.title === title);
            sourcePlaylist = jsonBhojpuriSongs;
            break;
        case 'json-phonk':
            song = jsonPhonkSongs.find(s => s.title === title);
            sourcePlaylist = jsonPhonkSongs;
            break;
        case 'json-haryanvi':
            song = jsonHaryanviSongs.find(s => s.title === title);
            sourcePlaylist = jsonHaryanviSongs;
            break;
    }
    
    if (!song) {
        console.error("Song not found:", title);
        return;
    }
    
    // Use the original source playlist for continuous playback
    currentPlaylist = sourcePlaylist;
    currentContext = source;
    currentSongIndex = currentPlaylist.findIndex(s => s.title === title);
    
    if (currentSongIndex === -1) {
        console.error("Song index not found in source playlist");
        return;
    }
    
    console.log(`Playing "${title}" from ${source} (index: ${currentSongIndex}). Next songs will continue from this collection.`);
    
    audioPlayer.src = song.link;
    audioPlayer.play()
        .then(() => {
            playerContainer.style.display = "flex";
            updatePlayerUI(song);
            highlightCurrentSong();
            showPopup(`Playing from ${source.replace('json-', '')}`);
        })
        .catch(error => {
            console.error("Playback failed:", error);
            showPopup("Error playing song!");
        });
}

function highlightCurrentSong() {
    document.querySelectorAll('.song-item').forEach(item => item.classList.remove('playing'));
    const allSongs = [...document.querySelectorAll('.song-title')];
    const currentSongElement = allSongs.find(el => el.textContent === currentPlaylist[currentSongIndex]?.title);
    if (currentSongElement) {
        currentSongElement.parentElement.classList.add('playing');
    }
}


// Remove the duplicate at the bottom and keep this one
document.addEventListener("DOMContentLoaded", () => {
    displayFixedSections();
    loadSearchSongs();
    changeVolume(100); // This sets volume to 100% (300/300)
});

function handleSongEnd() {
    console.log("Current Song Index Before:", currentSongIndex);
    console.log("Repeat Mode:", repeatMode);
    console.log("Current Context:", currentContext);

    // Remove event listener before potentially re-adding it
    audioPlayer.removeEventListener('ended', handleSongEnd);

    if (repeatMode === 2) { // Repeat single song
        audioPlayer.currentTime = 0;
        audioPlayer.play().catch(error => console.error("Playback failed:", error));
        console.log("Repeating the same song...");
        
        // Add event listener back
        audioPlayer.addEventListener('ended', handleSongEnd);
        updatePlayPauseButton();
        return;
    }

    // Get the next song in the current context/collection
    if (repeatMode === 1) { // Repeat all songs
        currentSongIndex = (currentSongIndex + 1) % currentPlaylist.length;
    } else if (currentSongIndex < currentPlaylist.length - 1) { // Play next song normally
        currentSongIndex++;
    } else {
        console.log("Reached the end of the playlist. Stopping.");
        audioPlayer.addEventListener('ended', handleSongEnd);
        return;
    }

    console.log(`Loading Next Song (${currentContext}):`, currentPlaylist[currentSongIndex].title);

    // Load the next song from the SAME context
    audioPlayer.src = currentPlaylist[currentSongIndex].link;
    audioPlayer.load();

    let songStarted = false;
    let retries = 0;
    let maxRetries = 5;

    // Ensure playback before moving to the next song
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
                await new Promise(resolve => setTimeout(resolve, 1000)); // Retry after delay
                retries++;
            }
        }

        if (!songStarted && currentPlaylist.length > 1) {
            console.error("Max retries reached! Skipping to next song...");
            // Skip to the next song BUT STAY IN SAME CONTEXT
            currentSongIndex = (currentSongIndex + 1) % currentPlaylist.length;
            playSong(currentPlaylist[currentSongIndex].title, currentContext);
        }

        // Add event listener back after playback starts
        audioPlayer.addEventListener('ended', handleSongEnd);
        updatePlayPauseButton(); // Sync the play/pause button
    };

    // Confirm the song is playing
    audioPlayer.onplaying = () => {
        console.log("Confirmed: Song is playing:", currentPlaylist[currentSongIndex].title);
        songStarted = true;
        audioPlayer.addEventListener('ended', handleSongEnd);
        highlightCurrentSong(); // Highlight the currently playing song
    };

    // Ensure UI updates with new song info
    updatePlayerUI(currentPlaylist[currentSongIndex]);
    highlightCurrentSong(); // Also update highlighting when song changes
    updatePlayPauseButton();
}

document.addEventListener("visibilitychange", () => {
    let audio = document.querySelector("audio");
    if (document.visibilityState === "visible" && audio.paused) {
        audio.play().catch(err => console.log("Autoplay prevented:", err));
    }
});

document.addEventListener("click", () => {
    let audio = document.querySelector("audio");
    if (audio.paused) {
        audio.play().catch(err => console.log("Playback error:", err));
    }
}, { once: true });

// Make sure the next/previous functions also maintain context
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
    document.querySelector("#repeat-btn").textContent = ['🔁', '🔂', '🔄'][repeatMode];
    showPopup(['Repeat Off', 'Repeat All', 'Repeat One'][repeatMode]);
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
        // Force a check of the actual player state
        if (audioPlayer.paused || audioPlayer.ended || audioPlayer.readyState < 3) {
            playPauseBtn.textContent = "▶"; // Play symbol
        } else {
            playPauseBtn.textContent = "⏸"; // Pause symbol
        }
    }
}

// Add these event listeners to help with mobile device synchronization
document.addEventListener("visibilitychange", () => {
    // When page becomes visible again, update the button state immediately
    if (document.visibilityState === "visible") {
        updatePlayPauseButton();
        
        // Update again after a short delay in case the audio state is still changing
        setTimeout(updatePlayPauseButton, 100);
        setTimeout(updatePlayPauseButton, 500); // Another check after 500ms
    }
});

// Add these additional event listeners to the audio player
audioPlayer.addEventListener("play", updatePlayPauseButton);
audioPlayer.addEventListener("pause", updatePlayPauseButton);
audioPlayer.addEventListener("ended", updatePlayPauseButton);
audioPlayer.addEventListener("waiting", updatePlayPauseButton);
audioPlayer.addEventListener("canplay", updatePlayPauseButton);

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

// Modified changeVolume function
function changeVolume(value) {
    // Change these two lines:
    const volumeValue = value / 100;  // Now 100% = full volume
    audioPlayer.volume = volumeValue;
    document.getElementById("volume-percentage").textContent = `${value}%`;
}

// Improved highlighting function
function highlightCurrentSong() {
    // First, remove 'playing' class from all song items
    document.querySelectorAll('.song-item').forEach(item => item.classList.remove('playing'));
    
    // Find the current song element by matching title text
    const currentSongTitle = currentPlaylist[currentSongIndex]?.title;
    if (!currentSongTitle) return;
    
    // Get all song titles
    const allSongTitles = document.querySelectorAll('.song-title');
    
    // Find the matching element and add 'playing' class to its parent
    for (const titleElement of allSongTitles) {
        if (titleElement.textContent.trim() === currentSongTitle) {
            titleElement.parentElement.classList.add('playing');
            // You might also want to scroll to the playing song
            titleElement.parentElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            break;
        }
    }
}

// ✅ Modified initialization sequence
document.addEventListener("DOMContentLoaded", async () => {
    await displayFixedSections(); // First load JSON collections
    await loadSearchSongs(); // Then prepare search list
    changeVolume(100);
});

