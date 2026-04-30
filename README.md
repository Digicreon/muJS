<p align="center"><a href="https://mujs.org/" target="_blank">
	<img src="https://static.digicreon.com/main/mujs/favicon-128x128.png" alt="µJS logo">
</a></p>

# µJS (muJS)

**Lightweight AJAX navigation library — accelerate your website without a JS framework.**

µJS intercepts clicks on links and form submissions to load pages via AJAX instead of full browser navigation. The fetched content replaces part (or all) of the current page, making navigation faster and smoother.

No build step required. No dependencies. No framework. Just a single `<script>` tag.

Inspired by [pjax](https://github.com/defunkt/jquery-pjax), [Turbo](https://turbo.hotwired.dev/) and [HTMX](https://htmx.org/), µJS aims to be simpler and lighter while covering the most common use cases.

- 🚀 **Fast** — Prefetch on hover, no full page reload, progress bar
- 🪶 **Lightweight** — Single file, ~5 KB gzipped, zero dependencies
- 🔌 **Drop-in** — Works with any backend (PHP, Python, Ruby, Go…), no server-side changes needed
- 🧩 **Patch mode** — Update multiple page fragments in a single request
- 🎯 **Triggers** — Any element, any event: live search, polling, focus actions
- 🔄 **HTTP verbs** — GET, POST, PUT, PATCH, DELETE on links, buttons, and forms
- 📡 **SSE** — Real-time updates via Server-Sent Events
- ✨ **Modern** — View Transitions, DOM morphing (via idiomorph), `fetch` API, event delegation


## Table of contents

- [Installation](#installation)
- [Quick start](#quick-start)
- [Modes](#modes)
- [Patch mode](#patch-mode)
- [Forms](#forms)
- [HTTP methods](#http-methods)
- [HTTP headers](#http-headers)
- [Triggers](#triggers)
- [Server-Sent Events (SSE)](#server-sent-events-sse)
- [History & Scroll](#history--scroll)
- [Scroll restoration](#scroll-restoration)
- [Prefetch](#prefetch)
- [DOM morphing](#dom-morphing)
- [View Transitions](#view-transitions)
- [Scripts](#scripts)
- [Progress bar](#progress-bar)
- [Events](#events)
- [Attributes reference](#attributes-reference)
- [Configuration reference](#configuration-reference)
- [Programmatic API](#programmatic-api)
- [Browser support](#browser-support)
- [License](#license)


## Installation

### Via `<script>` tag (recommended)

Place the scripts at the end of `<body>`, after all your HTML content. This ensures the DOM is ready when µJS initializes.

```html
<body>
    <!-- your content -->
    <script src="/path/to/mu.min.js"></script>
    <script>mu.init();</script>
</body>
```

### Via CDN

```html
<!-- unpkg -->
<script src="https://unpkg.com/@digicreon/mujs/dist/mu.min.js"></script>

<!-- jsDelivr -->
<script src="https://cdn.jsdelivr.net/npm/@digicreon/mujs/dist/mu.min.js"></script>

<script>mu.init();</script>
```

With [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) (SRI):

```html
<!-- unpkg -->
<script src="https://unpkg.com/@digicreon/mujs@1.4.8/dist/mu.min.js"
        integrity="sha384-x9kao8F430kRoLUGlLYGRC2FPo+rCsVlMUItQA1zbf0ZsIcht6wv8nikdx/Prqh2"
        crossorigin="anonymous"></script>

<!-- jsDelivr -->
<script src="https://cdn.jsdelivr.net/npm/@digicreon/mujs@1.4.8/dist/mu.min.js"
        integrity="sha384-x9kao8F430kRoLUGlLYGRC2FPo+rCsVlMUItQA1zbf0ZsIcht6wv8nikdx/Prqh2"
        crossorigin="anonymous"></script>

<script>mu.init();</script>
```

### Via npm

```bash
npm install @digicreon/mujs
```


## Quick start

After calling `mu.init()`, all same-origin links are automatically intercepted. Clicking a link fetches the page via AJAX and replaces the current `<body>` with the fetched `<body>`. The page title is updated automatically. Browser history (back/forward buttons) works as expected.

µJS handles absolute paths (`/about`), relative URLs (`about`, `../about`), and absolute same-origin URLs (`https://yoursite.com/about`). If your site uses a `<base>` tag, relative URLs are resolved accordingly. Note that only the `<base>` tag from the initially loaded page is used; `<base>` tags in dynamically fetched pages are not applied.

```html
<!DOCTYPE html>
<html>
<head>
    <title>My site</title>
</head>
<body>
    <!-- These links are automatically handled by µJS -->
    <nav>
        <a href="/">Home</a>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
    </nav>

    <main id="content">
        <p>Page content here.</p>
    </main>

    <!-- This link is NOT handled (external URL) -->
    <a href="https://example.com">External link</a>

    <!-- This link is NOT handled (has target attribute) -->
    <a href="/page" target="_blank">Opens in new tab</a>

    <!-- This link is NOT handled (has download attribute) -->
    <a href="/file.pdf" download>Download PDF</a>

    <!-- This link is NOT handled (explicitly disabled) -->
    <a href="/page" mu-disabled>Disabled link</a>

    <script src="/path/to/mu.min.js"></script>
    <script>mu.init();</script>
</body>
</html>
```

To replace only a fragment of the page instead of the whole body:

```html
<a href="/about" mu-target="#content" mu-source="#content">About</a>
```

This fetches `/about`, extracts the `#content` element from the response, and replaces the current `#content` with it.


## Modes

The `mu-mode` attribute controls how fetched content is injected into the page. Default: `replace`.

| Mode | Description |
|---|---|
| `replace` | Replace the target node with the source node (default). |
| `update` | Replace the inner content of the target with the source's inner content. |
| `prepend` | Insert the source node at the beginning of the target. |
| `append` | Insert the source node at the end of the target. |
| `before` | Insert the source node before the target. |
| `after` | Insert the source node after the target. |
| `remove` | Remove the target node (source is ignored). |
| `none` | Do nothing to the DOM (events are still fired). |
| `patch` | Process multiple targeted fragments (see [Patch mode](#patch-mode)). |

Example:

```html
<a href="/notifications" mu-mode="update" mu-target="#notifs" mu-source="#notifs">
    Refresh notifications
</a>
```


## Patch mode

Patch mode allows a single request to update multiple parts of the page. The server returns HTML fragments, each annotated with a target and an optional mode.

### Link triggering a patch

```html
<a href="/api/comments/new" mu-mode="patch">Add comment</a>
```

### Server response

The server returns plain HTML. Each element with a `mu-patch-target` attribute is a patch fragment:

```html
<!-- Replaces #comment-42 (default mode: replace) -->
<div class="comment" mu-patch-target="#comment-42">
    Updated comment text
</div>

<!-- Appends a new comment to #comments -->
<div class="comment" mu-patch-target="#comments" mu-patch-mode="append">
    New comment
</div>

<!-- Updates the page title -->
<title mu-patch-target="title">New page title</title>

<!-- Adds a stylesheet -->
<link rel="stylesheet" href="/css/gallery.css"
      mu-patch-target="head" mu-patch-mode="append">

<!-- Removes an element -->
<div mu-patch-target="#old-banner" mu-patch-mode="remove"></div>
```

Patch fragments are standard HTML elements — no special tags needed. The `mu-patch-*` attributes are preserved on injected nodes for debugging.

The `mu-patch-mode` attribute accepts the same values as `mu-mode` (except `patch` and `none`). Default is `replace`.

### Patch and browser history

By default, patch mode does not modify browser history. To add the URL to history:

```html
<a href="/products?cat=3" mu-mode="patch" mu-patch-history="true">Filter</a>
```


## Forms

µJS intercepts form submissions. HTML5 validation (`reportValidity()`) is checked before any request. When a form has multiple submit buttons with different `name`/`value` attributes, µJS includes the clicked button's data in the submission.

### GET forms

Data is serialized as a query string. Behaves like a link.

```html
<form action="/search" method="get" mu-target="#results" mu-source="#results">
    <input type="text" name="q">
    <button type="submit">Search</button>
</form>
```

### POST forms

Data is sent as `application/x-www-form-urlencoded` by default. Add `enctype="multipart/form-data"` for file uploads. History is disabled by default (POST responses should not be replayed via the browser back button).

```html
<form action="/comment/create" method="post">
    <textarea name="body"></textarea>
    <button type="submit">Send</button>
</form>
```

### PUT / PATCH / DELETE forms

Use `mu-method` to override the HTTP method. The form data is sent like POST (`application/x-www-form-urlencoded` by default).

```html
<!-- PUT form -->
<form action="/api/user/1" mu-method="put">
    <input type="text" name="name">
    <button type="submit">Update</button>
</form>

<!-- DELETE form (no data needed) -->
<form action="/api/user/1" mu-method="delete">
    <button type="submit">Delete</button>
</form>
```

### POST form with patch response

```html
<form action="/comment/create" method="post" mu-mode="patch">
    <textarea name="body"></textarea>
    <button type="submit">Send</button>
</form>
```

Server response:

```html
<div class="comment" mu-patch-target="#comments" mu-patch-mode="append">
    <p>The new comment</p>
</div>

<form action="/comment/create" method="post" mu-patch-target="#comment-form">
    <textarea name="body"></textarea>
    <button type="submit">Send</button>
</form>
```

The new comment is appended to the list, and the form is replaced with a blank version.

### Custom validation

```html
<form action="/save" method="post" mu-validate="myValidator">...</form>
<script>
function myValidator(form) {
    return form.querySelector('#name').value.length > 0;
}
</script>
```

### Quit-page confirmation

Add `mu-confirm-quit` to a form. If any input is modified, the user is prompted before navigating away:

```html
<form action="/save" method="post" mu-confirm-quit>
    <input type="text" name="title">
    <button type="submit">Save</button>
</form>
```


## HTTP methods

By default, links use GET and forms use their `method` attribute. The `mu-method` attribute overrides the HTTP method for any element.

Supported values: `get`, `post`, `put`, `patch`, `delete`, `sse`.

```html
<!-- DELETE button -->
<button mu-url="/api/item/42" mu-method="delete" mu-mode="remove" mu-target="#item-42">
    Delete
</button>

<!-- PUT link -->
<a href="/api/publish/5" mu-method="put" mu-mode="none">Publish</a>
```

## HTTP headers

µJS sends the following HTTP headers with each request:

| Header | Value | Sent when |
|---|---|---|
| `X-Requested-With` | `XMLHttpRequest` | Always |
| `X-Mu-Mode` | Current injection mode | Always |
| `X-Mu-Method` | HTTP method (`POST`, `PUT`, `PATCH`, `DELETE`) | Non-GET requests only |
| `X-Mu-Prefetch` | `1` | Prefetch requests only |

These headers allow the server to detect µJS requests and adapt its response (e.g. return a fragment instead of a full page, skip analytics, return lighter content on prefetch).

### Custom headers

You can send additional HTTP headers with every request by setting the `headers` option in the configuration:

```javascript
mu.init({
    headers: {
        "Authorization": "Bearer " + myToken,
        "Accept-Language": "fr-FR"
    }
});
```

These headers are merged into both regular and prefetch requests. µJS's internal headers (`X-Requested-With`, `X-Mu-Mode`, `X-Mu-Method`, `X-Mu-Prefetch`) always take precedence and cannot be overridden through this option.

For per-request or dynamic headers (e.g. a fresh CSRF token on each request), listen to the `mu:before-fetch` event and modify `event.detail.config` instead.


## Triggers

µJS supports custom event triggers via the `mu-trigger` attribute. This allows any element with a `mu-url` to initiate a fetch on events other than click or submit.

### Default triggers

When `mu-trigger` is absent, the trigger depends on the element type:

| Element | Default trigger |
|---|---|
| `<a>` | `click` |
| `<form>` | `submit` |
| `<input>`, `<textarea>`, `<select>` | `change` |
| Any other element | `click` |

### Available triggers

| Trigger | Browser event(s) | Typical elements |
|---|---|---|
| `click` | `click` | Any element (default for `<a>`, `<button>`, `<div>`...) |
| `submit` | `submit` | `<form>` |
| `change` | `input` | `<input>`, `<textarea>`, `<select>` |
| `blur` | `change` + `blur` (deduplicated) | `<input>`, `<textarea>`, `<select>` |
| `focus` | `focus` | `<input>`, `<textarea>`, `<select>` |
| `load` | *(fires immediately when rendered)* | Any element |

### Examples

**Live search with debounce:**

```html
<input type="text" name="q"
       mu-trigger="change" mu-debounce="500"
       mu-url="/search" mu-target="#results" mu-source="#results"
       mu-mode="update">
```

**Action on focus (e.g. load suggestions):**

```html
<input type="text" mu-trigger="focus"
       mu-url="/suggestions" mu-target="#suggestions" mu-mode="update">
```

**Action on blur (save on field exit):**

```html
<input type="text" name="title" mu-trigger="blur"
       mu-url="/api/save" mu-method="put" mu-target="#status" mu-mode="update">
```

**Load content immediately:**

```html
<div mu-trigger="load"
     mu-url="/sidebar" mu-target="#sidebar" mu-mode="update">
</div>
```

### Polling

Combine `mu-trigger="load"` with `mu-repeat` to poll a URL at regular intervals:

```html
<div mu-trigger="load" mu-repeat="5000"
     mu-url="/notifications" mu-target="#notifs" mu-mode="update">
</div>
```

The first fetch fires immediately, then every 5 seconds. Polling intervals are automatically cleaned up when the element is removed from the DOM.

### Debounce

Use `mu-debounce` to delay the fetch until the user stops interacting:

```html
<input type="text" name="q" mu-debounce="300"
       mu-url="/search" mu-target="#results" mu-mode="update">
```

> **Note:** Triggers other than `click` and `submit` default to no browser history entry and no scroll (`mu-history="false"`, `mu-scroll="false"`).


## Server-Sent Events (SSE)

µJS supports real-time updates via Server-Sent Events. Set `mu-method="sse"` to open an `EventSource` connection instead of a one-shot fetch.

```html
<div mu-trigger="load" mu-url="/chat/stream"
     mu-mode="patch" mu-method="sse">
</div>
```

Each incoming SSE message is treated as HTML and rendered according to the element's `mu-mode`. In patch mode, the server sends HTML fragments with `mu-patch-target` attributes, just like a regular patch response.

### Server-side example

```
event: message
data: <div mu-patch-target="#messages" mu-patch-mode="append"><p>New message!</p></div>

event: message
data: <span mu-patch-target="#online-count">42</span>
```

### Limitations

- **No custom headers**: `EventSource` does not support custom HTTP headers. Use query parameters for authentication (e.g. `mu-url="/stream?token=abc"`).
- **Connection limit**: Browsers allow ~6 SSE connections per domain in HTTP/1.1. Use HTTP/2 to avoid this limit.
- **Automatic cleanup**: SSE connections are closed when the element is removed from the DOM (e.g. when the page changes).


## History & Scroll

`mu-history` controls whether the URL is added to browser history. `mu-scroll` controls whether the page scrolls to top after rendering. Both attributes are independent.

```html
<!-- Skip history on a link -->
<a href="/panel" mu-history="false">Open panel</a>

<!-- Skip history globally -->
<script>mu.init({ history: false });</script>

<!-- Scroll to top without adding history -->
<a href="/page" mu-history="false" mu-scroll="true">Link</a>
```

Defaults for `mu-history` and `mu-scroll` depend on the mode and context:

| Mode | Context | `mu-history` | `mu-scroll` |
|---|---|---|---|
| `replace`, `update` | Links (GET) | `true` | `true` |
| `replace`, `update` | Forms (GET) | `true` | `true` |
| `replace`, `update` | Forms (POST/PUT/PATCH/DELETE) | `false` | `true` |
| `replace`, `update` | Triggers (change, blur, focus, load) | `false` | `false` |
| `replace`, `update` | SSE | `false` | `false` |
| `append`, `prepend`, `before`, `after`, `remove`, `none` | Any | `false` | `false` |
| `patch` | Any | `false` | `false` |

Redirections always add the URL to browser history, regardless of the `mu-history` setting. In patch mode, use `mu-patch-history="true"` to add the URL to history.


## Scroll restoration

When the user navigates with the browser's back/forward buttons, µJS automatically restores the scroll position to where it was before leaving the page. This works out of the box — no configuration needed.


## Prefetch

When enabled (default), µJS fetches the target page when the user hovers over a link, before they click. A 50ms delay filters accidental hover-throughs (mouse passing over a link without intent to click). This saves ~100-300ms of perceived loading time.

The prefetch cache stores one entry per URL and is consumed on click. Prefetch only applies to GET requests — elements with `mu-method="post"`, `put`, `patch`, `delete` or `sse` are never prefetched.

```html
<!-- Disable prefetch on a specific link -->
<a href="/heavy-page" mu-prefetch="false">Heavy page</a>

<!-- Disable prefetch globally -->
<script>mu.init({ prefetch: false });</script>
```


## DOM morphing

When a morph library is available, µJS uses it for `replace` and `update` modes to preserve DOM state (input focus, scroll positions, video playback, CSS transitions, etc.).

µJS auto-detects [idiomorph](https://github.com/bigskysoftware/idiomorph). Just load it before µJS:

```html
<script src="/path/to/idiomorph.js"></script>
<script src="/path/to/mu.min.js"></script>
<script>mu.init();</script>
```

If idiomorph is not loaded, µJS falls back to direct DOM replacement. No error, no warning.

Disable morphing globally or per-element:

```html
<!-- Globally -->
<script>mu.init({ morph: false });</script>

<!-- Per-element -->
<a href="/page" mu-morph="false">Link</a>
```

To use a different morph library:

```javascript
mu.init();
mu.setMorph(function(target, html, opts) {
    myMorphLib.morph(target, html, opts);
});
```


## View Transitions

µJS uses the [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition) when supported by the browser, providing smooth animated transitions between page states.

Enabled by default. Falls back silently on unsupported browsers.

```html
<!-- Disable globally -->
<script>mu.init({ transition: false });</script>

<!-- Disable per-element -->
<a href="/page" mu-transition="false">Link</a>
```


## Scripts

When µJS loads a page, scripts are handled differently depending on their location:

- **`<head>` scripts** are merged additively. If a script (identified by its `src` or content) is already present in the current `<head>`, it is not re-added or re-executed. New scripts found in the fetched page's `<head>` are added and executed once.
- **`<body>` scripts** found in the injected content are re-executed on each navigation. External scripts (with `src`) are loaded only once — subsequent navigations skip them. Inline scripts are re-executed every time.

This means third-party scripts loaded in the `<head>` (analytics, tracking, widgets) are **not** re-executed by µJS. For example, a Plausible or Google Analytics script in the `<head>` will detect SPA navigations on its own via `pushState` interception — no special configuration is needed.

To prevent a `<body>` inline script from being re-executed on navigation, add `mu-disabled`:

```html
<script mu-disabled>
    // This script runs only on the initial page load
    oneTimeSetup();
</script>
```

For code that should run after every µJS navigation, use the `mu:after-render` event instead of inline scripts:

```javascript
document.addEventListener("mu:after-render", function(e) {
    myApp.initWidgets();
});
```


## Progress bar

A thin progress bar (3px, blue) is displayed at the top of the page during fetch requests. It requires no external stylesheet.

The bar element has `id="mu-progress"` and can be customized via CSS:

```css
#mu-progress {
    background: red !important;
    height: 5px !important;
}
```

Disable globally:

```html
<script>mu.init({ progress: false });</script>
```


## Events

µJS dispatches `CustomEvent` events on `document`. All events carry a `detail` object with `lastUrl` and `previousUrl`.

| Event | Cancelable | Description |
|---|---|---|
| `mu:init` | No | Fired after initialization. |
| `mu:before-fetch` | Yes | Fired before fetching. `preventDefault()` aborts the load. |
| `mu:before-render` | Yes | Fired after fetch, before DOM injection. `detail.html` can be modified. |
| `mu:after-render` | No | Fired after DOM injection. |
| `mu:fetch-error` | No | Fired on fetch failure or HTTP error. |

### Example: run code after each page load

```javascript
document.addEventListener("mu:after-render", function(e) {
    console.log("Loaded: " + e.detail.url);
    myApp.initWidgets();
});
```

### Example: cancel a navigation

```javascript
document.addEventListener("mu:before-fetch", function(e) {
    if (e.detail.url === "/restricted") {
        e.preventDefault();
    }
});
```

### Example: modify HTML before rendering

```javascript
document.addEventListener("mu:before-render", function(e) {
    e.detail.html = e.detail.html.replace("foo", "bar");
});
```

### Example: handle errors

```javascript
document.addEventListener("mu:fetch-error", function(e) {
    if (e.detail.status === 404) {
        alert("Page not found");
    }
});
```


## Attributes reference

All attributes support both `mu-*` and `data-mu-*` syntax.

| Attribute | Description |
|---|---|
| `mu-disabled` | Disable µJS on this element. |
| `mu-mode` | Injection mode (`replace`, `update`, `prepend`, `append`, `before`, `after`, `remove`, `none`, `patch`). |
| `mu-target` | CSS selector for the target node in the current page. |
| `mu-source` | CSS selector for the source node in the fetched page. |
| `mu-url` | Override the URL to fetch (instead of `href` / `action`). |
| `mu-prefix` | URL prefix for the fetch request. |
| `mu-title` | Selector for the title node. Supports `selector/attribute` syntax. Empty string to disable. |
| `mu-history` | Add URL to browser history (`true`/`false`). Default depends on mode and context. |
| `mu-scroll` | Force (`true`) or prevent (`false`) scrolling to top. Default depends on mode and context. |
| `mu-morph` | Disable morphing on this element (`false`). |
| `mu-transition` | Disable view transitions on this element (`false`). |
| `mu-prefetch` | Disable prefetch on hover for this link (`false`). |
| `mu-method` | HTTP method: `get`, `post`, `put`, `patch`, `delete`, or `sse`. |
| `mu-trigger` | Event trigger: `click`, `submit`, `change`, `blur`, `focus`, `load`. |
| `mu-debounce` | Debounce delay in milliseconds (e.g. `"500"`). |
| `mu-repeat` | Polling interval in milliseconds (e.g. `"5000"`). |
| `mu-confirm` | Show a confirmation dialog before loading. |
| `mu-confirm-quit` | *(Forms)* Prompt before leaving if the form has been modified. |
| `mu-validate` | *(Forms)* Name of a JS validation function. Must return `true`/`false`. |
| `mu-patch-target` | *(Patch fragments)* CSS selector of the target node. |
| `mu-patch-mode` | *(Patch fragments)* Injection mode for this fragment. |
| `mu-patch-history` | Set to `true` to add the URL to browser history in patch mode. Default: `false`. |


## Configuration reference

Pass an object to `mu.init()` to override defaults:

```javascript
mu.init({
    history: false,
    processForms: false,
    morph: false,
    progress: true
});
```

| Option | Type | Default | Description |
|---|---|---|---|
| `processLinks` | bool | `true` | Intercept `<a>` tags. |
| `processForms` | bool | `true` | Intercept `<form>` tags. |
| `history` | bool | `true` | Add URL to browser history. |
| `mode` | string | `"replace"` | Default injection mode. |
| `target` | string | `"body"` | Default target CSS selector. |
| `source` | string | `"body"` | Default source CSS selector. |
| `title` | string | `"title"` | Title selector (`"selector"` or `"selector/attribute"`). |
| `scroll` | bool\|null | `null` | Scroll behavior. `null` = auto (depends on mode and context). |
| `urlPrefix` | string\|null | `null` | Prefix added to fetched URLs. |
| `progress` | bool | `true` | Show progress bar during fetch. |
| `prefetch` | bool | `true` | Prefetch pages on link hover. |
| `prefetchTtl` | number | `3000` | Prefetch cache TTL in milliseconds. |
| `morph` | bool | `true` | Enable DOM morphing (requires idiomorph or custom morph function). |
| `transition` | bool | `true` | Enable View Transitions API. |
| `confirmQuitText` | string | `"Are you sure you want to leave this page?"` | Quit-page confirmation message. |


## Programmatic API

```javascript
// Load a page programmatically
mu.load("/page", { history: false, target: "#content" });

// Get the last URL loaded by µJS
mu.getLastUrl();    // "/about" or null

// Get the previous URL
mu.getPreviousUrl();    // "/" or null

// Enable/disable quit-page confirmation
mu.setConfirmQuit(true);
mu.setConfirmQuit(false);

// Register a custom morph function
mu.setMorph(function(target, html, opts) {
    myMorphLib.morph(target, html, opts);
});
```


## Browser support

µJS works in all modern browsers. The minimum versions are determined by `AbortController` (used for request cancellation).

**Desktop:**

| Browser | Version | Release date |
|---|---|---|
| Chrome | 66+ | April 2018 |
| Edge | 79+ | January 2020 |
| Firefox | 57+ | November 2017 |
| Safari | 12.1+ | March 2019 |
| Opera | 53+ | May 2018 |

**Mobile:**

| Browser | Version | Release date |
|---|---|---|
| Chrome Android | 66+ | April 2018 |
| Safari iOS | 11.3+ | March 2018 |
| Firefox Android | 57+ | November 2017 |
| Opera Mobile | 47+ | May 2018 |

View Transitions require Chrome/Edge 111+. On unsupported browsers, transitions are skipped silently.

DOM morphing requires a separate library (idiomorph recommended). Without it, µJS falls back to direct DOM replacement.

µJS does **not** support Internet Explorer or legacy Edge (EdgeHTML).


## License

[MIT](LICENSE)

---

**µJS** is developed by [Digicreon](https://github.com/Digicreon).
Website: [mujs.org](https://mujs.org)

