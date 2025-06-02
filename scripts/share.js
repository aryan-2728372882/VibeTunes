(function () {
    // Generate a shareable URL for a song
    function generateShareLink(songId) {
        const song = getSongData(songId);
        if (!song) {
            showPopup("Error: Song data not found.");
            return;
        }

        const baseUrl = window.location.origin; // Dynamically get the current website's base URL
        const shareUrl = `${baseUrl}/?songId=${encodeURIComponent(songId)}`;

        navigator.clipboard.writeText(shareUrl).then(() => {
            showPopup("Song link copied to clipboard!");
        }).catch((error) => {
            console.error("Failed to copy song link:", error);
            showPopup("Failed to copy song link.");
        });
    }

    // Handle shared song from URL query parameter
    function handleSharedSong() {
        const urlParams = new URLSearchParams(window.location.search);
        const songId = urlParams.get("songId");
        if (!songId) return;

        const song = getSongData(songId);
        if (!song) {
            showPopup("Song not found.");
            return;
        }

        // Determine context based on songId prefix
        let context = "";
        if (songId.startsWith("bhojpuri-")) context = "bhojpuri";
        else if (songId.startsWith("phonk-")) context = "phonk";
        else if (songId.startsWith("haryanvi-")) context = "haryanvi";
        else if (songId.startsWith("json-bhojpuri-")) context = "json-bhojpuri";
        else if (songId.startsWith("json-phonk-")) context = "json-phonk";
        else if (songId.startsWith("json-haryanvi-")) context = "json-haryanvi";
        else if (songId.startsWith("json-remixes-")) context = "json-remixes";
        else if (songId.startsWith("search-")) context = "search";

        if (context) {
            try {
                debouncedPlaySong(song.title, context);
            } catch (error) {
                if (error.name === "NotAllowedError" || error.message.includes("play()")) {
                    showPopup(`Autoplay disabled for '${song.title}'. Please play manually.`, 8000);
                } else {
                    showPopup("Failed to play song.");
                }
            }
        } else {
            showPopup("Invalid song context.");
        }
    }

    // Helper function to get song data (assumes window.songData is available)
    function getSongData(songId) {
        return window.songData ? window.songData[songId] : null;
    }

    // Expose functions globally
    window.generateShareLink = generateShareLink;
    window.handleSharedSong = handleSharedSong;
})();