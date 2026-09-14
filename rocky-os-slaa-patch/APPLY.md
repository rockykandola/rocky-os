# Rocky OS S.L.A.A. H.O.W. patch

This patch adds a new `/slaa` section to Rocky OS.

It includes:

* A 37 day dashboard beginning September 14, 2026
* Daily 2:30 PM sponsor call checkbox
* Three daily outreach call checkboxes
* Prayer and meditation, meeting, and Bottom Line tracking
* Editable daily assignment and answer
* YES / NO / MAYBE tracking for the 12 characteristics
* Patterns noticed and notes for Mr. Jude
* A generated call summary with a Copy button
* Editable Bottom Lines, Middle Lines, and Top Lines
* Automatic browser localStorage saving
* A sidebar navigation item

## Apply on the Mac

From the root of the existing `rocky-os` repository, copy the three files in this bundle into the matching paths, then run:

```bash
npm run build
git add src/app/'(app)'/slaa/page.tsx src/components/slaa/slaa-how-dashboard.tsx src/components/layout/nav-items.ts
git commit -m "Add SLAA HOW recovery dashboard"
git push origin main
```

The GitHub repository is already linked to the Vercel project named `rocky-os`, so a push to `main` should trigger the normal deployment flow.
