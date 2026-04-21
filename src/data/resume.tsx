import { Icons } from "@/components/icons";
import { HomeIcon } from "lucide-react";

export const DATA = {
  name: "Vivek Anand",
  initials: "VA",
  url: "https://github.com/vivek-650",
  location: "Dumka, Jharkhand, India",
  locationLink: "https://maps.google.com/?q=Dumka%2C+Jharkhand%2C+India",
  description:
    "Frontend-focused full-stack engineer shipping production AI products with startup speed, strong ownership, and product-level UX rigor.",
  summary:
    "I build software end-to-end, from product architecture to polished user experiences, with a strong focus on measurable outcomes.\n\nIn startup teams, I have architected frontend systems from scratch, shipped multi-dashboard products, and optimized performance for scale and reliability.\n\nMy work increasingly sits at the intersection of product engineering and GenAI, where I design practical automation and AI workflows that solve real business problems.",
  avatarUrl: "/me.png",
  skillGroups: [
    {
      category: "Languages",
      items: ["JavaScript", "TypeScript", "C++"],
    },
    {
      category: "Frontend",
      items: ["React.js", "Next.js", "Redux", "Tailwind CSS", "Framer Motion"],
    },
    {
      category: "Backend",
      items: ["Node.js", "Express.js"],
    },
    {
      category: "Databases",
      items: ["MongoDB", "MySQL", "Supabase", "NeonDB"],
    },
    {
      category: "ORMs & Data",
      items: ["Prisma", "Mongoose"],
    },
    {
      category: "AI / GenAI",
      items: [
        "LangChain",
        "LangGraph",
        "OpenAI APIs",
        "RAG Pipelines",
        "Qdrant",
        "Pinecone",
      ],
    },
    {
      category: "Tools",
      items: [
        "AWS Lambda",
        "AWS S3",
        "AWS EventBridge",
        "Git",
        "GitHub",
        "Firebase",
        "Clerk",
        "Postman",
        "Microsoft Clarity",
      ],
    },
  ],
  navbar: [
    { href: "/", icon: HomeIcon, label: "Home" },
  ],
  contact: {
    email: "curiousvivek.contact@gmail.com",
    tel: "+917856039243",
    social: {
      GitHub: {
        name: "GitHub",
        url: "https://github.com/vivek-650",
        icon: Icons.github,
        navbar: true,
      },

      LinkedIn: {
        name: "LinkedIn",
        url: "https://linkedin.com/in/curiousvivek",
        icon: Icons.linkedin,

        navbar: true,
      },
      email: {
        name: "Send Email",
        url: "mailto:curiousvivek.contact@gmail.com",
        icon: Icons.email,

        navbar: true,
      },
    },
  },

  work: [
    {
      company: "Haha Nice Try :)",
      href: "https://linkedin.com/in/curiousvivek",
      badges: ["Current"],
      location: "India",
      title: "Software Developer Intern",
      logoUrl: "",
      start: "Jan 2026",
      end: "Present",
      technologies: [
        "Next.js",
        "TypeScript",
        "React",
        "Redux",
        "Tailwind CSS",
        "Node.js",
        "Postman",
      ],
      description:
        "Architected the frontend infrastructure from scratch for Admin, Client, and Partner dashboards, enabling a scalable base for rapid product iteration.\n\n- Engineered API orchestration and resilient state management for high-traffic operational views.\n- Optimized rendering and data workflows, reducing manual operational effort by 60%.\n- Translated product goals into release-ready features with strong attention to usability and maintainability.",
    },
    {
      company: "Asan Innovators",
      badges: [],
      href: "https://linkedin.com/in/curiousvivek",
      location: "India",
      title: "Frontend Developer Intern",
      logoUrl: "",
      start: "Apr 2025",
      end: "Aug 2025",
      technologies: [
        "React",
        "TypeScript",
        "Tailwind CSS",
        "Framer Motion",
        "REST APIs",
        "GitHub",
      ],
      description:
        "Built and scaled core product features for Asandev Nest using a component-driven React and Tailwind architecture.\n\n- Designed reusable UI primitives that improved development velocity and consistency across modules.\n- Integrated backend APIs with predictable client-side data flows and robust error handling.\n- Applied clean engineering patterns that improved readability, testability, and long-term scalability.",
    },
    {
      company: "Escenems Technologies",
      href: "https://linkedin.com/in/curiousvivek",
      badges: [],
      location: "India",
      title: "Software Developer Intern",
      logoUrl: "",
      start: "Aug 2024",
      end: "Feb 2025",
      technologies: [
        "React",
        "Node.js",
        "Express.js",
        "MongoDB",
        "OpenAI APIs",
        "PWA",
      ],
      description:
        "Owned the full-stack delivery of Vedic Rashi, an AI-powered product, from feature design to production deployment.\n\n- Integrated AI chat capabilities and payment workflows into a cohesive user journey.\n- Built reporting modules and PWA support for accessibility and retention across devices.\n- Shipped production-ready features with a strong focus on reliability, performance, and user trust.",
    },
  ],
  education: [
    {
      school: "Asansol Engineering College",
      href: "https://www.aecwb.edu.in/",
      degree: "B.Tech in Computer Science",
      logoUrl: "",
      start: "2022",
      end: "2026",
    },
  ],
  projects: [
    {
      title: "Samvad AI",
      href: "https://samvadai-eight.vercel.app/",
      dates: "2026",
      active: true,
      description:
        "AI meeting assistant that captures discussions across major conferencing tools and converts them into clear, actionable execution plans.\n\n- Auto-joins Zoom, Google Meet, and Teams sessions to generate structured summaries and action items.\n- Designed workflow automation that pushes outputs into Jira, Asana, and Trello to reduce coordination overhead.\n- Engineered event-driven processing with AWS Lambda, S3, and EventBridge for scalable post-meeting pipelines.",
      technologies: [
        "Next.js",
        "TypeScript",
        "Prisma",
        "OpenAI",
        "AWS Lambda",
        "AWS S3",
        "AWS EventBridge",
      ],
      links: [
        {
          type: "Live",
          href: "https://samvadai-eight.vercel.app/",
          icon: <Icons.globe className="size-3" />,
        },
      ],
      image: "",
      video: "",
    },
    {
      title: "Askly AI",
      href: "https://shorturl.at/RDQ0R",
      dates: "2025",
      active: true,
      description:
        "Retrieval-augmented AI assistant designed to let users query knowledge across long-form, multi-format content with high relevance.\n\n- Built a full RAG pipeline for PDFs, websites, and YouTube transcripts using semantic chunking and embeddings.\n- Implemented vector search with Qdrant and context orchestration via LangChain for low-latency answers.\n- Structured the system for scale with modular ingestion, indexing, and retrieval layers.",
      technologies: [
        "Next.js",
        "LangChain",
        "OpenAI",
        "Qdrant",
        "Clerk",
        "TypeScript",
      ],
      links: [
        {
          type: "Live",
          href: "https://shorturl.at/RDQ0R",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "",
      video: "",
    },
    {
      title: "Skill Nest",
      href: "https://studynotion-dhgd.onrender.com/",
      dates: "2024",
      active: true,
      description:
        "MERN-powered EdTech platform focused on delivering role-aware learning experiences for students, mentors, and admins.\n\n- Built authentication, authorization, and role-based access control for secure feature segmentation.\n- Designed full-stack modules for content delivery, progress tracking, and user management.\n- Shipped a practical product architecture emphasizing maintainability and extensibility.",
      technologies: [
        "MongoDB",
        "Express.js",
        "React.js",
        "Node.js",
        "Mongoose",
      ],
      links: [
        {
          type: "Live",
          href: "https://studynotion-dhgd.onrender.com/",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "",
      video: "",
    },
  ],
  hackathons: [],
} as const;
