(function() {
    "use strict";
    const btns    = document.querySelectorAll(".category-btn");
    const sections = document.querySelectorAll(".category-section");

    function activate_category(cat) {
        const btn = document.querySelector(`.category-btn[data-cat="${cat}"]`);
        if (!btn) return false;

        btns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        sections.forEach(s => {
            s.classList.toggle("active", s.id === cat);
        });

        return true;
    }
    window.addEventListener("hashchange", () => {
        const hash = window.location.hash.slice(1);
        if (hash && !activate_category(hash)) {
            activate_category("main");
        } else if (!hash) {
            // No hash, default to main
            activate_category("main");
        }
    });

    window.dispatchEvent(new Event("hashchange"));

    btns.forEach(btn => {
        btn.addEventListener("click", () => {
            window.location.hash = btn.dataset.cat;
        });
    });

    const copy_blocks = document.querySelectorAll(".copyable-block");
    copy_blocks.forEach(block => {
        const original_text = block.innerText.trim();
        block.dataset.original_text = original_text;

        let timeout_id = null;

        block.addEventListener("click", (e) => {
            e.stopPropagation();
            const textToCopy = block.dataset.copy || original_text;

            if (timeout_id) {
                clearTimeout(timeout_id);
                timeout_id = null;
            }

            block.classList.add("copy-flash");
            block.innerText = "copied!";

            navigator.clipboard.writeText(textToCopy).catch(() => {
                const textarea = document.createElement("textarea");
                textarea.value = textToCopy;
                document.body.appendChild(textarea);
                textarea.select();
                try { document.execCommand("copy"); } catch (e) {}
                document.body.removeChild(textarea);
            });

            timeout_id = setTimeout(() => {
                block.classList.remove("copy-flash");
                block.innerText = block.dataset.original_text;
                timeout_id = null;
            }, 800);
        });
    });
})();