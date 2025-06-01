/* global auth, db, firebase */
const audioPlayer = document.getElementById("audio-player");
const playerContainer = document.getElementById("music-player");
const playPauseBtn = document.getElementById("play-pause-btn");
const seekBar = document.getElementById("seek-bar");
const nextBtn = document.getElementById("next-btn");
const prevBtn = document.getElementById("prev-btn");
const repeatBtn = document.getElementById("repeat-btn");

if (playerContainer) playerContainer.style.display = "none";

// Firebase Auth and Firestore
auth.onAuthStateChanged(user => {
    if (!user) {
        showPopup("Please log in to track your listening stats!");
    } else {
        showPopup(`Welcome, ${user.email}! Tracking your stats...`);
        setupSongTracking(user.uid);
    }
});

function setupSongTracking(uid) {
    const audioPlayer = document.getElementById("audio-player");
    const seekBar = document.getElementById("seek-bar");
    if (!audioPlayer || !seekBar) {
        return;
    }

    let totalPlayTime = 0;
    let continuousPlayTime = 0;
    let lastPlayTime = 0;
    let songStarted = false;
    let hasSeeked = false;

    audioPlayer.addEventListener("play", () => {
        if (!songStarted) {
            lastPlayTime = Date.now();
            songStarted = true;
            hasSeeked = false;
        }
        updatePlayPauseButton();
    });

    audioPlayer.addEventListener("pause", () => {
        if (lastPlayTime) {
            const elapsed = (Date.now() - lastPlayTime) / 1000;
            totalPlayTime += elapsed;
            if (!hasSeeked) continuousPlayTime += elapsed;
            lastPlayTime = 0;
            songStarted = false;
        }
        updatePlayPauseButton();
    });

    audioPlayer.addEventListener("ended", () => {
        if (lastPlayTime) {
            const elapsed = (Date.now() - lastPlayTime) / 1000;
            totalPlayTime += elapsed;
            if (!hasSeeked) continuousPlayTime += elapsed;
            lastPlayTime = 0;
            songStarted = false;
        }
        if (continuousPlayTime >= 60) {
            const minutesPlayed = Math.floor(totalPlayTime / 60);
            updateUserStats(uid, minutesPlayed);
        }
        totalPlayTime = 0;
        continuousPlayTime = 0;
        updatePlayPauseButton();
        handleSongEnd();
    });

    seekBar.addEventListener("input", () => {
        seekSong(seekBar.value);
        if (songStarted) {
            if (lastPlayTime) {
                const elapsed = (Date.now() - lastPlayTime) / 1000;
                totalPlayTime += elapsed;
                if (!hasSeeked) continuousPlayTime += elapsed;
                lastPlayTime = Date.now();
            }
            hasSeeked = true;
            continuousPlayTime = 0;
        }
    });

    audioPlayer.addEventListener("loadedmetadata", () => {
        updateSeekBar();
    });

    audioPlayer.addEventListener("timeupdate", throttle(() => {
        updateSeekBar();
    }, 250));

    audioPlayer.addEventListener("error", async () => {
        const currentSrc = audioPlayer.src;
        try {
            const cache = await caches.open("vibetunes-audio-cache");
            const cachedResponse = await cache.match(currentSrc);
            if (cachedResponse) {
                audioPlayer.src = URL.createObjectURL(await cachedResponse.blob());
                audioPlayer.play().catch(() => nextSong());
            } else {
                nextSong();
            }
        } catch {
            nextSong();
        }
        updatePlayPauseButton();
    });
}

function updateUserStats(uid, minutesPlayed) {
    if (!uid || minutesPlayed < 1) return;
    const userRef = db.collection("users").doc(uid);
    userRef.update({
        songsPlayed: firebase.firestore.FieldValue.increment(1),
        minutesListened: firebase.firestore.FieldValue.increment(minutesPlayed)
    }).catch(error => {
        setTimeout(() => updateUserStats(uid, minutesPlayed), 2000);
    });
}

// Song Lists
const fixedBhojpuri = [
    {
        "title": "koiri ke raj chali",
        "link": "https://github.com/aryan-2728372882/TRENDINGBHOJPURI/raw/main/Kehu%20Ke%20Na%20Daal%20Gali%20Koiri%20Ke%20Raaj%20Chali(Khesari2.IN).mp3",
        "thumbnail": "https://i.ytimg.com/vi/emeEWLXozqg/maxresdefault.jpg",
        "genre": "Bhojpuri"
    },
    {
        "title": "Namariya Kamar Mei Khos Deb",
        "link": "https://github.com/aryan-2728372882/TRENDINGBHOJPURI/raw/main/%23VIDEO%20%23SAMAR%20SINGH%20%20Namariya%20Kamariya%20Me%20Khos%20Deb%20%20%23Shilpi%20Raj%2C%20%23Akanksha%20Dubey%20%23BhojpuriSong.mp3",
        "thumbnail": "https://i.ytimg.com/vi/iie1dxZtNNA/maxresdefault.jpg",
        "genre": "Bhojpuri"
    },
    {
        "title": "UdanBaj Rajau",
        "link": "https://github.com/aryan-2728372882/TRENDINGBHOJPURI/raw/main/%23Viral%20Song%20%20Shilpi%20Raj%20%20%E0%A4%89%E0%A5%9C%E0%A4%A8%E0%A4%AC%E0%A4%9C%20%E0%A4%B0%E0%A4%9C%E0%A4%8A%20%20Feat%20_%20Anisha%20Pandey%20%20Udanbaj%20Rajau%20%20Bhojpuri%20Song%202025.mp3",
        "thumbnail": "https://a10.gaanacdn.com/gn_img/albums/Rz4W8evbxD/4W87jx2L3x/size_m.jpg",
        "genre": "Bhojpuri"
    },
    {
        "title": "Chuwe Mor Jawani",
        "link": "https://github.com/aryan-2728372882/TRENDINGBHOJPURI/raw/main/%23video%20%20%E0%A4%9A%E0%A4%B5%20%E0%A4%AE%E0%A4%B0%20%E0%A4%9C%E0%A4%B5%E0%A4%A8%20%20%23samarsingh%20%20Chuwe%20Mor%20Jawani%20%20%23bhojpuri%20Song%202024.mp3",
        "thumbnail": "https://c.saavncdn.com/405/Chuwe-Mor-Jawani-Bhojpuri-2024-20240417122251-500x500.jpg",
        "genre": "Bhojpuri"
    },
    {
        "title": "Balma Kadar na Jane",
        "link": "https://github.com/aryan-2728372882/TRENDINGBHOJPURI/raw/main/%23video%20-%20%E0%A4%AC%E0%A4%B2%20%E0%A4%B0%20%E0%A4%89%E0%A4%AE%E0%A4%B0%E0%A4%AF%20%E0%A4%95%20%20Dhananjay%20Dhadkan%20Viral%20Song%202024%20%20Balma%20Kadar%20Na%20Jnae.mp3",
        "thumbnail": "https://c.saavncdn.com/659/Balma-Kadar-Na-Jane-Bhojpuri-2024-20241022172505-500x500.jpg",
        "genre": "Bhojpuri"
    },
    {
        "title": "Babuan",
        "link": "https://github.com/aryan-2728372882/TRENDINGBHOJPURI/raw/main/Babuaan%20Sooryavansham%20320%20Kbps.mp3",
        "thumbnail": "https://i.ytimg.com/vi/WpEHdFDDX00/maxresdefault.jpg",
        "genre": "Bhojpuri"
    },
    {
        "title": "Makaiya Mei Raja ji",
        "link": "https://github.com/aryan-2728372882/TRENDINGBHOJPURI/raw/main/Makaiya%20Me%20Raja%20JI(BhojpuriWap.In).mp3",
        "thumbnail": "https://i.ytimg.com/vi/KO9MHwbV4c8/maxresdefault.jpg",
        "genre": "Bhojpuri"
    },
    {
        "title": "pahin ke chali bikini",
        "link": "https://github.com/aryan-2728372882/TRENDINGBHOJPURI/raw/main/Pahin%20Ke%20Chali%20Bikini%20Purav%20Jha%20320%20Kbps.mp3",
        "thumbnail": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/45/e7/7b/45e77b91-40ee-526c-6df5-6ab7fc13fb3b/cover.jpg/1200x1200bf-60.jpg",
        "genre": "Bhojpuri"
    },
    {
        "title": "Balamua ke balam",
        "link": "https://github.com/aryan-2728372882/TRENDINGBHOJPURI/raw/main/Balamuwa%20Ke%20Ballam(KoshalWorld.Com).mp3",
        "thumbnail": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/4f/10/9d/4f109d9e-8280-d699-4c74-dcd7467a22c3/8905713725498_cover.jpg/800x800cc.jpg",
        "genre": "Bhojpuri"
    },
    {
        "title": "samastipur jila ha",
        "link": "https://github.com/aryan-2728372882/TRENDINGBHOJPURI/raw/main/%23video%20Song%20%20%23%E0%A4%B8%E0%A4%AE%E0%A4%B8%E0%A4%A4%E0%A4%AA%E0%A4%B0%20%20%E0%A4%9C%E0%A4%B2%20%E0%A4%B9%20%20%23chandan%20yadav%20or%20%23kajal%20raj%20%E0%A4%95%20%E0%A4%AC%E0%A4%B0%E0%A4%A1%20%E0%A4%97%E0%A4%A8%20%20%20Samastipur%20jila%20ha.mp3",
        "thumbnail": "https://i.ytimg.com/vi/-EBdpD_aGls/maxresdefault.jpg",
        "genre": "Bhojpuri"
    }
];

const fixedPhonk = [
    {
        "title": "NEXT!",
        "link": "https://github.com/aryan-2728372882/TRENDINGPHONK/raw/main/NEXT!.mp3",
        "thumbnail": "https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da84653ce7dc85f2716164d9c664",
        "genre": "Phonk"
    },
    {
        "title": "Death Is No More X SleepWalker",
        "link": "https://github.com/aryan-2728372882/TRENDINGPHONK/raw/main/death%20in%20no%20more%20x%20sleepwalker.mp3",
        "thumbnail": "https://i.ytimg.com/vi/aO_ZcbgdBHs/maxresdefault.jpg",
        "genre": "Phonk"
    },
    {
        "title": "Matushka UltraFunk",
        "link": "https://github.com/aryan-2728372882/TRENDINGPHONK/raw/main/M%F0%9D%9A%8A%F0%9D%9A%9D%F0%9D%9A%9E%F0%9D%9A%9C%F0%9D%9A%91%F0%9D%9A%94%F0%9D%9A%8A%20%20U%F0%9D%9A%95%F0%9D%9A%9D%F0%9D%9A%9B%F0%9D%9A%8A%F0%9D%9A%8F%F0%9D%9A%9E%F0%9D%9A%97%F0%9D%9A%94.mp3",
        "thumbnail": "https://i.ytimg.com/vi/Hq6mo6lhDMM/hqdefault.jpg",
        "genre": "Phonk"
    },
    {
        "title": "Next Up!",
        "link": "https://github.com/aryan-2728372882/TRENDINGPHONK/raw/main/NEXT%20UP!.mp3",
        "thumbnail": "https://i1.sndcdn.com/artworks-KmDFHGS2abNxivGQ-koMlyw-t500x500.jpg",
        "genre": "Phonk"
    },
    {
        "title": "Empire",
        "link": "https://github.com/aryan-2728372882/TRENDINGPHONK/raw/main/EMPIRE.mp3",
        "thumbnail": "https://i.ytimg.com/vi/FaWzBc-RUA0/maxresdefault.jpg",
        "genre": "Phonk"
    },
    {
        "title": "Funk of Galactico",
        "link": "https://github.com/aryan-2728372882/TRENDINGPHONK/raw/main/Funk%20of%20Gal%C3%A1ctico.mp3",
        "thumbnail": "https://i.ytimg.com/vi/VH9EF4QpI4A/maxresdefault.jpg",
        "genre": "Phonk"
    },
    {
        "title": "Acordeão Funk",
        "link": "https://github.com/aryan-2728372882/TRENDINGPHONK/raw/main/Acorde%C3%A3o%20Funk.mp3",
        "thumbnail": "https://i.ytimg.com/vi/-ELVoLmlSpU/maxresdefault.jpg?sqp=-oaymwEmCIAKENAF8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGH8gEyh5MA8=&rs=AOn4CLBJoXKWv-g1K0zNg1Xxp93d1jviQg",
        "genre": "Phonk"
    },
    {
        "title": "Glory",
        "link": "https://github.com/aryan-2728372882/TRENDINGPHONK/raw/main/GLORY.mp3",
        "thumbnail": "https://i.ytimg.com/vi/Q5chHwL1Fhg/maxresdefault.jpg?sqp=-oaymwEmCIAKENAF8quKqQMa8AEB-AG2CIACuAiKAgwIABABGH8gEygTMA8=&rs=AOn4CLBgyb9jPITWD_-cfTZ1ayQYKGlGTg",
        "genre": "Phonk"
    },
    {
        "title": "Slay",
        "link": "https://github.com/aryan-2728372882/TRENDINGPHONK/raw/main/SLAY!.mp3",
        "thumbnail": "https://i.ytimg.com/vi/GOz19fuuZ8g/maxresdefault.jpg?sqp=-oaymwEmCIAKENAF8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGH8gEyh5MA8=&rs=AOn4CLBJoXKWv-g1K0zNg1Xxp93d1jviQg",
        "genre": "Phonk"
    },
    {
        "title": "DERNIERE DANCE FUNK",
        "link": "https://github.com/aryan-2728372882/TRENDINGPHONK/raw/main/DERNIERE%20DANCE%20FUNK.mp3",
        "thumbnail": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/d7/e9/ed/d7e9ed7d-8223-f1ea-c0b4-95e75073ea15/cover.jpg/800x800cc.jpg",
        "genre": "Phonk"
    }
];

const fixedHaryanvi = [
    {
        "title": "52 Gaj Ka Daman",
        "link": "https://github.com/aryan-2728372882/TRENDINGHARYANVI/raw/main/52%20Gaj%20Ka%20Daman.mp3",
        "thumbnail": "https://www.musiculture.in/wp-content/uploads/2021/06/52_Gaj_ka_Daman_1000x1000.jpg",
        "genre": "Haryanvi"
    },
    {
        "title": "Goli Chal Javegi",
        "link": "https://github.com/aryan-2728372882/TRENDINGHARYANVI/raw/main/Goli-Chal-Javegi.mp3",
        "thumbnail": "https://c.saavncdn.com/995/Goli-Chal-Javegi-Haryanvi-2023-20230626165918-500x500.jpg",
        "genre": "Haryanvi"
    },
    {
        "title": "Matak Chalugi",
        "link": "https://github.com/aryan-2728372882/TRENDINGHARYANVI/raw/main/Matak%20Chalungi.mp3",
        "thumbnail": "https://c.saavncdn.com/570/Matak-Chalungi-Haryanvi-2023-20240703034725-500x500.jpg",
        "genre": "Haryanvi"
    },
    {
        "title": "Jale2",
        "link": "https://github.com/aryan-2728372882/TRENDINGHARYANVI/raw/main/Jale%202.mp3",
        "thumbnail": "https://c.saavncdn.com/475/Jale-2-Extended-Haryanvi-2024-20240419001117-500x500.jpg",
        "genre": "Haryanvi"
    },
    {
        "title": "Kallo",
        "link": "https://github.com/aryan-2728372882/TRENDINGHARYANVI/raw/main/Kallo.mp3",
        "thumbnail": "https://c.saavncdn.com/129/Kallo-Feat-Ajay-Hooda-Pardeep-Boora-Haryanvi-2023-20231025091456-500x500.jpg",
        "genre": "Haryanvi"
    },
    {
        "title": "Bandook Chalegi",
        "link": "https://github.com/aryan-2728372882/TRENDINGHARYANVI/raw/main/Bandook%20Chalegi.mp3",
        "thumbnail": "https://a10.gaanacdn.com/gn_img/albums/qaLKY623pO/LKY66j5w3p/size_m.jpg",
        "genre": "Haryanvi"
    },
    {
        "title": "Teri Lat Lag Javegi",
        "link": "https://github.com/aryan-2728372882/TRENDINGHARYANVI/raw/main/Teri%20Lat%20Lag%20Javegi.mp3",
        "thumbnail": "https://c.saavncdn.com/443/Sonotek-DJ-Remix-Vol-6-songs-2017-20230329182027-500x500.jpg",
        "genre": "Haryanvi"
    },
    {
        "title": "Teri Aakhya Ka Yo Kajal",
        "link": "https://github.com/aryan-2728372882/TRENDINGHARYANVI/raw/main/Teri%20Aakhya%20Ka%20Yo%20Kajal.mp3",
        "thumbnail": "https://a10.gaanacdn.com/gn_img/Albums/lJvKa63DV9/4vKa0Ev6WD.jpg",
        "genre": "Haryanvi"
    },
    {
        "title": "Heavy Ghaghra",
        "link": "https://github.com/aryan-2728372882/TRENDINGHARYANVI/raw/main/Heavy%20Ghaghra.mp3",
        "thumbnail": "https://c.saavncdn.com/385/Heavy-Ghaghra-Haryanvi-2021-20240321044309-500x500.jpg",
        "genre": "Haryanvi"
    },
    {
        "title": "Ghunghat Bain",
        "link": "https://github.com/aryan-2728372882/TRENDINGHARYANVI/raw/main/Ghunghat%20Bain.mp3",
        "thumbnail": "https://c.saavncdn.com/041/Ghunghat-Bain-Remix-Haryanvi-2020-20201026122405-500x500.jpg",
        "genre": "Haryanvi"
    }
];

// Player State Management
const MIN_PLAYTIME_THRESHOLD = 60;
let currentPlaylist = [];
let jsonBhojpuriSongs = [];
let jsonPhonkSongs = [];
let jsonHaryanviSongs = [];
let jsonRemixSongs = [];
let currentSongIndex = 0;
let repeatMode = 0;
let currentContext = "bhojpuri";
let preloadedAudio = null;
let wakeLock = null;
let manualPause = false;
let searchSongsList = [];
let isPlaying = false;

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
    if (!audioPlayer.paused && isFinite(audioPlayer.duration)) {
        seekBar.value = (audioPlayer.currentTime / audioPlayer.duration) * 100 || 0;
    }
    requestAnimationFrame(updateProgress);
}

function setupMediaSession(song) {
    if ("mediaSession" in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: song.title,
            artist: song.artist || "Unknown Artist",
            artwork: [{ src: song.thumbnail, sizes: "512x512", type: "image/jpeg" }]
        });
        navigator.mediaSession.setActionHandler("play", () => {
            if (audioPlayer.paused) {
                manualPause = false;
                audioPlayer.play().then(() => {
                    updatePlayPauseButton();
                    requestWakeLock();
                });
            }
        });
        navigator.mediaSession.setActionHandler("pause", () => {
            if (!audioPlayer.paused) {
                manualPause = true;
                audioPlayer.pause();
                updatePlayPauseButton();
            }
        });
        navigator.mediaSession.setActionHandler("nexttrack", () => nextSong());
        navigator.mediaSession.setActionHandler("previoustrack", () => previousSong());
        navigator.mediaSession.playbackState = audioPlayer.paused ? "paused" : "playing";
    }
}

function enableBackgroundPlayback() {
    audioPlayer.setAttribute("preload", "auto");
    let wasPlayingBeforeHide = false;
    let retryAttempts = 0;
    const maxRetries = 5;

    const handleVisibilityChange = async () => {
        if (document.visibilityState === "hidden") {
            wasPlayingBeforeHide = !audioPlayer.paused;
            if (wasPlayingBeforeHide) {
                if ("mediaSession" in navigator) {
                    navigator.mediaSession.playbackState = "playing";
                }
                try {
                    await audioPlayer.play();
                } catch (error) {
                    console.warn("Playback failed on visibility hidden, retrying...", error);
                    if (retryAttempts < maxRetries) {
                        retryAttempts++;
                        setTimeout(async () => {
                            if (wasPlayingBeforeHide && !manualPause) {
                                try {
                                    await audioPlayer.play();
                                } catch {
                                    nextSong();
                                }
                            }
                        }, 1000 * retryAttempts);
                    } else {
                        nextSong();
                    }
                }
            }
        } else if (document.visibilityState === "visible") {
            retryAttempts = 0;
            if (wasPlayingBeforeHide && audioPlayer.paused && !manualPause) {
                await requestWakeLock();
                try {
                    await audioPlayer.play();
                } catch (error) {
                    console.warn("Playback failed on visibility visible, retrying...", error);
                    setTimeout(async () => {
                        try {
                            await audioPlayer.play();
                        } catch {
                            nextSong();
                        }
                    }, 1000);
                }
            }
            if ("mediaSession" in navigator) {
                navigator.mediaSession.playbackState = audioPlayer.paused ? "paused" : "playing";
                if (currentPlaylist[currentSongIndex]) {
                    navigator.mediaSession.metadata = new MediaMetadata({
                        title: currentPlaylist[currentSongIndex].title,
                        artist: currentPlaylist[currentSongIndex].artist || "Unknown Artist",
                        artwork: [{ src: currentPlaylist[currentSongIndex].thumbnail, sizes: "512x512", type: "image/jpeg" }]
                    });
                }
            }
            updatePlayPauseButton();
            updateProgress();
        }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    window.addEventListener("blur", async () => {
        if (!audioPlayer.paused && !manualPause) {
            try {
                await audioPlayer.play();
            } catch (error) {
                console.warn("Playback failed on blur, retrying...", error);
                setTimeout(async () => {
                    try {
                        await audioPlayer.play();
                    } catch {
                        nextSong();
                    }
                }, 1000);
            }
            if ("mediaSession" in navigator) {
                navigator.mediaSession.playbackState = "playing";
            }
        }
    });

    audioPlayer.addEventListener("waiting", () => {
        preloadNextSong();
    });

    audioPlayer.addEventListener("canplay", async () => {
        if (wasPlayingBeforeHide && audioPlayer.paused && !manualPause) {
            try {
                await audioPlayer.play();
                if ("mediaSession" in navigator) {
                    navigator.mediaSession.playbackState = "playing";
                }
            } catch {}
        }
        updatePlayPauseButton();
    });

    audioPlayer.addEventListener("progress", () => {
        if (audioPlayer.buffered.length > 0) {
            const bufferedEnd = audioPlayer.buffered.end(audioPlayer.buffered.length - 1);
            const bufferThreshold = 15;
            if (bufferedEnd - audioPlayer.currentTime < bufferThreshold && !audioPlayer.paused) {
                preloadNextSong();
            }
        }
    });

    const keepAliveInterval = setInterval(() => {
        if (!audioPlayer.paused && document.visibilityState === "hidden") {
            audioPlayer.currentTime = audioPlayer.currentTime;
        }
    }, 30000);

    window.addEventListener("beforeunload", () => {
        clearInterval(keepAliveInterval);
    });
}

async function requestWakeLock() {
    if (wakeLock !== null || document.visibilityState !== "visible") return;
    const maxRetries = 3;
    let retryCount = 0;

    const attemptWakeLock = async () => {
        try {
            if ("wakeLock" in navigator) {
                wakeLock = await navigator.wakeLock.request("screen");
                wakeLock.addEventListener("release", () => {
                    wakeLock = null;
                    if (!audioPlayer.paused && document.visibilityState === "visible") {
                        setTimeout(requestWakeLock, 1000);
                    }
                });
                if (!audioPlayer.paused) {
                    setTimeout(() => {
                        if (wakeLock && !audioPlayer.paused) {
                            wakeLock.release();
                            requestWakeLock();
                        }
                    }, 60000);
                }
            }
        } catch (error) {
            console.warn("WakeLock request failed, retrying...", error);
            if (retryCount < maxRetries - 1) {
                retryCount++;
                setTimeout(attemptWakeLock, 5000);
            }
        }
    };

    await attemptWakeLock();
}

function preloadNextSong() {
    if (currentPlaylist.length === 0 || currentSongIndex >= currentPlaylist.length - 1) return;

    const nextIndex = (currentSongIndex + 1) % currentPlaylist.length;
    const url = currentPlaylist[nextIndex].link;

    if (preloadedAudio && preloadedAudio.src !== url) {
        preloadedAudio.pause();
        preloadedAudio.src = "";
        preloadedAudio = null;
    }

    if (!preloadedAudio) {
        preloadedAudio = new Audio();
        preloadedAudio.preload = "auto";
        preloadedAudio.src = url;
        preloadedAudio.load();

        preloadedAudio.addEventListener("error", () => {
            console.warn("Preload failed for next song, skipping preload...");
            preloadedAudio = null;
        });

        preloadedAudio.addEventListener("canplay", () => {
            console.log("Next song preloaded successfully:", url);
        });
    }

    const cacheNextSong = async () => {
        try {
            const cache = await caches.open("vibetunes-audio-cache");
            const cachedResponse = await cache.match(url);
            if (!cachedResponse) {
                await cache.add(url);
                console.log("Next song cached successfully:", url);
            }
        } catch (error) {
            console.warn("Failed to cache next song:", error);
        }
    };

    cacheNextSong();
}

function clearAudioCache() {
    if ("caches" in window) {
        caches.keys().then(cacheNames => cacheNames.forEach(name => caches.delete(name)));
    }
    if (preloadedAudio && preloadedAudio.src !== audioPlayer.src) {
        preloadedAudio.pause();
        preloadedAudio.src = "";
        preloadedAudio = null;
    }
}

async function displayFixedSections() {
    populateSection("bhojpuri-list", fixedBhojpuri, "bhojpuri");
    populateSection("phonk-list", fixedPhonk, "phonk");
    populateSection("haryanvi-list", fixedHaryanvi, "haryanvi");
    await loadFullJSONSongs();
}

async function loadFullJSONSongs() {
    try {
        const [bhojpuriSongs, phonkSongs, haryanviSongs, remixSongs] = await Promise.all([
            fetch("songs.json").then(response => response.json()).catch(() => []),
            fetch("phonk.json").then(response => response.json()).catch(() => []),
            fetch("haryanvi.json").then(response => response.json()).catch(() => []),
            fetch("remixes.json").then(response => response.json()).catch(() => [])
        ]);
        jsonBhojpuriSongs = bhojpuriSongs.filter(song => isValidSong(song)).map(song => ({
            ...song,
            title: song.title?.trim() || "Unknown Title",
            link: song.link?.trim() || "",
            thumbnail: song.thumbnail?.trim() || "https://via.placeholder.com/150"
        }));
        jsonPhonkSongs = phonkSongs.filter(song => isValidSong(song)).map(song => ({
            ...song,
            title: song.title?.trim() || "Unknown Title",
            link: song.link?.trim() || "",
            thumbnail: song.thumbnail?.trim() || "https://via.placeholder.com/150"
        }));
        jsonHaryanviSongs = haryanviSongs.filter(song => isValidSong(song)).map(song => ({
            ...song,
            title: song.title?.trim() || "Unknown Title",
            link: song.link?.trim() || "",
            thumbnail: song.thumbnail?.trim() || "https://via.placeholder.com/150"
        }));
        jsonRemixSongs = remixSongs.filter(song => isValidSong(song)).map(song => ({
            ...song,
            title: song.title?.trim() || "Unknown Title",
            link: song.link?.trim() || "",
            thumbnail: song.thumbnail?.trim() || "https://via.placeholder.com/150"
        }));
        populateSection("bhojpuri-collection", jsonBhojpuriSongs, "json-bhojpuri");
        populateSection("phonk-collection", jsonPhonkSongs, "json-phonk");
        populateSection("haryanvi-collection", jsonHaryanviSongs, "json-haryanvi");
        populateSection("remix-collection", jsonRemixSongs, "json-remixes");
    } catch {}
}

function isValidSong(song) {
    const isValid = song &&
                   typeof song.title === "string" && song.title.trim() &&
                   typeof song.link === "string" && song.link.trim() &&
                   typeof song.thumbnail === "string";
    return isValid;
}

function populateSection(containerId, songs, context) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";
    songs.forEach((song, index) => {
        const songElement = document.createElement("div");
        songElement.classList.add("song-item");
        const songId = `${context}-${index}`;
        songElement.id = songId;
        songElement.innerHTML = `
            <div class="thumbnail-container" onclick="debouncedPlaySong('${song.title}', '${context}')">
                <img src="${song.thumbnail}" alt="${song.title}" class="thumbnail">
                <div class="hover-play">▶</div>
                <div class="song-actions-toggle">
                    <button class="song-menu-btn" title="Options">⋮</button>
                </div>
            </div>
            <div class="song-title">${song.title}</div>
        `;
        container.appendChild(songElement);

        window.songData = window.songData || {};
        window.songData[songId] = { title: song.title, link: song.link, thumbnail: song.thumbnail };

        const menuBtn = songElement.querySelector(".song-menu-btn");
        menuBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            showSongMenu(e, songId);
        });
    });
}

async function loadSearchSongs() {
    try {
        searchSongsList = [...jsonBhojpuriSongs, ...jsonPhonkSongs, ...jsonHaryanviSongs, ...jsonRemixSongs, ...fixedBhojpuri, ...fixedPhonk, ...fixedHaryanvi];
    } catch {}
}

function searchSongs(query) {
    if (!query || query.trim().length < 2) {
        document.getElementById("search-results-container").style.display = "none";
        return;
    }

    query = query.toLowerCase();
    let allSongs = [...currentPlaylist, ...jsonBhojpuriSongs, ...jsonPhonkSongs, ...jsonHaryanviSongs, ...jsonRemixSongs];
    let songsHash = {};
    allSongs.forEach(song => {
        songsHash[song.title] = song;
    });
    allSongs = Object.values(songsHash);

    const searchSongsList = allSongs.filter(song =>
        song.title.toLowerCase().includes(query)
    );

    const searchContainer = document.querySelector("#search-results-container .scroll-container");
    searchContainer.innerHTML = "";

    if (searchSongsList.length > 0) {
        document.getElementById("search-results-container").style.display = "block";
        searchSongsList.forEach(song => {
            const songElement = document.createElement("div");
            songElement.classList.add("song-item");
            const songId = `search-${song.title}`;
            songElement.id = songId;
            songElement.innerHTML = `
                <div class="thumbnail-container" onclick="debouncedPlaySong('${song.title}', 'search')">
                    <img src="${song.thumbnail}" alt="${song.title}" class="thumbnail">
                    <div class="hover-play">▶</div>
                    <div class="song-actions-toggle">
                        <button class="song-menu-btn" title="Options">⋮</button>
                    </div>
                </div>
                <div class="song-title">${song.title}</div>
            `;
            searchContainer.appendChild(songElement);

            window.songData[songId] = { title: song.title, link: song.link, thumbnail: song.thumbnail };

            const menuBtn = songElement.querySelector(".song-menu-btn");
            menuBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                showSongMenu(e, songId);
            });
        });
        currentPlaylist = searchSongsList.filter(song =>
            song.title.toLowerCase().includes(query)
        );
    } else {
        document.getElementById("search-results-container").style.display = "none";
    }
}

async function playSong(title, context, retryCount = 0) {
    if (isPlaying) return;
    isPlaying = true;

    let song;
    switch (context) {
        case "bhojpuri": song = fixedBhojpuri.find(s => s.title === title); currentPlaylist = fixedBhojpuri; currentContext = "bhojpuri"; break;
        case "phonk": song = fixedPhonk.find(s => s.title === title); currentPlaylist = fixedPhonk; currentContext = "phonk"; break;
        case "haryanvi": song = fixedHaryanvi.find(s => s.title === title); currentPlaylist = fixedHaryanvi; currentContext = "haryanvi"; break;
        case "json-bhojpuri": song = jsonBhojpuriSongs.find(s => s.title === title); currentPlaylist = jsonBhojpuriSongs; currentContext = "json-bhojpuri"; break;
        case "json-phonk": song = jsonPhonkSongs.find(s => s.title === title); currentPlaylist = jsonPhonkSongs; currentContext = "json-phonk"; break;
        case "json-haryanvi": song = jsonHaryanviSongs.find(s => s.title === title); currentPlaylist = jsonHaryanviSongs; currentContext = "json-haryanvi"; break;
        case "json-remixes": song = jsonRemixSongs.find(s => s.title === title); currentPlaylist = jsonRemixSongs; currentContext = "json-remixes"; break;
        case "search": song = currentPlaylist.find(s => s.title === title); currentContext = "search"; break;
    }

    if (!song || !isValidSong(song)) {
        isPlaying = false;
        return nextSong();
    }

    currentSongIndex = currentPlaylist.findIndex(s => s.title === title);
    if (currentSongIndex === -1) {
        isPlaying = false;
        return nextSong();
    }

    const maxRetries = 3;
    try {
        manualPause = false;
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        if (seekBar) seekBar.value = 0;

        const cache = await caches.open("vibetunes-audio-cache");
        const cachedResponse = await cache.match(song.link);
        if (cachedResponse) {
            audioPlayer.src = URL.createObjectURL(await cachedResponse.blob());
        } else {
            audioPlayer.src = song.link;
        }

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

        const songId = `${context}-${currentSongIndex}`;
        if (typeof addToRecentlyPlayed === "function") {
            addToRecentlyPlayed(songId, song.title, song.thumbnail);
        } else if (typeof addToRecentlyPlayedLocal === "function") {
            addToRecentlyPlayedLocal(songId);
        }

        if (typeof displayRecentlyPlayed === "function") {
            setTimeout(displayRecentlyPlayed, 500);
        }
    } catch (error) {
        console.error("Error playing song:", error);
        if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            isPlaying = false;
            return playSong(title, context, retryCount + 1);
        } else {
            isPlaying = false;
            return nextSong();
        }
    } finally {
        isPlaying = false;
    }
}

const debouncedPlaySong = debounce(playSong, 500);

function highlightCurrentSong() {
    document.querySelectorAll(".song-item").forEach(item => item.classList.remove("playing"));
    const allSongs = [...document.querySelectorAll(".song-title")];
    const currentSongElement = allSongs.find(el => el.textContent === currentPlaylist[currentSongIndex]?.title);
    if (currentSongElement) currentSongElement.parentElement.classList.add("playing");
}

async function handleSongEnd() {
    if (repeatMode === 2) {
        audioPlayer.currentTime = 0;
        if (seekBar) seekBar.value = 0;
        await audioPlayer.play();
        updatePlayPauseButton();
        preloadNextSong();
        if ("mediaSession" in navigator) {
            navigator.mediaSession.playbackState = "playing";
            navigator.mediaSession.metadata = new MediaMetadata({
                title: currentPlaylist[currentSongIndex].title,
                artist: currentPlaylist[currentSongIndex].artist || "Unknown Artist",
                artwork: [{ src: currentPlaylist[currentSongIndex].thumbnail, sizes: "512x512", type: "image/jpeg" }]
            });
        }
        return;
    }

    if (currentPlaylist.length === 0) {
        return;
    }

    if (repeatMode === 1) {
        currentSongIndex = (currentSongIndex + 1) % currentPlaylist.length;
    } else if (currentSongIndex < currentPlaylist.length - 1) {
        currentSongIndex += 1;
    } else {
        let nextContext = null;
        let nextPlaylist = null;
        if (currentContext === "bhojpuri" && jsonBhojpuriSongs.length > 0) {
            nextPlaylist = jsonBhojpuriSongs;
            nextContext = "json";
        } else if (currentContext === "phonk" && jsonPhonkSongs.length > 0) {
            nextSongs = jsonPhonkSongs;
            nextContext = "json-phonk";
        } else if (currentContext === "haryanvi" && jsonHaryanviSongs.length > 0) {
            nextPlaylist = jsonHaryanviSongs;
            nextContext = "json-haryanvi";
        } else if (currentContext === "json-remixes" && fixedBhojpuri.length > 0) {
            nextPlaylist = fixedBhojpuri;
            nextContext = "bhojpuri";
        } else if (currentContext === "search") {
            const lastSong = currentPlaylist[currentSongIndex];
            if (jsonBhojpuriSongs.some(s => s.length === lastSong.title)) {
                nextPlaylist = jsonBhojpuriSongs;
                nextContext = "json-bhojpuri";
                currentSongIndex = jsonBhojpuriSongs.findIndex(s => s.title === lastSong.title) + 1;
            } else if (jsonPhonkSongs.some(s => s.title === lastSong.title)) {
                nextPlaylist = jsonPhonkSongs;
                nextContext = "json-phonk";
                currentSongIndex = jsonPhonkSongs.findIndex(s => s.title === lastSong.title) + 1;
            } else if (jsonHaryanviSongs.some(s => s.title === lastSong.title)) {
                nextPlaylist = jsonHaryanviSongs;
                nextContext = "json-haryanvi";
                currentSongIndex = jsonHaryanviSongs.findIndex(s => s.title === lastSong.title) + 1;
            } else if (jsonRemixSongs.some(s => s.title === lastSong.title)) {
                nextPlaylist = fixedBhojpuri;
                nextContext = "bhojpuri";
                currentSongIndex = jsonRemixSongs.findIndex(s => s.title === lastSong.title) + 1;
            }
            if (nextPlaylist && currentSongIndex >= nextPlaylist.length) currentSongIndex = 0;
        } else if (["json-bhojpuri", "json-phonk", "json-haryanvi"].includes(currentContext)) {
            if (currentContext === "json-bhojpuri" && jsonPhonkSongs.length > 0) {
                nextPlaylist = jsonPhonkSongs;
                nextContext = "json-phonk";
            } else if (currentContext === "json-phonk" && jsonHaryanviSongs.length > 0) {
                nextPlaylist = jsonHaryanviSongs;
                nextContext = "json-haryanvi";
            } else if (currentContext === "json-haryanvi" && jsonRemixSongs.length > 0) {
                nextPlaylist = jsonRemixSongs;
                nextContext = "json-remixes";
            } else {
                return;
            }
        } else {
            return;
        }
        if (!nextPlaylist) return;
        currentPlaylist = nextPlaylist;
        currentContext = nextContext;
        currentSongIndex = 0;
    }

    if (currentPlaylist.length === 0 || currentSongIndex >= currentPlaylist.length) {
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

if (!localStorage.getItem("userFirstVisit")) {
    localStorage.setItem("userFirstVisit", Math.floor(Date.now() / 1000));
}
const userFirstVisit = parseInt(localStorage.getItem("userFirstVisit"));

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

                    if (messageTime < userFirstVisit) return;

                    if (clearedMessageIds.has(messageId)) return;

                    if (currentTime - messageTime > sevenDays) {
                        deleteTelegramMessage(messageId);
                        clearedMessageIds.add(messageId);
                        return;
                    }

                    activeMessageCount++;

                    const announcementSection = document.createElement("section");
                    announcementSection.classList.add("notification-box");
                    announcementSection.setAttribute("data-message-id", messageId);
                    announcementSection.innerHTML = `
                        <div class="section-title">
                            <svg viewBox="0 0 24 24" style="width:28px;height:28px">
                                <path fill="currentColor" d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.50,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.50,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
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
    } catch {
        notificationContainer.innerHTML = `
            <div class="error-notification">
                <p>Unable to fetch announcements. Please try again later.</p>
            </div>
        `;
    }
}

function clearNotifications() {
    if (notificationContainer) {
        const messageElements = notificationContainer.querySelectorAll(".notification-box");

        messageElements.forEach(element => {
            const messageId = element.getAttribute("data-message-id");
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

        localStorage.setItem("userClearedMessages", JSON.stringify([...clearedMessageIds]));
    }

    markAsSeen();
}

function initializeNotifications() {
    const savedClearedIds = localStorage.getItem("userClearedMessages");
    if (savedClearedIds) {
        clearedMessageIds = new Set(JSON.parse(savedClearedIds));
    }

    fetchLatestTelegramUpdates();
}

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

async function deleteTelegramMessage(messageId) {
    try {
        const response = await fetch(`https://api.telegram.org/bot${bot_token}/deleteMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chat_id, message_id: messageId })
        });
        const result = await response.json();
    } catch {}
}

setInterval(fetchLatestTelegramUpdates, 30000);

initializeNotifications();

audioPlayer.addEventListener("play", () => {
    if (manualPause && document.activeElement !== playPauseBtn && audioPlayer.currentTime !== 0) {
        audioPlayer.pause();
    } else {
        manualPause = false;
        updatePlayPauseButton();
        if ("mediaSession" in navigator) {
            navigator.mediaSession.playbackState = "playing";
        }
    }
});

audioPlayer.addEventListener("pause", () => {
    updatePlayPauseButton();
    if ("mediaSession" in navigator) {
        navigator.mediaSession.playbackState = "paused";
    }
});

audioPlayer.addEventListener("error", () => {
    isPlaying = false;
    nextSong();
    updatePlayPauseButton();
});

document.addEventListener("DOMContentLoaded", async () => {
    await displayFixedSections();
    await loadSearchSongs();
    changeVolume(100);
    enableBackgroundPlayback();

    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/scripts/service-worker.js").catch(() => {});
    }

    if (playPauseBtn) playPauseBtn.addEventListener("click", togglePlay);
    if (seekBar) seekBar.addEventListener("input", () => seekSong(seekBar.value));
    if (nextBtn) nextBtn.addEventListener("click", nextSong);
    if (prevBtn) prevBtn.addEventListener("click", previousSong);
    if (repeatBtn) repeatBtn.addEventListener("click", toggleRepeat);

    updatePlayPauseButton();
    updateSeekBar();
});

function nextSong() {
    if (currentPlaylist.length === 0) {
        return;
    }

    currentSongIndex = (currentSongIndex + 1) % currentPlaylist.length;
    playSong(currentPlaylist[currentSongIndex].title, currentContext);
}

function previousSong() {
    if (currentPlaylist.length === 0) {
        return;
    }

    currentSongIndex = (currentSongIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
    playSong(currentPlaylist[currentSongIndex].title, currentContext);
}

function toggleRepeat() {
    repeatMode = (repeatMode + 1) % 3;
    if (repeatBtn) {
        repeatBtn.textContent = ["⏹️", "♾️", "➊"][repeatMode];
        repeatBtn.style.color = ["#fff", "#0f0", "#00f"][repeatMode];
    }
}

function truncateTitle(title) {
    const isAndroid = /Android/i.test(navigator.userAgent);
    if (isAndroid) {
        const words = title.split(" ");
        if (words.length > 3) {
            return words.slice(0, 3).join(" ") + "...";
        } else if (title.length > 20) {
            return title.substring(0, 17) + "...";
        }
    }
    return title;
}

function updatePlayerUI(song) {
    document.getElementById("player-thumbnail").src = song.thumbnail;
    document.getElementById("player-title").textContent = truncateTitle(song.title);
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
                    updatePlayPauseButton();
                    requestWakeLock();
                    if ("mediaSession" in navigator) {
                        navigator.mediaSession.playbackState = "playing";
                    }
                })
                .catch(() => {
                    updatePlayPauseButton();
                });
        }
    } else {
        manualPause = true;
        audioPlayer.pause();
        updatePlayPauseButton();
        if ("mediaSession" in navigator) {
            navigator.mediaSession.playbackState = "paused";
        }
    }
}

document.querySelectorAll(".scroll-container").forEach(container => {
    const items = container.querySelectorAll(".song-item").length;
    const itemWidth = 10;
    const containerWidth = container.offsetWidth / 16;
    const totalContentWidth = items * itemWidth;
    const extraPadding = Math.max(20, (totalContentWidth - containerWidth + itemWidth) * 1.2);
    container.style.setProperty("--buffer-width", `${extraPadding}rem`);
});

function updatePlayPauseButton() {
    if (playPauseBtn) {
        playPauseBtn.textContent = audioPlayer.paused ? "▶️" : "⏸️";
    }
}

function updateSeekBar() {
    if (seekBar && isFinite(audioPlayer.duration)) {
        seekBar.value = (audioPlayer.currentTime / audioPlayer.duration) * 100 || 0;
    } else if (seekBar) {
        seekBar.value = 0;
    }
}

function seekSong(value) {
    if (isFinite(audioPlayer.duration)) {
        audioPlayer.currentTime = (value / 100) * audioPlayer.duration;
    }
}

function changeVolume(value) {
    audioPlayer.volume = value / 100;
    document.getElementById("volume-percentage").textContent = `${value}%`;
}

function showSongMenu(event, songId) {
    // Validate the event and target
    if (!event || !event.target || typeof event.target.getBoundingClientRect !== 'function') {
        console.error('Invalid event or target in showSongMenu:', event);
        return;
    }

    // Remove existing context menus
    document.querySelectorAll(".song-context-menu").forEach(menu => menu.remove());

    const contextMenu = document.createElement("div");
    contextMenu.className = "song-context-menu";

    // Get the bounding rectangle of the clicked button
    let rect;
    try {
        rect = event.target.getBoundingClientRect();
    } catch (error) {
        console.error('Error getting bounding client rect:', error);
        // Fallback position
        rect = { top: 0, left: 0, bottom: 0 };
    }

    contextMenu.style.position = "fixed";
    contextMenu.style.top = `${rect.bottom + 5}px`;
    contextMenu.style.left = `${rect.left}px`;

    contextMenu.innerHTML = `
        <button class="menu-option share-btn">Share</button>
    `;

    const shareBtn = contextMenu.querySelector(".share-btn");
    shareBtn.addEventListener("click", () => {
        generateShareLink(songId);
        contextMenu.remove();
    });

    document.body.appendChild(contextMenu);

    // Close menu when clicking outside
    document.addEventListener("click", function closeMenu(e) {
        if (!contextMenu.contains(e.target) && e.target !== event.target) {
            contextMenu.remove();
            document.removeEventListener("click", closeMenu);
        }
    }, { once: true });
}

function generateShareLink(songId) {
    const song = getSongData(songId);
    if (!song) {
        showPopup("Error: Song data not found.");
        return;
    }

    // Use the song's direct audio file URL
    const shareUrl = song.link;

    // Copy the URL to the clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
        showPopup("Song link copied to clipboard!");
    }).catch((error) => {
        console.error("Failed to copy song link:", error);
        showPopup("Failed to copy song link.");
    });
}

function getSongData(songId) {
    return window.songData ? window.songData[songId] : null;
}

function showPopup(message) {
    const popup = document.getElementById("popup-notification");
    if (popup) {
        popup.textContent = message;
        popup.classList.add("show");
        setTimeout(() => popup.classList.remove("show"), 3000);
    } else {
        console.log("Popup:", message);
    }
}