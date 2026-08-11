"use client";

import { DATA } from "@/data/resume";
import { cn } from "@/lib/utils";
import { BadgeCheck, Link2, MapPin, Users } from "lucide-react";
import Image from "next/image";
import NextLink from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState, type ReactNode } from "react";

type TwitterProfile = typeof DATA.socialProfiles.twitter;
type GithubProfile = typeof DATA.socialProfiles.github;
type LinkedinProfile = typeof DATA.socialProfiles.linkedin;
type SocialProfile = TwitterProfile | GithubProfile | LinkedinProfile;

const CLOSE_DELAY_MS = 150;
const CARD_WIDTH = 320;
const VIEWPORT_MARGIN = 16;

type CardPosition = { top: number; left: number };

function useCardInteraction() {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<CardPosition | null>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const canHover = useRef(false);
  const triggerRef = useRef<HTMLAnchorElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    canHover.current = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }, []);

  const clearCloseTimer = () => {
    if (closeTimer.current !== undefined) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = undefined;
    }
  };

  const computePosition = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const left = Math.min(
      Math.max(rect.left, VIEWPORT_MARGIN),
      window.innerWidth - CARD_WIDTH - VIEWPORT_MARGIN
    );

    setPosition({ top: rect.bottom + 10, left });
  };

  const openNow = () => {
    clearCloseTimer();
    computePosition();
    setOpen(true);
  };

  const closeSoon = () => {
    clearCloseTimer();
    closeTimer.current = window.setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  };

  const close = () => {
    clearCloseTimer();
    setOpen(false);
  };

  const handleHoverEnter = () => {
    if (canHover.current) openNow();
  };

  const handleHoverLeave = () => {
    if (canHover.current) closeSoon();
  };

  const handleFocus = () => {
    if (canHover.current) openNow();
  };

  const handleBlur = () => {
    if (canHover.current) closeSoon();
  };

  const openRef = useRef(open);
  openRef.current = open;

  const handleTriggerClick = (event: React.MouseEvent) => {
    if (!canHover.current) {
      event.preventDefault();
      if (openRef.current) {
        close();
      } else {
        openNow();
      }
    }
  };

  useEffect(() => clearCloseTimer, []);

  useEffect(() => {
    if (!open) return;

    const handleScroll = () => close();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    const handleOutside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (cardRef.current?.contains(target)) return;
      close();
    };

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleScroll);
    document.addEventListener("keydown", handleKey);
    document.addEventListener("pointerdown", handleOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("pointerdown", handleOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return {
    open,
    position,
    triggerRef,
    cardRef,
    hoverHandlers: { onMouseEnter: handleHoverEnter, onMouseLeave: handleHoverLeave },
    focusHandlers: { onFocus: handleFocus, onBlur: handleBlur },
    contentHoverHandlers: { onMouseEnter: clearCloseTimer, onMouseLeave: handleHoverLeave },
    handleTriggerClick,
  };
}

function XCardBody({ profile }: { profile: TwitterProfile }) {
  return (
    <div className="rounded-2xl border border-zinc-700/60 bg-black p-4 text-white">
      <div className="flex items-start justify-between gap-3">
        <div className="size-14 shrink-0 overflow-hidden rounded-full ring-1 ring-white/10">
          <Image src={profile.avatar} alt={profile.name} width={56} height={56} className="h-full w-full object-cover" unoptimized />
        </div>
        <a
          href={profile.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-black transition-colors hover:bg-white/90"
        >
          Follow
        </a>
      </div>

      <div className="mt-3 min-w-0">
        <div className="flex items-center gap-1">
          <p className="truncate font-bold leading-tight">{profile.name}</p>
          {profile.verified && <BadgeCheck className="size-4 shrink-0 text-sky-400" fill="currentColor" stroke="black" />}
        </div>
        <p className="truncate text-sm text-zinc-500">{profile.handle}</p>
      </div>

      <p className="mt-3 text-sm leading-snug text-zinc-100">{profile.bio}</p>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
        {profile.location && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" />
            {profile.location}
          </span>
        )}
        {profile.link && (
          <a
            href={`https://${profile.link}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sky-400 hover:underline"
          >
            <Link2 className="size-3.5" />
            {profile.link}
          </a>
        )}
      </div>
      {profile.joined && <p className="mt-1 text-xs text-zinc-500">{profile.joined}</p>}

      <div className="mt-3 flex gap-4 text-sm">
        <p>
          <span className="font-bold text-white">{profile.following}</span>{" "}
          <span className="text-zinc-500">Following</span>
        </p>
        <p>
          <span className="font-bold text-white">{profile.followers}</span>{" "}
          <span className="text-zinc-500">Followers</span>
        </p>
      </div>
    </div>
  );
}

function GitHubCardBody({ profile }: { profile: GithubProfile }) {
  return (
    <div className="rounded-md border border-[#30363d] bg-[#161b22] p-4 text-[#c9d1d9]">
      <div className="flex items-start gap-3">
        <div className="size-12 shrink-0 overflow-hidden rounded-full ring-1 ring-white/10">
          <Image src={profile.avatar} alt={profile.name} width={48} height={48} className="h-full w-full object-cover" unoptimized />
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="truncate font-semibold text-white">{profile.name}</p>
          <p className="truncate text-sm text-[#8b949e]">{profile.handle}</p>
        </div>
      </div>

      <p className="mt-3 text-sm leading-snug text-[#c9d1d9]">{profile.bio}</p>

      <div className="mt-3 flex items-center gap-1.5 text-xs text-[#8b949e]">
        <Users className="size-3.5" />
        <span>
          <strong className="font-semibold text-[#c9d1d9]">{profile.followers}</strong> followers
        </span>
        <span aria-hidden>·</span>
        <span>
          <strong className="font-semibold text-[#c9d1d9]">{profile.following}</strong> following
        </span>
      </div>

      <a
        href={profile.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 block w-full rounded-md border border-[#30363d] bg-[#21262d] py-1.5 text-center text-sm font-medium text-[#c9d1d9] transition-colors hover:bg-[#30363d]"
      >
        Follow
      </a>
    </div>
  );
}

function LinkedInCardBody({ profile }: { profile: LinkedinProfile }) {
  return (
    <div className="rounded-lg border border-black/10 bg-white p-4 text-neutral-900">
      <div className="flex items-center gap-3">
        <div className="size-16 shrink-0 overflow-hidden rounded-full ring-1 ring-black/10">
          <Image src={profile.avatar} alt={profile.name} width={64} height={64} className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">
            {profile.name}
            {profile.pronouns && <span className="ml-1 font-normal text-neutral-500">{profile.pronouns}</span>}
          </p>
          <p className="text-xs leading-snug text-neutral-600">{profile.headline}</p>
        </div>
      </div>

      {profile.location && <p className="mt-2 text-xs text-neutral-500">{profile.location}</p>}

      <p className="mt-1 text-xs text-neutral-500">
        {new Intl.NumberFormat("en-US").format(profile.followers)} followers · {profile.connections} connections
      </p>

      <a
        href={profile.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 block w-full rounded-full bg-[#0a66c2] px-4 py-1.5 text-center text-sm font-semibold text-white transition-colors hover:bg-[#004182]"
      >
        + Follow
      </a>
    </div>
  );
}

function ProfileCardBody({ profile }: { profile: SocialProfile }) {
  if (profile.platform === "twitter") return <XCardBody profile={profile} />;
  if (profile.platform === "github") return <GitHubCardBody profile={profile} />;
  return <LinkedInCardBody profile={profile} />;
}

type SocialProfileCardProps = {
  profile: SocialProfile;
  href: string;
  label: string;
  className?: string;
  children: ReactNode;
};

export default function SocialProfileCard({ profile, href, label, className, children }: SocialProfileCardProps) {
  const [mounted, setMounted] = useState(false);
  const { open, position, triggerRef, cardRef, hoverHandlers, focusHandlers, contentHoverHandlers, handleTriggerClick } =
    useCardInteraction();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR-safe portal mount guard
    setMounted(true);
  }, []);

  return (
    <>
      <NextLink
        ref={triggerRef}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        aria-expanded={open}
        title={label}
        className={cn(className)}
        onClick={handleTriggerClick}
        {...hoverHandlers}
        {...focusHandlers}
      >
        {children}
      </NextLink>

      {mounted && open && position
        ? createPortal(
            <div
              ref={cardRef}
              role="dialog"
              style={{ position: "fixed", top: position.top, left: position.left, width: CARD_WIDTH }}
              className="z-50 max-w-[calc(100vw-2rem)] animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]"
              {...contentHoverHandlers}
            >
              <ProfileCardBody profile={profile} />
            </div>,
            document.body
          )
        : null}
    </>
  );
}
