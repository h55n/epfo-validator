# EPFO Validator — Device & Browser QA Checklist

Run this checklist before every production release.

---

## Automated (must pass before manual QA)

- [ ] `npm run lint` — zero warnings
- [ ] `npm run build` — zero errors, bundle sizes within limits
- [ ] `npm test --project=chromium` — all specs pass
- [ ] `npm test --project=firefox` — all specs pass
- [ ] `npm test --project=mobile-chrome` — all mobile specs pass

---

## Browser / Device Matrix

### Desktop

| Browser | Version | OS | Login | Validation | Resolution | Submit | Hindi |
|---------|---------|---|-------|------------|------------|--------|-------|
| Chrome  | Latest  | Windows 11 | ☐ | ☐ | ☐ | ☐ | ☐ |
| Firefox | Latest  | Windows 11 | ☐ | ☐ | ☐ | ☐ | ☐ |
| Edge    | Latest  | Windows 11 | ☐ | ☐ | ☐ | ☐ | ☐ |
| Safari  | Latest  | macOS 14   | ☐ | ☐ | ☐ | ☐ | ☐ |

### Mobile

| Device | OS | Browser | Login | Validation | Hindi | No horizontal scroll |
|--------|----|---------|-------|------------|-------|----------------------|
| iPhone 14 | iOS 17 | Safari | ☐ | ☐ | ☐ | ☐ |
| Pixel 7   | Android 14 | Chrome | ☐ | ☐ | ☐ | ☐ |
| Samsung Galaxy A54 | Android 13 | Samsung Internet | ☐ | ☐ | ☐ | ☐ |

### Tablet

| Device | OS | Browser | Layout |
|--------|----|---------|--------|
| iPad Air (768px) | iPadOS 17 | Safari | ☐ |
| Samsung Tab S8 (800px) | Android 13 | Chrome | ☐ |

---

## Zoom & Text Size

| Zoom Level | Login | Dashboard | Validation |
|------------|-------|-----------|------------|
| 100% (default) | ☐ | ☐ | ☐ |
| 150% | ☐ | ☐ | ☐ |
| 200% | ☐ | ☐ | ☐ |
| Browser large text (via OS accessibility) | ☐ | ☐ | ☐ |

---

## Screen Reader

Test with VoiceOver (macOS/iOS) or NVDA (Windows) + Chrome:

- [ ] Login form announced correctly: UAN field, password field, submit button
- [ ] Demo account buttons announced with name and scenario label
- [ ] Validation cards announce status changes (role="status", aria-live="polite")
- [ ] Document modal: focus trapped, role="dialog" announced, Escape closes
- [ ] Error messages read aloud on invalid login
- [ ] Hindi text read as expected (may vary by screen reader)

---

## Visual QA Checklist

Run on each supported browser/device above:

- [ ] No text overflow or truncation on narrow screens (375px)
- [ ] All CTA buttons have minimum 44px tap target
- [ ] Status badges (PASS/FAIL/ADVISORY) distinct in colour AND text (no colour-only distinction)
- [ ] Focus rings visible on all interactive elements (Tab through the page)
- [ ] Prototype banner visible on all pages
- [ ] Hindi text renders without boxes/tofu (font supports Devanagari)
- [ ] PDF download produces readable document
- [ ] Print dialog opens and content is formatted correctly

---

## Performance (Lighthouse)

Run in Chrome DevTools → Lighthouse on the deployed production URL:

| Metric | Target | Actual |
|--------|--------|--------|
| Performance | ≥ 85 | |
| Accessibility | ≥ 90 | |
| Best Practices | ≥ 90 | |
| SEO | ≥ 85 | |
| FCP (First Contentful Paint) | ≤ 2.5s | |
| LCP (Largest Contentful Paint) | ≤ 4s | |
| TBT (Total Blocking Time) | ≤ 300ms | |

---

## Sign-off

| Release | Date | QA Engineer | Notes |
|---------|------|-------------|-------|
| v1.0.0 | | | |
