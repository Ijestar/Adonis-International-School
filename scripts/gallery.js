const items = [...document.querySelectorAll(".galleryItem")];
const filters = document.querySelectorAll(".galleryFilters button");
const grid = document.querySelector(".galleryGrid");

const box = document.getElementById("lightbox");
const boxImg = box.querySelector("img");
const boxCap = box.querySelector("figcaption");

const carouselModal = document.getElementById("carouselModal");
const track = document.getElementById("carouselTrack");
const dots = document.getElementById("carouselDots");
const carTitle = document.getElementById("carouselTitle");
const carCap = document.getElementById("carouselCaption");

let current = 0;
let slide = 0;
let slides = [];

/* ---------- Edit this: more images per activity ---------- */
const photos = {
    sports: {
        title: "Sports",
        images: [
            { src: "/assets/Images/BlueHouse.png", alt: "Blue House", caption: "Green House" },
            { src: "/assets/Images/GreenHouse.png", alt: "Green House", caption: "Blue House" },
            { src: "/assets/Images/YellowHouse.png", alt: "Yellow House", caption: "Yellow House" },
            { src: "/assets/Images/RedHouse.png", alt: "Red House", caption: "Red House" },
            { src: "/assets/Images/PinkHouse.png", alt: "Pink House", caption: "Pink House" },
            { src: "/assets/Images/WhiteHouse.png", alt: "White House", caption: "White House" },
        ],
    },
    arts: {
        title: "Arts & Culture",
        images: [
            { src: "/assets/Images/activities/arts-1.jpeg", alt: "Cultural dance", caption: "Cultural Day" },
            { src: "/assets/Images/activities/arts-2.jpeg", alt: "Drama performance", caption: "Drama Night" },
        ],
    },
    clubs: {
        title: "Clubs",
        images: [
            { src: "/assets/Images/activities/clubs-1.jpeg", alt: "Science club", caption: "Science Club" },
            { src: "/assets/Images/activities/clubs-2.jpeg", alt: "Debate club", caption: "Debate Club" },
        ],
    },
    events: {
        title: "Events",
        images: [
            { src: "/assets/Images/students pic.jpeg", alt: "Graduation ceremony", caption: "Graduation Day" },
            // { src: "/assets/Images/activities/events-2.jpeg", alt: "Prize giving", caption: "Prize Giving Day" },
        ],
    },
};
/* --------------------------------------------------------- */

/* ---------- Filters -> grid or popup carousel ---------- */
function setActive(type) {
    filters.forEach((b) => b.classList.toggle("active", b.dataset.filter === type));
}

function openCarousel(type, updateHash = true) {
    buildCarousel(type);
    setActive(type);
    if (!carouselModal.open) carouselModal.showModal();
    if (updateHash) history.replaceState(null, "", "#" + type);
}

function closeCarousel() {
    if (carouselModal.open) carouselModal.close();
}

filters.forEach((btn) =>
    btn.addEventListener("click", () => {
        const type = btn.dataset.filter;
        if (type === "all" || !photos[type]) {
            closeCarousel();
            setActive("all");
            history.replaceState(null, "", location.pathname);
        } else {
            openCarousel(type);
        }
    })
);

// closing the popup (X, Esc, or clicking outside) returns to "All"
document.getElementById("carouselClose").addEventListener("click", closeCarousel);
carouselModal.addEventListener("click", (e) => { if (e.target === carouselModal) closeCarousel(); });
carouselModal.addEventListener("close", () => {
    setActive("all");
    history.replaceState(null, "", location.pathname);
});

/* ---------- Carousel ---------- */
function buildCarousel(type) {
    const { title, images } = photos[type];
    carTitle.textContent = title;
    track.innerHTML = "";
    dots.innerHTML = "";

    slides = images.map((img, i) => {
        const el = document.createElement("img");
        el.src = img.src;
        el.alt = img.alt;
        el.loading = i === 0 ? "eager" : "lazy";
        el.className = "carouselSlide";
        track.appendChild(el);

        const dot = document.createElement("button");
        dot.className = "carouselDot";
        dot.setAttribute("aria-label", `Go to image ${i + 1}`);
        dot.addEventListener("click", () => goTo(i));
        dots.appendChild(dot);
        return { el, dot, caption: img.caption };
    });

    goTo(0);
}

function goTo(i) {
    slide = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${slide * 100}%)`;
    slides.forEach((s, idx) => s.dot.classList.toggle("active", idx === slide));
    carCap.textContent = slides[slide].caption;
}

document.querySelector(".carouselPrev").addEventListener("click", () => goTo(slide - 1));
document.querySelector(".carouselNext").addEventListener("click", () => goTo(slide + 1));

carouselModal.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") goTo(slide - 1);
    if (e.key === "ArrowRight") goTo(slide + 1);
});

/* swipe on touch screens */
let startX = 0;
track.addEventListener("touchstart", (e) => (startX = e.touches[0].clientX), { passive: true });
track.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) goTo(slide + (dx < 0 ? 1 : -1));
});

/* ---------- Lightbox (grid view, unchanged) ---------- */
const visible = () => items.filter((item) => !item.hidden);

function show(index) {
    const list = visible();
    current = (index + list.length) % list.length;
    const img = list[current].querySelector("img");
    boxImg.src = img.currentSrc || img.src;
    boxImg.alt = img.alt;
    boxCap.textContent = list[current].querySelector("figcaption").firstChild.textContent.trim();
}

function open(item) {
    show(visible().indexOf(item));
    box.showModal();
}

items.forEach((item) => {
    item.addEventListener("click", () => open(item));
    item.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            open(item);
        }
    });
});

box.querySelector(".lightboxClose").addEventListener("click", () => box.close());
box.querySelector(".lightboxPrev").addEventListener("click", () => show(current - 1));
box.querySelector(".lightboxNext").addEventListener("click", () => show(current + 1));
box.addEventListener("click", (e) => { if (e.target === box) box.close(); });
box.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
});

/* ---------- Open the right popup from the URL hash ---------- */
function fromHash() {
    const type = location.hash.slice(1);
    if (photos[type]) openCarousel(type, false);
    else closeCarousel();
}
window.addEventListener("hashchange", fromHash);
fromHash();