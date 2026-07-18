/* ============================================================
   RizeUp Global — Destination & University data
   ------------------------------------------------------------
   THIS is the file you edit to add / change universities.
   Each country has a blurb and a list of universities.
   For each university:
     name         – full name
     short        – abbreviation shown on the placeholder card
     city         – location
     rank         – ranking badge text (e.g. "QS World #60")
     photo        – (optional) path to a real photo in /images.
                    Leave empty ("") to show the styled placeholder.
     tone         – card accent: 'indigo' | 'yellow' | 'red' | 'green'
     courses      – array of popular programs (shown as tags)
     requirements – array of short "what you need to apply" bullets
   ------------------------------------------------------------
   Rankings shown are indicative (QS World University Rankings)
   and change each year — confirm exact criteria with a counselor.
   ============================================================ */

window.DESTINATIONS = {
  malaysia: {
    name: 'Malaysia',
    flag: '🇲🇾',
    tagline: 'Affordable, English-taught, close to home.',
    intro: "Malaysia is where most of our students start — world-ranked universities, tuition from around $3,500/yr, and living costs close to Dhaka. Many programs accept MOI letters instead of IELTS.",
    stats: [
      { num: '20+', label: 'Universities we place into' },
      { num: '~$3,500/yr', label: 'Tuition from' },
      { num: '2–3 mo', label: 'Fastest consult-to-flight' },
    ],
    universities: [
      {
        name: 'Universiti Malaya (UM)', short: 'UM', city: 'Kuala Lumpur', rank: 'QS World #60', tone: 'indigo',
        courses: ['Computer Science', 'Engineering', 'Medicine', 'Business', 'Law'],
        requirements: ['HSC / A-Level with strong GPA', 'IELTS 6.0+ (or accepted MOI letter)', 'Statement of purpose'],
      },
      {
        name: 'Universiti Putra Malaysia (UPM)', short: 'UPM', city: 'Serdang, Selangor', rank: 'QS World #148', tone: 'green',
        courses: ['Agriculture & Food', 'Engineering', 'Business', 'Computer Science', 'Veterinary'],
        requirements: ['HSC / A-Level, min GPA ~3.0', 'IELTS 6.0+ or MOI', 'Program-specific prerequisites'],
      },
      {
        name: 'Universiti Kebangsaan Malaysia (UKM)', short: 'UKM', city: 'Bangi, Selangor', rank: 'QS World #138', tone: 'yellow',
        courses: ['Medicine', 'Engineering', 'Social Sciences', 'Business', 'IT'],
        requirements: ['HSC / A-Level with good grades', 'IELTS 6.0+ or MOI', 'Statement of purpose'],
      },
      {
        name: 'Universiti Sains Malaysia (USM)', short: 'USM', city: 'Penang', rank: 'QS World #146', tone: 'red',
        courses: ['Pharmacy', 'Engineering', 'Computer Science', 'Sciences', 'Management'],
        requirements: ['HSC / A-Level, min GPA ~3.0', 'IELTS 6.0+ or MOI', 'Relevant science background for STEM'],
      },
      {
        name: 'Universiti Teknologi Malaysia (UTM)', short: 'UTM', city: 'Johor Bahru / KL', rank: 'QS World #181', tone: 'indigo',
        courses: ['Engineering', 'Architecture', 'Computer Science', 'Built Environment', 'Business'],
        requirements: ['HSC / A-Level with STEM subjects', 'IELTS 6.0+ or MOI', 'Portfolio for design programs'],
      },
      {
        name: "Taylor's University", short: 'TU', city: 'Subang Jaya, Selangor', rank: 'QS World #253 (Top private)', tone: 'yellow',
        courses: ['Hospitality', 'Business', 'Design', 'Computer Science', 'Biosciences'],
        requirements: ['HSC / A-Level or foundation', 'IELTS 6.0+ (some 5.5 with prep)', 'Portfolio for creative programs'],
      },
      {
        name: 'Monash University Malaysia', short: 'MU', city: 'Bandar Sunway, Selangor', rank: 'Australian degree in Malaysia', tone: 'green',
        courses: ['Business', 'Engineering', 'IT', 'Pharmacy', 'Psychology'],
        requirements: ['HSC / A-Level, competitive GPA', 'IELTS 6.5 (no band < 6.0)', 'Statement of purpose'],
      },
      {
        name: 'Asia Pacific University (APU)', short: 'APU', city: 'Kuala Lumpur', rank: 'Top IT & tech private', tone: 'red',
        courses: ['Computer Science', 'Cybersecurity', 'Data Science', 'Business IT', 'Games Development'],
        requirements: ['HSC / A-Level or foundation', 'IELTS 5.5–6.0 or MOI', 'Basic maths for tech programs'],
      },
    ],
  },

  australia: {
    name: 'Australia',
    flag: '🇦🇺',
    tagline: 'Global rankings, strong post-study work rights.',
    intro: "Australia pairs top-40 universities with generous post-study work visas. Plan for 6–9 months including visa, and a tuition budget from around $22,000/yr. Strong grades and IELTS matter here.",
    stats: [
      { num: '40+', label: 'Universities we work with' },
      { num: '~$22,000/yr', label: 'Tuition from' },
      { num: '6–9 mo', label: 'Typical timeline' },
    ],
    universities: [
      {
        name: 'University of Melbourne', short: 'UoM', city: 'Melbourne, VIC', rank: 'QS World #13', tone: 'indigo',
        courses: ['Business', 'Engineering', 'Computer Science', 'Medicine', 'Law'],
        requirements: ['HSC + strong academic record', 'IELTS 6.5 (no band < 6.0)', 'SOP; some programs need prerequisites'],
      },
      {
        name: 'University of Sydney', short: 'USYD', city: 'Sydney, NSW', rank: 'QS World #18', tone: 'red',
        courses: ['Engineering', 'Business', 'IT', 'Architecture', 'Health Sciences'],
        requirements: ['HSC with competitive grades', 'IELTS 6.5–7.0', 'Portfolio for design; SOP'],
      },
      {
        name: 'UNSW Sydney', short: 'UNSW', city: 'Sydney, NSW', rank: 'QS World #19', tone: 'yellow',
        courses: ['Engineering', 'Computer Science', 'Business', 'Data Science', 'Design'],
        requirements: ['HSC / foundation year', 'IELTS 6.5 (no band < 6.0)', 'Maths prerequisites for STEM'],
      },
      {
        name: 'Australian National University (ANU)', short: 'ANU', city: 'Canberra, ACT', rank: 'QS World #30', tone: 'green',
        courses: ['Computing', 'International Relations', 'Sciences', 'Business', 'Engineering'],
        requirements: ['HSC with strong grades', 'IELTS 6.5', 'Statement of purpose'],
      },
      {
        name: 'Monash University', short: 'MON', city: 'Melbourne, VIC', rank: 'QS World #37', tone: 'indigo',
        courses: ['Business', 'Pharmacy', 'Engineering', 'IT', 'Medicine'],
        requirements: ['HSC / diploma or foundation', 'IELTS 6.5 (no band < 6.0)', 'Program prerequisites'],
      },
      {
        name: 'University of Queensland (UQ)', short: 'UQ', city: 'Brisbane, QLD', rank: 'QS World #40', tone: 'red',
        courses: ['Engineering', 'Business', 'Agriculture', 'Sciences', 'IT'],
        requirements: ['HSC with good results', 'IELTS 6.5', 'SOP; some scholarships available'],
      },
    ],
  },

  usa: {
    name: 'USA',
    flag: '🇺🇸',
    tagline: 'The widest range of universities and scholarships.',
    intro: "The USA has everything from Ivy League to affordable state universities strong on scholarships for international students. Budget varies widely; tuition can start around $15,000/yr at many public universities. Expect IELTS/TOEFL, SOP, and recommendation letters.",
    stats: [
      { num: '100+', label: 'Universities across all budgets' },
      { num: '~$15,000/yr', label: 'Tuition from (public unis)' },
      { num: '6–9 mo', label: 'Typical timeline' },
    ],
    universities: [
      {
        name: 'Massachusetts Institute of Technology (MIT)', short: 'MIT', city: 'Cambridge, MA', rank: 'QS World #1', tone: 'indigo',
        courses: ['Computer Science', 'Engineering', 'Physics', 'Economics', 'Mathematics'],
        requirements: ['Outstanding academic record', 'TOEFL 100+ / IELTS 7.5', 'SAT/ACT, SOP, strong LORs'],
      },
      {
        name: 'Stanford University', short: 'STAN', city: 'Stanford, CA', rank: 'QS World #6', tone: 'red',
        courses: ['Computer Science', 'Engineering', 'Business', 'Sciences', 'Design'],
        requirements: ['Top grades & extracurriculars', 'TOEFL 100+ / IELTS 7.0+', 'SAT/ACT, essays, LORs'],
      },
      {
        name: 'University of Illinois Urbana-Champaign', short: 'UIUC', city: 'Urbana, IL', rank: 'QS World #69', tone: 'yellow',
        courses: ['Computer Science', 'Engineering', 'Business', 'Data Science', 'Agriculture'],
        requirements: ['HSC with strong grades', 'TOEFL 79+ / IELTS 6.5', 'SAT (test-optional varies), SOP, LORs'],
      },
      {
        name: 'Purdue University', short: 'PUR', city: 'West Lafayette, IN', rank: 'QS World #99', tone: 'green',
        courses: ['Engineering', 'Computer Science', 'Aviation', 'Business', 'Sciences'],
        requirements: ['HSC with STEM strength', 'TOEFL 80+ / IELTS 6.5', 'SAT/ACT (varies), SOP, LORs'],
      },
      {
        name: 'Arizona State University (ASU)', short: 'ASU', city: 'Tempe, AZ', rank: 'Top for international students', tone: 'indigo',
        courses: ['Business', 'Computer Science', 'Engineering', 'Journalism', 'Sustainability'],
        requirements: ['HSC, min GPA ~3.0', 'TOEFL 61+ / IELTS 6.0', 'SOP; generous merit scholarships'],
      },
      {
        name: 'University of Texas at Dallas (UTD)', short: 'UTD', city: 'Richardson, TX', rank: 'Strong value & scholarships', tone: 'red',
        courses: ['Computer Science', 'Business Analytics', 'Engineering', 'Finance', 'Data Science'],
        requirements: ['HSC with good grades', 'TOEFL 80+ / IELTS 6.5', 'SOP, LORs; scholarships for strong GPA'],
      },
    ],
  },

  europe: {
    name: 'Europe',
    flag: '🇪🇺',
    tagline: 'Low-cost tuition and English-taught degrees.',
    intro: "Europe spans the UK, Germany, Italy, France and more. Germany and Italy offer very low (sometimes free) public tuition; the UK offers fast one-year master's. Requirements vary by country — we map the right fit to your budget and profile.",
    stats: [
      { num: '6', label: 'Countries: UK, Germany, Italy, France…' },
      { num: 'Low / free', label: 'Public tuition in Germany & Italy' },
      { num: '1 yr', label: "UK master's duration" },
    ],
    universities: [
      {
        name: 'Imperial College London', short: 'ICL', city: 'London, United Kingdom', rank: 'QS World #2', tone: 'indigo',
        courses: ['Engineering', 'Computing', 'Medicine', 'Business', 'Natural Sciences'],
        requirements: ['HSC / A-Level with top grades', 'IELTS 6.5–7.0', 'SOP; strong maths for STEM'],
      },
      {
        name: 'University of Oxford', short: 'OXF', city: 'Oxford, United Kingdom', rank: 'QS World #3', tone: 'red',
        courses: ['PPE', 'Computer Science', 'Engineering', 'Law', 'Medicine'],
        requirements: ['Exceptional academic record', 'IELTS 7.0–7.5', 'SOP, LORs, admissions test/interview'],
      },
      {
        name: 'Technical University of Munich (TUM)', short: 'TUM', city: 'Munich, Germany', rank: 'QS World #28', tone: 'yellow',
        courses: ['Engineering', 'Computer Science', 'Data Science', 'Management', 'Physics'],
        requirements: ['HSC + recognised qualification', 'IELTS 6.5 (or German for some)', 'Low/no tuition; APS certificate'],
      },
      {
        name: 'University of Manchester', short: 'UoM', city: 'Manchester, United Kingdom', rank: 'QS World #34', tone: 'green',
        courses: ['Business', 'Engineering', 'Computer Science', 'Sciences', 'Social Sciences'],
        requirements: ['HSC / A-Level, good grades', 'IELTS 6.5', 'SOP; scholarships available'],
      },
      {
        name: 'Heidelberg University', short: 'HD', city: 'Heidelberg, Germany', rank: 'QS World #47', tone: 'indigo',
        courses: ['Medicine', 'Sciences', 'Humanities', 'Law', 'Economics'],
        requirements: ['HSC + recognised qualification', 'IELTS 6.5 or German', 'APS certificate; low/no tuition'],
      },
      {
        name: 'Politecnico di Milano', short: 'POLIMI', city: 'Milan, Italy', rank: 'QS World #111', tone: 'red',
        courses: ['Architecture', 'Design', 'Engineering', 'Urban Planning', 'Computer Engineering'],
        requirements: ['HSC with STEM strength', 'IELTS 6.0–6.5', 'Portfolio for design; low public tuition'],
      },
    ],
  },
};
