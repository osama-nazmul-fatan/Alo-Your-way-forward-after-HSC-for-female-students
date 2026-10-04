// ===== Alo program data =====
// Edit this list to add, change or remove programs. Every entry should be checked against
// its official source before launch, and "verified" updated to the date you checked it.
//
// cat:      university | scholarship | diploma | skill
// cost:     free | low | varies | paid | stipend   (stipend = the program pays the student)
// device:   none | phone | laptop | provided
// earnSoon: true if it can lead to income within about a year
// minGpa:   minimum HSC GPA if one applies (null = no fixed minimum / check circular)
// groups:   HSC groups that can apply: ["any"] or any of "science", "humanities", "business"
// relocate: true if most students must move away from home
// link:     official website, or null when it varies by institute

window.ALO_PROGRAMS = [
  // ---------- Universities ----------
  { id: "uni-public", cat: "university", title: "Public university admission", provider: "DU, RU, JU, GST cluster and other public universities",
    duration: "4 years", cost: "low", costText: "Low tuition", mode: "On campus", device: "none", earnSoon: false, minGpa: 3.5, groups: ["any"], relocate: true,
    summary: "Highly competitive, but very affordable. Alo tracks each university's form dates, units and admission test schedule.", link: null },
  { id: "uni-nu", cat: "university", title: "Honours at National University colleges", provider: "National University affiliated government colleges",
    duration: "4 years", cost: "low", costText: "Low fees", mode: "On campus, in your district", device: "none", earnSoon: false, minGpa: null, groups: ["any"], relocate: false,
    summary: "Large capacity and colleges in every district, so you can study close to home at a low cost.", link: "https://www.nu.ac.bd" },
  { id: "uni-bou", cat: "university", title: "Bachelor's at Bangladesh Open University", provider: "Bangladesh Open University",
    duration: "3–4 years", cost: "low", costText: "Low fees", mode: "Distance learning with weekend tutorials", device: "phone", earnSoon: true, minGpa: null, groups: ["any"], relocate: false,
    summary: "Study while you work or after marriage. Classes are mostly self-study with tutorial centres across the country.", link: "https://www.bou.ac.bd" },
  { id: "uni-auw", cat: "university", title: "Asian University for Women", provider: "AUW, Chattogram",
    duration: "4–5 years", cost: "free", costText: "Substantial scholarships", mode: "Residential, Chattogram", device: "none", earnSoon: false, minGpa: null, groups: ["any"], relocate: true,
    summary: "A women's university that offers substantial scholarships to students from low-income families. Teaching is in English.", link: "https://www.auw.edu.bd" },
  { id: "uni-private-waiver", cat: "university", title: "Private university with waiver", provider: "Private universities with merit, need or female-student waivers",
    duration: "4 years", cost: "varies", costText: "Partial to full waiver", mode: "On campus", device: "none", earnSoon: false, minGpa: 4.0, groups: ["any"], relocate: false,
    summary: "Many private universities reduce or waive tuition for strong results, low family income, or female students. Ask each university for its waiver policy.", link: null },
  { id: "uni-nursing-bsc", cat: "university", title: "BSc in Nursing", provider: "Government and private nursing colleges",
    duration: "4 years", cost: "low", costText: "Low at government colleges", mode: "On campus", device: "none", earnSoon: false, minGpa: null, groups: ["science"], relocate: true,
    summary: "A respected profession with steady demand at hospitals in Bangladesh and abroad.", link: "https://www.dgnm.gov.bd" },

  // ---------- Scholarships ----------
  { id: "sch-pmeat", cat: "scholarship", title: "Education Assistance Trust stipend", provider: "Prime Minister's Education Assistance Trust",
    duration: "Yearly", cost: "stipend", costText: "Pays you", mode: "Online application", device: "phone", earnSoon: false, minGpa: null, groups: ["any"], relocate: false,
    summary: "Stipends and admission assistance for students from low-income families, up to bachelor's level. Payment is through a Nagad account in your name.", link: null },
  { id: "sch-board", cat: "scholarship", title: "HSC board scholarship", provider: "Education boards",
    duration: "During degree", cost: "stipend", costText: "Pays you", mode: "Awarded on results", device: "none", earnSoon: false, minGpa: 4.5, groups: ["any"], relocate: false,
    summary: "Awarded to students with high HSC results. Check your board's scholarship list after results are published.", link: null },
  { id: "sch-mext", cat: "scholarship", title: "MEXT scholarship, Japan", provider: "Government of Japan, via the Embassy in Dhaka",
    duration: "4–5 years", cost: "free", costText: "Fully funded", mode: "Study in Japan", device: "laptop", earnSoon: false, minGpa: 4.5, groups: ["any"], relocate: true,
    summary: "Covers tuition, a monthly allowance and flights, with a year of Japanese language training.", link: "https://www.studyinjapan.go.jp" },
  { id: "sch-gks", cat: "scholarship", title: "Global Korea Scholarship (undergraduate)", provider: "Government of Korea",
    duration: "5 years incl. Korean language", cost: "free", costText: "Fully funded", mode: "Study in Korea", device: "laptop", earnSoon: false, minGpa: 4.0, groups: ["any"], relocate: true,
    summary: "Covers tuition, living allowance and flights for undergraduate study in Korea.", link: "https://www.studyinkorea.go.kr" },
  { id: "sch-turkiye", cat: "scholarship", title: "Türkiye Bursları", provider: "Government of Türkiye",
    duration: "Degree length + language year", cost: "free", costText: "Fully funded", mode: "Study in Türkiye", device: "laptop", earnSoon: false, minGpa: 4.0, groups: ["any"], relocate: true,
    summary: "Full scholarship with accommodation, health insurance and a monthly stipend.", link: "https://www.turkiyeburslari.gov.tr" },
  { id: "sch-hungary", cat: "scholarship", title: "Stipendium Hungaricum", provider: "Government of Hungary",
    duration: "Degree length", cost: "free", costText: "Fully funded", mode: "Study in Hungary", device: "laptop", earnSoon: false, minGpa: 4.0, groups: ["any"], relocate: true,
    summary: "Tuition-free study with a monthly stipend and housing support, taught in English.", link: "https://stipendiumhungaricum.hu" },
  { id: "sch-usa", cat: "scholarship", title: "Need-based aid at US colleges", provider: "US colleges, free advice from EducationUSA",
    duration: "4 years", cost: "varies", costText: "Up to full aid", mode: "Study in the USA", device: "laptop", earnSoon: false, minGpa: 4.5, groups: ["any"], relocate: true,
    summary: "Some US colleges meet full financial need for international students. EducationUSA advisers in Dhaka help for free.", link: "https://educationusa.state.gov" },

  // ---------- Diplomas ----------
  { id: "dip-nursing", cat: "diploma", title: "Diploma in Nursing Science and Midwifery", provider: "Government and private nursing institutes",
    duration: "3 years", cost: "low", costText: "Low at government institutes", mode: "On campus", device: "none", earnSoon: false, minGpa: null, groups: ["any"], relocate: true,
    summary: "Leads to work as a nurse in hospitals and clinics. Check the current circular for group and GPA rules.", link: "https://www.dgnm.gov.bd" },
  { id: "dip-midwifery", cat: "diploma", title: "Diploma in Midwifery", provider: "Government nursing and midwifery institutes",
    duration: "3 years", cost: "low", costText: "Low fees", mode: "On campus", device: "none", earnSoon: false, minGpa: null, groups: ["any"], relocate: true,
    summary: "Midwives are needed at upazila health complexes and NGO clinics across the country.", link: "https://www.dgnm.gov.bd" },
  { id: "dip-medtech", cat: "diploma", title: "Diploma in Medical Technology", provider: "Institutes of Health Technology and approved private institutes",
    duration: "3–4 years", cost: "varies", costText: "Varies", mode: "On campus", device: "none", earnSoon: false, minGpa: null, groups: ["science"], relocate: true,
    summary: "Specialise in laboratory, radiology, physiotherapy, pharmacy or dental technology.", link: null },
  { id: "dip-engineering", cat: "diploma", title: "Diploma in Engineering", provider: "Government polytechnics and BTEB-affiliated institutes",
    duration: "4 years", cost: "low", costText: "Low at government polytechnics", mode: "On campus", device: "none", earnSoon: false, minGpa: null, groups: ["any"], relocate: false,
    summary: "Computer, civil, electrical, textile, architecture and more. Leads to technician and sub-assistant engineer jobs.", link: "https://www.bteb.gov.bd" },
  { id: "dip-agri", cat: "diploma", title: "Diploma in Agriculture", provider: "Agricultural Training Institutes",
    duration: "4 years", cost: "low", costText: "Low fees", mode: "On campus", device: "none", earnSoon: false, minGpa: null, groups: ["any"], relocate: true,
    summary: "Leads to agricultural extension work and agribusiness jobs.", link: null },

  // ---------- Skills ----------
  { id: "sk-herpower", cat: "skill", title: "Her Power freelancing training", provider: "ICT Division, Government of Bangladesh",
    duration: "About 6 months", cost: "free", costText: "Free", mode: "In person", device: "provided", earnSoon: true, minGpa: null, groups: ["any"], relocate: false,
    summary: "Graphic design, web development and digital marketing for women. Some phases have provided laptops. Check the current call for eligibility.", link: null },
  { id: "sk-computer", cat: "skill", title: "Computer basics and office skills", provider: "Department of Youth Development, BTEB short courses",
    duration: "3–6 months", cost: "low", costText: "Free or low cost", mode: "In person, district centres", device: "none", earnSoon: true, minGpa: null, groups: ["any"], relocate: false,
    summary: "MS Office, typing in Bangla and English, email and internet. Opens office assistant and data entry jobs.", link: "https://www.dyd.gov.bd" },
  { id: "sk-graphics", cat: "skill", title: "Graphic design", provider: "Government programs and accredited institutes",
    duration: "3–6 months", cost: "varies", costText: "Free to paid", mode: "In person or online", device: "laptop", earnSoon: true, minGpa: null, groups: ["any"], relocate: false,
    summary: "Photoshop, Illustrator and Canva. Work for local shops and brands, then freelance.", link: null },
  { id: "sk-web", cat: "skill", title: "Web development", provider: "Government programs, BASIS Institute and accredited institutes",
    duration: "4–6 months", cost: "varies", costText: "Free to paid", mode: "In person or online", device: "laptop", earnSoon: true, minGpa: null, groups: ["any"], relocate: false,
    summary: "HTML, CSS, WordPress and basic JavaScript. Leads to junior web jobs and freelance projects.", link: null },
  { id: "sk-marketing", cat: "skill", title: "Digital marketing", provider: "Government programs and accredited institutes",
    duration: "3 months", cost: "varies", costText: "Free to paid", mode: "In person or online", device: "phone", earnSoon: true, minGpa: null, groups: ["any"], relocate: false,
    summary: "Facebook ads, social media management and SEO. Many local businesses need help with their pages.", link: null },
  { id: "sk-video", cat: "skill", title: "Video editing", provider: "Accredited institutes and online courses",
    duration: "2–4 months", cost: "varies", costText: "Free to paid", mode: "In person or online", device: "laptop", earnSoon: true, minGpa: null, groups: ["any"], relocate: false,
    summary: "Edit videos for YouTube channels, shops and agencies.", link: null },
  { id: "sk-ecommerce", cat: "skill", title: "Start an online shop", provider: "Government programs, SME Foundation",
    duration: "1–3 months", cost: "low", costText: "Free or low cost", mode: "In person or online", device: "phone", earnSoon: true, minGpa: null, groups: ["any"], relocate: false,
    summary: "Run a Facebook shop: product photos, pricing, orders and delivery. Possible with only a smartphone.", link: null },
  { id: "sk-muktopaath", cat: "skill", title: "Free online courses on Muktopaath", provider: "a2i, Government of Bangladesh",
    duration: "Self-paced", cost: "free", costText: "Free", mode: "Online, in Bangla", device: "phone", earnSoon: false, minGpa: null, groups: ["any"], relocate: false,
    summary: "Start learning while you wait for admission or a training seat. Courses give certificates.", link: "https://muktopaath.gov.bd" },
  { id: "sk-nsda", cat: "skill", title: "NSDA-certified skills courses", provider: "Registered training organisations",
    duration: "3–6 months", cost: "varies", costText: "Varies", mode: "In person", device: "none", earnSoon: true, minGpa: null, groups: ["any"], relocate: false,
    summary: "Nationally recognised certificates that employers trust, in many trades.", link: "https://www.nsda.gov.bd" },
  { id: "sk-dwa", cat: "skill", title: "Tailoring, beauty and food processing", provider: "Department of Women Affairs, Jatiyo Mohila Sangstha",
    duration: "3–6 months", cost: "free", costText: "Free", mode: "In person, upazila level", device: "none", earnSoon: true, minGpa: null, groups: ["any"], relocate: false,
    summary: "Practical trades for a home-based business or local job, close to home.", link: "https://www.dwa.gov.bd" }
];

window.ALO_CATEGORIES = {
  university: "Study further",
  scholarship: "Scholarships",
  diploma: "Diplomas",
  skill: "Skills to earn"
};

window.findProgram = id => window.ALO_PROGRAMS.find(p => p.id === id);
