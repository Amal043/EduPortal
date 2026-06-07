const states = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry"
];

document.addEventListener("DOMContentLoaded", () => {
    populateStates();
    initTheme();
    setupThemeToggle();
    setupStateSelection();
    setFooterYear();
});

function populateStates() {
    const select = document.getElementById("stateSelect");
    if (!select) return;

    select.innerHTML = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select State";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    select.appendChild(defaultOption);

    states.forEach((state) => {
        const option = document.createElement("option");
        option.value = state;
        option.textContent = state;
        select.appendChild(option);
    });

    const savedState = localStorage.getItem("selectedState");
    if (savedState) {
        select.value = savedState;
        updateStateMessage(savedState);
    } else {
        updateStateMessage("");
    }
}

function initTheme() {
    const savedTheme = localStorage.getItem("theme") || "light";
    if (savedTheme === "dark") {
        document.body.classList.add("dark-theme");
    }
}

function setupThemeToggle() {
    const toggle = document.getElementById("themeToggle");
    if (!toggle) return;

    toggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-theme");
        const currentTheme = document.body.classList.contains("dark-theme") ? "dark" : "light";
        localStorage.setItem("theme", currentTheme);
        toggle.textContent = currentTheme === "dark" ? "Light Mode" : "Dark Mode";
    });

    const initialTheme = document.body.classList.contains("dark-theme") ? "dark" : "light";
    toggle.textContent = initialTheme === "dark" ? "Light Mode" : "Dark Mode";
}

function setupStateSelection() {
    const select = document.getElementById("stateSelect");
    if (!select) return;

    select.addEventListener("change", (event) => {
        const selectedState = event.target.value;
        localStorage.setItem("selectedState", selectedState);
        updateStateMessage(selectedState);
    });
}

function updateStateMessage(state) {
    const messageEl = document.getElementById("stateMessage");
    if (!messageEl) return;

    if (state) {
        messageEl.textContent = `Showing opportunities curated for ${state}.`;
        messageEl.dataset.selected = "true";
    } else {
        messageEl.textContent = "Choose your state to personalize the experience.";
        messageEl.dataset.selected = "false";
    }
}

function setFooterYear() {
    const yearSpan = document.getElementById("year");
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}
