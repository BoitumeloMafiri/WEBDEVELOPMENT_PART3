/* ==========================================================================
   Maintenance Essentials
   Main JavaScript (js/script.js)
   WEDE5020 Part 3 (Final POE) 
   Boitumelo Mafiri 
   ST10106738 

   This one file adds all the interactive behaviour to the website. It is
   linked at the bottom of every page so the HTML loads first.

   CONTENTS
   1. Footer year        - fills in the current year automatically
   2. Mobile menu        - opens and closes navigation on small screens
   3. Accordion          - opens and closes the FAQ answers
   4. Gallery lightbox   - opens images in a larger overlay view
   5. Provider search    - filters providers as the visitor types
   6. Helper functions   - shared validation checks
   7. Enquiry form       - validates input and returns a price quote
   8. Provider form      - validates the "get listed" application
   9. Contact form       - validates input and compiles an email
   10. Interactive map    - switches the map between the two branches
   ========================================================================== */

/* Everything runs once the page has fully loaded. Without this, the script
   could look for elements that do not exist yet and fail. */
document.addEventListener("DOMContentLoaded", function () {

    /* ===== 1. FOOTER YEAR ==============================================
       Rather than typing the year by hand and updating it every January,
       JavaScript reads the current year from the visitor's computer. */

    var yearSpan = document.getElementById("year");
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    /* ===== 2. MOBILE NAVIGATION MENU ===================================
       On small screens the five links hide behind a Menu button. Clicking
       it adds the "open" class, which CSS uses to show the links. */

    var menuToggle = document.getElementById("menu-toggle");
    var navLinks = document.getElementById("nav-links");

    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", function () {
            navLinks.classList.toggle("open");
            var isOpen = navLinks.classList.contains("open");
            // aria-expanded tells screen readers whether the menu is open
            menuToggle.setAttribute("aria-expanded", isOpen);
        });
    }

    /* ===== 3. ACCORDION (FAQ) ==========================================
       Each question is a button. Clicking it opens the answer panel below
       and closes any other panel that is already open. */

    var accordionTriggers = document.querySelectorAll(".accordion-trigger");

    accordionTriggers.forEach(function (trigger) {
        trigger.addEventListener("click", function () {
            var panel = trigger.nextElementSibling;
            var alreadyOpen = panel.classList.contains("open");

            // Close every panel first so only one is open at a time
            document.querySelectorAll(".accordion-panel").forEach(function (p) {
                p.classList.remove("open");
            });
            accordionTriggers.forEach(function (t) {
                t.classList.remove("active");
                t.setAttribute("aria-expanded", "false");
            });

            // If the clicked panel was closed, open it
            if (!alreadyOpen) {
                panel.classList.add("open");
                trigger.classList.add("active");
                trigger.setAttribute("aria-expanded", "true");
            }
        });
    });

    /* ===== 4. GALLERY LIGHTBOX =========================================
       Clicking any gallery image copies its source and alt text into a
       full-screen overlay so the work can be seen in detail. */

    var lightbox = document.getElementById("lightbox");
    var lightboxImage = document.getElementById("lightbox-image");
    var lightboxCaption = document.getElementById("lightbox-caption");
    var lightboxClose = document.getElementById("lightbox-close");
    var galleryItems = document.querySelectorAll(".gallery-item");

    if (lightbox && lightboxImage) {

        galleryItems.forEach(function (item) {
            item.addEventListener("click", function () {
                lightboxImage.src = item.src;
                lightboxImage.alt = item.alt;
                if (lightboxCaption) {
                    lightboxCaption.textContent = item.alt;
                }
                lightbox.classList.add("open");
                // Stops the page behind the overlay from scrolling
                document.body.style.overflow = "hidden";
            });
        });

        // One function so all three ways of closing share the same code
        function closeLightbox() {
            lightbox.classList.remove("open");
            document.body.style.overflow = "";
        }

        if (lightboxClose) {
            lightboxClose.addEventListener("click", closeLightbox);
        }

        // Close by clicking the dark background, but not the image itself
        lightbox.addEventListener("click", function (event) {
            if (event.target === lightbox) {
                closeLightbox();
            }
        });

        // Close by pressing the Escape key
        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                closeLightbox();
            }
        });
    }

    /* ===== 5. PROVIDER SEARCH AND FILTER (dynamic content) =============
       The search box and filter buttons work together. Every time the
       visitor types or clicks, this checks each provider card and hides
       the ones that do not match, without reloading the page. */

    var searchInput = document.getElementById("provider-search");
    var filterButtons = document.querySelectorAll(".filter-btn");
    var providerCards = document.querySelectorAll(".provider-card");
    var searchStatus = document.getElementById("search-status");

    // Remembers which filter button is currently selected
    var activeCategory = "all";

    function filterProviders() {
        // toLowerCase means searching "NAILS" still finds "nails"
        var searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : "";
        var visibleCount = 0;

        providerCards.forEach(function (card) {
            var cardText = card.textContent.toLowerCase();
            var cardCategory = card.getAttribute("data-category");

            // A card must match BOTH the search text and the chosen category
            var matchesSearch = (searchTerm === "") || (cardText.indexOf(searchTerm) !== -1);
            var matchesCategory = (activeCategory === "all") || (cardCategory === activeCategory);

            if (matchesSearch && matchesCategory) {
                card.style.display = "";
                visibleCount = visibleCount + 1;
            } else {
                card.style.display = "none";
            }
        });

        // Tell the visitor how many providers matched
        if (searchStatus) {
            if (visibleCount === 0) {
                searchStatus.textContent = "No providers match your search. Try a different word.";
            } else if (visibleCount === 1) {
                searchStatus.textContent = "Showing 1 provider.";
            } else {
                searchStatus.textContent = "Showing " + visibleCount + " providers.";
            }
        }
    }

    if (searchInput) {
        // "input" fires on every keystroke, so results update as you type
        searchInput.addEventListener("input", filterProviders);
    }

    filterButtons.forEach(function (btn) {
        btn.addEventListener("click", function () {
            filterButtons.forEach(function (b) {
                b.classList.remove("active");
            });
            btn.classList.add("active");
            activeCategory = btn.getAttribute("data-filter");
            filterProviders();
        });
    });

    // Show the starting count when the page first loads
    if (providerCards.length > 0) {
        filterProviders();
    }

    /* ===== 6. HELPER FUNCTIONS used by all three forms ================= */

    // Shows a red error message under one field
    function showError(fieldId, message) {
        var errorElement = document.getElementById(fieldId + "-error");
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    // Clears all error messages inside one form before checking again
    function clearErrors(form) {
        form.querySelectorAll(".error").forEach(function (el) {
            el.textContent = "";
        });
    }

    // Checks an email looks like name@domain.com
    function isValidEmail(value) {
        var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        return emailPattern.test(value);
    }

    // Checks a South African phone number is 10 digits
    function isValidPhone(value) {
        var phonePattern = /^[0-9]{10}$/;
        return phonePattern.test(value.replace(/\s/g, ""));
    }

    /* ===== 7. ENQUIRY FORM =============================================
       Validates every field. If all is correct it works out an estimated
       price for the chosen service and the next Maintenance Week date. */

    var enquiryForm = document.getElementById("enquiry-form");

    if (enquiryForm) {

        // Price list used to calculate the quote
        var servicePrices = {
            "gel-nails":      { name: "Gel overlay", price: 250, wait: "45 minutes", provider: "Glossed & Co Nails, Braamfontein" },
            "acrylic-nails":  { name: "Acrylic set", price: 350, wait: "60 minutes", provider: "Glossed & Co Nails, Braamfontein" },
            "wig-install":    { name: "Wig installation", price: 400, wait: "90 minutes", provider: "Crown Culture Hair, Sandton" },
            "braids":         { name: "Knotless braids", price: 550, wait: "3 hours", provider: "Crown Culture Hair, Sandton" },
            "classic-lashes": { name: "Classic lash set", price: 300, wait: "60 minutes", provider: "Lash Lounge JHB, Maboneng" },
            "volume-lashes":  { name: "Volume lash set", price: 450, wait: "90 minutes", provider: "Lash Lounge JHB, Maboneng" }
        };

        enquiryForm.addEventListener("submit", function (event) {
            // Stops the browser reloading so we can handle it ourselves
            event.preventDefault();
            clearErrors(enquiryForm);

            var status = document.getElementById("enquiry-status");
            var valid = true;

            var name = document.getElementById("name").value.trim();
            var surname = document.getElementById("surname").value.trim();
            var email = document.getElementById("email").value.trim();
            var phone = document.getElementById("phone").value.trim();
            var service = document.getElementById("service").value;
            var date = document.getElementById("date").value;

            if (name.length < 2) {
                showError("name", "Please enter your first name (at least 2 letters).");
                valid = false;
            }
            if (surname.length < 2) {
                showError("surname", "Please enter your surname (at least 2 letters).");
                valid = false;
            }
            if (!isValidEmail(email)) {
                showError("email", "Please enter a valid email address, for example you@example.com");
                valid = false;
            }
            if (!isValidPhone(phone)) {
                showError("phone", "Please enter a 10-digit phone number, for example 0721234567.");
                valid = false;
            }
            if (service === "") {
                showError("service", "Please choose the service you need.");
                valid = false;
            }
            if (date === "") {
                showError("date", "Please choose your preferred date.");
                valid = false;
            } else {
                // Check the chosen date is not in the past
                var chosen = new Date(date);
                var today = new Date();
                today.setHours(0, 0, 0, 0);
                if (chosen < today) {
                    showError("date", "Please choose today or a future date.");
                    valid = false;
                }
            }

            if (!valid) {
                status.className = "form-status error-status";
                status.textContent = "Please correct the errors above and try again.";
                return;
            }

            /* Input is valid, so process it and give a real response. The
               brief asks the enquiry form to return cost or availability. */
            var chosenService = servicePrices[service];

            // Work out the first day of next month = Maintenance Week
            var nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            nextMonth.setDate(1);
            var nextWeek = nextMonth.toLocaleDateString("en-ZA", {
                day: "numeric", month: "long", year: "numeric"
            });

            // A booking fee is added so the quote shows a calculation
            var bookingFee = 25;
            var total = chosenService.price + bookingFee;

            status.className = "form-status success-status";
            status.innerHTML =
                "<strong>Thank you, " + name + "! Here is your estimate.</strong>" +
                "<ul>" +
                "<li><strong>Service:</strong> " + chosenService.name + "</li>" +
                "<li><strong>Provider:</strong> " + chosenService.provider + "</li>" +
                "<li><strong>From:</strong> R" + chosenService.price + " + R" + bookingFee +
                    " booking fee = <strong>R" + total + "</strong></li>" +
                "<li><strong>Estimated time in salon:</strong> " + chosenService.wait + "</li>" +
                "<li><strong>Next Maintenance Week starts:</strong> " + nextWeek + "</li>" +
                "</ul>" +
                "<p>A confirmation will be sent to " + email +
                " and we will call you on " + phone + " to confirm your slot.</p>";

            enquiryForm.reset();
        });

        // Clear a field's error as soon as the visitor starts fixing it
        enquiryForm.querySelectorAll("input, select, textarea").forEach(function (field) {
            field.addEventListener("input", function () {
                showError(field.id, "");
            });
        });
    }

    /* ===== 8. PROVIDER "GET LISTED" FORM =============================== */

    var providerForm = document.getElementById("provider-form");

    if (providerForm) {
        providerForm.addEventListener("submit", function (event) {
            event.preventDefault();
            clearErrors(providerForm);

            var status = document.getElementById("provider-status");
            var valid = true;

            var business = document.getElementById("business").value.trim();
            var pEmail = document.getElementById("provider-email").value.trim();
            var offer = document.getElementById("offer").value.trim();

            if (business.length < 2) {
                showError("business", "Please enter your business name.");
                valid = false;
            }
            if (!isValidEmail(pEmail)) {
                showError("provider-email", "Please enter a valid email address.");
                valid = false;
            }
            if (offer.length < 3) {
                showError("offer", "Please tell us which services you offer.");
                valid = false;
            }

            if (!valid) {
                status.className = "form-status error-status";
                status.textContent = "Please correct the errors above and try again.";
                return;
            }

            status.className = "form-status success-status";
            status.innerHTML =
                "<strong>Thank you, " + business + "!</strong>" +
                "<p>Your listing request has been received. Our team will review your work and contact you on " +
                pEmail + " within 3 working days to complete your vetting.</p>";

            providerForm.reset();
        });

        providerForm.querySelectorAll("input").forEach(function (field) {
            field.addEventListener("input", function () {
                showError(field.id, "");
            });
        });
    }

    /* ===== 9. CONTACT FORM =============================================
       Validates the input, then builds an email from it and opens the
       visitor's email program with everything filled in, ready to send. */

    var contactForm = document.getElementById("contact-form");

    if (contactForm) {
        contactForm.addEventListener("submit", function (event) {
            event.preventDefault();
            clearErrors(contactForm);

            var status = document.getElementById("contact-status");
            var valid = true;

            var cName = document.getElementById("c-name").value.trim();
            var cEmail = document.getElementById("c-email").value.trim();
            var cPhone = document.getElementById("c-phone").value.trim();
            var cType = document.getElementById("c-type").value;
            var cMessage = document.getElementById("c-message").value.trim();

            if (cName.length < 2) {
                showError("c-name", "Please enter your full name.");
                valid = false;
            }
            if (!isValidEmail(cEmail)) {
                showError("c-email", "Please enter a valid email address.");
                valid = false;
            }
            // Phone is optional, so only check it if something was typed
            if (cPhone !== "" && !isValidPhone(cPhone)) {
                showError("c-phone", "Please enter a 10-digit phone number, or leave this blank.");
                valid = false;
            }
            if (cType === "") {
                showError("c-type", "Please choose the type of message.");
                valid = false;
            }
            if (cMessage.length < 10) {
                showError("c-message", "Please write a message of at least 10 characters.");
                valid = false;
            }

            if (!valid) {
                status.className = "form-status error-status";
                status.textContent = "Please correct the errors above and try again.";
                return;
            }

            /* Build the email. encodeURIComponent turns spaces and symbols
               into a format that is safe inside a web address. */
            var recipient = "hello@maintenanceessentials.co.za";
            var subject = encodeURIComponent(cType + " from " + cName);
            var body = encodeURIComponent(
                "Name: " + cName + "\n" +
                "Email: " + cEmail + "\n" +
                "Phone: " + (cPhone === "" ? "Not provided" : cPhone) + "\n" +
                "Message type: " + cType + "\n\n" +
                "Message:\n" + cMessage
            );

            // mailto: opens the visitor's own email program
            window.location.href = "mailto:" + recipient + "?subject=" + subject + "&body=" + body;

            status.className = "form-status success-status";
            status.innerHTML =
                "<strong>Thank you, " + cName + "!</strong>" +
                "<p>Your email program should now open with your message ready to send to " +
                recipient + ". If it does not open, please email us directly.</p>";

            contactForm.reset();
        });

        contactForm.querySelectorAll("input, select, textarea").forEach(function (field) {
            field.addEventListener("input", function () {
                showError(field.id, "");
            });
        });
    }

    /* ===== 10. INTERACTIVE MAP BUTTONS =================================
       Clicking a branch button changes the map to show that location. */

    var mapButtons = document.querySelectorAll(".map-btn");
    var locationMap = document.getElementById("location-map");
    var mapNote = document.getElementById("map-note");

    // The map address for each branch
    var mapLocations = {
        braamfontein: {
            query: "78+Juta+Street,+Braamfontein,+Johannesburg",
            label: "Braamfontein branch"
        },
        sandton: {
            query: "15+Rivonia+Road,+Sandton,+Johannesburg",
            label: "Sandton branch"
        }
    };

    mapButtons.forEach(function (btn) {
        btn.addEventListener("click", function () {
            var key = btn.getAttribute("data-location");
            var location = mapLocations[key];

            if (location && locationMap) {
                // Swapping the src makes the map jump to the new address
                locationMap.src = "https://www.google.com/maps?q=" + location.query + "&output=embed";
                locationMap.title = "Map showing the Maintenance Essentials " + location.label;

                if (mapNote) {
                    mapNote.textContent = "Currently showing: " + location.label;
                }

                mapButtons.forEach(function (b) {
                    b.classList.remove("active");
                });
                btn.classList.add("active");
            }
        });
    });

});
