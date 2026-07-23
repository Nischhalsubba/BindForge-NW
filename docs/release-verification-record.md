# Release verification record

Complete this record for every production candidate. Do not mark the release ready merely because the merge button was available. GitHub is not a quality oracle.

## Candidate

- Commit SHA:
- Pull request:
- Quality workflow URL:
- Release verification workflow URL:
- Tester:
- Date:

## Automated verification

- [ ] Dependency installation passed
- [ ] ESLint passed
- [ ] TypeScript passed
- [ ] Unit and catalog tests passed
- [ ] Production build passed
- [ ] Mobile Playwright project passed
- [ ] Tablet Playwright project passed
- [ ] Desktop Playwright project passed
- [ ] Dark-theme axe baseline passed
- [ ] Light-theme axe baseline passed
- [ ] Reports and diagnostics were retained

## Manual functional review

- [ ] Search toolbar is visible on mobile, tablet, and desktop
- [ ] Action dropdown is visible on mobile, tablet, and desktop
- [ ] Mobile filter panel opens and closes without horizontal overflow
- [ ] Class, action, and difficulty filters work together
- [ ] Bind and unbind output updates immediately
- [ ] Edited preset keys persist after reload
- [ ] Command Lab generates normalized output
- [ ] Custom chat binds sanitize line breaks and quotation marks
- [ ] Theme selection persists
- [ ] Backup export works
- [ ] Valid backup import works
- [ ] Invalid backup import is rejected clearly
- [ ] Version 1 migration works
- [ ] Clear saved data does not recreate storage immediately
- [ ] Clipboard success and fallback messaging are understandable
- [ ] Loading, not-found, and runtime-error recovery screens work

## Responsive review

| Viewport | Browser/device | Result | Notes |
|---|---|---|---|
| Mobile portrait |  |  |  |
| Mobile landscape |  |  |  |
| Tablet portrait |  |  |  |
| Tablet landscape |  |  |  |
| Desktop 1280px |  |  |  |
| Desktop 1440px+ |  |  |  |

## Accessibility review

- [ ] Keyboard focus is always visible
- [ ] Skip link moves to the library
- [ ] Toolbar controls have unique labels
- [ ] Filter disclosure exposes expanded state
- [ ] Status messages are announced without duplicate labels
- [ ] Text and controls remain readable in dark theme
- [ ] Text and controls remain readable in light theme
- [ ] Reduced-motion preference is respected

## Decision

- [ ] Ready for production deployment
- [ ] Blocked

Accepted limitations:


Approver:
