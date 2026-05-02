/**
 * Seed a starter set of Tamil Nadu / India scholarships.
 * Run: node src/scripts/seed-scholarships.js
 *
 * Idempotent: skips entries whose (name, provider) already exist.
 * Sources: official portals (links live as of 2026-05). Verify before relying on.
 */
require('../db/connection'); // open mongoose connection
const Scholarship = require('../models/scholarship');

const seeds = [
    {
        name: 'Pre-Matric Scholarship for SC Students',
        provider: 'Government of Tamil Nadu — ADW Department',
        category: 'caste',
        level: 'school',
        summary: 'Annual scholarship for SC students in classes 9–10 studying in govt / aided schools in TN.',
        eligibility: 'SC community; family income limit ₹2.5L/year; studying in TN govt or aided school.',
        amount: 'Up to ₹3,500/year + book allowance',
        applyUrl: 'https://www.tnschools.gov.in/',
        deadline: null,
        tags: ['SC', 'school', 'TN'],
    },
    {
        name: 'Post-Matric Scholarship — SC/ST',
        provider: 'National Scholarship Portal (NSP)',
        category: 'caste',
        level: 'higher_secondary',
        summary: 'Centrally sponsored post-matric scholarship for SC/ST students from class 11 onwards.',
        eligibility: 'SC/ST; family income ≤ ₹2.5L; studying in any recognised institute in India.',
        amount: 'Tuition + maintenance allowance (varies by course)',
        applyUrl: 'https://scholarships.gov.in/',
        deadline: null,
        tags: ['SC', 'ST', 'NSP'],
    },
    {
        name: 'Moovalur Ramamirtham Ammaiyar Marriage Assistance & Education Scheme',
        provider: 'Government of Tamil Nadu — Social Welfare',
        category: 'need',
        level: 'higher_secondary',
        summary: 'Cash incentive to encourage girl students to continue education after class 10.',
        eligibility: 'Girls who completed class 10 in TN govt / aided schools; family income limit applies.',
        amount: '₹1,000/month for class 11–12 students continuing education',
        applyUrl: 'https://www.tn.gov.in/scheme/data_view/3611',
        deadline: null,
        tags: ['girls', 'TN'],
    },
    {
        name: 'Pudhumai Penn Scheme',
        provider: 'Government of Tamil Nadu',
        category: 'need',
        level: 'undergrad',
        summary: '₹1,000/month for girls who studied in TN govt schools and pursue higher education.',
        eligibility: 'Girls who studied class 6–12 in TN govt schools; pursuing UG/PG/diploma in India.',
        amount: '₹1,000 per month till course completion',
        applyUrl: 'https://penkalvi.tn.gov.in/',
        deadline: null,
        tags: ['girls', 'TN', 'UG'],
    },
    {
        name: 'INSPIRE Scholarship for Higher Education',
        provider: 'Department of Science & Technology, Govt of India',
        category: 'merit',
        level: 'undergrad',
        summary: '₹80,000/year for top 1% in class 12 board exams who choose natural / basic sciences.',
        eligibility: 'Top 1% in class 12 (any board); enrolled in B.Sc. / Integrated MSc. in basic sciences.',
        amount: '₹80,000 per year for 5 years',
        applyUrl: 'https://online-inspire.gov.in/',
        deadline: null,
        tags: ['merit', 'science', 'UG'],
    },
    {
        name: 'Tata Trusts Education Grants',
        provider: 'Tata Trusts',
        category: 'need',
        level: 'any',
        summary: 'Need-based grants for meritorious students from underprivileged families across India.',
        eligibility: 'Demonstrated need + merit; usually for higher secondary and college students.',
        amount: 'Varies by case (partial / full tuition support)',
        applyUrl: 'https://www.tatatrusts.org/our-work/individual-grants/education-grants',
        deadline: null,
        tags: ['need', 'private'],
    },
    {
        name: 'Kishore Vaigyanik Protsahan Yojana (KVPY) — legacy fellows',
        provider: 'Indian Institute of Science (IISc), Bengaluru',
        category: 'merit',
        level: 'undergrad',
        summary: 'Fellowship for science research aspirants. (New intake merged into INSPIRE; existing fellows continue.)',
        eligibility: 'KVPY-selected fellows from earlier batches.',
        amount: '₹5,000–₹7,000/month + annual contingency',
        applyUrl: 'http://www.kvpy.iisc.ac.in/',
        deadline: null,
        tags: ['merit', 'science'],
    },
    {
        name: 'Begum Hazrat Mahal National Scholarship',
        provider: 'Maulana Azad Education Foundation',
        category: 'minority',
        level: 'higher_secondary',
        summary: 'For meritorious girls from notified minority communities in classes 9–12.',
        eligibility: 'Minority girl students who scored ≥ 50% in previous class; family income ≤ ₹2L.',
        amount: '₹5,000 (class 9–10), ₹6,000 (class 11–12)',
        applyUrl: 'https://scholarships.gov.in/',
        deadline: null,
        tags: ['minority', 'girls'],
    },
    {
        name: 'AICTE Pragati Scholarship for Girls',
        provider: 'AICTE',
        category: 'merit',
        level: 'undergrad',
        summary: 'Encourages girls to pursue technical education in AICTE-approved institutes.',
        eligibility: 'Girl students admitted to first year of degree / diploma in AICTE-approved institutions.',
        amount: '₹50,000 per year',
        applyUrl: 'https://www.aicte-pragati-saksham-gov.in/',
        deadline: null,
        tags: ['girls', 'engineering', 'AICTE'],
    },
    {
        name: 'CM\'s Scholarship for Higher Education',
        provider: 'Government of Tamil Nadu — Higher Education Dept',
        category: 'need',
        level: 'undergrad',
        summary: 'Supports first-generation graduates from TN govt schools attending state universities.',
        eligibility: 'First-generation graduate; studied in TN govt school; admitted to TN state university / college.',
        amount: 'Tuition fee waiver + monthly stipend',
        applyUrl: 'https://tngdc.tn.gov.in/',
        deadline: null,
        tags: ['TN', 'first-gen', 'UG'],
    },
];

(async () => {
    let added = 0, skipped = 0;
    for (const s of seeds) {
        const exists = await Scholarship.findOne({ name: s.name, provider: s.provider });
        if (exists) { skipped++; continue; }
        await Scholarship.create(s);
        added++;
    }
    console.log(`Seed complete. Added ${added}, skipped ${skipped} (already present).`);
    process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
