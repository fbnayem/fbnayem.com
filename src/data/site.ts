// Site content, taken from the website brief (20 Nov 2026).
// Kept in one typed file so it can move into Sanity later without changing the pages.

export const profile = {
  name: 'Fazle Bary Nayem',
  shortName: 'Nayem',
  role: 'Founder & AI Product Builder',
  primaryRole: 'Founder & CEO of Abedin Tech',
  headline: 'I build AI products that help businesses work better.',
  intro:
    "I'm Nayem, founder of Abedin Tech and the builder behind Callinva and SaleAnto. My work brings together software, automation, and the lessons learned from helping real businesses grow.",
  location: 'Based in Bangladesh. Building for a global market.',
  footerLine: 'Building practical AI products and business systems from Bangladesh.',
  shortBio:
    'Fazle Bary Nayem is a Bangladesh-based founder and AI product builder. He is the founder and CEO of Abedin Tech and is building Callinva and SaleAnto. His work combines software, business automation, and digital growth, informed by experience serving businesses in international markets.',
};

export const nav = [
  { label: 'About', href: '/about/' },
  { label: 'Ventures', href: '/ventures/' },
  { label: 'Work', href: '/work/' },
  { label: 'Insights', href: '/insights/' },
  { label: 'Connect', href: '/connect/' },
];

export type Venture = {
  slug: string;
  name: string;
  domain: string;
  url: string;
  short: string;
  shortDetail: string;
  category: string;
  role: string;
  body: string[];
  focus?: string[];
  cta: string;
};

export const ventures: Venture[] = [
  {
    slug: 'abedin-tech',
    name: 'Abedin Tech',
    domain: 'abedintech.com',
    url: 'https://abedintech.com',
    short: 'AI automation, custom software, and digital growth for businesses.',
    shortDetail: 'The company where my team and I turn business challenges into working solutions.',
    category: 'AI automation, software, and digital growth',
    role: 'Founder & CEO',
    body: [
      'Abedin Tech is the foundation of my work as a technology founder. Through the company, my team and I help businesses develop websites and software, connect their systems, improve workflows, and support their digital growth.',
      'Our work spans AI agents, business automation, custom applications, web development, and marketing systems. Client delivery keeps us close to the practical challenges that shape our product decisions.',
    ],
    focus: ['AI and automation', 'Custom software and integrations', 'Web and ecommerce development', 'Digital growth'],
    cta: 'Visit Abedin Tech',
  },
  {
    slug: 'callinva',
    name: 'Callinva',
    domain: 'callinva.com',
    url: 'https://callinva.com',
    short: 'AI calling and customer follow-up for businesses.',
    shortDetail:
      'Built around the work that follows a conversation, including lead capture, appointment booking, and communication workflows.',
    category: 'AI calling and customer communication',
    role: 'Founder and product builder',
    body: [
      "Callinva is a product I'm building around business conversations. Its focus is helping businesses handle calls, capture the important details, and connect conversations with the next step.",
      'The product brings together voice agents and customer workflows, including lead qualification, appointment booking, follow-up, and human handoff. My focus is on making the experience practical for the people using it and the businesses depending on it.',
    ],
    cta: 'Explore Callinva',
  },
  {
    slug: 'saleanto',
    name: 'SaleAnto',
    domain: 'saleanto.com',
    url: 'https://saleanto.com',
    short: 'AI-assisted social content creation and scheduling.',
    shortDetail:
      'A product focused on helping businesses create consistent branded content and manage their publishing workflow.',
    category: 'AI social content and scheduling',
    role: 'Product builder',
    body: [
      'SaleAnto is an AI-assisted platform for creating social media content and managing its publishing schedule. The goal is to help businesses turn their brand direction into consistent content with a more organized workflow.',
      "The product brings together creative generation, brand consistency, and scheduling. I'm interested in making these tasks easier while keeping content quality and business context central to the experience.",
    ],
    cta: 'Explore SaleAnto',
  },
];

export type Project = {
  slug: string;
  name: string;
  title: string;
  summary: string;
  type: 'Client work' | 'Owned product';
  category: string;
  body: string[];
  lesson: string;
  source?: { label: string; url: string };
};

export const projects: Project[] = [
  {
    slug: 'gotennis',
    name: 'GoTennis!',
    title: 'Building a digital presence for a tennis community',
    summary: 'Website development and digital growth for a tennis community.',
    type: 'Client work',
    category: 'Website and digital growth',
    body: [
      "Abedin Tech's work for GoTennis! brought together website development, search optimization, content, and campaign activity.",
      'The project covered a broad digital experience for the community, including membership, events, and discovery.',
    ],
    lesson: 'A website and its customer acquisition activity work best when they are planned as one connected experience.',
    source: { label: "Abedin Tech's GoTennis case study", url: 'https://abedintech.com/portfolio/gotennis-case-study/' },
  },
  {
    slug: 'negi-and-nori',
    name: 'Negi & Nori',
    title: 'Connecting restaurant branding with a usable website',
    summary: 'Website, content, and search visibility for a London restaurant.',
    type: 'Client work',
    category: 'Website, content and search',
    body: [
      'For Negi & Nori, Abedin Tech combined website development, brand presentation, content, and search work.',
      'The project needed to present the restaurant clearly while keeping important actions, such as exploring the menu and finding reservation information, easy to use.',
    ],
    lesson: "Good presentation should support the customer's next action.",
    source: { label: "Abedin Tech's Negi & Nori case study", url: 'https://abedintech.com/portfolio/negi-noris-case-study/' },
  },
  {
    slug: 'callinva',
    name: 'Callinva',
    title: 'Designing the next step after a business conversation',
    summary: 'Product work connecting business conversations with useful next actions.',
    type: 'Owned product',
    category: 'AI product',
    body: [
      'Callinva brings together AI calling and business workflows. A useful conversation usually has a next step: a booking, an answer from the right person, or a follow-up message.',
      'The product is being designed around that need, with reliable information, booking and workflow actions, and a clear handoff to a person when the situation calls for it.',
    ],
    lesson: 'A business conversation should lead to a useful next action.',
  },
];

export const principles = [
  {
    title: 'Understand the workflow',
    body: 'Start with the people, tasks, and constraints involved. A clear process makes it easier to decide where software or automation can help.',
  },
  {
    title: 'Measure the outcome',
    body: 'Look at what changes for the business: response time, useful conversations, completed tasks, booked appointments, or team capacity.',
  },
  {
    title: 'Keep human judgment available',
    body: 'Build clear ways to review, intervene, and hand work to a person when the situation needs it.',
  },
];

export const upcomingArticles = [
  { title: 'What running an agency taught me about building AI products', category: 'Building Products' },
  { title: 'Why an AI phone agent needs to do more than answer calls', category: 'AI and Automation' },
  { title: 'Building global technology products from Bangladesh', category: 'Founder Notes' },
];

export const faqs = [
  {
    q: 'What do you work on?',
    a: 'My work spans AI products, business automation, custom software, and digital growth. I lead Abedin Tech and am building Callinva and SaleAnto.',
  },
  {
    q: 'Can I discuss a project with you?',
    a: 'Yes. Send a brief outline of the problem, the business context, and what you want to achieve. Project delivery can be explored through Abedin Tech.',
  },
  {
    q: 'Do you work with international businesses?',
    a: 'My work includes businesses and collaborators in international markets, including the US and UK.',
  },
  {
    q: 'Can I contact you about partnerships or investment?',
    a: 'Yes. Please include the venture you are interested in and a short introduction.',
  },
  {
    q: 'Are you open to interviews or speaking invitations?',
    a: 'You can send an invitation with the topic, audience, format, and proposed date. Relevant subjects include AI products, business automation, and entrepreneurship.',
  },
];
