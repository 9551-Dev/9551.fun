(function() {
    "use strict";

    var jumpable_selector = ".jumpable";

    var btns         = document.querySelectorAll(".category-btn");
    var sections     = document.querySelectorAll(".category-section");
    var floating_nav = document.querySelector(".floating-nav")
    var top_nav      = document.querySelector(".top-nav");
    var container    = document.querySelector('.container');

    function activate_category(cat) {
        var btn = document.querySelector(".category-btn[data-cat=\"" + cat + "\"]");
        if (!btn) return false;
        btns.forEach(function(b) { b.classList.remove("active"); });
        btn.classList.add("active");
        sections.forEach(function(s) {
            s.classList.toggle("active", s.id === cat);
        });
        var active_section = document.getElementById(cat);
        if (active_section) {
            active_section.querySelectorAll(".card-description").forEach(function(desc) {
                truncate_description(desc);
            });
        }
        make_jumpable_elements_clickable();
        return true;
    }

    function scroll_to_element(id) {
        var el = document.getElementById(id);
        if (!el) return false;
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        el.style.transition = "background 0.2s";
        el.style.background = "rgba(80, 140, 210, 0.15)";
        setTimeout(function() { el.style.background = ""; }, 500);
        return true;
    }

    window.addEventListener("hashchange", function() {
        var hash = window.location.hash.slice(1);
        if (!hash) {
            activate_category("main");
            return;
        }
        if (hash.includes("--")) {
            var parts = hash.split("--");
            var cat = parts[0];
            var sub_id = parts.slice(1).join("--");
            if (activate_category(cat)) {
                setTimeout(function() { scroll_to_element(sub_id); }, 50);
            }
            return;
        }
        var category_btn = document.querySelector(".category-btn[data-cat=\"" + hash + "\"]");
        if (category_btn) {
            activate_category(hash);
            return;
        }
        var target = document.getElementById(hash);
        if (target) {
            var parent_section = target.closest(".category-section");
            if (parent_section && parent_section.id && !document.querySelector(".category-section.active#" + parent_section.id)) {
                activate_category(parent_section.id);
                setTimeout(function() { scroll_to_element(hash); }, 50);
            } else {
                scroll_to_element(hash);
            }
            return;
        }
        activate_category("main");
    });

    window.dispatchEvent(new Event("hashchange"));

    btns.forEach(function(btn) {
        btn.addEventListener("click", function() {
            window.location.hash = btn.dataset.cat;
        });
    });

    var copy_blocks = document.querySelectorAll(".copyable-block");
    copy_blocks.forEach(function(block) {
        var original_text = block.innerText.trim();
        block.dataset.original_text = original_text;
        var timeout_id = null;
        block.addEventListener("click", function(e) {
            e.stopPropagation();
            var text_to_copy = block.dataset.copy || original_text;
            if (timeout_id) clearTimeout(timeout_id);
            block.classList.add("copy-flash");
            block.innerText = "copied!";
            navigator.clipboard.writeText(text_to_copy).catch(function() {
                var textarea = document.createElement("textarea");
                textarea.value = text_to_copy;
                document.body.appendChild(textarea);
                textarea.select();
                try { document.execCommand("copy"); } catch(e) {}
                document.body.removeChild(textarea);
            });
            timeout_id = setTimeout(function() {
                block.classList.remove("copy-flash");
                block.innerText = block.dataset.original_text;
                timeout_id = null;
            }, 800);
        });
    });

    function truncate_description(desc) {
        if (desc.hasAttribute("data-truncated")) return;
        if (desc.hasAttribute("data-no-truncate") ||
            desc.classList.contains("no-readmore") ||
            (desc.closest(".card") && desc.closest(".card").classList.contains("no-readmore"))) {
            return;
        }
        var original_html = desc.innerHTML;
        var clone = desc.cloneNode(true);
        var parent_width = desc.offsetWidth || (desc.parentElement ? desc.parentElement.offsetWidth : 300);
        clone.style.cssText = "position: absolute; visibility: hidden; width: " + parent_width + "px; font-size: 0.95rem; line-height: 1.4; padding: 0.4rem 0.6rem; top: -9999px; left: -9999px;";
        document.body.appendChild(clone);
        var content_height = clone.scrollHeight;
        document.body.removeChild(clone);
        var max_height_em = 15;
        var max_height_px = parseFloat(getComputedStyle(document.documentElement).fontSize) * max_height_em;
        if (content_height <= max_height_px + 5) return;
        desc.innerHTML = "";
        desc.setAttribute("data-truncated", "true");
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
    }

    function truncate_all_descriptions() {
        document.querySelectorAll(".card-description").forEach(function(desc) {
            truncate_description(desc);
        });
    }

    function get_jumpable_title(el) {
        if (el.dataset.title && el.dataset.title.trim()) return el.dataset.title.trim();
        var title_child = el.querySelector(".jumpable-title");
        if (title_child) return title_child.innerText.trim();
        var own_text = el.innerText.trim();
        if (own_text.length > 80) own_text = own_text.substring(0, 80) + "…";
        return own_text || "unnamed section";
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

    function escape_html(str) {
        return str.replace(/[&<>]/g, function(m) {
            if (m === "&") return "&amp;";
            if (m === "<") return "&lt;";
            if (m === ">") return "&gt;";
            return m;
        });
    }

    function build_floating_nav() {
        var active_section = document.querySelector(".category-section.active");
        var nav_list = document.getElementById("floatingNavList");
        if (!nav_list) return;
        if (!active_section) {
            nav_list.innerHTML = "<li style=\"padding: 0.4rem 0.8rem; color: #888;\">— no sections —</li>";
            return;
        }
        var targets = [];
        active_section.querySelectorAll(".subcategory-group").forEach(function(group) {
            var header = group.querySelector(".subcategory-header");
            if (!header) return;
            var title = header.innerText.trim();
            if (!title || !group.id) return;
            targets.push({ id: group.id, title: title });
        });
        active_section.querySelectorAll(jumpable_selector).forEach(function(el) {
            var title = get_jumpable_title(el);
            if (!title) return;
            if (!el.id) {
                var base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "tmp";
                el.id = "auto-" + base + "-" + Date.now() + "-" + Math.random();
            }
            targets.push({ id: el.id, title: title });
        });
        if (targets.length === 0) {
            nav_list.innerHTML = "<li style=\"padding: 0.4rem 0.8rem; color: #888;\">↳ no jumpable items</li>";
            return;
        }
        var items_html = "";
        var category_id = active_section.id;
        targets.forEach(function(target) {
            var combined_hash = category_id + "--" + target.id;
            items_html += "<li><a class=\"floating-nav-link\" href=\"#" + combined_hash + "\" data-nav-link=\"" + target.id + "\">> " + escape_html(target.title) + "</a></li>";
        });
        nav_list.innerHTML = items_html;
        document.querySelectorAll(".floating-nav-link").forEach(function(link) {
            link.addEventListener("click", function(e) {
                e.preventDefault();
                var hash = this.getAttribute("href").slice(1);
                if (hash) window.location.hash = hash;
            });
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
                    make_jumpable_elements_clickable();
                }, 30);
            });
        });
    }

    function clear_all_click_handlers(container) {
        if (!container) return;
        var all_jumpables = container.querySelectorAll(".subcategory-group, " + jumpable_selector);
        all_jumpables.forEach(function(el) {
            if (el._hash_click_handler) {
                el.removeEventListener("click", el._hash_click_handler);
                delete el._hash_click_handler;
            }
            var headers = el.querySelectorAll(".subcategory-header, .jumpable-title");
            headers.forEach(function(header) {
                if (header._hash_click_handler) {
                    header.removeEventListener("click", header._hash_click_handler);
                    delete header._hash_click_handler;
                }
                header.style.cursor = "";
            });
            el.style.cursor = "";
        });
    }

    function make_jumpable_elements_clickable() {
        var active_section = document.querySelector(".category-section.active");
        if (!active_section) return;

        clear_all_click_handlers(active_section);

        var targets = [
            ...active_section.querySelectorAll(".subcategory-group"),
            ...active_section.querySelectorAll(jumpable_selector)
        ];

        var category_id = active_section.id;

        targets.forEach(function(el) {
            if (!el.id) return;
            var combined_hash = category_id + "--" + el.id;

            var title_el = null;
            if (el.classList.contains("subcategory-group")) {
                title_el = el.querySelector(".subcategory-header");
            } else if (el.matches(jumpable_selector)) {
                title_el = el.querySelector(".jumpable-title");
            }

            var click_target = title_el || el;
            var handler = function(e) {
                e.stopPropagation();
                window.location.hash = combined_hash;
            };
            click_target.addEventListener("click", handler);
            click_target._hash_click_handler = handler;

            click_target.style.cursor = "pointer";
            if (title_el) {
                el.style.cursor = "";
            } else {
                el.style.cursor = "pointer";
            }
        });
    }

    function init_floating_nav() {
        assign_jumpable_ids();
        build_floating_nav();
        make_jumpable_elements_clickable();
        watch_category_changes();
        hook_category_buttons();
    }

    truncate_all_descriptions();

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init_floating_nav);
    } else {
        init_floating_nav();
    }

    const SCROLL_ADD_THRESHOLD    = 60;
    const SCROLL_REMOVE_THRESHOLD = 5;

    function update_navbar_compact() {
        const scrolled = top_nav.classList.contains("scrolled");
        if (!scrolled && window.scrollY > SCROLL_ADD_THRESHOLD) {
            top_nav.classList.add("scrolled");
        } else if (scrolled && window.scrollY < SCROLL_REMOVE_THRESHOLD) {
            top_nav.classList.remove("scrolled");
        }
    }

    function update_floating_nav_top() {
        var computed_style = window.getComputedStyle(floating_nav);
        var right_margin_px = parseFloat(computed_style.right);
        if (isNaN(right_margin_px)) {
            right_margin_px = 32;
        }
        var navbar_height = top_nav.offsetHeight;
        floating_nav.style.top = (navbar_height + right_margin_px) + "px";
    }

    var resize_observer = new ResizeObserver(function() {
        update_floating_nav_top();
    });
    resize_observer.observe(top_nav);

    window.addEventListener("resize", function() {
        update_floating_nav_top();
        check_overlap();
    });

    window.addEventListener("scroll", function() {
        update_navbar_compact();
        check_overlap();
    });

    update_navbar_compact();
    requestAnimationFrame(update_floating_nav_top);

    var last_overlap_state = null;

    function check_overlap() {
        var viewport_width = window.innerWidth;
        // (viewport_width + 0.6*viewport_width)/2 = 0.8 * viewport_width
        var container_natural_right = 0.8 * viewport_width;
        var nav_rect = floating_nav.getBoundingClientRect();
        var nav_left = nav_rect.left;

        var would_overlap = (nav_left <= container_natural_right);

        if (would_overlap !== last_overlap_state) {
            if (would_overlap) {
                floating_nav.style.visibility = "hidden";
                container.classList.add("overlap-mode");
            } else {
                floating_nav.style.visibility = "visible";
                container.classList.remove("overlap-mode");
            }
            last_overlap_state = would_overlap;
        }
    }

    window.addEventListener("load", function() {
        check_overlap();
    });

    if (document.readyState === "complete") {
        check_overlap();
    } else {
        window.addEventListener("load", check_overlap);
    }

    const spacer = document.createElement("div");
    spacer.className = "top-nav-spacer";
    top_nav.insertAdjacentElement("afterend", spacer);
    spacer.style.height  = 0
})();