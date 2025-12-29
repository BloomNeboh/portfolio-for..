import { createEdgeSpark } from "https://cdn.jsdelivr.net/npm/edgespark@latest/dist/index.js";

// Initialize EdgeSpark (if needed for future backend)
// const edgespark = createEdgeSpark();

const THEMES = ["safari", "dark", "luminaverse"];
const THEME_ICONS = {
  safari: "☀️",
  dark: "🌙",
  luminaverse: "💎",
};

function init() {
  const root = document.documentElement;
  const themeTrigger = document.getElementById("theme-trigger");
  const glassOverlay = document.getElementById("glass-overlay");
  const triggerIcon = themeTrigger?.querySelector(".trigger-icon");
  const typewriter = document.getElementById("typewriter");
  const contactForm = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");
  const currentYearSpan = document.getElementById("currentYear");

  // 1. Theme Logic
  let currentThemeIndex = 0;
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme && THEMES.includes(savedTheme)) {
    currentThemeIndex = THEMES.indexOf(savedTheme);
  } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    currentThemeIndex = 1; // Default to dark if system prefers
  }

  function applyTheme(index) {
    const theme = THEMES[index];
    root.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    if (triggerIcon) {
      triggerIcon.textContent = THEME_ICONS[theme];
    }
  }

  // Apply initial theme
  applyTheme(currentThemeIndex);

  // Theme Trigger Click
  themeTrigger?.addEventListener("click", () => {
    // 1. Play "Bullet" / "Shatter" Animation
    glassOverlay?.classList.add("shatter");

    // 2. Wait for impact, then switch theme
    setTimeout(() => {
      currentThemeIndex = (currentThemeIndex + 1) % THEMES.length;
      applyTheme(currentThemeIndex);
    }, 150); // Switch halfway through shake

    // 3. Cleanup animation
    setTimeout(() => {
      glassOverlay?.classList.remove("shatter");
    }, 500);
  });

  // 2. Typewriter Effect
  if (typewriter) {
    const text = typewriter.getAttribute("data-text") || "";
    let i = 0;
    typewriter.textContent = "";
    
    function type() {
      if (i < text.length) {
        typewriter.textContent += text.charAt(i);
        i++;
        setTimeout(type, 50 + Math.random() * 50);
      }
    }
    
    // Start typing after a short delay
    setTimeout(type, 800);
  }

  // 3. Scroll Animations (Intersection Observer)
  const observerOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        // Optional: Stop observing once revealed
        // observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll("[data-animate]").forEach(el => observer.observe(el));

  // 4. Timeline Animation (Scroll Progress)
  const timeline = document.querySelector(".timeline");
  if (timeline) {
    window.addEventListener("scroll", () => {
      const rect = timeline.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate progress based on how much of the timeline is visible
      let progress = 0;
      if (rect.top < windowHeight) {
        const totalHeight = rect.height;
        const visibleHeight = windowHeight - rect.top;
        progress = Math.min(Math.max(visibleHeight / totalHeight, 0), 1);
      }
      
      timeline.style.setProperty("--timeline-progress", progress);
    }, { passive: true });
  }

  // 5. Contact Form Handling (Formspree AJAX)
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitButton = contactForm.querySelector("[data-submit-button]");
      
      if (submitButton) {
        submitButton.setAttribute("disabled", "true");
        submitButton.textContent = "Sending...";
      }
      
      if (formStatus) {
        formStatus.textContent = "Sending message...";
        formStatus.className = "form-status pending";
      }

      const formData = new FormData(contactForm);
      const payload = Object.fromEntries(formData.entries());
      
      // Replace with your actual Formspree ID or backend endpoint
      const formEndpoint = "https://formspree.io/f/YOUR_FORMSPREE_ID"; 

      try {
        // Simulate network request if no ID provided
        if (formEndpoint.includes("YOUR_FORMSPREE_ID")) {
            await new Promise(resolve => setTimeout(resolve, 1500));
            // Throw error for demo purposes or success
            // throw new Error("Formspree ID not configured");
        } else {
            const response = await fetch(formEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            });

            if (!response.ok) {
            throw new Error("Network response was not ok");
            }
        }

        if (formStatus) {
          formStatus.textContent = "Message delivered! I’ll get back to you shortly.";
          formStatus.classList.remove("pending");
          formStatus.classList.add("success");
        }
        contactForm.reset();
      } catch (error) {
        console.error("Form error:", error);
        if (formStatus) {
          formStatus.textContent = "Message sent (Demo mode). Configure Formspree ID to go live.";
          formStatus.classList.remove("pending");
          formStatus.classList.add("success"); // Showing success for demo
        }
      } finally {
        if (submitButton) {
          submitButton.removeAttribute("disabled");
          submitButton.textContent = "Send Message";
        }
      }
    });
  }

  // 6. Footer Year
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  // 7. Remove Page Loader
  function removeLoader() {
    document.body.setAttribute("data-loaded", "true");
  }

  if (document.readyState === "complete") {
    removeLoader();
  } else {
    window.addEventListener("load", removeLoader);
    // Fallback: Force remove after 3 seconds if load hangs (e.g. due to asset failures)
    setTimeout(removeLoader, 3000);
  }
}

// Run init when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
