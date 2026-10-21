# Queue Tracker

Dependency-free, mobile-first PWA for regular P and priority U tickets at three service windows. Includes the 37 original observations, from P81 at 08:48 to P120 at 09:28, and target P159. Missing observations are not inferred.

## Development

Use Node.js 22 or newer. Run `npm test` for Node's built-in tests. Serve with `python3 -m http.server 8000`; open http://localhost:8000. No install or build step is required. The browser imports the tested queue-core.mjs module.

## Data safety

Existing localStorage at `kolejka-p159-v1` and legacy JSON `{rows,target}` exports are supported. Invalid saved data is preserved and blocks saving; the download button exports the original raw data for recovery. Do not clear browser storage before backing up. Valid empty history remains empty. Storage failures appear in the interface.

Imports validate the entire file, merge only new tickets, preserve existing conflicts and the current target, require confirmation, and save a pre-import snapshot before changes. P times must follow ticket-number order; simultaneous calls are allowed. Historical legacy data loads without time-order rejection so it remains recoverable. Editing and deletion are explicit user actions; deletion requires confirmation. Export JSON before editing important records.

Data is local to a browser and origin, not synced to GitHub. Moving from another hostname or a file URL requires a one-time JSON export/import. The app tracks one day's queue; midnight rollover requires a separate history backup/session. Estimates use observed P progression and are not service guarantees.

## GitHub workflow

Future changes use feature branches and pull requests in piowys/queue-tracker. CI runs `npm test` on pull requests; merges to main run tests and deploy only public application assets with GitHub Actions. No ZIP transfers are needed.

Select repository Settings → Pages → Source: GitHub Actions. The expected URL is https://piowys.github.io/queue-tracker/. Private repository Pages availability depends on the account plan; the site and bundled seed history will be publicly accessible. Do not change repository visibility without the owner's instruction.

## Updates and offline use

The service worker precaches a complete version including JavaScript modules. It asks before activating an update and reloading. Bump the queue-tracker cache version in sw.js for every application change. Only this app's old caches are removed. Unsaved form input should be submitted before accepting an update.

## Manual testing

1. On Android Chrome, load the site and confirm 37 history entries, latest P120, target P159, and collapsed history sorted newest first. Check local clock after a minute and after returning from the background.
2. Add P121 at 09:29 with window 2 and U29 with window 3. Check duplicate rejection, invalid time rejection, and rejection of P122 at 09:27. Edit an entry and check duplicates and chronological validation again.
3. Reload and verify persistence. Export JSON, import it again, and confirm no duplicates. Import a conflicting backup and verify local values remain. Cancel an import and verify nothing changes.
4. Install to the Android home screen, reload once online, then open in airplane mode. Confirm history, editing, and export remain available.
5. Deploy a version with a new cache version while the old app is open. Reload online, accept the update prompt, and confirm history survives. Check the updated version offline.
6. In a separate test browser profile, place invalid JSON in the storage key and reload. Confirm the warning, raw backup download, and preservation of that storage value.
