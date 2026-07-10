export const RELEASE_CACHE_TTL_MS = 60 * 60 * 1000;

const RELEASE_CACHE_KEY = "kerosene.latest-release";
const RELEASE_CACHE_VERSION = 1;

function isRecord(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function firstString(...values) {
    return values.find((value) => typeof value === "string" && value.trim())?.trim() ?? "";
}

export function normalizeRelease(release) {
    if (!isRecord(release)) {
        throw new Error("Invalid GitHub release response.");
    }

    const tagName = firstString(release.tag_name, release.tagName);
    const htmlUrl = firstString(release.html_url, release.htmlUrl);

    if (!tagName || !htmlUrl) {
        throw new Error("GitHub release is missing required metadata.");
    }

    const assets = Array.isArray(release.assets)
        ? release.assets
              .filter((asset) => isRecord(asset))
              .map((asset) => ({
                  name: firstString(asset.name),
                  browserDownloadUrl: firstString(asset.browser_download_url, asset.browserDownloadUrl),
              }))
              .filter((asset) => asset.name && asset.browserDownloadUrl)
        : [];

    return {
        name: firstString(release.name, tagName),
        tagName,
        htmlUrl,
        assets,
    };
}

export function selectPublishedRelease(releases) {
    if (!Array.isArray(releases)) {
        throw new Error("Unexpected GitHub releases response.");
    }

    const release = releases.find((item) => isRecord(item) && !item.draft);

    if (!release) {
        throw new Error("No published releases found.");
    }

    return normalizeRelease(release);
}

export function readReleaseCache(storage, now = Date.now()) {
    if (!storage || typeof storage.getItem !== "function") {
        return null;
    }

    try {
        const entry = JSON.parse(storage.getItem(RELEASE_CACHE_KEY));
        if (!isRecord(entry) || entry.version !== RELEASE_CACHE_VERSION || !Number.isFinite(entry.fetchedAt)) {
            return null;
        }

        const age = now - entry.fetchedAt;
        if (age < 0 || age >= RELEASE_CACHE_TTL_MS) {
            return null;
        }

        return {
            release: normalizeRelease(entry.release),
            fetchedAt: entry.fetchedAt,
        };
    } catch {
        return null;
    }
}

export function writeReleaseCache(storage, release, now = Date.now()) {
    if (!storage || typeof storage.setItem !== "function") {
        return false;
    }

    try {
        const normalizedRelease = normalizeRelease(release);
        storage.setItem(
            RELEASE_CACHE_KEY,
            JSON.stringify({
                version: RELEASE_CACHE_VERSION,
                fetchedAt: now,
                release: normalizedRelease,
            }),
        );
        return true;
    } catch {
        return false;
    }
}
