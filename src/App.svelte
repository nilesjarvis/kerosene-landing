<script>
    import {
        Apple,
        Download,
        FileArchive,
        Github,
        MonitorDown,
        Package,
        TerminalSquare,
    } from "lucide-svelte";
    import { onMount } from "svelte";

    const githubUrl = "https://github.com/nilesjarvis/kerosene";

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

    $: primaryDownload = downloadTargets[platform] ?? downloadTargets.unknown;

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

    function placeholderAction() {}

    onMount(detectPlatform);
</script>

<svelte:head>
    <meta name="theme-color" content="#090a0c" />
</svelte:head>

<main class="shell">
    <div class="side-rail left"></div>
    <div class="side-rail right"></div>

    <header class="topbar" aria-label="Site header">
        <a class="brand" href="/" aria-label="Kerosene home">
            <span class="brand-mark" aria-hidden="true"></span>
            <span class="brand-name">Kerosene</span>
        </a>

        <nav class="nav-links" aria-label="Primary navigation">
            <a href={githubUrl}>GitHub</a>
            <button type="button" on:click={placeholderAction}>Docs</button>
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

    <section class="hero" aria-labelledby="hero-title">
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
</main>
