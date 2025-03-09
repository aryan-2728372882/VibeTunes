function handleFormSubmission(event) {
    event.preventDefault(); // Prevent default form submission

    const form = document.getElementById("contact-form");
    const formData = new FormData(form);

    fetch("https://formspree.io/mvgzeoow", {
        method: "POST",
        body: formData,
        headers: {
            "Accept": "application/json"
        }
    }).then(response => {
        if (response.ok) {
            showPopup("Mail Sent Successfully!", () => {
                window.location.href = "index.html"; // Redirect immediately after popup
            });
            form.reset(); // Reset form fields after submission
        } else {
            showPopup("Failed to send mail. Try again.");
        }
    }).catch(() => {
        showPopup("An error occurred. Please try again.");
    });
}

// Function to show a popup notification
function showPopup(message, callback = null) {
    const popup = document.createElement("div");
    popup.classList.add("popup-notification");
    popup.textContent = message;
    document.body.appendChild(popup);

    // Remove popup after 1.5 seconds and redirect immediately
    setTimeout(() => {
        popup.classList.add("fade-out");
        setTimeout(() => {
            popup.remove();
            if (callback) callback();
        }, 300); // Shorter fade-out animation (0.3s)
    }, 1200); // Popup stays visible for only 1.2s
}
