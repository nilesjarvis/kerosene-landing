# Kerosene Landing

## Production Notes

- Download links fetch the newest non-draft GitHub release from
  `nilesjarvis/kerosene`, including prereleases. Successful checks are cached in
  the browser for one hour, and bundled fallback links keep CTAs working if
  GitHub's API is rate-limited or unavailable.
- The docs page renders Markdown fetched from GitHub through `marked`, then
  sanitizes the generated HTML with DOMPurify before injecting it into Svelte.
- Open Graph and Twitter metadata point at `public/social-card.svg`. If the site is
  deployed behind a fixed canonical domain, update social image URLs to absolute
  production URLs for crawler compatibility.

## High-Level Style

A product-first, native-tool aesthetic. The page should feel like a precise
technical document wrapped around a product demo: restrained, intentional, and
sparse. Visual weight comes from the actual terminal screenshots, not abstract
illustrations. Confidence in the product is the guiding principle - show the
software immediately, keep the page fast and legible, and treat technical details
as part of the brand.

## Visual Language

- Dark background with faint grid lines defining the page structure.
- Hairline borders separate sections, columns, feature panels, and cards.
- Large real product screenshot creates most of the visual weight.
- Minimal shadows; depth comes from contrast between page chrome and terminal UI.
- UI elements use small radii, closer to native software controls than rounded SaaS
  pills.
- Decorative elements stay quiet and structural instead of illustrative.

## Color Direction

- Near-black background with faint orange-tinted grid lines.
- Single structural accent color for CTAs and navigation.
- Green and red for market semantics only: price changes, buy/sell labels,
  order book depth, and chart movement.
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

## Dark Mode Direction

- Use dark mode as the primary-feeling version if the terminal itself is dark.
- Frame the app screenshot with a thin bright keyline or subtle outer glow so it
  does not disappear into the page.
- Keep market green/red inside screenshots and data callouts; avoid using them as
  page decoration.
- Use cool dark neutrals for page chrome and let one accent color own CTAs.
- Increase contrast for small financial data, since traders
  will scan numbers and labels more aggressively than marketing copy.

## Typography

A sharp contrast between a refined display headline and compact,
code-adjacent interface text. The hero headline is large, thin, and editorial; the
supporting copy and feature text feel denser and more technical.

- Display headline: large, calm, not shouty.
- Body: compact and highly legible.
- Data callouts: monospaced or tabular numerals.
- Labels: small, uppercase only when it improves scanability.

For a trading terminal, tabular numerals matter more than decorative type. Any
market stats, latency figures, or price examples should align cleanly.

## Layout Direction

### Desktop Hero

The first viewport is highly ordered:

- Compact nav at the top with wordmark, GitHub, docs, releases, and download.
- Announcement strip below the nav.
- Centered hero copy with one large claim, one supporting sentence, primary and
  secondary CTAs, then platform availability.
- Three short feature statements sit in a bordered row before the product
  screenshot.
- The Kerosene terminal screenshot starts before the first viewport ends, making
  the product unavoidable.
- Show charts, order book, positions, and account state in the hero screenshot.
- Use three concrete claims: native Rust performance, multi-pane market
  workflow, and direct exchange connectivity.
- Keep CTA choices narrow: download, GitHub/source, docs, or waitlist depending on
  the project state.

### Full Page

The page alternates between proof, features, engineering detail, and final CTA. It
stays visually consistent because every section uses the same grid, border,
small-card, and screenshot grammar.

Strong reusable patterns:

- Feature groups with one screenshot plus several compact feature descriptions.
- Feature rows instead of oversized marketing cards.
- Final CTA that repeats the app icon, primary CTA, and source CTA.

Suggested sections:

- "Built for fast market reading" with chart/order-book screenshot.
- "Control your workspace" with pane grid, watchlists, and account panels.
- "Execution and risk at a glance" with order entry, positions, fills, and PnL.
- "Native Rust desktop app" with iced/Rust performance story.
- "Open source" or "Local-first" if those are accurate for the project.

### Mobile

The mobile layout keeps the desktop story but removes side-by-side complexity:

- Nav collapses to logo and menu.
- Hero remains centered.
- Feature row becomes stacked cards.
- Product screenshots are scaled down but remain prominent.
- Dense grids become single-column lists.

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
