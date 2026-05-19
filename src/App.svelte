<script>
    import DOMPurify from "dompurify";
    import { marked } from "marked";
    import {
        Apple,
        Activity,
        BookOpen,
        Download,
        ExternalLink,
        FileArchive,
        Filter,
        Github,
        MonitorDown,
        Package,
        RefreshCw,
        TerminalSquare,
        Timer,
        VolumeX,
        Wallet,
    } from "lucide-svelte";
    import { onMount } from "svelte";

    const githubUrl = "https://github.com/nilesjarvis/kerosene";
    const releasesUrl = `${githubUrl}/releases`;
    const releasesApiUrl = "https://api.github.com/repos/nilesjarvis/kerosene/releases?per_page=10";
    const readmeUrl = "https://raw.githubusercontent.com/nilesjarvis/kerosene/main/README.md";
    const rawBaseUrl = "https://raw.githubusercontent.com/nilesjarvis/kerosene/main/";
    const readmePath = "README.md";
    const readmeItem = {
        title: "Overview",
        path: readmePath,
        rawUrl: readmeUrl,
        externalUrl: `${githubUrl}/blob/main/README.md`,
    };
    const fallbackRelease = {
        name: "v0.1.4-alpha",
        tagName: "v0.1.4",
        htmlUrl: `${githubUrl}/releases/tag/v0.1.4`,
        assets: [
            {
                name: "Kerosene-0.1.4-macos-arm64.dmg",
                browserDownloadUrl: `${githubUrl}/releases/download/v0.1.4/Kerosene-0.1.4-macos-arm64.dmg`,
            },
            {
                name: "Kerosene-0.1.4-x86_64.AppImage",
                browserDownloadUrl: `${githubUrl}/releases/download/v0.1.4/Kerosene-0.1.4-x86_64.AppImage`,
            },
            {
                name: "kerosene_0.1.4-1_amd64.deb",
                browserDownloadUrl: `${githubUrl}/releases/download/v0.1.4/kerosene_0.1.4-1_amd64.deb`,
            },
        ],
    };

    marked.use({
        gfm: true,
        breaks: false,
        walkTokens(token) {
            if (token.type === "link") {
                token.href = resolveReadmeUrl(token.href);
            }

            if (token.type === "image") {
                token.href = resolveReadmeUrl(token.href, true);
            }
        },
    });

    const downloadTargets = {
        mac: {
            label: "Download macOS DMG",
            detail: "macOS Apple silicon",
            icon: Apple,
        },
        windows: {
            label: "View Linux releases",
            detail: "Windows build planned",
            icon: MonitorDown,
        },
        linux: {
            label: "Download .deb",
            detail: "Debian / Ubuntu",
            icon: Package,
        },
        unknown: {
            label: "View releases",
            detail: "macOS and Linux builds available now",
            icon: Download,
        },
    };

    const assetMatchers = {
        mac: [/\.(dmg|pkg)$/i, /\b(mac|macos|darwin|apple)\b/i],
        windows: [/\.(exe|msi)$/i, /\b(win|windows)\b/i],
        linux: [/\.deb$/i],
        appimage: [/\.appimage$/i],
    };

    const featureHighlights = [
        {
            title: "Mute Tickers",
            description: "Hide noisy symbols from search, watchlists, and trading panes so the workspace stays focused.",
            icon: VolumeX,
            accent: "#ff8a1f",
        },
        {
            title: "HIP-3-Only Mode",
            description: "Filter the terminal down to HIP-3 markets when a session needs a narrower venue scope.",
            icon: Filter,
            accent: "#6ee7b7",
        },
        {
            title: "Advanced Orders",
            description: "Run client-side Chase orders and TWAP schedules with local lifecycle tracking.",
            icon: Timer,
            accent: "#a5b4fc",
        },
        {
            title: "Liquidation Feed",
            description: "Watch liquidation flow alongside active markets without leaving the trading layout.",
            icon: Activity,
            accent: "#fda4af",
        },
        {
            title: "Wallet Tracker",
            description: "Follow saved wallets, balances, and address-book context from the same desktop terminal.",
            icon: Wallet,
            accent: "#67e8f9",
        },
        {
            title: "Local Trading Journal",
            description: "Review fills and aggregated trades locally, including diagnostics for position chains.",
            icon: BookOpen,
            accent: "#fcd34d",
        },
    ];

    let platform = "unknown";
    let platformName = "your platform";
    let path = "/";
    let docsHtml = "";
    let docsStatus = "idle";
    let docsError = "";
    let docsUpdatedAt = "";
    let docsNavItems = [readmeItem];
    let activeDocsPath = readmePath;
    let docsRenderBasePath = readmePath;
    let docsLoadToken = 0;
    let latestRelease = fallbackRelease;
    let releaseStatus = "fallback";
    let releaseError = "";
    const docsCache = new Map();

    $: primaryDownload = downloadTargets[platform] ?? downloadTargets.unknown;
    $: isDocsPage = path === "/docs";
    $: activeDocsItem = docsNavItems.find((item) => item.path === activeDocsPath) ?? readmeItem;
    $: releasePageUrl = latestRelease?.htmlUrl ?? releasesUrl;
    $: releaseName = latestRelease?.name ?? "latest release";
    $: displayVersion = latestRelease?.name ?? "Checking latest release";
    $: releaseAssets = latestRelease?.assets ?? [];
    $: selectedDownloadAsset = findReleaseAsset(platform, releaseAssets);
    $: appImageAsset = findReleaseAsset("appimage", releaseAssets);
    $: primaryDownloadUrl = selectedDownloadAsset?.browserDownloadUrl ?? releasePageUrl;
    $: appImageDownloadUrl = appImageAsset?.browserDownloadUrl ?? releasePageUrl;
    $: downloadNote = getDownloadNote(releaseStatus, releaseError, selectedDownloadAsset, releaseName);

    function detectPlatform() {
        const userAgent = navigator.userAgent.toLowerCase();
        const platformHint =
            navigator.userAgentData?.platform?.toLowerCase() ||
            navigator.platform?.toLowerCase() ||
            "";

        if (platformHint.includes("mac") || userAgent.includes("mac os")) {
            platform = "mac";
            platformName = "macOS";
            return;
        }

        if (platformHint.includes("win") || userAgent.includes("windows")) {
            platform = "windows";
            platformName = "Windows";
            return;
        }

        if (platformHint.includes("linux") || userAgent.includes("linux")) {
            platform = "linux";
            platformName = "Linux";
        }
    }

    function syncPath() {
        path = window.location.pathname || "/";

        if (path === "/docs") {
            activeDocsPath = new URLSearchParams(window.location.search).get("doc") || readmePath;
        }
    }

    function navigate(event, target) {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
            return;
        }

        event.preventDefault();
        window.history.pushState({}, "", target);
        syncPath();
        if (path === "/docs") {
            loadDocs(false, activeDocsPath);
        }
        window.scrollTo(0, 0);
    }

    function isEditableTarget(target) {
        if (!(target instanceof Element)) return false;

        return Boolean(target.closest("input, textarea, select, button, [contenteditable='true']"));
    }

    function handleDownloadHotkey(event) {
        if (
            isDocsPage ||
            event.repeat ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey ||
            isEditableTarget(event.target)
        ) {
            return;
        }

        if (event.key.toLowerCase() !== "d") return;

        event.preventDefault();
        window.location.href = primaryDownloadUrl;
    }

    function escapeHtml(value) {
        return value
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");
    }

    function escapeAttribute(value) {
        return escapeHtml(value).replaceAll("`", "&#96;");
    }

    function encodeRepoPath(path) {
        return path.split("/").map((segment) => encodeURIComponent(segment)).join("/");
    }

    function normalizeRepoPath(url, basePath = readmePath) {
        const baseDirectory = basePath.includes("/") ? basePath.slice(0, basePath.lastIndexOf("/") + 1) : "";

        try {
            return decodeURIComponent(
                new URL(url, `https://kerosene.local/${baseDirectory}`).pathname.replace(/^\/+/, ""),
            );
        } catch (_error) {
            return url.replace(/^\.?\//, "");
        }
    }

    function resolveMarkdownPath(url, basePath = readmePath) {
        if (!url) return "";

        let pathPart = url.trim().split("#")[0].split("?")[0];
        if (!pathPart || pathPart.startsWith("#") || pathPart.startsWith("mailto:")) return "";

        const rawPrefix = rawBaseUrl;
        const blobPrefix = `${githubUrl}/blob/main/`;

        if (pathPart.startsWith(rawPrefix)) {
            pathPart = pathPart.slice(rawPrefix.length);
        } else if (pathPart.startsWith(blobPrefix)) {
            pathPart = pathPart.slice(blobPrefix.length);
        } else if (/^https?:/i.test(pathPart)) {
            return "";
        } else if (pathPart.startsWith("/")) {
            pathPart = pathPart.slice(1);
        } else {
            pathPart = normalizeRepoPath(pathPart, basePath);
        }

        pathPart = normalizeRepoPath(pathPart, readmePath);
        return /\.md$/i.test(pathPart) ? pathPart : "";
    }

    function resolveReadmeUrl(url, asset = false, basePath = docsRenderBasePath) {
        if (!asset) {
            const docsPath = resolveMarkdownPath(url, basePath);
            if (docsPath) {
                return docsPath === readmePath ? "/docs" : `/docs?doc=${encodeURIComponent(docsPath)}`;
            }
        }

        if (/^(https?:|mailto:|#)/.test(url)) {
            return url;
        }

        if (url.startsWith("/")) {
            const repoPath = url.slice(1);
            return asset ? `${rawBaseUrl}${encodeRepoPath(repoPath)}` : `${githubUrl}/${repoPath}`;
        }

        const repoPath = normalizeRepoPath(url, basePath);

        if (asset) {
            return `${rawBaseUrl}${encodeRepoPath(repoPath)}`;
        }

        return `${githubUrl}/blob/main/${encodeRepoPath(repoPath)}`;
    }

    function normalizeReadmeMarkdown(markdown, basePath = docsRenderBasePath) {
        return markdown.replace(/\b(src|href)="(?!https?:|mailto:|#|\/)([^"]+)"/g, (_match, attr, url) => {
            const resolved = attr === "src" ? resolveReadmeUrl(url, true, basePath) : resolveReadmeUrl(url, false, basePath);
            return `${attr}="${escapeAttribute(resolved)}"`;
        });
    }

    function orangeCursor(node) {
        const cursor = document.createElement("div");
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
        let cursorFrame = 0;
        let nextCursorX = -100;
        let nextCursorY = -100;
        let nextCursorTarget = null;
        cursor.className = "orange-cursor-ring";
        document.body.appendChild(cursor);

        function applyCursorPosition() {
            cursorFrame = 0;
            cursor.style.setProperty("--cursor-x", `${nextCursorX}px`);
            cursor.style.setProperty("--cursor-y", `${nextCursorY}px`);

            const isInteractive = nextCursorTarget?.closest("button, a, input, textarea, select, [role='button']");
            cursor.classList.toggle("visible", !isInteractive);
        }

        function moveCursor(event) {
            if (reducedMotion.matches || (event.pointerType && event.pointerType !== "mouse")) {
                hideCursor();
                return;
            }

            nextCursorX = event.clientX;
            nextCursorY = event.clientY;
            nextCursorTarget = event.target instanceof Element ? event.target : null;

            if (!cursorFrame) {
                cursorFrame = requestAnimationFrame(applyCursorPosition);
            }
        }

        function hideCursor() {
            if (cursorFrame) {
                cancelAnimationFrame(cursorFrame);
                cursorFrame = 0;
            }
            cursor.classList.remove("visible");
        }

        node.addEventListener("pointermove", moveCursor, { passive: true });
        node.addEventListener("pointerleave", hideCursor);
        window.addEventListener("blur", hideCursor);

        return {
            destroy() {
                node.removeEventListener("pointermove", moveCursor);
                node.removeEventListener("pointerleave", hideCursor);
                window.removeEventListener("blur", hideCursor);
                if (cursorFrame) {
                    cancelAnimationFrame(cursorFrame);
                }
                cursor.remove();
            },
        };
    }

    function findReleaseAsset(kind, assets) {
        if (kind === "unknown") {
            return null;
        }

        const matchers = assetMatchers[kind] ?? [];
        return assets.find((asset) => matchers.some((matcher) => matcher.test(asset.name))) ?? null;
    }

    function getDownloadNote(status, error, asset, name) {
        if (status === "loading" || status === "idle") {
            return "Checking the latest GitHub release.";
        }

        if (status === "fallback" && error) {
            return `${error || "Could not check GitHub releases."} Using bundled release links.`;
        }

        if (asset) {
            return `Latest release ${name}. ${asset.name}.`;
        }

        return `Latest release ${name}. macOS and Linux builds are available on GitHub.`;
    }

    function animatedChart(canvas) {
        const context = canvas.getContext("2d", { alpha: true });
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
        const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
        const createPoint = (x, y, volatility) => ({
            x,
            y,
            wick: 0.008 + Math.random() * volatility * 0.28,
            volume: 0.18 + Math.random() * 0.82,
        });
        let nextLayerId = 0;
        const createLayer = (startX = -0.18 - Math.random() * 0.34) => {
            const layerId = nextLayerId++;
            const value = 0.38 + Math.random() * 0.24;

            return {
                id: layerId,
                points: [createPoint(Math.max(0, startX), value, 0.022)],
                headX: startX,
                nextPointX: Math.max(0, startX),
                lastTick: performance.now(),
                value,
                speed: 0.00006 + Math.random() * 0.000065,
                tickDistance: 0.012 + Math.random() * 0.01,
                volatility: 0.032 + Math.random() * 0.04,
                jumpChance: 0.055 + Math.random() * 0.08,
                jumpMultiplier: 2 + Math.random() * 2,
                driftBias: (Math.random() - 0.5) * 0.01,
                trendFlipChance: 0.018 + Math.random() * 0.032,
                chartHeight: 0.32 + Math.random() * 0.22,
                trailLength: 0.72 + Math.random() * 0.24,
                verticalBand: 0.14 + Math.random() * 0.72,
                color: layerId % 2 === 0 ? "255, 138, 31" : "255, 209, 160",
                headPoint: {
                    x: 0,
                    y: value,
                    wick: 0,
                    volume: 0,
                    isHead: true,
                },
                renderBounds: {
                    started: false,
                    count: 0,
                    firstX: 0,
                    firstY: 0,
                    lastX: 0,
                    lastY: 0,
                },
            };
        };
        let layers = [];
        let width = 0;
        let height = 0;
        let animationFrame = 0;
        let lastFrame = performance.now();
        let lastRenderedAt = 0;
        let nextSpawnAt = performance.now();
        let running = true;
        let playing = false;
        let inView = true;
        let documentVisible = !document.hidden;
        const frameInterval = 1000 / 30;

        function randomWalk(layer) {
            if (Math.random() < layer.trendFlipChance) {
                layer.driftBias = (Math.random() - 0.5) * layer.volatility * 0.75;
            }

            const jump = Math.random() < layer.jumpChance
                ? (Math.random() - 0.5) * layer.volatility * layer.jumpMultiplier
                : 0;
            const meanReversion = (0.5 - layer.value) * layer.volatility * 0.14;
            const drift = (Math.random() - 0.5) * layer.volatility + layer.driftBias + jump + meanReversion;
            layer.value = clamp(layer.value + drift, 0.16, 0.84);
            return layer.value;
        }

        function resize() {
            const rect = canvas.getBoundingClientRect();
            const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
            width = Math.max(1, rect.width);
            height = Math.max(1, rect.height);
            canvas.width = Math.floor(width * pixelRatio);
            canvas.height = Math.floor(height * pixelRatio);
            context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        }

        function updateLayer(layer, _layerIndex, timestamp, delta) {
            if (reducedMotion.matches) return true;

            layer.headX += delta * layer.speed;

            while (layer.nextPointX <= Math.min(layer.headX + layer.tickDistance * 3.25, 1)) {
                layer.points.push(createPoint(layer.nextPointX, randomWalk(layer), layer.volatility));
                layer.nextPointX += layer.tickDistance * (0.44 + Math.random() * 1.18);
            }

            layer.lastTick = timestamp;
            return layer.headX <= 1.18;
        }

        function scheduleNextSpawn(timestamp) {
            nextSpawnAt = timestamp + 420 + Math.random() * 620;
        }

        function spawnDueLayers(timestamp) {
            if (reducedMotion.matches) return;

            while (timestamp >= nextSpawnAt && layers.length < 12) {
                layers.push(createLayer());
                scheduleNextSpawn(timestamp);
            }

            if (layers.length < 7) {
                layers.push(createLayer(-0.18 - Math.random() * 0.24));
                scheduleNextSpawn(timestamp);
            }
        }

        function pointX(point) {
            return point.x * width;
        }

        function pointY(layer, point) {
            return height * layer.verticalBand + (point.y - 0.5) * height * layer.chartHeight;
        }

        function createHeadPoint(layer) {
            let previousPoint = null;
            let nextPoint = null;

            for (let index = 0; index < layer.points.length; index += 1) {
                const point = layer.points[index];
                if (point.x <= layer.headX) {
                    previousPoint = point;
                } else {
                    nextPoint = point;
                    break;
                }
            }

            if (!previousPoint || !nextPoint || layer.headX >= 1) return null;

            const progress = clamp((layer.headX - previousPoint.x) / (nextPoint.x - previousPoint.x), 0, 1);
            const eased = progress * progress * (3 - 2 * progress);
            const headPoint = layer.headPoint;

            headPoint.x = layer.headX;
            headPoint.y = previousPoint.y + (nextPoint.y - previousPoint.y) * eased;
            headPoint.wick = previousPoint.wick + (nextPoint.wick - previousPoint.wick) * eased;
            headPoint.volume = previousPoint.volume + (nextPoint.volume - previousPoint.volume) * eased;

            return headPoint;
        }

        function appendPathPoint(layer, point, bounds) {
            const x = pointX(point);
            const y = pointY(layer, point);

            if (!bounds.started) {
                context.moveTo(x, y);
                bounds.started = true;
                bounds.firstX = x;
                bounds.firstY = y;
            } else {
                context.lineTo(x, y);
            }

            bounds.lastX = x;
            bounds.lastY = y;
            bounds.count += 1;
        }

        function buildLayerPath(layer, visibleStart, headPoint) {
            const bounds = layer.renderBounds;
            bounds.started = false;
            bounds.count = 0;
            context.beginPath();

            for (let pointIndex = 0; pointIndex < layer.points.length; pointIndex += 1) {
                const point = layer.points[pointIndex];
                if (point.x < visibleStart || point.x > layer.headX) continue;
                appendPathPoint(layer, point, bounds);
            }

            if (headPoint && headPoint.x >= visibleStart) {
                appendPathPoint(layer, headPoint, bounds);
            }

            return bounds.count > 1;
        }

        function drawLayer(layer, layerIndex, timestamp) {
            const trailStart = layer.headX - layer.trailLength;
            const visibleStart = Math.max(0, trailStart);
            const headPoint = createHeadPoint(layer);

            const alpha = clamp(0.16 - (layerIndex % 4) * 0.018, 0.08, 0.16);
            const endFade = layer.headX <= 0.94 ? 1 : clamp((1.18 - layer.headX) / 0.24, 0, 1);
            const fadeForPoint = (point) => {
                const tailFade = clamp((point.x - trailStart) / 0.28, 0, 1);
                const edgeFade = clamp(point.x / 0.08, 0, 1);
                return tailFade * edgeFade * endFade;
            };

            context.save();
            context.lineCap = "round";
            context.lineJoin = "round";

            if (buildLayerPath(layer, visibleStart, headPoint)) {
                const gradient = context.createLinearGradient(visibleStart * width, 0, Math.min(layer.headX, 1) * width, 0);
                gradient.addColorStop(0, `rgba(${layer.color}, 0)`);
                gradient.addColorStop(0.34, `rgba(${layer.color}, ${alpha * endFade})`);
                gradient.addColorStop(1, `rgba(${layer.color}, ${alpha * endFade})`);

                context.lineWidth = layerIndex === 0 ? 1.25 : 0.9;
                context.strokeStyle = gradient;
                context.stroke();
            }

            if (layer.headX <= 0.96) {
                for (let pointIndex = 0; pointIndex < layer.points.length; pointIndex += 1) {
                    if (pointIndex % 5 !== 0) continue;
                    const point = layer.points[pointIndex];
                    if (point.x < visibleStart || point.x > layer.headX) continue;

                    const pointFade = fadeForPoint(point);
                    if (pointFade <= 0.08) continue;

                    const currentX = pointX(point);
                    const currentY = pointY(layer, point);
                    const wickHeight = height * point.wick;
                    const barHeight = (4 + point.volume * 18) * (layerIndex === 0 ? 1 : 0.72);
                    const barY = currentY + height * 0.07;

                    context.strokeStyle = `rgba(${layer.color}, ${alpha * 0.2 * pointFade})`;
                    context.lineWidth = 0.65;
                    context.beginPath();
                    context.moveTo(currentX, currentY - wickHeight);
                    context.lineTo(currentX, currentY + wickHeight);
                    context.stroke();

                    context.fillStyle = `rgba(${layer.color}, ${alpha * 0.12 * pointFade})`;
                    context.fillRect(currentX - 0.6, barY, 1.2, barHeight * 0.55);

                    if (pointIndex % 6 === 0 && pointFade > 0.05) {
                        context.fillStyle = `rgba(${layer.color}, ${alpha * 1.2 * pointFade})`;
                        context.beginPath();
                        context.arc(currentX, currentY, 1.05, 0, Math.PI * 2);
                        context.fill();
                    }
                }

                if (headPoint && headPoint.x >= visibleStart) {
                    const pointFade = fadeForPoint(headPoint);
                    const currentX = pointX(headPoint);
                    const currentY = pointY(layer, headPoint);
                    const wickHeight = height * headPoint.wick;

                    context.strokeStyle = `rgba(${layer.color}, ${alpha * 0.24 * pointFade})`;
                    context.lineWidth = 1;
                    context.beginPath();
                    context.moveTo(currentX, currentY - wickHeight);
                    context.lineTo(currentX, currentY + wickHeight);
                    context.stroke();
                }
            }

            context.restore();
        }

        function renderFrame(timestamp = performance.now(), advance = !reducedMotion.matches) {
            const delta = advance ? Math.min(48, timestamp - lastFrame) : 0;
            if (advance) {
                lastFrame = timestamp;
            }
            context.clearRect(0, 0, width, height);

            if (advance) {
                spawnDueLayers(timestamp);
            }

            for (let layerIndex = 0; layerIndex < layers.length; layerIndex += 1) {
                const layer = layers[layerIndex];
                const alive = advance ? updateLayer(layer, layerIndex, timestamp, delta) : true;
                if (alive) {
                    drawLayer(layer, layerIndex, timestamp);
                } else {
                    layers.splice(layerIndex, 1);
                    layerIndex -= 1;
                }
            }
        }

        function shouldAnimate() {
            return running && inView && documentVisible && !reducedMotion.matches;
        }

        function startAnimation() {
            if (playing || !shouldAnimate()) return;

            const timestamp = performance.now();
            playing = true;
            lastFrame = timestamp;
            lastRenderedAt = timestamp - frameInterval;
            animationFrame = requestAnimationFrame(tick);
        }

        function stopAnimation() {
            if (!playing) return;

            playing = false;
            cancelAnimationFrame(animationFrame);
            animationFrame = 0;
        }

        function syncAnimationState() {
            if (shouldAnimate()) {
                startAnimation();
            } else {
                stopAnimation();
            }
        }

        function tick(timestamp = performance.now()) {
            if (!running || !playing) return;

            if (timestamp - lastRenderedAt >= frameInterval) {
                renderFrame(timestamp);
                lastRenderedAt = timestamp;
            }

            animationFrame = requestAnimationFrame(tick);
        }

        function seedAnimatedLayers() {
            const seedPositions = [-1.16, -0.98, -0.8, -0.62, -0.44, -0.27, -0.1, 0.08, 0.26, 0.44, 0.62, 0.8];
            layers = seedPositions.map((position) => createLayer(position + (Math.random() - 0.5) * 0.08));
            scheduleNextSpawn(performance.now());
        }

        function seedStaticLayers() {
            layers = Array.from({ length: 5 }, () => {
                const layer = createLayer(0);
                layer.headX = 1;
                layer.nextPointX = 0;
                layer.points = [];

                while (layer.nextPointX < 1) {
                    layer.points.push(createPoint(layer.nextPointX, randomWalk(layer), layer.volatility));
                    layer.nextPointX += layer.tickDistance * (0.72 + Math.random() * 0.64);
                }

                layer.points.push(createPoint(1, randomWalk(layer), layer.volatility));
                return layer;
            });
        }

        function handleVisibilityChange() {
            documentVisible = !document.hidden;
            if (documentVisible) {
                lastFrame = performance.now();
            }
            syncAnimationState();
        }

        function handleMotionPreferenceChange() {
            if (reducedMotion.matches) {
                stopAnimation();
                seedStaticLayers();
                renderFrame(performance.now(), false);
                return;
            }

            seedAnimatedLayers();
            syncAnimationState();
        }

        const observer = new ResizeObserver(() => {
            resize();
            renderFrame(performance.now(), false);
        });
        const viewportObserver = "IntersectionObserver" in window
            ? new IntersectionObserver(([entry]) => {
                inView = entry.isIntersecting;
                if (inView) {
                    lastFrame = performance.now();
                }
                syncAnimationState();
            }, { rootMargin: "120px 0px" })
            : null;

        observer.observe(canvas);
        viewportObserver?.observe(canvas);
        document.addEventListener("visibilitychange", handleVisibilityChange);
        if (reducedMotion.addEventListener) {
            reducedMotion.addEventListener("change", handleMotionPreferenceChange);
        } else {
            reducedMotion.addListener(handleMotionPreferenceChange);
        }

        resize();
        if (reducedMotion.matches) {
            seedStaticLayers();
            renderFrame(performance.now(), false);
        } else {
            seedAnimatedLayers();
            syncAnimationState();
        }

        return {
            destroy() {
                running = false;
                stopAnimation();
                observer.disconnect();
                viewportObserver?.disconnect();
                document.removeEventListener("visibilitychange", handleVisibilityChange);
                if (reducedMotion.removeEventListener) {
                    reducedMotion.removeEventListener("change", handleMotionPreferenceChange);
                } else {
                    reducedMotion.removeListener(handleMotionPreferenceChange);
                }
            },
        };
    }

    function formatDocsTitle(path) {
        if (path === readmePath) return "Overview";

        const filename = path.split("/").pop()?.replace(/\.md$/i, "") || path;
        return filename
            .replace(/[-_]+/g, " ")
            .replace(/\b\w/g, (character) => character.toUpperCase());
    }

    function createDocsItem(path, title = "") {
        return {
            title: title || formatDocsTitle(path),
            path,
            rawUrl: `${rawBaseUrl}${encodeRepoPath(path)}`,
            externalUrl: `${githubUrl}/blob/main/${encodeRepoPath(path)}`,
        };
    }

    function visitTokens(tokens, visitor) {
        tokens.forEach((token) => {
            visitor(token);

            if (token.tokens) {
                visitTokens(token.tokens, visitor);
            }

            if (token.items) {
                token.items.forEach((item) => visitTokens(item.tokens || [], visitor));
            }
        });
    }

    function getDocsNavItems(markdown) {
        const items = [readmeItem];
        const seen = new Set([readmePath]);
        const tokens = marked.lexer(markdown);

        visitTokens(tokens, (token) => {
            if (token.type !== "link") return;

            const docsPath = resolveMarkdownPath(token.href, readmePath);
            if (!docsPath || seen.has(docsPath)) return;

            seen.add(docsPath);
            items.push(createDocsItem(docsPath, token.text?.trim()));
        });

        return items;
    }

    async function fetchMarkdown(item, force = false) {
        if (!force && docsCache.has(item.path)) {
            return docsCache.get(item.path);
        }

        const url = force ? `${item.rawUrl}?cache=${Date.now()}` : item.rawUrl;
        const response = await fetch(url, {
            headers: { Accept: "text/plain" },
        });

        if (!response.ok) {
            throw new Error(`GitHub returned ${response.status}`);
        }

        const markdown = await response.text();
        docsCache.set(item.path, markdown);
        return markdown;
    }

    async function loadLatestRelease() {
        releaseStatus = "loading";
        releaseError = "";

        try {
            const response = await fetch(releasesApiUrl, {
                headers: { Accept: "application/vnd.github+json" },
            });

            if (!response.ok) {
                throw new Error(`GitHub returned ${response.status}`);
            }

            const releases = JSON.parse(await response.text());
            const release = releases.find((item) => !item.draft);

            if (!release) {
                throw new Error("No published releases found.");
            }

            latestRelease = {
                name: release.name || release.tag_name,
                tagName: release.tag_name,
                htmlUrl: release.html_url,
                assets: (release.assets ?? []).map((asset) => ({
                    name: asset.name,
                    browserDownloadUrl: asset.browser_download_url,
                })),
            };
            releaseStatus = "loaded";
        } catch (error) {
            latestRelease = fallbackRelease;
            releaseError = error.message || "Could not check GitHub releases.";
            releaseStatus = "fallback";
        }
    }

    function renderDocsMarkdown(markdown, basePath) {
        docsRenderBasePath = basePath;
        return DOMPurify.sanitize(marked.parse(normalizeReadmeMarkdown(markdown, basePath)), {
            ADD_ATTR: ["align", "width", "height"],
        });
    }

    function setDocsUrl(path) {
        const target = path === readmePath ? "/docs" : `/docs?doc=${encodeURIComponent(path)}`;
        const current = `${window.location.pathname}${window.location.search}`;

        if (current !== target) {
            window.history.pushState({}, "", target);
            syncPath();
        }
    }

    function selectDocsPath(path) {
        setDocsUrl(path);
        activeDocsPath = path;
        loadDocs(false, path);
    }

    function handleDocsArticleClick(event) {
        const link = event.target instanceof Element ? event.target.closest("a") : null;
        if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

        const targetUrl = new URL(link.href, window.location.href);
        if (targetUrl.origin !== window.location.origin || targetUrl.pathname !== "/docs") return;

        event.preventDefault();
        selectDocsPath(targetUrl.searchParams.get("doc") || readmePath);
    }

    function internalDocsLinks(node) {
        node.addEventListener("click", handleDocsArticleClick);

        return {
            destroy() {
                node.removeEventListener("click", handleDocsArticleClick);
            },
        };
    }

    async function loadDocs(force = false, requestedPath = activeDocsPath) {
        const loadToken = ++docsLoadToken;
        docsStatus = "loading";
        docsError = "";

        try {
            const readmeMarkdown = await fetchMarkdown(readmeItem, force);
            const nextNavItems = getDocsNavItems(readmeMarkdown);
            const selectedItem = nextNavItems.find((item) => item.path === requestedPath) ?? readmeItem;
            const markdown = selectedItem.path === readmePath
                ? readmeMarkdown
                : await fetchMarkdown(selectedItem, force);

            if (loadToken !== docsLoadToken) return;

            docsNavItems = nextNavItems;
            activeDocsPath = selectedItem.path;
            docsHtml = renderDocsMarkdown(markdown, selectedItem.path);
            docsUpdatedAt = new Date().toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
            });
            docsStatus = "loaded";
        } catch (error) {
            if (loadToken !== docsLoadToken) return;

            docsError = error.message || "Could not load documentation from GitHub.";
            docsStatus = "error";
        }
    }

    function handlePopState() {
        syncPath();
        if (path === "/docs") {
            loadDocs(false, activeDocsPath);
        }
    }

    onMount(() => {
        detectPlatform();
        syncPath();
        loadLatestRelease();
        window.addEventListener("popstate", handlePopState);
        window.addEventListener("keydown", handleDownloadHotkey);

        return () => {
            window.removeEventListener("popstate", handlePopState);
            window.removeEventListener("keydown", handleDownloadHotkey);
        };
    });

    $: if (isDocsPage && docsStatus === "idle") {
        loadDocs();
    }
</script>

<svelte:head>
    <meta name="theme-color" content="#090a0c" />
    <title>{isDocsPage ? "Kerosene Docs" : "Kerosene"}</title>
</svelte:head>

<main class="shell" use:orangeCursor>
    <header class="topbar" aria-label="Site header">
        <a class="brand" href="/" aria-label="Kerosene home" on:click={(event) => navigate(event, "/")}>
            <span class="brand-mark" aria-hidden="true"></span>
            <span class="brand-name">Kerosene</span>
        </a>

        <nav class="nav-links" aria-label="Primary navigation">
            <a class:active={isDocsPage} href="/docs" on:click={(event) => navigate(event, "/docs")}>Docs</a>
            <a href={releasePageUrl}>Releases</a>
        </nav>

        <div class="nav-actions">
            <a class="ghost-link" href={githubUrl}>
                <Github size={15} />
                <span>Source</span>
            </a>
            <a
                class="download-small"
                href={primaryDownloadUrl}
                aria-label={`Download ${releaseName}`}
            >
                <Download size={15} />
                <span>Download</span>
            </a>
        </div>
    </header>

    <div class="announcement" aria-hidden="true"></div>

    {#if isDocsPage}
        <section class="docs-page" aria-labelledby="docs-title">
            <div class="hero-grid-node top-left"></div>
            <div class="hero-grid-node top-right"></div>
            <div class="hero-grid-node bottom-left"></div>
            <div class="hero-grid-node bottom-right"></div>

            <div class="docs-header">
                <p class="eyebrow">
                    <TerminalSquare size={15} />
                    Live README.md from GitHub
                </p>
                <h1 id="docs-title">Kerosene Docs</h1>
                <p class="lede">
                    The docs below are fetched directly from the Kerosene GitHub README so this page stays aligned with the source repository.
                </p>
                <div class="docs-actions">
                    <button class="button secondary" type="button" on:click={() => loadDocs(true, activeDocsPath)} disabled={docsStatus === "loading"}>
                        <RefreshCw size={17} />
                        <span>{docsStatus === "loading" ? "Refreshing" : "Refresh from GitHub"}</span>
                    </button>
                    <a class="button secondary" href={activeDocsItem.externalUrl}>
                        <ExternalLink size={17} />
                        <span>Open on GitHub</span>
                    </a>
                </div>
                {#if docsUpdatedAt}
                    <p class="platform-note">Last fetched {docsUpdatedAt}</p>
                {/if}
            </div>

            <div class="docs-layout">
                <aside class="docs-sidebar" aria-label="Documentation files">
                    <p class="docs-sidebar-label">Documentation</p>
                    <nav>
                        {#each docsNavItems as item}
                            <button
                                class:active={item.path === activeDocsPath}
                                type="button"
                                on:click={() => selectDocsPath(item.path)}
                            >
                                <span>{item.title}</span>
                                <small>{item.path}</small>
                            </button>
                        {/each}
                    </nav>
                </aside>

                <article class="docs-card" aria-live="polite">
                    {#if docsStatus === "loading"}
                        <div class="docs-loading">Fetching {activeDocsItem.path} from GitHub…</div>
                    {:else if docsStatus === "error"}
                        <div class="docs-error">
                            <strong>Could not load docs.</strong>
                            <span>{docsError}</span>
                        </div>
                    {:else}
                        <div class="markdown-body" use:internalDocsLinks>
                            {@html docsHtml}
                        </div>
                    {/if}
                </article>
            </div>
        </section>
    {:else}
        <section class="hero" aria-labelledby="hero-title">
            <canvas class="market-background" use:animatedChart aria-hidden="true"></canvas>
            <div class="hero-grid-node top-left"></div>
            <div class="hero-grid-node top-right"></div>
            <div class="hero-grid-node bottom-left"></div>
            <div class="hero-grid-node bottom-right"></div>

            <div class="hero-copy">
                <p class="eyebrow">
                    <TerminalSquare size={15} />
                    {displayVersion}
                </p>

                <h1 id="hero-title">
                    An Open-Source Trading Terminal for Hyperliquid.
                </h1>

                <p class="lede">
                    Kerosene is designed as a customizable, private, local trading
                    terminal. No additional fees, or routing trades through third
                    party APIs.
                </p>

                <div class="cta-row" aria-label="Primary actions">
                    <a
                        class="button primary"
                        href={primaryDownloadUrl}
                        aria-label={`${primaryDownload.label} from ${releaseName}`}
                    >
                        <svelte:component this={primaryDownload.icon} size={17} />
                        <span>{primaryDownload.label}</span>
                        <kbd>D</kbd>
                    </a>

                    {#if platform === "linux"}
                        <a
                            class="button secondary"
                            href={appImageDownloadUrl}
                            aria-label={`Download AppImage from ${releaseName}`}
                        >
                            <FileArchive size={17} />
                            <span>AppImage</span>
                        </a>
                    {/if}

                    <a class="button secondary" href={githubUrl}>
                        <Github size={17} />
                        <span>View GitHub</span>
                    </a>
                </div>

                <p class="platform-note">
                    Detected {platformName}. {primaryDownload.detail}. {downloadNote}
                </p>
            </div>

            <div class="feature-strip" aria-label="Key product notes">
                <article>
                    <h2>Native</h2>
                    <p>
                        Stop trading in a browser and trade with a native App on
                        your desktop.
                    </p>
                </article>
                <article>
                    <h2>Customizable</h2>
                    <p>
                        Create your own layout and pick between many different
                        themes.
                    </p>
                </article>
                <article>
                    <h2>Built for Traders</h2>
                    <p>Choose between many trader-first features.</p>
                </article>
            </div>

            <section class="features-section" aria-labelledby="features-title">
                <div class="features-header">
                    <p class="eyebrow">
                        <TerminalSquare size={15} />
                        Features
                    </p>
                    <h2 id="features-title">Built for active Hyperliquid workflows.</h2>
                </div>

                <div class="features-grid">
                    {#each featureHighlights as feature}
                        <article class="feature-card" style={`--feature-accent: ${feature.accent}`}>
                            <span class="feature-icon" aria-hidden="true">
                                <svelte:component this={feature.icon} size={19} />
                            </span>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                        </article>
                    {/each}
                </div>
            </section>
        </section>
    {/if}
</main>
