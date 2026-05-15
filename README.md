# Kerosene Landing Inspiration

Source: [Zed homepage](https://zed.dev/)
Captured: May 14, 2026

This directory is an inspiration workspace for a future Kerosene landing page. The
screenshots are reference material only; the final Kerosene site should use its own
copy, screenshots, graphics, and brand system.

## Production Notes

- Download links fetch the newest non-draft GitHub release from
  `nilesjarvis/kerosene`, including prereleases. The site keeps bundled fallback
  links for the current alpha release so CTAs still work if GitHub's API is
  rate-limited or unavailable.
- The docs page renders Markdown fetched from GitHub through `marked`, then
  sanitizes the generated HTML with DOMPurify before injecting it into Svelte.
- Open Graph and Twitter metadata point at `public/social-card.svg`. If the site is
  deployed behind a fixed canonical domain, update social image URLs to absolute
  production URLs for crawler compatibility.

## Screenshot Inventory

| File | View | Notes |
| --- | --- | --- |
| [`screenshots/zed-home-desktop-hero.png`](screenshots/zed-home-desktop-hero.png) | Desktop, 1440 x 1200 | First viewport with nav, announcement strip, hero, CTAs, feature triad, and product screenshot. |
| [`screenshots/zed-home-desktop-full.png`](screenshots/zed-home-desktop-full.png) | Desktop, 1440 x 8180 | Full-page structure and section pacing. |
| [`screenshots/zed-home-mobile-full.png`](screenshots/zed-home-mobile-full.png) | Mobile, 390 x 10743 | Responsive stacking, compact nav, and mobile section order. |
| [`screenshots/zed-home-dark-desktop-hero.png`](screenshots/zed-home-dark-desktop-hero.png) | Dark desktop, 1440 x 1200 | Dark-mode hero treatment, nav, CTAs, feature triad, and product screenshot. |
| [`screenshots/zed-home-dark-desktop-full.png`](screenshots/zed-home-dark-desktop-full.png) | Dark desktop, 1440 x 8180 | Full-page dark-mode pacing and section contrast. |
| [`screenshots/zed-home-dark-mobile-full.png`](screenshots/zed-home-dark-mobile-full.png) | Dark mobile, 390 x 10743 | Mobile dark-mode stacking and footer treatment. |

To refresh the captures, run:

```sh
./scripts/capture-zed.sh
```

The helper uses Playwright's CLI, captures both light and dark variants, and
writes a temporary anonymous storage state to hide the cookie banner before
capture.

## High-Level Style

Zed's page feels like a precise technical document wrapped around a product demo.
It is restrained, product-first, and intentionally sparse. The visual system relies
on thin lines, off-white surfaces, a single strong blue, compact copy, and actual
software UI screenshots instead of abstract illustrations.

The important idea for Kerosene is not to copy Zed's exact look, but to borrow the
same confidence: a native tool should show the product immediately, keep the page
fast and legible, and treat technical details as part of the brand.

## Visual Language

- Warm off-white background with light paper texture.
- Thin blueprint-like grid lines and ruler marks define the page structure.
- Hairline borders separate sections, columns, feature panels, and cards.
- Large real product screenshot creates most of the visual weight.
- Minimal shadows; depth comes from contrast between pale page chrome and dark app
  UI.
- UI elements use small radii, closer to native software controls than rounded SaaS
  pills.
- Decorative elements stay quiet and structural instead of illustrative.

## Color Direction

Observed light palette:

- Background: warm white / pale gray.
- Primary accent: vivid royal blue for logo, headline, primary buttons, links, and
  footer.
- Text: near-black for headings, gray for supporting copy.
- Borders: very light blue-gray.
- Product media: dark neutral editor surface with syntax-highlight accents.

Observed dark palette:

- Background: near-black with a faint blue cast rather than pure black.
- Primary accent: saturated blue remains reserved for CTAs, logo, and footer.
- Hero headline: softened sky-blue, not the same vivid CTA blue.
- Text: cool off-white for headings, muted blue-gray for body and metadata.
- Borders: low-contrast graphite/blue-gray lines that are visible but quiet.
- Product media: dark UI blends into the page more than in light mode, so the
  window chrome and screenshot edges carry less contrast.

Kerosene adaptation:

- Keep a pale technical shell for the page, but let Kerosene's terminal screenshots
  provide the darker visual mass.
- Offer a dark page mode that feels native to the terminal rather than simply
  inverted from light mode.
- Use green and red for market semantics only: price changes, buy/sell labels,
  order book depth, and chart movement.
- Use one structural accent color for CTAs and navigation. Blue works well, but a
  cooler cyan or graphite-blue could feel more financial-terminal specific.
- Avoid making the page dominated by red/green; that would read as noisy and less
  trustworthy.

Suggested starting tokens:

```css
--page-bg: #f7f6f1;
--grid-line: rgba(40, 84, 170, 0.12);
--text: #171717;
--muted: #62666d;
--accent: #0b55ff;
--panel-dark: #252a31;
--border: #dbe1ea;
--buy: #50fa7b;
--sell: #ff5555;
--radius-control: 4px;
--radius-card: 6px;
```

Suggested dark tokens:

```css
--page-bg: #090b0f;
--surface: #0d1117;
--surface-raised: #111722;
--grid-line: rgba(102, 139, 190, 0.12);
--text: #eef4ff;
--muted: #9aa7b8;
--accent: #1f5fff;
--accent-soft: #8ab9ff;
--panel-dark: #262c35;
--border: #202936;
--buy: #50fa7b;
--sell: #ff5555;
```

## Dark Mode Analysis

Zed's dark mode is not a simple color inversion. It keeps the same editorial grid,
but the page becomes a dark technical workspace where the blueprint lines recede
and the app screenshot merges into the environment. The result feels more like a
native tool surface and less like a marketing page.

What works:

- The hero headline shifts from vivid royal blue to a softer icy blue, preserving
  hierarchy without glare.
- Borders and ruler marks remain visible, but they are low contrast enough to avoid
  visual noise.
- The primary CTA is still saturated blue, so the page has one obvious action.
- The footer keeps the high-energy blue block, which gives the long dark page a
  clear endpoint.
- Mobile dark mode stays readable because sections continue to use thin separators
  and compact vertical rhythm.

Tradeoffs:

- Product screenshots have less contrast against the page because both are dark.
  This is elegant, but it can make the product boundary less obvious.
- Several lower-page cards become very quiet in dark mode. That works for a known
  editor brand, but a new Kerosene page may need slightly stronger card borders or
  brighter screenshot framing.
- The blue footer is visually dominant in both modes. For Kerosene, that footer
  color should be tied to the brand accent, not copied as-is.

Kerosene dark-mode direction:

- Use dark mode as the primary-feeling version if the terminal itself is dark.
- Frame the app screenshot with a thin bright keyline or subtle outer glow so it
  does not disappear into the page.
- Keep market green/red inside screenshots and data callouts; avoid using them as
  page decoration.
- Use cool dark neutrals for page chrome and let one accent color own CTAs.
- Increase contrast a little beyond Zed for small financial data, since traders
  will scan numbers and labels more aggressively than editor marketing copy.

## Typography

Zed uses a sharp contrast between a refined display headline and compact,
code-adjacent interface text. The hero headline is large, thin, and editorial; the
supporting copy and feature text feel denser and more technical.

Kerosene can use the same typographic hierarchy:

- Display headline: large, calm, not shouty.
- Body: compact and highly legible.
- Data callouts: monospaced or tabular numerals.
- Labels: small, uppercase only when it improves scanability.

For a trading terminal, tabular numerals matter more than decorative type. Any
market stats, latency figures, or price examples should align cleanly.

## Layout Observations

### Desktop Hero

The first viewport is highly ordered:

- Compact nav at the top with logo, product links, search shortcut, sign-up link,
  and strong download button.
- Announcement strip below the nav.
- Centered hero copy with one large claim, one supporting sentence, primary and
  secondary CTAs, then OS availability.
- Three short feature statements sit in a bordered row before the product
  screenshot.
- The product screenshot starts before the first viewport ends, making the product
  unavoidable.

Kerosene equivalent:

- Show the Kerosene terminal in the first viewport, not a generic market graphic.
- Put charts, order book, positions, and account state in the hero screenshot.
- Use three claims that are concrete: native Rust performance, multi-pane market
  workflow, and direct exchange connectivity.
- Keep CTA choices narrow: download, GitHub/source, docs, or waitlist depending on
  the project state.

### Full Desktop Page

The page alternates between proof, features, ecosystem, engineering detail, blog
updates, and final CTA. It stays visually consistent because every section uses
the same grid, border, small-card, and screenshot grammar.

Strong reusable patterns:

- Feature groups with one screenshot plus several compact feature descriptions.
- Social proof cards with quotes and tiny identity blocks.
- Ecosystem section with dense plugin/extension cards.
- Engineering section that uses feature rows instead of oversized marketing cards.
- Final CTA that repeats the app icon, primary CTA, and source CTA.

Kerosene equivalent sections:

- "Built for fast market reading" with chart/order-book screenshot.
- "Control your workspace" with pane grid, watchlists, and account panels.
- "Execution and risk at a glance" with order entry, positions, fills, and PnL.
- "Native Rust desktop app" with iced/Rust performance story.
- "Open source" or "Local-first" if those are accurate for the project.

### Mobile Page

The mobile layout keeps the desktop story but removes side-by-side complexity:

- Nav collapses to logo and menu.
- Hero remains centered.
- Feature row becomes stacked cards.
- Product screenshots are scaled down but remain prominent.
- Dense grids become single-column lists.
- Footer becomes very tall, so link hierarchy must be intentional.

Kerosene mobile note:

The actual Rust app is desktop-oriented, so the landing page should not pretend the
terminal is mobile-first. Mobile should focus on understanding, screenshots, and
download/source actions rather than simulating a trading workflow.

## Component Notes

- Buttons: rectangular, compact, small radius, strong border or fill.
- Keyboard hints: small outlined keycaps beside action labels.
- Cards: thin borders, low radius, little or no shadow.
- Section dividers: horizontal rules and grid intersections instead of large
  background color changes.
- Product media: app-window chrome with real UI content.
- Icons: small, functional, mostly monochrome except the brand mark.
- CTAs: primary filled accent, secondary outlined.

## What To Borrow For Kerosene

- Product-first first viewport.
- Pale technical grid as a background system.
- Dark application screenshot as the visual anchor.
- Compact engineering copy that mentions Rust, native performance, and direct
  workflows.
- Thin bordered feature rows instead of bulky marketing cards.
- Strong final CTA that repeats the primary action.

## What To Change For Kerosene

- Use financial-terminal density, not editor density.
- Let market semantics drive accent color: green/red for directional data,
  neutral tones for chrome, one CTA accent for actions.
- Replace developer social proof with relevant proof: exchange support,
  open-source status, latency/performance claims, screenshots, docs, or roadmap.
- Use chart and order-flow imagery instead of code editor imagery.
- Keep the tone pragmatic and trust-focused; avoid hype around trading outcomes.

## Initial Landing Page Direction

Working concept:

> Kerosene is a native Rust trading terminal for reading markets, managing account
> state, and acting from a fast multi-pane desktop workspace.

Potential first-viewport structure:

1. Compact nav with Kerosene wordmark, GitHub, docs, releases, and download.
2. Announcement strip for latest release or active development status.
3. Centered headline focused on native trading workflow.
4. Two CTAs: download/build from source and view GitHub/docs.
5. Three bordered claims: Native Rust, Multi-pane market view, Exchange-connected.
6. Large real Kerosene screenshot showing chart, order book, account, and trades.

The page should feel more like an instrument panel than a brochure: calm, precise,
fast, and built around the actual terminal.
