// DOM ready check
document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM fully loaded");
    initializeFilters();

    // Mobile menu toggle
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', function () {
            document.querySelector('.nav-list')?.classList.toggle('active');
        });
    }

    // Dropdown toggle for mobile navigation
    document.querySelectorAll('.with-dropdown > a').forEach(item => {
        item.addEventListener('click', function (e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                e.stopPropagation(); // Prevents interference with other clicks;
                this.nextElementSibling?.classList.toggle('active');
            }
        });
    });

    // Scholarship mobile toggle
    const scholarshipToggle = document.querySelector('.mobile-scholarship-toggle');
    if (scholarshipToggle) {
        scholarshipToggle.addEventListener('click', function () {
            this.classList.toggle('active');
        });
    }
});

function openModal(name, school, major, degree = '', email = '', job = '', linkedin = '', imageSrc) {
    const existingModal = document.getElementById("profileModal");
    if (existingModal) existingModal.remove();

    const modal = document.createElement("div");
    modal.className = "modal";
    modal.id = "profileModal";
    modal.innerHTML = `
        <span class="close" onclick="document.getElementById('profileModal').remove()">×</span>
        <div class="modal-content">
            <img src="${imageSrc}" alt="${name}">
            <h2>${name}</h2>
            <p><strong>University:</strong> ${school}</p>
            <p><strong>Major:</strong> ${major}</p>
            ${degree ? `<p><strong>Highest Degree:</strong> ${degree}</p>` : ''}
            ${linkedin ? `<p><strong>LinkedIn:</strong> <a href="${linkedin}" target="_blank" class="linkedin-link">View Profile</a></p>` : ''}
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = "flex";
}

// Automatically extract all emails from your grid items
function getAllRecipientEmails() {
    const items = document.querySelectorAll(".grid-item");
    const emails = new Set();

    items.forEach(item => {
        const onclickValue = item.getAttribute("onclick");

        if (onclickValue) {
            // Extract all arguments of openModal(...) safely
            const args = onclickValue
                .match(/openModal\((.*)\)/)[1]        // get inside parentheses
                .split(/,(?=(?:[^']*'[^']*')*[^']*$)/) // split respecting quotes
                .map(a => a.trim().replace(/^'|'$/g, "")); // clean quotes

            const email = args[4]; // email is argument #4
            if (email) emails.add(email.toLowerCase());
        }
    });

    return Array.from(emails);
}


function checkLogin() {
    const validEmails = getAllRecipientEmails(); // auto-generated list

    const correctPassword = "ILLCFscholarsPortal";
    const email = document.getElementById("emailInput").value.trim().toLowerCase();
    const password = document.getElementById("passwordInput").value;
    const screen = document.getElementById("passwordScreen");
    const content = document.getElementById("content");
    const error = document.getElementById("errorMessage");

    if (!validEmails.includes(email)) {
        error.textContent = "Invalid email. Please use a registered email address.";
        return;
    }

    if (password !== correctPassword) {
        error.textContent = "Incorrect password. Please try again.";
        return;
    }

    // Success
    screen.style.display = "none";
    content.style.display = "block";
}



// Filters: setup and populate
function initializeFilters() {
    console.log("Initializing filters...");
    const members = document.querySelectorAll('.grid-item');
    const universities = new Set();
    const majors = new Set();
    const years = new Set();
    const degrees = new Set();

    members.forEach(member => {
        const section = member.closest('div[class^="members-row"]')?.previousElementSibling;
        if (section && section.tagName === 'H2') {
            years.add(section.textContent.replace(' Scholarship Recipients', '').trim());
        }

        const onclickText = member.getAttribute('onclick');
        if (onclickText) {
            const parts = onclickText.split("'");
            if (parts.length >= 8) { // assumes degree is the 8th part
                universities.add(parts[3].trim());
                majors.add(parts[5].trim());
                degrees.add(parts[7].trim()); // <- degree value
            }
        }
    });

    populateSelect('universityFilter', universities);
    populateSelect('majorFilter', majors);
    populateSelect('yearFilter', years);}

// Helper: populate a filter dropdown
function populateSelect(id, valuesSet) {
    const select = document.getElementById(id);
    if (!select) return;
    Array.from(valuesSet).sort().forEach(value => {
        if (value) {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        }
    });
}

// Filter members based on dropdowns
function filterMembers() {
    const universityValue = document.getElementById('universityFilter')?.value.toLowerCase();
    const majorValue = document.getElementById('majorFilter')?.value.toLowerCase();
    const yearValue = document.getElementById('yearFilter')?.value.toLowerCase();
    const degreeValue = document.getElementById('degreeFilter')?.value.toLowerCase(); // <- new

    const members = document.querySelectorAll('.grid-item');
    let anyVisible = false;

    members.forEach(member => {
        const onclickText = member.getAttribute('onclick');
        let matchesUniversity = true;
        let matchesMajor = true;
        let matchesYear = true;
        let matchesDegree = true;

        if (onclickText) {
            const parts = onclickText.split("'");
            if (parts.length >= 8) {
                const memberUniversity = parts[3].toLowerCase();
                const memberMajor = parts[5].toLowerCase();
                const memberDegree = parts[7].toLowerCase();

                if (universityValue && !memberUniversity.includes(universityValue)) {
                    matchesUniversity = false;
                }
                if (majorValue && !memberMajor.includes(majorValue)) {
                    matchesMajor = false;
                }
                if (degreeValue && !memberDegree.includes(degreeValue)) {
                    matchesDegree = false;
                }
            }
        }

        if (yearValue) {
            const section = member.closest('div[class^="members-row"]')?.previousElementSibling;
            const memberYear = section?.textContent.replace(' Scholarship Recipients', '').trim().toLowerCase();
            if (!memberYear || !memberYear.includes(yearValue)) {
                matchesYear = false;
            }
        }

        if (matchesUniversity && matchesMajor && matchesYear && matchesDegree) {
            member.style.display = 'block';
            anyVisible = true;
        } else {
            member.style.display = 'none';
        }
    });

    const noResults = document.getElementById('noResults');
    if (noResults) {
        noResults.style.display = anyVisible ? 'none' : 'block';
    }
}

// Reset filters
function resetFilters() {
    ['universityFilter', 'majorFilter', 'yearFilter', 'degreeFilter'].forEach(id => {
        const select = document.getElementById(id);
        if (select) select.value = '';
    });
    filterMembers();
}
