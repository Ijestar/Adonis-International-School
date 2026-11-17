const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = async function contact(request, response) {
    if (request.method !== "POST") {
        response.setHeader("Allow", "POST");
        return response.status(405).json({ message: "Method not allowed." });
    }

    const { name, email, message } = request.body || {};
    const submission = {
        name: typeof name === "string" ? name.trim() : "",
        email: typeof email === "string" ? email.trim() : "",
        message: typeof message === "string" ? message.trim() : ""
    };

    if (
        !submission.name || submission.name.length > 100 ||
        !EMAIL_PATTERN.test(submission.email) || submission.email.length > 254 ||
        !submission.message || submission.message.length > 5000
    ) {
        return response.status(400).json({ message: "Enter a valid name, email address, and message." });
    }

    const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
    const sharedSecret = process.env.CONTACT_FORM_SECRET;

    if (!appsScriptUrl || !sharedSecret || sharedSecret.length < 32) {
        return response.status(503).json({ message: "The contact form is not configured yet." });
    }

    try {
        const upstreamResponse = await fetch(appsScriptUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...submission, secret: sharedSecret })
        });
        const result = await upstreamResponse.json();

        if (!upstreamResponse.ok || result.success !== true) {
            console.error("Contact form Apps Script request failed.");
            return response.status(502).json({ message: "We could not send your message. Please try again later." });
        }

        return response.status(200).json({ message: "Thanks. Your message has been sent." });
    } catch (error) {
        console.error("Contact form forwarding failed:", error.message);
        return response.status(502).json({ message: "We could not send your message. Please try again later." });
    }
};