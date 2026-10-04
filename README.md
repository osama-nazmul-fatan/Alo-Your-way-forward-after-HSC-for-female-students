** Alo: Funded education, scholarships and skills training for young women in Bangladesh after HSC.**

Alo is a  web platform that helps young women continue their education and become financially independent after the Higher Secondary Certificate (HSC). It brings funded university places, government and foreign scholarships, diplomas and free skills training into one place, matches each user to the programs she qualifies for and connects her with a counsellor who helps her apply.

🔗 **Live site:** https://alobd.netlify.app

After HSC, most young women in Bangladesh see only two paths: a public university, where few get a seat, or a private university their family cannot afford. Many stop studying at this point and become financially dependent. 
Yet seats and funding exist. Scholarships, stipends, diplomas, national university colleges, open learning and free training programs are available, but they are scattered across dozens of websites and deadlines. Alo closes that information gap.

## Features

### For young women
- **Pathway Finder:** five questions (GPA, HSC group, need to earn soon, device, ability to relocate) return a ranked list of matching programs.
- **Program explorer:** universities, scholarships, diplomas and skills training, with filters for *free or paid stipend*, *phone is enough* and *earn within a year*.
- **Save programs:** keep a personal list and track its status (Saved, Counsellor in touch, Applied, Enrolled).
- **Counsellor chat:** real-time messaging with the Alo team.
- **Earning guide:** the route from a new skill to first income, freelancing requirements and scam warnings.
- **Family section:** answers to common questions from parents and guardians.
- **Safety:** tap-to-call helplines (999, 109, 1098, Police HQ hotline) and a quick-exit button (also `Shift + Esc`).

### For admins and counsellors
- View every registered user with search and filters (by program, unread messages).
- See each user's profile and the programs she saved.
- Update the status of each interest.
- Reply to users in real time, with unread badges and notifications.
- "Interest by program" overview.
- Export all users to CSV.

### General
- Fully responsive, mobile-first design for low-cost Android phones.
- No build step: plain HTML, CSS and JavaScript.
- Accessible: keyboard focus states, reduced-motion support, semantic markup.

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | HTML, CSS, vanilla JavaScript |
| Fonts | Baloo Da 2, Hind Siliguri (Google Fonts, Bangla + Latin) |
| Authentication | Supabase Auth (email and password) |
| Database | Supabase (PostgreSQL) with Row Level Security |
| Real-time chat | Supabase Realtime |
| Hosting | Netlify |

---

## Project structure

```
alo-website/
├── index.html          # Home: pathway finder, program explorer, guides, helplines
├── auth.html           # Sign in, create account, reset password
├── dashboard.html      # User dashboard: saved programs, profile, chat
├── admin.html          # Admin panel: users, interests, chat, CSV export
├── css/
│   └── style.css       # Design system and responsive layout
├── js/
│   ├── config.js       # Supabase project URL and public key
│   ├── common.js       # Shared helpers (auth, toast, quick exit, nav)
│   ├── programs.js     # Program data (edit this to update programs)
│   ├── main.js         # Home page logic
│   ├── auth.js         # Sign-in and sign-up logic
│   ├── dashboard.js    # User dashboard logic
│   └── admin.js        # Admin panel logic
├── supabase/
│   └── schema.sql      # Tables, security rules, triggers, realtime
└── netlify.toml        # Netlify headers and settings
```

---

## Getting started

### Prerequisites
- A free [Supabase](https://supabase.com) account
- A free [Netlify](https://www.netlify.com) account


## Author

**Osama Nazmul Fatan (Nobee)**, Dhaka, Bangladesh

*If you or someone you know is in danger in Bangladesh, call **999** (emergency) or **109** (violence against women and children, child marriage).*
