# Portfolio audit

## Cloudinary
- [ ] Configure server-only Cloudinary credentials and protected Studio access.
- [ ] Move media and project metadata to Cloudinary; remove their Lovable storage/database dependency while preserving other features.
- [ ] Support upload, editing, replacement and permanent removal through authorized server operations.
- [ ] Verify upload, persistence, public display, replacement, removal and unauthorized-request rejection.

- [x] Replace archive category dropdown with pill buttons; selection verified in browser.
- [x] Store contact submissions privately and show confirmed success or retry errors; browser submission checked against stored data.
- [x] Stabilize video unit tests, including rejected playback; eight focused tests pass.

- [x] Add video pause, image enlargement with close control, and editable realization categories.

- [x] Verify scrolling, mobile layout, media presentation, image enlargement, and video pause/resume.
- [x] Verify project and media creation, editing, categories, visibility, and deletion; report failed saves accurately.
- [x] Verify contact behavior: messages are stored privately; direct email remains optional, with no automatic email delivery.
- [x] Verify text/color persistence, run focused tests and desktop/mobile checks, and remove temporary test media and projects.