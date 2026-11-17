const form = document.querySelector("#contact-form");
const status = document.querySelector("#form-status");

if (form && status) {
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!form.reportValidity()) {
            return;
        }

        const submitButton = form.querySelector("[type=submit]");
        submitButton.disabled = true;
        status.dataset.state = "";
        status.textContent = "Sending your message...";

        try {
            const response = await fetch(form.action, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(Object.fromEntries(new FormData(form)))
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Your message could not be sent. Please try again.");
            }

            form.reset();
            status.dataset.state = "success";
            status.textContent = result.message;
        } catch (error) {
            status.dataset.state = "error";
            status.textContent = error.message || "Your message could not be sent. Please try again.";
        } finally {
            submitButton.disabled = false;
        }
    });
}