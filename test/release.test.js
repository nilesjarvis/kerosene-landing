import assert from "node:assert/strict";
import { test } from "node:test";

import {
    RELEASE_CACHE_TTL_MS,
    normalizeRelease,
    readReleaseCache,
    selectPublishedRelease,
    writeReleaseCache,
} from "../src/release.js";

class MemoryStorage {
    #values = new Map();

    lastKey = null;

    getItem(key) {
        return this.#values.get(key) ?? null;
    }

    setItem(key, value) {
        this.lastKey = key;
        this.#values.set(key, String(value));
    }

    overwriteLast(value) {
        assert.notEqual(this.lastKey, null, "the cache key must be established before overwriting it");
        this.#values.set(this.lastKey, value);
    }
}

const rawRelease = {
    id: 42,
    name: "Kerosene 0.2.0-beta",
    tag_name: "v0.2.0-beta",
    html_url: "https://github.com/nilesjarvis/kerosene/releases/tag/v0.2.0-beta",
    draft: false,
    prerelease: true,
    assets: [
        {
            name: "Kerosene-0.2.0-beta-macos-arm64.dmg",
            browser_download_url:
                "https://github.com/nilesjarvis/kerosene/releases/download/v0.2.0-beta/Kerosene-0.2.0-beta-macos-arm64.dmg",
            size: 123,
            content_type: "application/octet-stream",
        },
        {
            name: "kerosene_0.2.0-beta_amd64.deb",
            browser_download_url:
                "https://github.com/nilesjarvis/kerosene/releases/download/v0.2.0-beta/kerosene_0.2.0-beta_amd64.deb",
            size: 456,
        },
    ],
};

const normalizedRelease = {
    name: rawRelease.name,
    tagName: rawRelease.tag_name,
    htmlUrl: rawRelease.html_url,
    assets: [
        {
            name: rawRelease.assets[0].name,
            browserDownloadUrl: rawRelease.assets[0].browser_download_url,
        },
        {
            name: rawRelease.assets[1].name,
            browserDownloadUrl: rawRelease.assets[1].browser_download_url,
        },
    ],
};

test("selectPublishedRelease chooses the first published release, including a prerelease", () => {
    const draft = { ...rawRelease, id: 41, draft: true, prerelease: false };
    const laterStable = { ...rawRelease, id: 43, name: "Kerosene 0.1.9", prerelease: false };

    assert.deepEqual(selectPublishedRelease([draft, rawRelease, laterStable]), normalizedRelease);
});

test("normalizeRelease maps GitHub metadata and download assets to the public shape", () => {
    assert.deepEqual(normalizeRelease(rawRelease), normalizedRelease);
});

test("selectPublishedRelease rejects malformed and non-array API responses", () => {
    const malformedResponses = [
        null,
        undefined,
        {},
        { releases: [rawRelease] },
        "not an array",
        7,
        [],
        [null],
        [{ draft: true, tag_name: "v0.2.0" }],
        [{ draft: false }],
    ];

    for (const response of malformedResponses) {
        assert.throws(() => selectPublishedRelease(response), `expected rejection for ${String(response)}`);
    }
});

test("writeReleaseCache and readReleaseCache round-trip a fresh release entry", () => {
    const storage = new MemoryStorage();
    const fetchedAt = 1_000_000;

    writeReleaseCache(storage, normalizedRelease, fetchedAt);

    assert.deepEqual(readReleaseCache(storage, fetchedAt + RELEASE_CACHE_TTL_MS - 1), {
        release: normalizedRelease,
        fetchedAt,
    });
});

test("readReleaseCache ignores missing, malformed, and expired entries", () => {
    const now = 2_000_000;
    const storage = new MemoryStorage();

    assert.equal(readReleaseCache(storage, now), null);

    writeReleaseCache(storage, normalizedRelease, now);
    for (const malformed of [
        "not json",
        "null",
        JSON.stringify({ release: normalizedRelease }),
        JSON.stringify({ fetchedAt: now }),
        JSON.stringify({ release: null, fetchedAt: now }),
        JSON.stringify({ release: normalizedRelease, fetchedAt: "now" }),
    ]) {
        storage.overwriteLast(malformed);
        assert.equal(readReleaseCache(storage, now), null);
    }

    writeReleaseCache(storage, normalizedRelease, now - RELEASE_CACHE_TTL_MS - 1);
    assert.equal(readReleaseCache(storage, now), null);
});

test("a fresh cache entry remains usable when the GitHub API is unavailable", async () => {
    const storage = new MemoryStorage();
    const fetchedAt = 3_000_000;
    writeReleaseCache(storage, normalizedRelease, fetchedAt);

    const cachedAfterApiFailure = await Promise.resolve()
        .then(() => {
            throw new Error("GitHub API unavailable");
        })
        .catch(() => readReleaseCache(storage, fetchedAt + 1));

    assert.deepEqual(cachedAfterApiFailure, {
        release: normalizedRelease,
        fetchedAt,
    });
});
