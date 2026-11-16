async function loadComponent(selector, file) {
    const element = document.querySelector(selector);

    if (!element) {
        console.error(`Element ${selector} not found`);
        return;
    }

    try {
        const response = await fetch(file);

        if (!response.ok) {
            throw new Error(
                `Failed to load ${file}: ${response.status} ${response.statusText}`
            );
        }

        const html = await response.text();

        element.innerHTML = html;

    } catch (error) {
        console.error("Component loading error:", error);
    }
}

loadComponent("#header", "/shared/header.html");

loadComponent("#footer", "/shared/footer.html");