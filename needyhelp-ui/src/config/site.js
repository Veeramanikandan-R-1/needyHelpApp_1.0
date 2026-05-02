// Single source of truth for site-wide contact / owner info.
// To update: change values here. Used by Contact page, footer, and emails.
export const SITE = {
  name: 'needyHelp',
  tagline: 'Made in Tamil Nadu, for Tamil Nadu.',
  // Primary point of contact for the project
  owner: {
    name: 'Veeramanikandan R',
    role: 'Software Engineer, HCLTech Chennai',
    email: 'r.veeramanikandany216@gmail.com',
    phone: '+91 91592 50701',
    phoneRaw: '+919159250701', // for tel: links
    whatsapp: '919159250701',  // for wa.me links (no +)
    address: {
      line1: '112B, Kasthuri Nagar',
      line2: 'Oddachatram',
      district: 'Dindigul',
      state: 'Tamil Nadu',
      pincode: '624619',
      country: 'India',
    },
  },
  // Add socials here later: { github: '...', linkedin: '...', twitter: '...' }
  socials: {},
};

export const formatAddress = (a = SITE.owner.address) =>
  [a.line1, a.line2, a.district, `${a.state} ${a.pincode}`, a.country]
    .filter(Boolean)
    .join(', ');
