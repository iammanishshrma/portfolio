export const profile = {
  name: "Manish Sharma",
  title: "Associate Technical Lead",
  role: "React developer",
  company: "Pelocal Fintech",
  location: "Noida, India",
  timeZone: "Asia/Kolkata",
  email: "iammanishshrma@gmail.com",
  phone: "+91 74560 77775",
  phoneHref: "tel:+917456077775",
  linkedin: "https://www.linkedin.com/in/iammanishshrma",
  linkedinLabel: "linkedin.com/in/iammanishshrma",
  resume: "/Manish_Sharma_React_Developer_Resume.pdf",
  years: 6,
} as const

export const sections = [
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "toolkit", label: "Toolkit" },
  { id: "contact", label: "Contact" },
] as const

export type Point = { lead: string; rest: string }

export type Role = {
  title: string
  start: string
  end: string
  current?: boolean
  points: Point[]
}

export type Job = {
  company: string
  location: string
  roles: Role[]
  promotion?: string
}

export const experience: Job[] = [
  {
    company: "Pelocal Fintech Pvt. Ltd.",
    location: "Noida",
    promotion: "Promoted after 10 months",
    roles: [
      {
        title: "Associate Technical Lead",
        start: "Apr 2025",
        end: "Present",
        current: true,
        points: [
          {
            lead: "Cut first render time by 50% and bundle size by 30%",
            rest: " on the PNB MetLife portals (3.2s to 1.6s) using code splitting and lazy loading.",
          },
          {
            lead: "Shortened sprint release cycles from 14 to 10 days",
            rest: " while leading a team of 4 developers.",
          },
          {
            lead: "Rebuilt a 20-year-old legacy system",
            rest: " into the Distribution and Customer portals serving thousands of users, on a modern React and TypeScript architecture.",
          },
          {
            lead: "Reduced login-related UI errors by 30%",
            rest: " with OTP-based authentication, JWT session handling and RBAC route guards.",
          },
          {
            lead: "Reduced manual processing effort by 35%",
            rest: " and customer lookup time from minutes to seconds by integrating REST APIs with role-based workflows.",
          },
        ],
      },
      {
        title: "Software Engineer",
        start: "Jun 2024",
        end: "Mar 2025",
        points: [
          {
            lead: "Shipped fintech modules",
            rest: " in React.js and TypeScript with product, design and compliance teams.",
          },
        ],
      },
    ],
  },
  {
    company: "SparxIT Solutions Pvt. Ltd.",
    location: "Noida",
    roles: [
      {
        title: "Software Engineer",
        start: "Nov 2020",
        end: "May 2024",
        points: [
          {
            lead: "Reduced production bugs by 30%",
            rest: " by migrating a legacy JavaScript codebase to TypeScript.",
          },
          {
            lead: "Delivered accessible, responsive interfaces",
            rest: " from Figma designs in close collaboration with UI/UX teams.",
          },
          {
            lead: "Improved API performance and data structures",
            rest: " with backend developers by reshaping REST contracts.",
          },
        ],
      },
    ],
  },
]

export const education = [
  {
    degree: "Master of Computer Applications (MCA)",
    school: "Ajay Kumar Garg Engineering College, Ghaziabad",
    start: "Aug 2018",
    end: "Jun 2020",
  },
  {
    degree: "Bachelor of Computer Applications (BCA)",
    school: "Bhagwant Institute of Technology, Muzaffarnagar",
    start: "Aug 2015",
    end: "Jun 2018",
  },
]

export type Skill = { name: string; tag: string; attrs?: string; usedIn?: string }

export type SkillGroup = {
  tag: string
  label: string
  note?: string
  items: Skill[]
}

const PORTALS = "PNB MetLife portals"
const CHATBOT = "AI chatbot"
const PECONNECT = "PeConnect"

export const toolkit: SkillGroup[] = [
  {
    tag: "Core",
    label: "Core",
    items: [
      { name: "React.js", tag: "React.js", usedIn: `${PORTALS}, ${PECONNECT}, ${CHATBOT} (React 19)` },
      { name: "TypeScript", tag: "TypeScript", usedIn: `Everything since 2020, including the SparxIT migration` },
      { name: "JavaScript (ES6+)", tag: "JavaScript", attrs: 'es="6+"' },
      { name: "Next.js", tag: "Next.js" },
      { name: "HTML5", tag: "HTML5" },
      { name: "CSS3", tag: "CSS3" },
    ],
  },
  {
    tag: "StateAndData",
    label: "State and data",
    items: [
      { name: "Redux", tag: "Redux" },
      { name: "Zustand", tag: "Zustand", usedIn: `${PECONNECT}, ${CHATBOT}` },
      { name: "TanStack Query", tag: "TanStackQuery", usedIn: `${PECONNECT}, ${CHATBOT}` },
      { name: "React Hook Form", tag: "ReactHookForm" },
      { name: "Zod", tag: "Zod", usedIn: PECONNECT },
    ],
  },
  {
    tag: "AuthAndSecurity",
    label: "Auth and security",
    items: [
      { name: "JWT", tag: "JWT", usedIn: PORTALS },
      { name: "OTP", tag: "OTP", usedIn: `${PORTALS}, ${CHATBOT}` },
      { name: "RBAC", tag: "RBAC", usedIn: PORTALS },
      { name: "Protected routes", tag: "ProtectedRoutes", usedIn: PORTALS },
    ],
  },
  {
    tag: "Performance",
    label: "Performance",
    items: [
      { name: "Code splitting", tag: "CodeSplitting", usedIn: `${PORTALS}: bundle down 30%` },
      { name: "Lazy loading", tag: "LazyLoading", usedIn: `${PORTALS}: first render 3.2s to 1.6s` },
      { name: "Bundle optimization", tag: "BundleOptimization" },
      { name: "Core Web Vitals", tag: "CoreWebVitals" },
    ],
  },
  {
    tag: "APIs",
    label: "APIs",
    items: [
      { name: "REST", tag: "REST", usedIn: `${PORTALS}: lookups from minutes to seconds` },
      { name: "GraphQL", tag: "GraphQL" },
      { name: "Axios", tag: "Axios" },
      { name: "Server-Sent Events", tag: "SSE", usedIn: `${CHATBOT}: streaming with reconnect and heartbeat` },
    ],
  },
  {
    tag: "Tooling",
    label: "Tooling",
    items: [
      { name: "Vite", tag: "Vite", usedIn: CHATBOT },
      { name: "Webpack", tag: "Webpack" },
      { name: "Git", tag: "Git" },
      { name: "Pre-commit hooks", tag: "PreCommitHooks" },
      { name: "Agile and Scrum", tag: "AgileScrum", usedIn: "Sprint cycle cut from 14 to 10 days" },
    ],
  },
  {
    tag: "Backend",
    label: "Backend",
    note: "working knowledge",
    items: [
      { name: "Node.js", tag: "Node.js" },
      { name: "Express.js", tag: "Express.js" },
      { name: "MongoDB", tag: "MongoDB" },
    ],
  },
]
