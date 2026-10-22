# CampusPulse

**Smart campus issue reporting and tracking system.**

CampusPulse is a website where college students report campus problems such as broken fans, water leakage or poor Wi-Fi, and track each one until it is fixed. Every report gets a tracking ID and a public status, so problems no longer get lost or ignored.

Built for a college hackathon at KIET.

<!-- Add screenshots here, e.g. ![Home](screenshots/home.png) -->

## Features

**For students**
- Sign in with a college email (`name@kiet.edu` only)
- Report an issue with title, category, location, urgency, description and an optional photo
- Duplicate detection: while typing, the form suggests similar open reports, so students can add "I'm affected too" instead of filing a copy
- Automatic urgency: words like *leak*, *spark*, *shock* or *flood* set the urgency to High
- Track any report by its ID (for example `CP-1001`) and see its status timeline
- "I'm affected too" votes (one per student) to show which problems affect the most people
- "My reports" filter to see only your own submissions
- Search, filter by status or category, and sort by newest, most affected or highest urgency

**For staff**
- Sign in with a staff code
- Update an issue's status (Reported, In Progress, Resolved) with a note shown in the timeline
- Export all reports to CSV

**For everyone**
- Live counters and an Insights dashboard: percent resolved, average days to fix, overdue issues, issues by category and the most affected issue
- Overdue tag on unresolved issues older than 3 days
- Responsive layout for phones, tablets and laptops, with automatic dark mode
- Keyboard accessible and respects reduced-motion settings

## Privacy by design

Reports are anonymous. No name or email is stored with a report or shown to anyone, including staff. A student's email is converted into a one-way hash that the browser uses only to remember which reports belong to that student and which ones they have voted on.

## Tech stack

- HTML5, CSS3 (custom properties, grid, flexbox) and vanilla JavaScript
- Browser `localStorage` for data and `sessionStorage` for the login session
- No frameworks, no build step, no dependencies
- Google Fonts: Bricolage Grotesque and DM Sans

## Getting started

1. Clone the repository or download the zip:
   ```bash
   git clone https://github.com/<your-username>/campuspulse.git
   cd campuspulse
   ```
2. Open `index.html` in any modern browser. No server or install is needed.

Optional: serve it locally with `python3 -m http.server 8000` and open `http://localhost:8000`.

## Demo logins

| Role    | How to sign in                        |
|---------|---------------------------------------|
| Student | Any email ending in `@kiet.edu`       |
| Staff   | Code `1234` (demo value)              |

To change the staff code, edit the `PIN` constant on the first line of `app.js`.

## Project structure

```
campuspulse/
├── index.html   # Page structure, login screen, report form, modals
├── styles.css   # Styling, responsive layout, dark mode
├── app.js       # Data, login, rendering, smart assist, insights, CSV export
└── README.md
```

## Known limitations

This is a front-end prototype built for a hackathon.

- Data lives in the browser, so it is not shared between devices or users.
- The student login only checks that the email ends in `@kiet.edu`. It does not verify that the person owns the inbox.
- The staff code is stored in the front-end code, so anyone can read it using the browser's developer tools.
- Photos and data are limited by the browser's storage quota (about 5 MB).

## Roadmap

- [ ] Backend and database (Firebase or Node.js with MongoDB) so data is shared
- [ ] Email verification with a one-time code, or Google sign-in restricted to the college domain
- [ ] Proper staff accounts with roles and department assignment
- [ ] Email or push notifications when an issue's status changes
- [ ] AI-based categorization and urgency detection
- [ ] Map or floor-plan view of issues by building
- [ ] Admin analytics with trends over time

## Author

**Vasu Garg**, KIET
