const tabs = [...document.querySelectorAll('.tabs [role="tab"]')];

function select(tab) {
    tabs.forEach((t) => {
        const active = t === tab;
        t.setAttribute("aria-selected", active);
        t.tabIndex = active ? 0 : -1;
        document.getElementById(t.getAttribute("aria-controls")).hidden = !active;
    });
}

tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => select(tab));
    tab.addEventListener("keydown", (e) => {
        const dir = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
        if (!dir) return;
        const next = tabs[(i + dir + tabs.length) % tabs.length];
        next.focus();
        select(next);
    });
});

select(tabs[0]);

const hash = location.hash.slice(1);
const match = tabs.find((t) => t.id === `tab-${hash}`);
if (match) select(match);