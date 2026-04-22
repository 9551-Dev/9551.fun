(function() {
    "use strict";
    var jumpable_selector = ".jumpable";

    const btns       = document.querySelectorAll(".category-btn");
    const sections   = document.querySelectorAll(".category-section");
    var descriptions = document.querySelectorAll(".card-description");

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

    function scrollToElement(id) {
        const el = document.getElementById(id);
        if (!el) return false;
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        el.style.transition = "background 0.2s";
        el.style.background = "rgba(80, 140, 210, 0.15)";
        setTimeout(() => { el.style.background = ""; }, 500);
        return true;
    }

    window.addEventListener("hashchange", () => {
        let hash = window.location.hash.slice(1);
        if (!hash) {
            activate_category("main");
            return;
        }
        if (hash.includes("--")) {
            let parts = hash.split("--");
            let cat = parts[0];
            let subId = parts.slice(1).join("--");
            if (activate_category(cat)) {
                setTimeout(() => scrollToElement(subId), 50);
            }
            return;
        }
        const categoryBtn = document.querySelector(`.category-btn[data-cat="${hash}"]`);
        if (categoryBtn) {
            activate_category(hash);
            return;
        }
        const target = document.getElementById(hash);
        if (target) {
            const parentSection = target.closest(".category-section");
            if (parentSection && parentSection.id && !document.querySelector(`.category-section.active#${parentSection.id}`)) {
                activate_category(parentSection.id);
                setTimeout(() => scrollToElement(hash), 50);
            } else {
                scrollToElement(hash);
            }
            return;
        }
        activate_category("main");
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
            if (timeout_id) clearTimeout(timeout_id);
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

    descriptions.forEach(function(desc) {
        var parent_card = desc.closest(".card");
        if (desc.hasAttribute("data-no-truncate") ||
            desc.classList.contains("no-readmore") ||
            (parent_card && parent_card.classList.contains("no-readmore"))) {
            return;
        }
        var original_html = desc.innerHTML;
        var test_div = document.createElement("div");
        test_div.style.cssText = "position: absolute; visibility: hidden; width: " + desc.offsetWidth + "px; font-size: 0.95rem; line-height: 1.4; padding: 0.4rem 0.6rem;";
        test_div.innerHTML = original_html;
        document.body.appendChild(test_div);
        var content_height = test_div.scrollHeight;
        document.body.removeChild(test_div);
        var max_height_em = 12;
        var max_height_px = parseFloat(getComputedStyle(document.documentElement).fontSize) * max_height_em;
        var needs_truncation = content_height > max_height_px + 5;
        if (!needs_truncation) return;
        desc.innerHTML = "";
        var preview_wrapper = document.createElement("div");
        preview_wrapper.className = "cd-preview";
        var content_div = document.createElement("div");
        content_div.className = "cd-content";
        content_div.innerHTML = original_html;
        var blur_div = document.createElement("div");
        blur_div.className = "cd-blur-overlay";
        var toggle_btn = document.createElement("button");
        toggle_btn.className = "cd-read-more-btn";
        toggle_btn.textContent = "Show more";
        preview_wrapper.appendChild(content_div);
        preview_wrapper.appendChild(blur_div);
        preview_wrapper.appendChild(toggle_btn);
        desc.appendChild(preview_wrapper);
        var expanded = false;
        toggle_btn.addEventListener("click", function() {
            expanded = !expanded;
            if (expanded) {
                preview_wrapper.classList.add("expanded");
                toggle_btn.textContent = "Show less";
            } else {
                preview_wrapper.classList.remove("expanded");
                toggle_btn.textContent = "Show more";
            }
        });
    });

    function get_jumpable_title(el) {
        if (el.dataset.title && el.dataset.title.trim()) return el.dataset.title.trim();
        const titleChild = el.querySelector(".jumpable-title");
        if (titleChild) return titleChild.innerText.trim();
        let ownText = el.innerText.trim();
        if (ownText.length > 80) ownText = ownText.substring(0, 80) + "…";
        return ownText || "unnamed section";
    }

    function assign_jumpable_ids() {
        document.querySelectorAll(".category-section .subcategory-group").forEach(function(group, idx) {
            if (!group.id) {
                var header = group.querySelector(".subcategory-header");
                var base = header ? header.innerText.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") : "group-" + idx;
                group.id = "nav-" + idx + "-" + base;
            }
        });
        document.querySelectorAll(".category-section " + jumpable_selector).forEach(function(el, idx) {
            if (!el.id) {
                var title = get_jumpable_title(el);
                var base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "jump-" + idx;
                el.id = "jump-" + idx + "-" + base;
            }
        });
    }

    function build_floating_nav() {
        var active_section = document.querySelector(".category-section.active");
        var nav_list = document.getElementById("floatingNavList");
        if (!nav_list) return;
        if (!active_section) {
            nav_list.innerHTML = '<li style="padding: 0.4rem 0.8rem; color: #888;">— no sections —</li>';
            return;
        }
        let targets = [];
        active_section.querySelectorAll(".subcategory-group").forEach(group => {
            let header = group.querySelector(".subcategory-header");
            if (!header) return;
            let title = header.innerText.trim();
            if (!title || !group.id) return;
            targets.push({ id: group.id, title: title });
        });
        active_section.querySelectorAll(jumpable_selector).forEach(el => {
            let title = get_jumpable_title(el);
            if (!title) return;
            if (!el.id) {
                let base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "tmp";
                el.id = "auto-" + base + "-" + Date.now() + "-" + Math.random();
            }
            targets.push({ id: el.id, title: title });
        });
        if (targets.length === 0) {
            nav_list.innerHTML = '<li style="padding: 0.4rem 0.8rem; color: #888;">↳ no jumpable items</li>';
            return;
        }
        let items_html = "";
        const categoryId = active_section.id;
        targets.forEach(target => {
            let combinedHash = `${categoryId}--${target.id}`;
            items_html += `<li><a class="floating-nav-link" href="#${combinedHash}" data-nav-link="${target.id}">> ${escape_html(target.title)}</a></li>`;
        });
        nav_list.innerHTML = items_html;
        document.querySelectorAll(".floating-nav-link").forEach(link => {
            link.addEventListener("click", function(e) {
                e.preventDefault();
                const hash = this.getAttribute("href").slice(1);
                if (hash) window.location.hash = hash;
            });
        });
    }

    function escape_html(str) {
        return str.replace(/[&<>]/g, function(m) {
            if (m === "&") return "&amp;";
            if (m === "<") return "&lt;";
            if (m === ">") return "&gt;";
            return m;
        });
    }

    function watch_category_changes() {
        var sections = document.querySelectorAll(".category-section");
        if (!sections.length) return;
        var observer = new MutationObserver(function() {
            assign_jumpable_ids();
            build_floating_nav();
        });
        sections.forEach(function(section) {
            observer.observe(section, { attributes: true, attributeFilter: ["class"] });
        });
    }

    function hook_category_buttons() {
        var btns = document.querySelectorAll(".category-btn");
        btns.forEach(function(btn) {
            btn.addEventListener("click", function() {
                setTimeout(function() {
                    assign_jumpable_ids();
                    build_floating_nav();
                }, 30);
            });
        });
    }

    function init_floating_nav() {
        assign_jumpable_ids();
        build_floating_nav();
        watch_category_changes();
        hook_category_buttons();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init_floating_nav);
    } else {
        init_floating_nav();
    }
})();