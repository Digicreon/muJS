/**
 * µJS (muJS) - Lightweight AJAX navigation library
 * https://mujs.org
 * MIT License
 *
 * @file		mu.js
 * @license		MIT
 * @see			https://mujs.org
 *
 *
 * ============================================================================
 * TABLE OF CONTENTS
 * ============================================================================
 *
 * 1. Overview
 * 2. Installation
 * 3. Basic usage
 * 4. Modes
 * 5. Patch mode
 * 6. Attributes reference
 * 7. Configuration reference
 * 8. Events
 * 9. Morphing (idiomorph)
 * 10. View Transitions
 * 11. Forms
 * 12. History & Scroll
 * 13. Prefetch
 * 14. Progress bar
 * 15. Triggers
 * 16. Server-Sent Events (SSE)
 * 17. Programmatic usage
 *
 *
 * ============================================================================
 * 1. OVERVIEW
 * ============================================================================
 *
 * µJS intercepts clicks on links and form submissions to load pages via AJAX
 * instead of full browser navigation. The fetched content replaces part (or
 * all) of the current page, making navigation faster and smoother.
 *
 * It is inspired by pjax, Turbo (Hotwire), and HTMX, but aims to be simpler
 * and lighter, with zero dependencies.
 *
 *
 * ============================================================================
 * 2. INSTALLATION
 * ============================================================================
 *
 * Include the scripts at the end of <body>:
 *
 *   <script src="/path/to/mu.js"></script>
 *   <script>mu.init();</script>
 *
 * Optionally, load idiomorph before mu.js for DOM morphing support:
 *
 *   <script src="/path/to/idiomorph.js"></script>
 *   <script src="/path/to/mu.js"></script>
 *   <script>mu.init();</script>
 *
 * µJS auto-detects idiomorph. If present, morphing is enabled by default.
 *
 * Or use as an ES module:
 *
 *   import mu from './mu.js';
 *   mu.init();
 *
 *
 * ============================================================================
 * 3. BASIC USAGE
 * ============================================================================
 *
 * After calling mu.init(), all internal links (href starting with "/") are
 * automatically intercepted. Clicking a link fetches the page via AJAX and
 * replaces the current <body> with the fetched <body>.
 *
 * No modification of your HTML is needed for basic usage.
 *
 * Example — default behavior (full page replacement):
 *
 *   <a href="/about">About</a>
 *
 * Example — replace only a fragment:
 *
 *   <a href="/about" mu-target="#content" mu-source="#main">About</a>
 *
 * Example — disable µJS on a specific link:
 *
 *   <a href="/file.pdf" mu-disabled>Download</a>
 *
 *
 * ============================================================================
 * 4. MODES
 * ============================================================================
 *
 * The "mu-mode" attribute controls how fetched content is injected into the
 * current page. Default mode is "replace".
 *
 *   replace   Replace the target node with the source node (default).
 *   update    Replace the inner content of the target with the source's
 *             inner content.
 *   prepend   Insert the source node at the beginning of the target.
 *   append    Insert the source node at the end of the target.
 *   before    Insert the source node before the target.
 *   after     Insert the source node after the target.
 *   remove    Remove the target node (source content is ignored).
 *   none      Do nothing to the DOM (events are still fired).
 *   patch     Process multiple targeted fragments (see section 5).
 *
 * Example:
 *
 *   <a href="/notifications" mu-mode="update" mu-target="#notifs">
 *       Refresh notifications
 *   </a>
 *
 *
 * ============================================================================
 * 5. PATCH MODE
 * ============================================================================
 *
 * In patch mode, the fetched HTML contains multiple fragments, each targeting
 * a different part of the current page. Fragments are identified by the
 * "mu-patch-target" attribute.
 *
 * Link triggering a patch:
 *
 *   <a href="/api/comments/new" mu-mode="patch">Add comment</a>
 *
 * Server response (plain HTML):
 *
 *   <!-- Replaces #comment-42 (default mode: replace) -->
 *   <div mu-patch-target="#comment-42" class="comment">
 *       Updated comment
 *   </div>
 *
 *   <!-- Appends to #comments -->
 *   <div class="comment" mu-patch-target="#comments" mu-patch-mode="append">
 *       New comment
 *   </div>
 *
 *   <!-- Updates the page title -->
 *   <title mu-patch-target="title">New title</title>
 *
 *   <!-- Removes an element -->
 *   <div mu-patch-target="#old-banner" mu-patch-mode="remove"></div>
 *
 *   <!-- Adds a stylesheet -->
 *   <link rel="stylesheet" href="/css/gallery.css"
 *         mu-patch-target="head" mu-patch-mode="append">
 *
 * Patch fragments are standard HTML elements. No special tags needed.
 * The mu-patch-* attributes are kept on injected nodes for debugging.
 *
 * By default, patch mode does not modify browser history. To enable it:
 *
 *   <a href="/products?cat=3" mu-mode="patch" mu-patch-history="true">
 *       Filter
 *   </a>
 *
 *
 * ============================================================================
 * 6. ATTRIBUTES REFERENCE
 * ============================================================================
 *
 * All attributes support both "mu-*" and "data-mu-*" syntax.
 *
 *   mu-disabled           Disable µJS on this element.
 *   mu-mode               Injection mode (see section 4).
 *   mu-target             CSS selector for the target node in the current page.
 *   mu-source             CSS selector for the source node in the fetched page.
 *   mu-url                Override the URL to fetch (instead of href/action).
 *   mu-prefix             URL prefix for the fetch request.
 *   mu-title              Selector for the title node. Supports
 *                         "selector/attribute" syntax. Empty string to disable
 *                         title update.
 *   mu-history            "true"/"false" to add/skip browser history entry.
 *                         Default: true for navigation modes (replace/update),
 *                         false for partial modes and non-GET forms.
 *   mu-scroll             "true"/"false" to force or prevent scrolling to top.
 *                         Default: true for navigation, false for partial modes.
 *   mu-morph              "false" to disable morphing on this element.
 *   mu-transition         "false" to disable view transitions on this element.
 *   mu-prefetch           "false" to disable prefetch on hover for this link.
 *   mu-method             HTTP method: "get", "post", "put", "patch",
 *                         "delete", or "sse". Default: "get" for links,
 *                         form's method attribute for forms.
 *   mu-trigger            Event trigger: "click", "submit", "change",
 *                         "blur", "focus", "load". Default depends on
 *                         element type (see section 15).
 *   mu-debounce           Debounce delay in milliseconds (e.g. "500").
 *   mu-repeat             Repeat interval in ms for polling (e.g. "5000").
 *   mu-confirm            Confirmation message shown before loading.
 *   mu-confirm-quit       (Forms) Enable quit-page confirmation when the form
 *                         has been modified.
 *   mu-validate           Name of a JS function for form validation. Receives
 *                         the form element. Must return true/false.
 *   mu-patch-target       (Patch fragments) CSS selector of the target node.
 *   mu-patch-mode         (Patch fragments) Injection mode for this fragment.
 *   mu-patch-history      "true" to add the URL to browser history in patch
 *                         mode (default: "false", no history).
 *
 *
 * ============================================================================
 * 7. CONFIGURATION REFERENCE
 * ============================================================================
 *
 * Pass an object to mu.init() to override defaults:
 *
 *   mu.init({
 *       history: false,
 *       processForms: false,
 *       morph: false
 *   });
 *
 *   processLinks      (bool)    Process <a> tags. Default: true.
 *   processForms      (bool)    Process <form> tags. Default: true.
 *   history           (bool)    Add URL to browser history. Default: true.
 *   mode              (string)  Default injection mode. Default: "replace".
 *   target            (string)  Default target selector. Default: "body".
 *   source            (string)  Default source selector. Default: "body".
 *   title             (string)  Title selector. Default: "title".
 *   scroll            (bool)    Force scroll behavior. Default: null (auto).
 *   urlPrefix         (string)  Prefix added to fetched URLs. Default: null.
 *   progress          (bool)    Show progress bar. Default: true.
 *   prefetch          (bool)    Prefetch on hover. Default: true.
 *   morph             (bool)    Enable DOM morphing. Default: true.
 *   transition        (bool)    Enable View Transitions. Default: true.
 *   confirmQuitText   (string)  Quit-page confirmation message.
 *
 *
 * ============================================================================
 * 8. EVENTS
 * ============================================================================
 *
 * µJS dispatches CustomEvents on `document`. All events carry a `detail`
 * object with `lastUrl` and `previousUrl`.
 *
 *   mu:init           Fired after initialization.
 *                     detail: {url}
 *
 *   mu:before-fetch   Fired before fetching. Cancelable (preventDefault()
 *                     aborts the load).
 *                     detail: {url, fetchUrl, config, sourceElement}
 *
 *   mu:before-render  Fired after fetch, before DOM injection. Cancelable.
 *                     detail.html can be modified to alter injected content.
 *                     detail: {url, finalUrl, html, config}
 *
 *   mu:after-render   Fired after DOM injection.
 *                     detail: {url, finalUrl, mode}
 *
 *   mu:fetch-error    Fired on fetch failure or HTTP error.
 *                     detail: {url, fetchUrl, status, response, error}
 *
 * Example:
 *
 *   document.addEventListener("mu:after-render", function(e) {
 *       console.log("Loaded: " + e.detail.url);
 *       myApp.initWidgets();
 *   });
 *
 *
 * ============================================================================
 * 9. MORPHING (IDIOMORPH)
 * ============================================================================
 *
 * When a morph library is available, µJS uses it for "replace" and "update"
 * modes to preserve DOM state (focus, scroll position, video playback, etc.).
 *
 * µJS auto-detects idiomorph (https://github.com/bigskysoftware/idiomorph):
 *
 *   <script src="/path/to/idiomorph.js"></script>
 *   <script src="/path/to/mu.js"></script>
 *
 * To use a different morph library:
 *
 *   mu.init();
 *   mu.setMorph(function(target, html, opts) {
 *       myMorphLib.morph(target, html, opts);
 *   });
 *
 * Morphing can be disabled globally (morph: false in config) or per-element
 * (mu-morph="false").
 *
 *
 * ============================================================================
 * 10. VIEW TRANSITIONS
 * ============================================================================
 *
 * µJS uses the View Transitions API (document.startViewTransition) when
 * supported by the browser. This provides smooth animated transitions between
 * page states.
 *
 * Enabled by default. Falls back silently on unsupported browsers.
 *
 * Disable globally:
 *
 *   mu.init({ transition: false });
 *
 * Disable per-element:
 *
 *   <a href="/page" mu-transition="false">Link</a>
 *
 *
 * ============================================================================
 * 11. FORMS
 * ============================================================================
 *
 * µJS intercepts form submissions. HTML5 validation (reportValidity) is
 * checked before any fetch.
 *
 * GET forms: data is serialized as query string, behaves like a link.
 * POST forms: data is sent as URL-encoded (default) or FormData
 * (when enctype="multipart/form-data", e.g. file uploads).
 * History is disabled by default
 * (POST responses should not be replayed via browser back button).
 *
 * Example — POST form in patch mode:
 *
 *   <form action="/comment/create" method="post" mu-mode="patch">
 *       <textarea name="body"></textarea>
 *       <button type="submit">Send</button>
 *   </form>
 *
 * Quit-page confirmation: add mu-confirm-quit to a form. If any input is
 * modified, the user will be prompted before navigating away.
 *
 *   <form action="/save" method="post" mu-confirm-quit>...</form>
 *
 * Custom validation via mu-validate attribute:
 *
 *   <form action="/save" method="post" mu-validate="myValidator">...</form>
 *   <script>
 *       function myValidator(form) {
 *           return form.querySelector('#name').value.length > 0;
 *       }
 *   </script>
 *
 *
 * ============================================================================
 * 12. HISTORY & SCROLL
 * ============================================================================
 *
 * mu-history controls whether the URL is added to browser history.
 * mu-scroll controls whether the page scrolls to top after rendering.
 * Both are independent — setting one does not affect the other.
 *
 * Defaults depend on the mode and context:
 *   - Modes replace/update + GET link/form: history=true, scroll=true.
 *   - Modes replace/update + POST/PUT/PATCH/DELETE form: history=false, scroll=true.
 *   - Modes replace/update + triggers (change/blur/focus/load): history=false, scroll=false.
 *   - Modes append/prepend/before/after/remove/none: history=false, scroll=false.
 *   - Patch mode: history=false, scroll=false.
 *
 * Redirections always add the URL to browser history.
 *
 *   <a href="/panel" mu-history="false">Open panel</a>
 *
 * Disable history globally:
 *
 *   mu.init({ history: false });
 *
 * In patch mode, use mu-patch-history="true" to add the URL to history.
 *
 *
 * ============================================================================
 * 13. PREFETCH
 * ============================================================================
 *
 * When enabled (default), µJS fetches the page on mouse hover, before the
 * user clicks. A 50ms delay filters accidental hover-throughs.
 * This saves ~100-300ms of perceived loading time.
 *
 * The prefetch cache stores one entry per URL. It is consumed and cleared
 * when the link is clicked.
 *
 * Disable globally:
 *
 *   mu.init({ prefetch: false });
 *
 * Disable per-link:
 *
 *   <a href="/heavy-page" mu-prefetch="false">Link</a>
 *
 *
 * ============================================================================
 * 14. PROGRESS BAR
 * ============================================================================
 *
 * A thin progress bar is displayed at the top of the page during fetch.
 * It is styled with inline CSS (no external stylesheet needed).
 *
 * The bar element has id="mu-progress" and can be styled via CSS:
 *
 *   #mu-progress { background: red !important; height: 5px !important; }
 *
 * Disable globally:
 *
 *   mu.init({ progress: false });
 *
 *
 * ============================================================================
 * 15. TRIGGERS
 * ============================================================================
 *
 * µJS supports custom event triggers via the mu-trigger attribute. This
 * allows any element with a mu-url to initiate a fetch on events other
 * than click or submit.
 *
 * Default triggers (when mu-trigger is absent):
 *   <a>                          click
 *   <form>                       submit
 *   <input>, <textarea>, <select>  change
 *   Any other element            click
 *
 * Trigger mapping to browser events:
 *   click   → click (handled by event delegation)
 *   submit  → submit (handled by event delegation)
 *   change  → input (browser event)
 *   blur    → change + blur (deduplicated)
 *   focus   → focus
 *   load    → fires immediately when rendered
 *
 * Example — live search with debounce:
 *
 *   <input type="text" name="q"
 *          mu-trigger="change" mu-debounce="500"
 *          mu-url="/search" mu-target="#results" mu-source="#results"
 *          mu-mode="update">
 *
 * Example — polling every 5 seconds:
 *
 *   <div mu-trigger="load" mu-repeat="5000"
 *        mu-url="/notifications" mu-target="#notifs" mu-mode="update">
 *   </div>
 *
 * Example — action on focus:
 *
 *   <input type="text" mu-trigger="focus"
 *          mu-url="/suggestions" mu-target="#suggestions"
 *          mu-mode="update">
 *
 * Triggers other than click/submit default to history=false, scroll=false.
 *
 *
 * ============================================================================
 * 16. SERVER-SENT EVENTS (SSE)
 * ============================================================================
 *
 * µJS supports Server-Sent Events via mu-method="sse". This opens an
 * EventSource connection to the given URL. Each incoming message is
 * treated as HTML and rendered according to the element's mode.
 *
 * Example — real-time chat with patch mode:
 *
 *   <div mu-trigger="load" mu-url="/chat/stream"
 *        mu-mode="patch" mu-method="sse">
 *   </div>
 *
 * The server sends SSE messages where each data payload is HTML containing
 * patch fragments (with mu-patch-target attributes).
 *
 * Limitations:
 *   - EventSource does not support custom HTTP headers. Use query
 *     parameters for authentication or identification.
 *   - Browser limit: ~6 SSE connections per domain in HTTP/1.1.
 *     Use HTTP/2 to avoid this limit.
 *   - SSE connections are automatically closed when the element is
 *     removed from the DOM (via _cleanupTriggers).
 *
 *
 * ============================================================================
 * 17. PROGRAMMATIC USAGE
 * ============================================================================
 *
 *   // Load a page
 *   mu.load("/page", { history: false, target: "#content" });
 *
 *   // Get last loaded URL
 *   mu.getLastUrl();
 *
 *   // Get previous URL
 *   mu.getPreviousUrl();
 *
 *   // Enable/disable quit-page confirmation
 *   mu.setConfirmQuit(true);
 *   mu.setConfirmQuit(false);
 *
 *   // Register a custom morph function
 *   mu.setMorph(myMorphFunction);
 *
 */
var mu = mu || new function() {
	/* ********** CONSTANTS ********** */
	/** @type {string} Library version. */
	this._VERSION = "1.4.6";

	/* ********** DEFAULT CONFIGURATION ********** */
	/**
	 * Default configuration values.
	 * Overridden by the object passed to mu.init().
	 * @type {Object}
	 */
	this._defaults = {
		/** @type {boolean} Process <a> tags. */
		processLinks: true,
		/** @type {boolean} Process <form> tags. */
		processForms: true,
		/** @type {boolean} Add URL to browser history. */
		history: true,
		/** @type {string} Default injection mode. */
		mode: "replace",
		/** @type {string} Default target CSS selector. */
		target: "body",
		/** @type {string} Default source CSS selector. */
		source: "body",
		/** @type {string} Title selector ("selector" or "selector/attribute"). */
		title: "title",
		/** @type {boolean|null} Scroll to top. null = auto (true). */
		scroll: null,
		/** @type {string|null} Prefix added to fetched URLs. */
		urlPrefix: null,
		/** @type {boolean} Show progress bar during fetch. */
		progress: true,
		/** @type {boolean} Prefetch pages on link hover. */
		prefetch: true,
		/** @type {number} Prefetch cache TTL in milliseconds. */
		prefetchTtl: 3000,
		/** @type {boolean} Enable DOM morphing when a morph lib is available. */
		morph: true,
		/** @type {boolean} Enable View Transitions API. */
		transition: true,
		/** @type {string} Confirmation message before leaving a modified form. */
		confirmQuitText: "Are you sure you want to leave this page?"
	};

	/* ********** INTERNAL STATE ********** */
	/** @type {Object} Active configuration (defaults merged with init params). */
	this._cfg = {};
	/** @type {string|null} Last URL loaded by µJS. */
	this._lastUrl = null;
	/** @type {string|null} URL before the last one. */
	this._previousUrl = null;
	/** @type {AbortController|null} Controller for the current in-flight request. */
	this._abortCtrl = null;
	/** @type {Element|null} Progress bar DOM element. */
	this._progressEl = null;
	/** @type {Map} Prefetch cache (url => {html, ts} object or null if in-flight). */
	this._prefetchCache = new Map();
	/** @type {number|null} Pending prefetch timer (setTimeout ID). */
	this._prefetchTimer = null;
	/** @type {boolean} True if quit-page confirmation is active. */
	this._confirmQuit = false;
	/** @type {Object} Map of already-loaded external script URLs. */
	this._jsIncludes = {};
	/** @type {Function|null} Morph function. Auto-detected or set via setMorph(). */
	this._morph = null;
	/** @type {boolean} True after first init() call. Prevents duplicate listeners. */
	this._initialized = false;
	/** @type {Element|null} Last clicked submit button (fallback for e.submitter). */
	this._submitter = null;

	/* ********** INITIALIZATION ********** */
	/**
	 * Initialize µJS.
	 * Sets up event delegation and merges configuration.
	 * Should be called once when the page loads.
	 * @param	{Object}	[params]	Configuration overrides (see _defaults).
	 */
	this.init = function(params) {
		mu._cfg = Object.assign({}, mu._defaults, params || {});
		// Parse title selector (supports "selector/attribute" syntax)
		mu._cfg._titleAttr = null;
		if (mu._cfg.title) {
			var pos = mu._cfg.title.lastIndexOf("/");
			if (pos !== -1) {
				mu._cfg._titleAttr = mu._cfg.title.substring(pos + 1);
				mu._cfg.title = mu._cfg.title.substring(0, pos);
			}
		}
		// Auto-detect idiomorph
		if (!mu._morph && typeof window.Idiomorph !== "undefined" && typeof window.Idiomorph.morph === "function") {
			mu._morph = function(target, html, opts) {
				window.Idiomorph.morph(target, html, opts);
			};
		}
		// Pre-populate _jsIncludes with scripts already on the page.
		// Prevents _runScripts from re-downloading them on navigation.
		var existingScripts = document.querySelectorAll("script[src]");
		for (var i = 0; i < existingScripts.length; i++)
			mu._jsIncludes[existingScripts[i].getAttribute("src")] = true;
		// Event delegation (attached once, works for all current and future elements)
		if (!mu._initialized) {
			document.addEventListener("click", mu._onClick);
			document.addEventListener("submit", mu._onSubmit);
			document.addEventListener("mouseover", mu._onMouseOver);
			document.addEventListener("mouseout", mu._onMouseOut);
			document.addEventListener("input", mu._onInput);
			window.addEventListener("popstate", mu._onPopState);
			window.addEventListener("beforeunload", mu._onBeforeUnload);
			mu._initialized = true;
		}
		// Save initial history state
		window.history.replaceState({mu: true, url: location.pathname + location.search}, "");
		// Initialize triggers for elements already on the page
		if (document.body)
			mu._initTriggers(document.body);
		// If DOM is still loading, re-scan once parsing is complete.
		// Covers the case where init() is called from <head> or early in <body>
		// before trigger elements (mu-trigger="load", etc.) are parsed.
		// The _mu_bound flag on each element prevents duplicate binding.
		if (document.readyState === "loading") {
			document.addEventListener("DOMContentLoaded", function() {
				mu._initTriggers(document.body);
			});
		}
		// Emit init event
		mu._emit("mu:init", {url: location.pathname + location.search});
	};

	/* ********** PUBLIC API ********** */
	/**
	 * Programmatic page load.
	 * @param	{string}	url	URL to load.
	 * @param	{Object}	[opts]	Per-load configuration overrides.
	 */
	this.load = function(url, opts) {
		var cfg = Object.assign({}, mu._cfg, opts || {});
		mu._loadExec(mu._resolveUrl(url) || url, cfg);
	};
	/**
	 * Get the last URL loaded by µJS.
	 * @return	{string|null}	The last URL, or null if µJS hasn't loaded a page yet.
	 */
	this.getLastUrl = function() {
		return (mu._lastUrl);
	};
	/**
	 * Get the URL before the last one.
	 * @return	{string|null}	The previous URL, or null.
	 */
	this.getPreviousUrl = function() {
		return (mu._previousUrl);
	};
	/**
	 * Enable or disable quit-page confirmation.
	 * When enabled, navigating away from the page prompts the user.
	 * @param	{boolean}	val	True to enable, false to disable.
	 */
	this.setConfirmQuit = function(val) {
		mu._confirmQuit = !!val;
	};
	/**
	 * Register a custom morph function.
	 * The function receives (targetElement, htmlString, options).
	 * Options object may contain {morphStyle: "innerHTML"|"outerHTML"}.
	 * @param	{Function}	fn	Morph function.
	 */
	this.setMorph = function(fn) {
		mu._morph = fn;
	};

	/* ********** ATTRIBUTE HELPERS ********** */
	/**
	 * Read an attribute with mu-* / data-mu-* fallback.
	 * Tries mu-{name} first, then data-mu-{name}.
	 * @param	{Element}	el	DOM element.
	 * @param	{string}	name	Attribute name (without prefix).
	 * @return	{string|null}	Attribute value, or null if not found.
	 */
	this._attr = function(el, name) {
		if (el.hasAttribute("mu-" + name))
			return (el.getAttribute("mu-" + name));
		if (el.hasAttribute("data-mu-" + name))
			return (el.getAttribute("data-mu-" + name));
		return (null);
	};
	/**
	 * Read a boolean attribute with fallback.
	 * Returns true for values "" or "true", false for "false".
	 * @param	{Element}	el		DOM element.
	 * @param	{string}	name		Attribute name (without prefix).
	 * @param	{boolean}	fallback	Default value if attribute is absent.
	 * @return	{boolean}
	 */
	this._attrBool = function(el, name, fallback) {
		var v = mu._attr(el, name);
		if (v === null)
			return (fallback);
		if (v === "" || v === "true")
			return (true);
		if (v === "false")
			return (false);
		return (fallback);
	};

	/**
	 * Resolve a target selector containing "&" (relative target).
	 * The "&" is replaced by the source element's ID selector.
	 * If the source element has no ID, one is auto-generated.
	 * @param	{string}	selector	CSS selector, possibly containing "&".
	 * @param	{Element}	sourceEl	Trigger element (cfg._sourceElement).
	 * @return	{string}	Resolved CSS selector.
	 */
	this._resolveTarget = function(selector, sourceEl) {
		if (!selector || selector.indexOf("&") === -1 || !sourceEl)
			return (selector);
		if (!sourceEl.id)
			sourceEl.id = "mu-" + Math.random().toString(36).slice(2);
		return (selector.replace(/&/g, "#" + sourceEl.id));
	};

	/* ********** URL RESOLUTION ********** */
	/**
	 * Resolve a URL to a local path.
	 * Handles relative URLs (../page.html, page.html), absolute same-origin URLs
	 * (https://same-domain.com/page), and local paths (/page).
	 * Returns null for external URLs, hash-only links, and invalid URLs.
	 * @param	{string}	url	Raw URL from href, action, or mu-url attribute.
	 * @return	{string|null}	Local path (e.g. "/page") or null if external/invalid.
	 */
	this._resolveUrl = function(url) {
		// Skip empty URLs and hash-only URLs
		if (!url || url.charAt(0) === "#")
			return (null);
		// Fast path: already a local path (starts with "/" but not "//")
		if (url.charAt(0) === "/" && url.charAt(1) !== "/")
			return (url);
		// Resolve relative or absolute URLs
		try {
			var parsed = new URL(url, document.baseURI);
			if (parsed.origin === window.location.origin)
				return (parsed.pathname + parsed.search + parsed.hash);
		} catch(e) {}
		return (null);
	};

	/* ********** ELEMENT FILTERING ********** */
	/**
	 * Determine if an element should be intercepted by µJS.
	 * Checks for disabled state, target/download attributes, onclick/onsubmit handlers,
	 * and URL (must be same-origin: local paths, relative URLs, or absolute same-domain).
	 * @param	{Element}	el	DOM element (<a> or <form>).
	 * @return	{boolean}	True if µJS should handle this element.
	 */
	this._shouldProcess = function(el) {
		// Explicitly disabled
		if (mu._attr(el, "disabled") === "true" || mu._attr(el, "disabled") === "")
			return (false);
		if (el.getAttribute("mu") === "false" || el.getAttribute("data-mu") === "false")
			return (false);
		// Has target attribute (opens in new window/frame)
		if (el.hasAttribute("target"))
			return (false);
		// Has download attribute (triggers file download)
		if (el.hasAttribute("download"))
			return (false);
		// Links: skip if has onclick handler
		if (el.tagName === "A" && el.hasAttribute("onclick"))
			return (false);
		// Forms: skip if has onsubmit handler
		if (el.tagName === "FORM" && el.hasAttribute("onsubmit"))
			return (false);
		// Explicitly enabled (overrides URL check)
		if (el.getAttribute("mu") === "true" || el.getAttribute("data-mu") === "true")
			return (true);
		// Elements with mu-url: check the mu-url value instead of href/action
		var muUrl = mu._attr(el, "url");
		if (muUrl !== null)
			return (mu._resolveUrl(muUrl) !== null);
		// Check URL: must be same-origin (local path, relative, or absolute same-domain)
		var url = el.getAttribute("href") || el.getAttribute("action") || "";
		return (mu._resolveUrl(url) !== null);
	};

	/* ********** ELEMENT CONFIGURATION ********** */
	/**
	 * Build the effective configuration for a given element.
	 * Merges global config with element-level mu-* attributes.
	 * @param	{Element}	el	DOM element (<a> or <form>).
	 * @return	{Object}	Merged configuration object.
	 */
	this._elemCfg = function(el) {
		var cfg = Object.assign({}, mu._cfg);
		var v;
		if ((v = mu._attr(el, "mode")) !== null)
			cfg.mode = v;
		if ((v = mu._attr(el, "target")) !== null)
			cfg.target = v;
		if ((v = mu._attr(el, "source")) !== null)
			cfg.source = v;
		if ((v = mu._attr(el, "title")) !== null) {
			cfg.title = v;
			cfg._titleAttr = null;
			var pos = v.lastIndexOf("/");
			if (pos !== -1) {
				cfg._titleAttr = v.substring(pos + 1);
				cfg.title = v.substring(0, pos);
			}
		}
		if ((v = mu._attr(el, "url")) !== null)
			cfg._url = v;
		if ((v = mu._attr(el, "prefix")) !== null)
			cfg.urlPrefix = v;
		cfg.history = mu._attrBool(el, "history", cfg.history);
		cfg.scroll = mu._attrBool(el, "scroll", cfg.scroll);
		cfg.morph = mu._attrBool(el, "morph", cfg.morph);
		cfg.transition = mu._attrBool(el, "transition", cfg.transition);
		// mu-method (get, post, put, patch, delete, sse)
		if ((v = mu._attr(el, "method")) !== null)
			cfg.method = v.toLowerCase();
		cfg.confirm = mu._attr(el, "confirm");
		cfg.patchHistory = mu._attrBool(el, "patch-history", false);
		// Mode-based defaults: non-navigation modes default to no history, no scroll
		if (cfg.mode !== "replace" && cfg.mode !== "update" && cfg.mode !== "patch") {
			if (mu._attr(el, "history") === null)
				cfg.history = false;
			if (mu._attr(el, "scroll") === null && cfg.scroll === null)
				cfg.scroll = false;
		}
		return (cfg);
	};

	/* ********** EVENT HANDLERS ********** */
	/**
	 * Click handler (event delegation on document).
	 * Intercepts clicks on <a> elements that pass _shouldProcess().
	 * Modifier keys (ctrl, meta, shift, alt) are ignored to allow
	 * native browser behavior (open in new tab, etc.).
	 * @param	{MouseEvent}	e	Click event.
	 */
	this._onClick = function(e) {
		// Track submit button (fallback for e.submitter on older browsers)
		mu._submitter = e.target.closest("button, input[type='submit'], input[type='image']");
		var el = e.target.closest("[mu-url], [data-mu-url], a");
		if (!el || !mu._shouldProcess(el))
			return;
		// Check trigger: only process if effective trigger is "click"
		if (mu._getTrigger(el) !== "click")
			return;
		// Links: check processLinks config
		if (el.tagName === "A" && !mu._cfg.processLinks)
			return;
		// Modifier keys: let browser handle (new tab, etc.)
		if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey)
			return;
		var cfg = mu._elemCfg(el);
		var url = mu._resolveUrl(cfg._url || el.getAttribute("href"));
		if (!url)
			return;
		e.preventDefault();
		cfg._sourceElement = el;
		// Default to GET if no method specified
		if (!cfg.method)
			cfg.method = "get";
		// Confirmation dialog
		if (cfg.confirm && !window.confirm(cfg.confirm))
			return;
		// Quit page confirmation
		if (mu._confirmQuit) {
			if (!window.confirm(cfg.confirmQuitText))
				return;
			mu.setConfirmQuit(false);
		}
		// Non-GET clicks: no history by default
		if (cfg.method !== "get") {
			if (mu._attr(el, "history") === null)
				cfg.history = false;
		}
		// SSE mode
		if (cfg.method === "sse") {
			mu._openSSE(url, el, cfg);
			return;
		}
		mu._loadExec(url, cfg);
	};
	/**
	 * Form submit handler (event delegation on document).
	 * Intercepts submissions of <form> elements that pass _shouldProcess().
	 * Runs HTML5 validation and optional custom validation before fetching.
	 * GET forms: data serialized as query string.
	 * POST forms: data sent as URL-encoded (or FormData for file uploads),
	 * history disabled by default.
	 * @param	{SubmitEvent}	e	Submit event.
	 */
	this._onSubmit = function(e) {
		var form = e.target.closest("form");
		if (!form || !mu._cfg.processForms || !mu._shouldProcess(form))
			return;
		// Check trigger: only process if effective trigger is "submit"
		if (mu._getTrigger(form) !== "submit")
			return;
		// HTML5 validation
		if (!form.reportValidity())
			return;
		// Custom validation via mu-validate attribute
		var validator = mu._attr(form, "validate");
		if (validator && typeof window[validator] === "function") {
			if (!window[validator](form))
				return;
		}
		var cfg = mu._elemCfg(form);
		// Determine method: mu-method takes priority, then form's method attribute
		var method = cfg.method || (form.getAttribute("method") || "get").toLowerCase();
		cfg.method = method;
		var url = mu._resolveUrl(cfg._url || form.getAttribute("action"));
		if (!url)
			return;
		cfg._sourceElement = form;
		e.preventDefault();
		var formData = new FormData(form);
		var submitter = e.submitter || mu._submitter;
		if (submitter && submitter.form === form && submitter.name) {
			formData.append(submitter.name, submitter.value || "");
		}
		if (method === "get") {
			var qs = new URLSearchParams(formData).toString();
			url = url + "?" + qs;
		} else {
			cfg.postData = (form.enctype === "multipart/form-data")
			               ? formData
			               : new URLSearchParams(formData);
			// Non-GET forms: no history by default, scroll to top in navigation mode
			if (mu._attr(form, "history") === null)
				cfg.history = false;
			if (cfg.scroll === null && cfg.mode !== "patch")
				cfg.scroll = true;
		}
		// Quit page confirmation: disable after submission
		mu.setConfirmQuit(false);
		mu._loadExec(url, cfg);
	};
	/**
	 * Input handler for quit-page confirmation tracking.
	 * Activated by event delegation on document. Listens for any input event
	 * inside a form that has the mu-confirm-quit attribute.
	 * @param	{InputEvent}	e	Input event.
	 */
	this._onInput = function(e) {
		var form = e.target.closest("form[mu-confirm-quit], form[data-mu-confirm-quit]");
		if (form)
			mu.setConfirmQuit(true);
	};
	/**
	 * Mouseover handler for link prefetch.
	 * Waits 50ms before fetching to filter out accidental hover-throughs.
	 * The result is stored in _prefetchCache and consumed on click.
	 * Skips prefetch if the link points to the current page.
	 * @param	{MouseEvent}	e	Mouseover event.
	 */
	this._onMouseOver = function(e) {
		if (!mu._cfg.prefetch)
			return;
		var el = e.target.closest("[mu-url], [data-mu-url], a");
		if (!el || !mu._shouldProcess(el))
			return;
		// Only prefetch elements with click trigger (not load, change, etc.)
		if (mu._getTrigger(el) !== "click")
			return;
		// Only prefetch GET requests (never prefetch post, put, patch, delete, sse)
		var method = mu._attr(el, "method");
		if (method && method.toLowerCase() !== "get")
			return;
		if (mu._attrBool(el, "prefetch", true) === false)
			return;
		var url = mu._resolveUrl(mu._attr(el, "url") || el.getAttribute("href"));
		if (!url)
			return;
		// Skip if already in-flight or still fresh (within TTL)
		var existing = mu._prefetchCache.get(url);
		if (existing && (Date.now() - existing.ts) < mu._cfg.prefetchTtl)
			return;
		// Skip if destination is the current page
		if (url === location.pathname + location.search)
			return;
		// Cancel any pending prefetch timer
		clearTimeout(mu._prefetchTimer);
		// Delay prefetch by 50ms to filter accidental hover-throughs
		mu._prefetchTimer = setTimeout(function() {
			mu._prefetchTimer = null;
			// Re-check cache (may have been populated during the delay)
			var cached = mu._prefetchCache.get(url);
			if (cached && (Date.now() - cached.ts) < mu._cfg.prefetchTtl)
				return;
			// Store the fetch promise so _loadExec can await it (even if still in-flight)
			var fetchUrl = mu._cfg.urlPrefix ? mu._cfg.urlPrefix + url : url;
			var prefetchHeaders = {};
			// Merge custom headers if provided
			if (mu._cfg.headers)
				Object.assign(prefetchHeaders, mu._cfg.headers);
			prefetchHeaders["X-Requested-With"] = "XMLHttpRequest";
			prefetchHeaders["X-Mu-Prefetch"] = "1";	
			var promise = fetch(fetchUrl, {
				headers: prefetchHeaders,
				priority: "low"
			})
			.then(function(r) { return (r.ok ? r.text() : null); })
			.catch(function() { return (null); });
			mu._prefetchCache.set(url, {promise: promise, ts: Date.now()});
		}, 50);
	};
	/**
	 * Mouseout handler. Cancels pending prefetch timer.
	 * Prefetch cache entries are NOT deleted on mouseout. The TTL mechanism
	 * in _loadExec handles expiration, and _onMouseOver handles stale entries.
	 * @param	{MouseEvent}	e	Mouseout event.
	 */
	this._onMouseOut = function(e) {
		if (mu._prefetchTimer) {
			clearTimeout(mu._prefetchTimer);
			mu._prefetchTimer = null;
		}
	};
	/**
	 * Popstate handler (browser back/forward buttons).
	 * Reloads the page from the stored history state.
	 * If no µJS state is found, falls back to native browser navigation.
	 * Restores scroll position after rendering if available in state.
	 * @param	{PopStateEvent}	e	PopState event.
	 */
	this._onPopState = function(e) {
		var state = e.state;
		if (!state || !state.mu)
			return;
		var cfg = Object.assign({}, mu._cfg);
		cfg.history = false;
		cfg.scroll = false; // don't auto-scroll, we restore manually
		cfg._popstate = true; // skip _saveScroll (wrong history entry during popstate)
		cfg._restoreScroll = state.scrollX !== undefined ? {x: state.scrollX, y: state.scrollY} : null;
		mu._loadExec(state.url, cfg);
	};
	/**
	 * Before-unload handler for quit-page confirmation.
	 * Shows a browser-native confirmation dialog if _confirmQuit is true.
	 * @param	{BeforeUnloadEvent}	e	BeforeUnload event.
	 */
	this._onBeforeUnload = function(e) {
		if (mu._confirmQuit) {
			e.preventDefault();
			e.returnValue = mu._cfg.confirmQuitText;
		}
	};

	/* ********** TRIGGERS ********** */
	/**
	 * Determine the effective trigger event for an element.
	 * Returns the mu-trigger attribute value if set, otherwise a default
	 * based on the element's tag name.
	 * @param	{Element}	el	DOM element.
	 * @return	{string}	Trigger name (click, submit, change, blur, focus, load).
	 */
	this._getTrigger = function(el) {
		// check given trigger
		var t = mu._attr(el, "trigger");
		if (t)
			return (t);
		// default trigger from tag name
		t = el.tagName;
		if (t === "FORM")
			return ("submit");
		if (t === "INPUT" || t === "TEXTAREA" || t === "SELECT")
			return ("change");
		return ("click");
	};
	/**
	 * Create a debounced version of a function.
	 * The returned function delays invocation until after `delay` milliseconds
	 * have elapsed since the last call.
	 * @param	{Function}	fn		Function to debounce.
	 * @param	{number}	delay	Delay in milliseconds.
	 * @return	{Function}	Debounced function.
	 */
	this._debounce = function(fn, delay) {
		var timer = null;
		return function() {
			clearTimeout(timer);
			timer = setTimeout(fn, delay);
		};
	};
	/**
	 * Execute a trigger action for an element.
	 * Builds configuration, determines URL and method, serializes input
	 * data, then calls _loadExec or _openSSE as appropriate.
	 * Used by change, blur, focus, and load triggers.
	 * @param	{Element}	el	DOM element with mu-url.
	 */
	this._triggerAction = function(el) {
		if (!mu._shouldProcess(el))
			return;
		var cfg = mu._elemCfg(el);
		var url = mu._resolveUrl(cfg._url || el.getAttribute("href") || el.getAttribute("action"));
		if (!url)
			return;
		cfg._sourceElement = el;
		// Mark as trigger load (not a navigation)
		cfg._trigger = true;
		// No view transitions for partial trigger loads
		cfg.transition = false;
		// Default to GET
		if (!cfg.method)
			cfg.method = "get";
		// Non-click/submit triggers default to no history, no scroll
		if (mu._attr(el, "history") === null)
			cfg.history = false;
		if (mu._attr(el, "scroll") === null && cfg.scroll === null)
			cfg.scroll = false;
		// Serialize form data for input elements
		var t = el.tagName;
		if (t === "INPUT" || t === "TEXTAREA" || t === "SELECT") {
			var form = el.closest("form");
			if (form) {
				if (cfg.method === "get") {
					var formData = new FormData(form);
					var qs = new URLSearchParams(formData).toString();
					url = url.split("?")[0] + "?" + qs;
				} else {
					cfg.postData = (form.enctype === "multipart/form-data")
					               ? new FormData(form)
					               : new URLSearchParams(new FormData(form));
				}
			} else if (el.name) {
				if (cfg.method === "get") {
					url = url.split("?")[0] + "?" + encodeURIComponent(el.name) + "=" + encodeURIComponent(el.value);
				}
			}
		}
		// SSE mode
		if (cfg.method === "sse") {
			mu._openSSE(url, el, cfg);
			return;
		}
		mu._loadExec(url, cfg);
	};
	/**
	 * Initialize trigger listeners on elements within a container.
	 * Scans for elements with mu-url or mu-trigger and attaches event
	 * listeners for triggers not handled by event delegation (change,
	 * blur, focus, load). Handles debounce and repeat (polling).
	 * Elements are marked with _mu_bound to prevent duplicate binding.
	 * @param	{Element}	container	DOM element to scan.
	 */
	this._initTriggers = function(container) {
		var els = container.querySelectorAll("[mu-url], [data-mu-url], [mu-trigger], [data-mu-trigger]");
		// Also check the container itself
		if (container.matches && container.matches("[mu-url], [data-mu-url], [mu-trigger], [data-mu-trigger]")) {
			var tmp = [container];
			for (var j = 0; j < els.length; j++)
				tmp.push(els[j]);
			els = tmp;
		}
		for (var i = 0; i < els.length; i++) {
			var el = els[i];
			if (el._mu_bound)
				continue;
			var trigger = mu._getTrigger(el);
			// click and submit are handled by event delegation
			if (trigger === "click" || trigger === "submit")
				continue;
			// Element must have a URL to be actionable
			var url = mu._attr(el, "url") || el.getAttribute("href") || el.getAttribute("action");
			if (!url)
				continue;
			el._mu_bound = true;
			var debounceMs = parseInt(mu._attr(el, "debounce"), 10) || 0;
			var repeatMs = parseInt(mu._attr(el, "repeat"), 10) || 0;
			// Build the base handler
			var handler = (function(targetEl) {
				return function() { mu._triggerAction(targetEl); };
			})(el);
			// Apply debounce if specified
			if (debounceMs > 0)
				handler = mu._debounce(handler, debounceMs);
			// Wrap with repeat (polling) if specified
			if (repeatMs > 0) {
				handler = (function(targetEl, fn, ms) {
					var started = false;
					return function() {
						fn();
						if (!started) {
							started = true;
							targetEl._mu_interval = setInterval(fn, ms);
						}
					};
				})(el, handler, repeatMs);
			}
			// Attach event listener(s) based on trigger type
			if (trigger === "change") {
				el.addEventListener("input", handler);
			} else if (trigger === "blur") {
				// Deduplicate change+blur firing close together
				var dedupHandler = (function(fn) {
					var lastFired = 0;
					return function() {
						var now = Date.now();
						if (now - lastFired < 50)
							return;
						lastFired = now;
						fn();
					};
				})(handler);
				el.addEventListener("change", dedupHandler);
				el.addEventListener("blur", dedupHandler);
			} else if (trigger === "focus") {
				el.addEventListener("focus", handler);
			} else if (trigger === "load") {
				handler();
			}
		}
	};
	/**
	 * Clean up trigger-related resources within a container.
	 * Clears polling intervals and closes SSE connections on elements
	 * that are about to be removed from the DOM.
	 * @param	{Element}	container	DOM element to clean up.
	 */
	this._cleanupTriggers = function(container) {
		var els = container.querySelectorAll ? container.querySelectorAll("*") : [];
		for (var i = 0; i < els.length; i++) {
			if (els[i]._mu_interval) {
				clearInterval(els[i]._mu_interval);
				els[i]._mu_interval = null;
			}
			if (els[i]._mu_sse) {
				els[i]._mu_sse.close();
				els[i]._mu_sse = null;
			}
			els[i]._mu_bound = false;
		}
		// Also check the container itself
		if (container._mu_interval) {
			clearInterval(container._mu_interval);
			container._mu_interval = null;
		}
		if (container._mu_sse) {
			container._mu_sse.close();
			container._mu_sse = null;
		}
		container._mu_bound = false;
	};
	/**
	 * Open a Server-Sent Events connection.
	 * Creates an EventSource for the given URL. Incoming messages are
	 * parsed as HTML and rendered via _renderPatch or _renderPage.
	 * The connection is stored on the element for cleanup.
	 * Note: EventSource does not support custom headers. Use query
	 * parameters for authentication or identification.
	 * @param	{string}	url	SSE endpoint URL.
	 * @param	{Element}	el	DOM element that initiated the connection.
	 * @param	{Object}	cfg	Effective configuration.
	 */
	this._openSSE = function(url, el, cfg) {
		// Close existing connection on this element
		if (el._mu_sse)
			el._mu_sse.close();
		var fetchUrl = cfg.urlPrefix ? cfg.urlPrefix + url : url;
		var source = new EventSource(fetchUrl);
		el._mu_sse = source;
		source.onmessage = function(e) {
			var detail = {url: url, html: e.data, config: cfg};
			if (!mu._emit("mu:before-render", detail))
				return;
			if (cfg.mode === "patch") {
				mu._renderPatch(detail.html, cfg);
			} else {
				mu._renderPage(detail.html, cfg);
			}
			mu._emit("mu:after-render", {url: url, finalUrl: url, mode: cfg.mode});
		};
		source.onerror = function() {
			mu._emit("mu:fetch-error", {url: url, fetchUrl: fetchUrl, error: new Error("SSE connection error")});
		};
	};

	/* ********** CORE LOADING ********** */
	/**
	 * Fetch a URL and render it into the page.
	 * Handles prefetch cache, abort of in-flight requests, progress bar,
	 * view transitions, history management, and scroll behavior.
	 * @param	{string}	url	URL to fetch.
	 * @param	{Object}	cfg	Effective configuration.
	 */
	this._loadExec = async function(url, cfg) {
		var fetchUrl = cfg.urlPrefix ? cfg.urlPrefix + url : url;
		// Save current scroll position (skip for trigger loads and popstate)
		if (!cfg._trigger && !cfg._popstate)
			mu._saveScroll();
		// Emit before-fetch event (cancelable)
		if (!mu._emit("mu:before-fetch", {url: url, fetchUrl: fetchUrl, config: cfg, sourceElement: cfg._sourceElement || null}))
			return;
		// Abort controller: trigger loads use a local controller to avoid
		// interfering with the global navigation abort controller.
		var abortCtrl;
		if (cfg._trigger) {
			abortCtrl = new AbortController();
		} else {
			if (mu._abortCtrl)
				mu._abortCtrl.abort();
			abortCtrl = mu._abortCtrl = new AbortController();
		}
		if (!cfg._trigger)
			mu._showProgress();
		try {
			var html = null;
			var resp = null;
			var finalUrl = url;
			// Check prefetch cache (with TTL validation)
			// The cache stores {promise, ts} — the promise resolves to HTML or null.
			// This allows _loadExec to await an in-flight prefetch instead of
			// starting a duplicate request.
			// Non-GET requests are never served from cache.
			var method = cfg.method || "get";
			var cached = mu._prefetchCache.get(url);
			if (method === "get" && cached && cached.promise && (Date.now() - cached.ts) < mu._cfg.prefetchTtl) {
				html = await cached.promise;
				if (abortCtrl.signal.aborted)
					return;
			}
			if (!html) {
				// Build fetch options
				var fetchOpts = {
					signal: abortCtrl.signal,
					headers: {}
				};
				if (method !== "get") {
					fetchOpts.headers["X-Mu-Method"] = fetchOpts.method = method.toUpperCase();
					if (cfg.postData)
						fetchOpts.body = cfg.postData;
				}
				// Merge custom headers if provided
				if (cfg.headers)
					Object.assign(fetchOpts.headers, cfg.headers);
				fetchOpts.headers["X-Requested-With"] = "XMLHttpRequest";
				fetchOpts.headers["X-Mu-Mode"] = cfg.mode;
				resp = await fetch(fetchUrl, fetchOpts);
				if (!resp.ok) {
					mu._emit("mu:fetch-error", {url: url, fetchUrl: fetchUrl, status: resp.status, response: resp});
					return;
				}
				if (resp.redirected)
					finalUrl = new URL(resp.url).pathname + new URL(resp.url).search;
				html = await resp.text();
			}
			// Refresh the prefetch cache with a fresh timestamp (GET only).
			// The View Transition API renders asynchronously, which causes
			// the browser to fire a new mouseover after the DOM update.
			// Without a fresh cache entry, _onMouseOver would start a
			// duplicate prefetch for the URL that was just loaded.
			if (!cfg._trigger && method === "get")
				mu._prefetchCache.set(url, {promise: Promise.resolve(html), ts: Date.now()});
			// Emit before-render (cancelable, allows html modification)
			var detail = {url: url, finalUrl: finalUrl, html: html, config: cfg};
			if (!mu._emit("mu:before-render", detail))
				return;
			// Compute effective history (used for pushState and title update)
			if (cfg.mode === "patch") {
				cfg._addHistory = cfg.patchHistory;
			} else {
				cfg._addHistory = cfg.history;
				if (resp && resp.redirected)
					cfg._addHistory = true;
			}
			// Post-render tasks: history, scroll, event emission.
			// Grouped in a function so it runs after the DOM update regardless
			// of whether View Transitions are used (async) or not (sync).
			var postRender = function() {
				// History management
				mu._previousUrl = mu._lastUrl;
				mu._lastUrl = finalUrl;
				if (cfg._addHistory)
					window.history.pushState({mu: true, url: finalUrl}, "", finalUrl);
				// Scroll management (not for patch mode)
				if (cfg.mode !== "patch") {
					if (cfg._restoreScroll) {
						// Restore scroll position from history state (back/forward)
						window.scrollTo(cfg._restoreScroll.x, cfg._restoreScroll.y);
					} else {
						var shouldScroll = cfg.scroll !== null ? cfg.scroll : true;
						if (shouldScroll) {
							var hashIdx = url.indexOf("#");
							if (hashIdx !== -1) {
								var anchor = document.getElementById(url.substring(hashIdx + 1));
								if (anchor)
									anchor.scrollIntoView({behavior: "smooth"});
							} else {
								window.scrollTo(0, 0);
							}
						}
					}
				}
				// Reset quit confirmation
				mu.setConfirmQuit(false);
				// Emit after-render
				mu._emit("mu:after-render", {url: url, finalUrl: finalUrl, mode: cfg.mode});
			};
			// Build the DOM update function
			var applyDom;
			if (cfg.mode === "patch") {
				applyDom = function() { mu._renderPatch(detail.html, cfg); };
			} else {
				applyDom = function() { mu._renderPage(detail.html, cfg); };
			}
			// Wrap in View Transition if enabled and supported.
			// startViewTransition runs the callback asynchronously (after
			// capturing the old visual state), so post-render tasks must
			// wait for the updateCallbackDone promise.
			if (cfg.transition && document.startViewTransition) {
				document.startViewTransition(applyDom).updateCallbackDone.then(postRender);
			} else {
				applyDom();
				postRender();
			}
		} catch (err) {
			if (err.name === "AbortError")
				return;
			mu._emit("mu:fetch-error", {url: url, fetchUrl: fetchUrl, error: err});
		} finally {
			if (!cfg._trigger)
				mu._hideProgress();
		}
	};

	/* ********** PAGE RENDERING (navigation mode) ********** */
	/**
	 * Parse fetched HTML and inject it into the current page.
	 * Handles source/target selection, mode application, title update,
	 * head merging, and script execution.
	 * @param	{string}	html	Raw HTML string (full page).
	 * @param	{Object}	cfg	Effective configuration.
	 */
	this._renderPage = function(html, cfg) {
		var doc = new DOMParser().parseFromString(html, "text/html");
		// Find source node in fetched document
		var sourceNode = null;
		if (cfg.source)
			sourceNode = doc.querySelector(cfg.source);
		if (!sourceNode)
			sourceNode = doc.body;
		// Find target node in current page
		var resolvedTarget = mu._resolveTarget(cfg.target, cfg._sourceElement);
		var targetNode = document.querySelector(resolvedTarget);
		if (!targetNode) {
			console.warn("[µJS] Target element '" + resolvedTarget + "' not found.");
			return;
		}
		// Clean up triggers before replacing content
		mu._cleanupTriggers(targetNode);
		// Apply injection mode
		mu._applyMode(cfg.mode, targetNode, sourceNode, cfg);
		// Update page title (skip when no history)
		if (cfg._addHistory)
			mu._updateTitle(doc, cfg);
		// Merge <head> elements (additive: add missing assets, never remove)
		mu._mergeHead(doc);
		// Execute scripts in injected content
		var container = document.querySelector(resolvedTarget) || document.body;
		mu._runScripts(container);
		// Initialize triggers in new content
		mu._initTriggers(container);
	};

	/* ********** PATCH RENDERING ********** */
	/**
	 * Process patch fragments from fetched HTML.
	 * Iterates over all elements with a mu-patch-target attribute and
	 * injects each one into the current page according to its mu-patch-mode.
	 * The mu-patch-* attributes are preserved on injected nodes.
	 * @param	{string}	html	Raw HTML string containing patch fragments.
	 * @param	{Object}	cfg	Effective configuration.
	 */
	this._renderPatch = function(html, cfg) {
		var doc = new DOMParser().parseFromString(html, "text/html");
		// Find all patch fragments
		var fragments = doc.querySelectorAll("[mu-patch-target], [data-mu-patch-target]");
		var patchedSelectors = [];
		for (var i = 0; i < fragments.length; i++) {
			var frag = fragments[i];
			var targetSel = frag.getAttribute("mu-patch-target") || frag.getAttribute("data-mu-patch-target");
			targetSel = mu._resolveTarget(targetSel, cfg._sourceElement);
			var mode = frag.getAttribute("mu-patch-mode") || frag.getAttribute("data-mu-patch-mode") || "replace";
			// Find the target in the current page
			var targetNode = document.querySelector(targetSel);
			if (!targetNode) {
				console.warn("[µJS] Patch target '" + targetSel + "' not found.");
				continue;
			}
			// Clean up triggers before replacing content
			mu._cleanupTriggers(targetNode);
			// Apply injection mode
			mu._applyMode(mode, targetNode, frag, cfg);
			// Execute scripts in injected fragment
			if (mode !== "remove") {
				// For replace: the new node is now in the DOM at the target's position
				// For append/prepend/before/after: the fragment is now in the DOM
				// We run scripts on the injected node itself
				mu._runScripts(frag);
				patchedSelectors.push(targetSel);
			}
		}
		// Initialize triggers in patched areas
		for (var j = 0; j < patchedSelectors.length; j++) {
			var patched = document.querySelector(patchedSelectors[j]);
			if (patched)
				mu._initTriggers(patched);
		}
	};

	/* ********** DOM INJECTION ********** */
	/**
	 * Apply an injection mode to insert source content into a target node.
	 * Uses morphing for "replace" and "update" modes when available and enabled.
	 * For "prepend", "append", "before", "after": inserts the source node directly.
	 * @param	{string}	mode		Injection mode.
	 * @param	{Element}	targetNode	Destination DOM element.
	 * @param	{Element}	sourceNode	Source DOM element to inject.
	 * @param	{Object}	cfg		Configuration (used for morph flag).
	 */
	this._applyMode = function(mode, targetNode, sourceNode, cfg) {
		var useMorph = cfg.morph && mu._morph;
		switch (mode) {
			case "update":
				if (useMorph) {
					mu._morph(targetNode, sourceNode.innerHTML, {morphStyle: "innerHTML"});
				} else {
					targetNode.innerHTML = sourceNode.innerHTML;
				}
				break;
			case "prepend":
				targetNode.prepend(sourceNode);
				break;
			case "append":
				targetNode.append(sourceNode);
				break;
			case "before":
				targetNode.before(sourceNode);
				break;
			case "after":
				targetNode.after(sourceNode);
				break;
			case "remove":
				targetNode.remove();
				break;
			case "none":
				break;
			case "replace":
			default:
				// Cannot replace <body> with replaceWith(); use innerHTML instead
				if (targetNode.tagName === "BODY" && sourceNode.tagName === "BODY") {
					if (useMorph) {
						mu._morph(targetNode, sourceNode.innerHTML, {morphStyle: "innerHTML"});
					} else {
						targetNode.innerHTML = sourceNode.innerHTML;
					}
				} else {
					if (useMorph) {
						mu._morph(targetNode, sourceNode.outerHTML, {morphStyle: "outerHTML"});
					} else {
						targetNode.replaceWith(sourceNode);
					}
				}
				break;
		}
	};

	/* ********** PAGE METADATA ********** */
	/**
	 * Update the page title from the fetched document.
	 * Supports "selector/attribute" syntax: if the title selector contains
	 * a slash, the part after the slash is used as an attribute name.
	 * @param	{Document}	doc	Parsed document.
	 * @param	{Object}	cfg	Configuration.
	 */
	this._updateTitle = function(doc, cfg) {
		if (!cfg.title)
			return;
		var el = doc.querySelector(cfg.title);
		if (!el)
			return;
		var text = cfg._titleAttr ? el.getAttribute(cfg._titleAttr) : el.textContent;
		if (text)
			document.title = text;
	};
	/**
	 * Merge <head> elements from fetched document into current page.
	 * Additive only: adds missing stylesheets, styles, and scripts.
	 * Never removes existing elements.
	 * Scripts are created as new elements to ensure browser execution.
	 * @param	{Document}	doc	Parsed document.
	 */
	this._mergeHead = function(doc) {
		var selector = "link[rel='stylesheet'], style, script";
		var oldEls = document.head.querySelectorAll(selector);
		var newEls = doc.head.querySelectorAll(selector);
		// Build set of existing element keys
		var oldKeys = new Set();
		for (var i = 0; i < oldEls.length; i++)
			oldKeys.add(mu._elKey(oldEls[i]));
		// Add new elements not already present
		for (var i = 0; i < newEls.length; i++) {
			if (oldKeys.has(mu._elKey(newEls[i])))
				continue;
			if (newEls[i].tagName.toUpperCase() === "SCRIPT") {
				// Create a fresh script element (DOMParser scripts are inert)
				var s = document.createElement("script");
				for (var j = 0; j < newEls[i].attributes.length; j++)
					s.setAttribute(newEls[i].attributes[j].name, newEls[i].attributes[j].value);
				s.textContent = newEls[i].textContent;
				// Track external scripts to prevent re-loading by _runScripts
				if (s.hasAttribute("src"))
					mu._jsIncludes[s.getAttribute("src")] = true;
				document.head.appendChild(s);
			} else {
				document.head.appendChild(newEls[i].cloneNode(true));
			}
		}
	};
	/**
	 * Generate a unique key for a <head> element, used for deduplication.
	 * @param	{Element}	el	DOM element (link, style, or script).
	 * @return	{string}	Unique identifier string.
	 */
	this._elKey = function(el) {
		var tag = el.tagName.toUpperCase();
		if (tag === "LINK")
			return ("link:" + el.getAttribute("href"));
		if (tag === "STYLE")
			return ("style:" + el.textContent.substring(0, 100));
		if (tag === "SCRIPT")
			return ("script:" + (el.getAttribute("src") || el.textContent.substring(0, 100)));
		return (el.outerHTML);
	};

	/* ********** SCRIPT EXECUTION ********** */
	/**
	 * Execute <script> tags found in a container.
	 * Creates new script elements to force browser re-evaluation.
	 * External scripts (with src) are loaded only once (tracked in _jsIncludes).
	 * Scripts with mu-disabled are skipped.
	 * @param	{Element}	container	DOM element to search for scripts.
	 */
	this._runScripts = function(container) {
		var scripts = container.querySelectorAll("script");
		for (var i = 0; i < scripts.length; i++) {
			var old = scripts[i];
			// Skip disabled scripts
			if (mu._attr(old, "disabled") === "true" || mu._attr(old, "disabled") === "")
				continue;
			// Skip already-loaded external scripts
			if (old.hasAttribute("src")) {
				var src = old.getAttribute("src");
				if (mu._jsIncludes[src])
					continue;
				mu._jsIncludes[src] = true;
			}
			// Create a new script element (forces browser re-evaluation)
			var s = document.createElement("script");
			for (var j = 0; j < old.attributes.length; j++)
				s.setAttribute(old.attributes[j].name, old.attributes[j].value);
			s.textContent = old.textContent;
			old.parentNode.replaceChild(s, old);
		}
	};

	/* ********** PROGRESS BAR ********** */
	/**
	 * Show the progress bar at the top of the page.
	 * Creates the element on first call. The bar animates to 70% width
	 * while the request is in progress.
	 */
	this._showProgress = function() {
		if (!mu._cfg.progress)
			return;
		if (!mu._progressEl) {
			mu._progressEl = document.createElement("div");
			mu._progressEl.id = "mu-progress";
			mu._progressEl.style.cssText = "position:fixed;top:0;left:0;height:3px;background:#29d;z-index:99999;transition:width .3s ease;width:0";
		}
		document.body.appendChild(mu._progressEl);
		mu._progressEl.offsetWidth; // force reflow
		mu._progressEl.style.width = "70%";
	};
	/**
	 * Hide the progress bar.
	 * Animates to 100% width, then resets and removes the element.
	 */
	this._hideProgress = function() {
		if (!mu._progressEl)
			return;
		mu._progressEl.style.width = "100%";
		setTimeout(function() {
			if (!mu._progressEl)
				return;
			mu._progressEl.style.transition = "none";
			mu._progressEl.style.width = "0";
			mu._progressEl.offsetWidth; // force reflow
			mu._progressEl.style.transition = "width .3s ease";
			mu._progressEl.remove();
		}, 200);
	};

	/* ********** SCROLL MANAGEMENT ********** */
	/**
	 * Save the current scroll position into the current history state.
	 * Called before each navigation so that popstate can restore it.
	 */
	this._saveScroll = function() {
		var state = window.history.state;
		if (state && state.mu) {
			state.scrollX = window.scrollX;
			state.scrollY = window.scrollY;
			window.history.replaceState(state, "");
		}
	};

	/* ********** EVENT EMITTER ********** */
	/**
	 * Dispatch a CustomEvent on the document.
	 * Automatically adds lastUrl and previousUrl to the detail object.
	 * @param	{string}	name	Event name (e.g. "mu:before-fetch").
	 * @param	{Object}	[detail]	Event detail data.
	 * @return	{boolean}	False if the event was canceled via preventDefault().
	 */
	this._emit = function(name, detail) {
		detail = detail || {};
		detail.lastUrl = mu._lastUrl;
		detail.previousUrl = mu._previousUrl;
		var ev = new CustomEvent(name, {
			bubbles: true,
			cancelable: true,
			detail: detail
		});
		return (document.dispatchEvent(ev));
	};
};

