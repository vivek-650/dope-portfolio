import Image from "next/image";
import { cn } from "@/lib/utils";

const FALLBACK_ICON = "/Techicons/devicon/devicon-original.svg";

const TECH_ICON_MAP: Record<string, string> = {
  "javascript": "/Techicons/javascript/javascript-original.svg",
  "typescript": "/Techicons/typescript/typescript-original.svg",
  "c++": "/Techicons/cplusplus/cplusplus-original.svg",
  "react": "/Techicons/react/react-original.svg",
  "react.js": "/Techicons/react/react-original.svg",
  "next.js": "/Techicons/nextjs/nextjs-original.svg",
  "fastapi": "/Techicons/fastapi/fastapi-original.svg",
  "redux": "/Techicons/redux/redux-original.svg",
  "tailwind css": "/Techicons/tailwindcss/tailwindcss-original.svg",
  "framer motion": "/Techicons/framermotion/framermotion-original.svg",
  "node.js": "/Techicons/nodejs/nodejs-original.svg",
  "express.js": "/Techicons/express/express-original.svg",
  "mongodb": "/Techicons/mongodb/mongodb-original.svg",
  "mysql": "/Techicons/mysql/mysql-original.svg",
  "supabase": "/Techicons/supabase/supabase-original.svg",
  "neondb": "/Techicons/postgresql/postgresql-original.svg",
  "prisma": "/Techicons/prisma/prisma-original.svg",
  "mongoose": "/Techicons/mongoose/mongoose-original.svg",
  "langchain": FALLBACK_ICON,
  "langgraph": FALLBACK_ICON,
  "openai": "/Techicons/openapi/openapi-original.svg",
  "openai apis": "/Techicons/openapi/openapi-original.svg",
  "rag pipelines": FALLBACK_ICON,
  "qdrant": FALLBACK_ICON,
  "pinecone": FALLBACK_ICON,
  "aws lambda": "/Techicons/amazonwebservices/amazonwebservices-original-wordmark.svg",
  "aws s3": "/Techicons/amazonwebservices/amazonwebservices-original-wordmark.svg",
  "aws eventbridge": "/Techicons/amazonwebservices/amazonwebservices-original-wordmark.svg",
  "git": "/Techicons/git/git-original.svg",
  "github": "/Techicons/github/github-original.svg",
  "firebase": "/Techicons/firebase/firebase-original.svg",
  "clerk": FALLBACK_ICON,
  "postman": "/Techicons/postman/postman-original.svg",
  "microsoft clarity": "/Techicons/clarity/clarity-original.svg",
  "rest apis": "/Techicons/openapi/openapi-original.svg",
  "pwa": FALLBACK_ICON,
};

export function getTechIconPath(tech: string): string {
  return TECH_ICON_MAP[tech.toLowerCase().trim()] ?? FALLBACK_ICON;
}

type TechIconLabelProps = {
  label: string;
  className?: string;
  textClassName?: string;
  iconClassName?: string;
  iconSize?: number;
};

export function TechIconLabel({
  label,
  className,
  textClassName,
  iconClassName,
  iconSize = 14,
}: TechIconLabelProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-1.5", className)}
      title={label}
    >
      <Image
        src={getTechIconPath(label)}
        alt={`${label} icon`}
        width={iconSize}
        height={iconSize}
        className={cn("shrink-0 object-contain", iconClassName)}
      />
      <span className={textClassName}>{label}</span>
    </span>
  );
}
