<script>
    import { marked } from "marked";
    import {
        Apple,
        Download,
        ExternalLink,
        FileArchive,
        Github,
        MonitorDown,
        Package,
        RefreshCw,
        TerminalSquare,
    } from "lucide-svelte";
    import { onMount } from "svelte";

    const githubUrl = "https://github.com/nilesjarvis/kerosene";
    const readmeUrl = "https://raw.githubusercontent.com/nilesjarvis/kerosene/main/README.md";
    const rawBaseUrl = "https://raw.githubusercontent.com/nilesjarvis/kerosene/main/";

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
            label: "Download for macOS",
            detail: "Universal build",
            icon: Apple,
        },
        windows: {
            label: "Download for Windows",
            detail: "Installer placeholder",
            icon: MonitorDown,
        },
        linux: {
            label: "Download .deb",
            detail: "Debian / Ubuntu",
            icon: Package,
        },
        unknown: {
            label: "Download Kerosene",
            detail: "Choose a release",
            icon: Download,
        },
    };

    let platform = "unknown";
    let platformName = "your platform";
    let path = "/";
    let docsHtml = "";
    let docsStatus = "idle";
    let docsError = "";
    let docsUpdatedAt = "";

    $: primaryDownload = downloadTargets[platform] ?? downloadTargets.unknown;
    $: isDocsPage = path === "/docs";

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
    }

    function navigate(event, target) {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
            return;
        }

        event.preventDefault();
        window.history.pushState({}, "", target);
        syncPath();
        window.scrollTo(0, 0);
    }

    function placeholderAction() {}

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

    function resolveReadmeUrl(url, asset = false) {
        if (/^(https?:|mailto:|#)/.test(url)) {
            return url;
        }

        if (url.startsWith("/")) {
            return `${githubUrl}${url}`;
        }

        if (asset) {
            return `${rawBaseUrl}${url}`;
        }

        return `${githubUrl}/blob/main/${url}`;
    }

    function normalizeReadmeMarkdown(markdown) {
        return markdown.replace(/\b(src|href)="(?!https?:|mailto:|#|\/)([^"]+)"/g, (_match, attr, url) => {
            const resolved = attr === "src" ? resolveReadmeUrl(url, true) : resolveReadmeUrl(url);
            return `${attr}="${escapeAttribute(resolved)}"`;
        });
    }

    function orangeCursor(node) {
        const cursor = document.createElement("div");
        cursor.className = "orange-cursor-ring";
        document.body.appendChild(cursor);

        function moveCursor(event) {
            if (event.pointerType && event.pointerType !== "mouse") {
                hideCursor();
                return;
            }

            cursor.style.setProperty("--cursor-x", `${event.clientX}px`);
            cursor.style.setProperty("--cursor-y", `${event.clientY}px`);

            const isInteractive = event.target.closest("button, a, input, textarea, select, [role='button']");
            cursor.classList.toggle("visible", !isInteractive);
        }

        function hideCursor() {
            cursor.classList.remove("visible");
        }

        node.addEventListener("pointermove", moveCursor);
        node.addEventListener("pointerleave", hideCursor);
        window.addEventListener("blur", hideCursor);

        return {
            destroy() {
                node.removeEventListener("pointermove", moveCursor);
                node.removeEventListener("pointerleave", hideCursor);
                window.removeEventListener("blur", hideCursor);
                cursor.remove();
            },
        };
    }

    function animatedChart(canvas) {
        const context = canvas.getContext("2d");
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
            };
        };
        let layers = [];
        let width = 0;
        let height = 0;
        let animationFrame = 0;
        let lastFrame = performance.now();
        let nextSpawnAt = performance.now();
        let running = true;

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

        function pointToCanvas(layer, point) {
            const chartHeight = height * layer.chartHeight;
            const centerY = height * layer.verticalBand;

            return {
                x: point.x * width,
                y: centerY + (point.y - 0.5) * chartHeight,
            };
        }

        function createHeadPoint(layer) {
            const previousPoint = [...layer.points].reverse().find((point) => point.x <= layer.headX);
            const nextPoint = layer.points.find((point) => point.x > layer.headX);

            if (!previousPoint || !nextPoint || layer.headX >= 1) return null;

            const progress = clamp((layer.headX - previousPoint.x) / (nextPoint.x - previousPoint.x), 0, 1);
            const eased = progress * progress * (3 - 2 * progress);

            return {
                x: layer.headX,
                y: previousPoint.y + (nextPoint.y - previousPoint.y) * eased,
                wick: previousPoint.wick + (nextPoint.wick - previousPoint.wick) * eased,
                volume: previousPoint.volume + (nextPoint.volume - previousPoint.volume) * eased,
                isHead: true,
            };
        }

        function drawLayer(layer, layerIndex, timestamp) {
            const trailStart = layer.headX - layer.trailLength;
            const committedPoints = layer.points.filter(
                (point) => point.x <= layer.headX && point.x >= Math.max(0, trailStart),
            );
            const headPoint = createHeadPoint(layer);
            const visiblePoints = headPoint
                ? [...committedPoints, headPoint].filter((point) => point.x >= Math.max(0, trailStart))
                : committedPoints;
            if (visiblePoints.length < 2) return;

            const alpha = clamp(0.16 - (layerIndex % 4) * 0.018, 0.08, 0.16);
            const endFade = layer.headX <= 0.94 ? 1 : clamp((1.18 - layer.headX) / 0.24, 0, 1);
            const fadeForPoint = (point) => {
                const tailFade = clamp((point.x - trailStart) / 0.28, 0, 1);
                const edgeFade = clamp(point.x / 0.08, 0, 1);
                return tailFade * edgeFade * endFade;
            };

            context.save();
            visiblePoints.forEach((point, index) => {
                if (index === 0) return;

                const previousPoint = visiblePoints[index - 1];
                const segmentAlpha = alpha * Math.min(fadeForPoint(previousPoint), fadeForPoint(point));
                if (segmentAlpha <= 0.004) return;

                const current = pointToCanvas(layer, point);
                const previous = pointToCanvas(layer, previousPoint);
                const midpointX = (previous.x + current.x) / 2;
                const midpointY = (previous.y + current.y) / 2;
                const gradient = context.createLinearGradient(previous.x, previous.y, current.x, current.y);

                gradient.addColorStop(0, `rgba(${layer.color}, ${alpha * fadeForPoint(previousPoint)})`);
                gradient.addColorStop(1, `rgba(${layer.color}, ${alpha * fadeForPoint(point)})`);

                context.beginPath();
                context.moveTo(previous.x, previous.y);
                context.quadraticCurveTo(midpointX, midpointY, current.x, current.y);
                context.lineWidth = layerIndex === 0 ? 1.25 : 0.9;
                context.strokeStyle = gradient;
                context.shadowColor = "rgba(255, 138, 31, 0.16)";
                context.shadowBlur = 14 * endFade;
                context.stroke();
            });
            context.shadowBlur = 0;

            visiblePoints.forEach((point, pointIndex) => {
                if (layer.headX > 0.96 || (pointIndex % 5 !== 0 && !point.isHead)) return;
                const current = pointToCanvas(layer, point);
                const pointFade = fadeForPoint(point);
                if (pointFade <= 0.08) return;

                const wickHeight = height * point.wick;
                context.strokeStyle = `rgba(${layer.color}, ${alpha * 0.22 * pointFade})`;
                context.lineWidth = point.isHead ? 1 : 0.65;
                context.beginPath();
                context.moveTo(current.x, current.y - wickHeight);
                context.lineTo(current.x, current.y + wickHeight);
                context.stroke();
            });

            visiblePoints.slice(1).forEach((point, index) => {
                const previousPoint = visiblePoints[index];
                const segmentAlpha = alpha * 0.07 * Math.min(fadeForPoint(previousPoint), fadeForPoint(point));
                if (segmentAlpha <= 0.002) return;

                const current = pointToCanvas(layer, point);
                const previous = pointToCanvas(layer, previousPoint);
                const gradient = context.createLinearGradient(0, previous.y, 0, previous.y + 72);
                gradient.addColorStop(0, `rgba(${layer.color}, ${segmentAlpha})`);
                gradient.addColorStop(1, "rgba(255, 138, 31, 0)");

                context.beginPath();
                context.moveTo(previous.x, previous.y);
                context.lineTo(current.x, current.y);
                context.lineTo(current.x, current.y + 72);
                context.lineTo(previous.x, previous.y + 72);
                context.closePath();
                context.fillStyle = gradient;
                context.fill();
            });

            visiblePoints.forEach((point, pointIndex) => {
                if (layer.headX > 0.96 || (pointIndex % 5 !== 0 && !point.isHead)) return;
                const current = pointToCanvas(layer, point);
                const pointFade = fadeForPoint(point);
                if (pointFade <= 0.08) return;

                const barHeight = (4 + point.volume * 18) * (layerIndex === 0 ? 1 : 0.72);
                const barY = current.y + height * 0.07;
                context.fillStyle = `rgba(${layer.color}, ${alpha * 0.12 * pointFade})`;
                context.fillRect(current.x - 0.6, barY, 1.2, barHeight * 0.55);
            });

            visiblePoints.forEach((point, pointIndex) => {
                if (layer.headX > 0.96 || point.isHead || pointIndex % 6 !== 0) return;
                const current = pointToCanvas(layer, point);
                const pointFade = fadeForPoint(point);
                if (pointFade <= 0.05) return;
                context.fillStyle = `rgba(${layer.color}, ${alpha * 1.2 * pointFade})`;
                context.beginPath();
                context.arc(current.x, current.y, 1.05, 0, Math.PI * 2);
                context.fill();
            });

            context.restore();
        }

        function renderFrame(timestamp = performance.now()) {
            const delta = reducedMotion.matches ? 0 : Math.min(48, timestamp - lastFrame);
            lastFrame = timestamp;
            context.clearRect(0, 0, width, height);

            spawnDueLayers(timestamp);
            layers = layers.filter((layer, layerIndex) => {
                const alive = updateLayer(layer, layerIndex, timestamp, delta);
                if (alive) {
                    drawLayer(layer, layerIndex, timestamp);
                }
                return alive;
            });
        }

        function tick(timestamp = performance.now()) {
            if (!running) return;
            renderFrame(timestamp);

            if (!reducedMotion.matches) {
                animationFrame = requestAnimationFrame(tick);
            }
        }

        const observer = new ResizeObserver(() => {
            resize();
            renderFrame(performance.now());
        });

        observer.observe(canvas);
        resize();
        const seedPositions = [-1.16, -0.98, -0.8, -0.62, -0.44, -0.27, -0.1, 0.08, 0.26, 0.44, 0.62, 0.8];
        layers = seedPositions.map((position) => createLayer(position + (Math.random() - 0.5) * 0.08));
        scheduleNextSpawn(performance.now());

        if (reducedMotion.matches) {
            layers = Array.from({ length: 5 }, () => createLayer(1));
            layers.forEach((layer) => {
                layer.headX = 1;
                while (layer.nextPointX <= 1) {
                    layer.points.push(createPoint(layer.nextPointX, randomWalk(layer), layer.volatility));
                    layer.nextPointX += layer.tickDistance;
                }
            });
        }
        tick();

        return {
            destroy() {
                running = false;
                observer.disconnect();
                cancelAnimationFrame(animationFrame);
            },
        };
    }

    async function loadDocs(force = false) {
        if (docsStatus === "loaded" && !force) return;

        docsStatus = "loading";
        docsError = "";

        try {
            const response = await fetch(`${readmeUrl}?cache=${Date.now()}`, {
                headers: { Accept: "text/plain" },
            });

            if (!response.ok) {
                throw new Error(`GitHub returned ${response.status}`);
            }

            const markdown = await response.text();
            docsHtml = marked.parse(normalizeReadmeMarkdown(markdown));
            docsUpdatedAt = new Date().toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
            });
            docsStatus = "loaded";
        } catch (error) {
            docsError = error.message || "Could not load README.md from GitHub.";
            docsStatus = "error";
        }
    }

    onMount(() => {
        detectPlatform();
        syncPath();
        window.addEventListener("popstate", syncPath);

        return () => window.removeEventListener("popstate", syncPath);
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
            <a href={githubUrl}>GitHub</a>
            <a class:active={isDocsPage} href="/docs" on:click={(event) => navigate(event, "/docs")}>Docs</a>
            <button type="button" on:click={placeholderAction}>Releases</button>
        </nav>

        <div class="nav-actions">
            <a class="ghost-link" href={githubUrl}>
                <Github size={15} />
                <span>Source</span>
            </a>
            <button
                class="download-small"
                type="button"
                on:click={placeholderAction}
            >
                <Download size={15} />
                <span>Download</span>
            </button>
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
                    <button class="button secondary" type="button" on:click={() => loadDocs(true)} disabled={docsStatus === "loading"}>
                        <RefreshCw size={17} />
                        <span>{docsStatus === "loading" ? "Refreshing" : "Refresh from GitHub"}</span>
                    </button>
                    <a class="button secondary" href={`${githubUrl}/blob/main/README.md`}>
                        <ExternalLink size={17} />
                        <span>Open README</span>
                    </a>
                </div>
                {#if docsUpdatedAt}
                    <p class="platform-note">Last fetched {docsUpdatedAt}</p>
                {/if}
            </div>

            <article class="docs-card" aria-live="polite">
                {#if docsStatus === "loading"}
                    <div class="docs-loading">Fetching README.md from GitHub…</div>
                {:else if docsStatus === "error"}
                    <div class="docs-error">
                        <strong>Could not load docs.</strong>
                        <span>{docsError}</span>
                    </div>
                {:else}
                    <div class="markdown-body">
                        {@html docsHtml}
                    </div>
                {/if}
            </article>
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
                    v0.1.2-alpha
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
                    <button
                        class="button primary"
                        type="button"
                        on:click={placeholderAction}
                    >
                        <svelte:component this={primaryDownload.icon} size={17} />
                        <span>{primaryDownload.label}</span>
                        <kbd>D</kbd>
                    </button>

                    {#if platform === "linux"}
                        <button
                            class="button secondary"
                            type="button"
                            on:click={placeholderAction}
                        >
                            <FileArchive size={17} />
                            <span>AppImage</span>
                        </button>
                    {/if}

                    <a class="button secondary" href={githubUrl}>
                        <Github size={17} />
                        <span>View GitHub</span>
                    </a>
                </div>

                <p class="platform-note">
                    Detected {platformName}. {primaryDownload.detail}. Download
                    links are placeholders.
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
        </section>
    {/if}
</main>
