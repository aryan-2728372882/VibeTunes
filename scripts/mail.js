function handleFormSubmission(event) {
    event.preventDefault(); // Prevent default form submission

    const form = document.getElementById("contact-form");
    const formData = new FormData(form);

    fetch(form.action, {
        method: "POST",
        body: formData,
        headers: {
            "Accept": "application/json"
        }
    }).then(response => {
        if (response.ok) {
            showPopup("Mail Sent Successfully!");
            setTimeout(() => {
                window.location.href = "index.html"; // Redirect after 3 seconds
            }, 3000);
        } else {
            showPopup("Failed to send mail. Try again.");
        }
    }).catch(() => {
        showPopup("An error occurred. Please try again.");
    });
}

// Function to show a popup notification
function showPopup(message) {
    const popup = document.createElement("div");
    popup.classList.add("popup-notification");
    popup.textContent = message;
    document.body.appendChild(popup);

    setTimeout(() => {
        popup.remove();
    }, 3000);
}
