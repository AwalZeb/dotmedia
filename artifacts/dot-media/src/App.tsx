import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { motion, useReducedMotion } from 'framer-motion';
import type { Client, EnquiryCreatedResponse, HealthcareCaseStudy, Testimonial, WorkItem } from '@workspace/api-client-react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  Check,
  Clapperboard,
  ClipboardList,
  Clock3,
  HeartPulse,
  Instagram,
  Layers3,
  Menu,
  Megaphone,
  MonitorPlay,
  PenTool,
  ShieldCheck,
  Smartphone,
  Stethoscope,
  Target,
  Video,
  X,
} from 'lucide-react';
import { SiFacebook, SiTiktok, SiWhatsapp } from 'react-icons/si';
import { Link, Route, Router as WouterRouter, Switch, useLocation } from 'wouter';
import { site } from '@/config/site';
import { apiRequest } from '@/lib/api';
import AdminDashboard from '@/components/AdminDashboard';
import NotFound from '@/pages/not-found';
import './index.css';

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

const nav = site.navigation;

function Meta() {
  const [location] = useLocation();
  useEffect(() => {
    const route = location.split('?')[0] || '/';
    const meta = site.seo[route as keyof typeof site.seo] ?? { title: site.positioning, description: site.description };
    document.title = meta.title;
    const description = document.querySelector('meta[name="description"]') ?? document.createElement('meta');
    description.setAttribute('name', 'description');
    description.setAttribute('content', meta.description);
    if (!description.parentNode) document.head.appendChild(description);
    const canonical = document.querySelector('link[rel="canonical"]') ?? document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    canonical.setAttribute('href', `${window.location.origin}${basePath}${route}`);
    if (!canonical.parentNode) document.head.appendChild(canonical);
    const ogTitle = document.querySelector('meta[property="og:title"]') ?? document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    ogTitle.setAttribute('content', meta.title);
    if (!ogTitle.parentNode) document.head.appendChild(ogTitle);
    const ogDescription = document.querySelector('meta[property="og:description"]') ?? document.createElement('meta');
    ogDescription.setAttribute('property', 'og:description');
    ogDescription.setAttribute('content', meta.description);
    if (!ogDescription.parentNode) document.head.appendChild(ogDescription);
    const ogUrl = document.querySelector('meta[property="og:url"]') ?? document.createElement('meta');
    ogUrl.setAttribute('property', 'og:url');
    ogUrl.setAttribute('content', `${window.location.origin}${basePath}${route}`);
    if (!ogUrl.parentNode) document.head.appendChild(ogUrl);
    const twitterTitle = document.querySelector('meta[name="twitter:title"]') ?? document.createElement('meta');
    twitterTitle.setAttribute('name', 'twitter:title');
    twitterTitle.setAttribute('content', meta.title);
    if (!twitterTitle.parentNode) document.head.appendChild(twitterTitle);
    const twitterDescription = document.querySelector('meta[name="twitter:description"]') ?? document.createElement('meta');
    twitterDescription.setAttribute('name', 'twitter:description');
    twitterDescription.setAttribute('content', meta.description);
    if (!twitterDescription.parentNode) document.head.appendChild(twitterDescription);
    const ogImage = document.querySelector('meta[property="og:image"]') ?? document.createElement('meta');
    ogImage.setAttribute('property', 'og:image');
    ogImage.setAttribute('content', `${window.location.origin}${basePath}/og-image.svg`);
    if (!ogImage.parentNode) document.head.appendChild(ogImage);
    const twitterCard = document.querySelector('meta[name="twitter:card"]') ?? document.createElement('meta');
    twitterCard.setAttribute('name', 'twitter:card');
    twitterCard.setAttribute('content', 'summary_large_image');
    if (!twitterCard.parentNode) document.head.appendChild(twitterCard);
    const twitterImage = document.querySelector('meta[name="twitter:image"]') ?? document.createElement('meta');
    twitterImage.setAttribute('name', 'twitter:image');
    twitterImage.setAttribute('content', `${window.location.origin}${basePath}/og-image.svg`);
    if (!twitterImage.parentNode) document.head.appendChild(twitterImage);
    const structuredData = document.querySelector('#dot-media-structured-data') ?? document.createElement('script');
    structuredData.id = 'dot-media-structured-data';
    structuredData.setAttribute('type', 'application/ld+json');
    structuredData.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          name: site.name,
          url: `${window.location.origin}${basePath}/`,
          logo: `${window.location.origin}${basePath}/logo.svg`,
          email: site.email,
          telephone: `+${site.phoneInternational}`,
          sameAs: [site.instagramUrl],
        },
        {
          '@type': 'LocalBusiness',
          name: site.name,
          url: `${window.location.origin}${basePath}/`,
          image: `${window.location.origin}${basePath}/og-image.svg`,
          email: site.email,
          telephone: `+${site.phoneInternational}`,
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Peshawar',
            addressRegion: 'Khyber Pakhtunkhwa',
            addressCountry: 'PK',
          },
        },
      ],
    });
    if (!structuredData.parentNode) document.head.appendChild(structuredData);
    const robots = document.querySelector('meta[name="robots"]') ?? document.createElement('meta');
    robots.setAttribute('name', 'robots');
    robots.setAttribute('content', route === '/admin' || route.startsWith('/sign-') ? 'noindex, nofollow' : 'index, follow');
    if (!robots.parentNode) document.head.appendChild(robots);
  }, [location]);
  return null;
}

function Brand({ small = false }: { small?: boolean }) {
  return (
    <Link href="/" className={`brand focus-ring inline-flex flex-col ${small ? 'gap-0' : 'gap-1'}`} aria-label={`${site.name} home`}>
      <span className={`font-display font-bold tracking-[-.06em] text-white ${small ? 'text-[18px]' : 'text-[21px]'}`}>{site.name}<span className="red-dot">.</span></span>
      {!small && <span className="text-[9px] tracking-[.09em] text-[#8d8d8d]">{site.tagline}</span>}
    </Link>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  useEffect(() => setOpen(false), [location]);
  return (
    <header className="sticky top-0 z-40 border-b border-white/[.07] bg-[#0a0a0a]/90 backdrop-blur-xl">
      <div className="wrap flex h-[76px] items-center justify-between">
        <Brand />
        <nav aria-label="Main navigation" className="desktop-nav flex items-center gap-7">
          {nav.map(({ label, href }) => (
            <Link key={href} href={href} className={`focus-ring text-[12px] font-medium transition-colors hover:text-white ${location === href ? 'text-white' : 'text-[#9c9c9c]'}`} data-testid={`nav-${label.toLowerCase().replaceAll(' ', '-')}`}>{label}</Link>
          ))}
        </nav>
        <Link href="/contact" className="btn btn-primary header-consultation min-h-[42px] px-4 text-[11px]" data-testid="nav-consultation">
          {site.copy.headerConsultation} <ArrowUpRight size={14} />
        </Link>
        <button className="focus-ring flex h-10 w-10 items-center justify-center rounded-lg border border-[#2a2a2a] text-white md:hidden" aria-label={open ? site.copy.menuClose : site.copy.menuOpen} aria-expanded={open} onClick={() => setOpen(!open)} data-testid="button-mobile-menu">
          {open ? <X size={19} /> : <Menu size={20} />}
        </button>
      </div>
      {open && <nav aria-label="Mobile navigation" className="fixed inset-x-0 top-[76px] z-40 min-h-[calc(100dvh-76px)] border-t border-white/10 bg-[#0a0a0a] px-6 pb-10 pt-8 md:hidden">
        <div className="wrap flex flex-col">
          {nav.map(({ label, href }, index) => <Link key={href} href={href} className="flex items-center justify-between border-b border-white/10 py-5 font-display text-[23px] tracking-[-.04em] text-white" data-testid={`mobile-nav-${index}`}><span>{label}</span><ArrowUpRight size={18} className="text-[#e10e1a]" /></Link>)}
          <Link href="/contact" className="btn btn-primary mt-8 w-full" data-testid="mobile-consultation">{site.copy.headerConsultation} <ArrowRight size={15} /></Link>
        </div>
      </nav>}
    </header>
  );
}

function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t border-white/10 bg-[#0d0d0d]">
      <div className="wrap grid gap-12 py-16 md:grid-cols-[1.3fr_.8fr_.8fr_1fr] md:py-20">
        <div>
          <Brand />
          <p className="mt-5 max-w-[290px] text-sm leading-7 text-[#9c9c9c]">{site.copy.footerDescription}</p>
          <p className="mt-4 font-display text-[12px] font-medium text-white">{site.tagline}</p>
        </div>
        <div>
          <h2 className="mb-5 text-[11px] font-bold uppercase tracking-[.16em] text-[#777]">{site.copy.footer.explore}</h2>
          <div className="flex flex-col gap-3">{nav.slice(1).map(({ label, href }) => <Link key={href} href={href} className="w-fit text-[13px] text-[#bbb] transition-colors hover:text-white">{label}</Link>)}</div>
        </div>
        <div>
          <h2 className="mb-5 text-[11px] font-bold uppercase tracking-[.16em] text-[#777]">{site.copy.footer.servicesHeading}</h2>
          <div className="flex flex-col gap-3 text-[13px] text-[#bbb]">
            {site.copy.footer.services.map(item => <span key={item}>{item}</span>)}
          </div>
        </div>
        <div>
          <h2 className="mb-5 text-[11px] font-bold uppercase tracking-[.16em] text-[#777]">{site.copy.footer.contactHeading}</h2>
          <a href={`tel:+${site.phoneInternational}`} className="block text-[13px] text-white">{site.phoneDisplay}</a>
          <a href={`mailto:${site.email}`} className="mt-2 block text-[13px] text-[#bbb] hover:text-white">{site.email}</a>
          <p className="mt-2 text-[13px] text-[#888]">{site.locationShort}</p>
          <div className="mt-5 flex gap-2">
            <a aria-label={`${site.socialLabels.instagram} ${site.instagramHandle}`} href={site.instagramUrl} target="_blank" rel="noopener noreferrer" className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-[#333] text-[#aaa] hover:text-white"><Instagram size={15} /></a>
            {site.facebookUrl.startsWith('https://') ? <a aria-label={site.socialLabels.facebook} href={site.facebookUrl} target="_blank" rel="noopener noreferrer" className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-[#333] text-[#aaa] hover:text-white"><SiFacebook size={15} /></a> : null}
            {site.tiktokUrl.startsWith('https://') ? <a aria-label={site.socialLabels.tiktok} href={site.tiktokUrl} target="_blank" rel="noopener noreferrer" className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-[#333] text-[#aaa] hover:text-white"><SiTiktok size={15} /></a> : null}
          </div>
        </div>
      </div>
      <div className="wrap flex flex-col justify-between gap-3 border-t border-white/[.08] py-5 text-[11px] text-[#737373] sm:flex-row">
        <span>© {currentYear} {site.name}. {site.copy.footer.rights}</span><span>{site.location}</span>
      </div>
    </footer>
  );
}

function WhatsAppFloat() {
  const text = encodeURIComponent(site.whatsappMessage);
  return <a href={`${site.whatsappBaseUrl}${site.phoneInternational}?text=${text}`} target="_blank" rel="noopener noreferrer" aria-label={site.copy.whatsappLabel} className="focus-ring fixed bottom-5 right-5 z-30 flex h-[54px] w-[54px] items-center justify-center rounded-full bg-[#21c063] text-white shadow-[0_12px_40px_rgba(0,0,0,.4)] transition-transform hover:scale-105" data-testid="whatsapp-float"><SiWhatsapp size={25} /></a>;
}

function SiteShell({ children }: { children: ReactNode }) {
  return <><Meta /><Header /><main>{children}</main><Footer /><WhatsAppFloat /></>;
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <span className="eyebrow">{children}</span>;
}

function PageIntro({ label, title, text }: { label: string; title: ReactNode; text: string }) {
  return <section className="relative overflow-hidden border-b border-white/[.07] py-24 md:py-32">
    <div className="dot-grid pointer-events-none absolute inset-0 opacity-[.28]" />
    <div className="wrap relative">
      <Eyebrow>{label}</Eyebrow>
      <h1 className="section-title mt-7 max-w-4xl text-[42px] leading-[1.08] sm:text-6xl md:text-[74px]">{title}</h1>
      <p className="mt-7 max-w-[650px] text-[15px] leading-7 text-[#a3a3a3] md:text-[17px]">{text}</p>
    </div>
  </section>;
}

const problemIcons = [Clock3, Layers3, Video, Target];
const overviewIcons = [MonitorPlay, Clapperboard, ClipboardList, PenTool, Megaphone, Smartphone];
const processNumbers = ['01', '02', '03', '04', '05'];

function DotPathArt() {
  return <div className="pointer-events-none absolute inset-y-0 right-[-13%] hidden w-[68%] opacity-80 md:block" aria-hidden="true">
    <div className="dot-grid absolute inset-0 opacity-50" />
    <svg viewBox="0 0 760 640" className="absolute inset-0 h-full w-full" fill="none">
      <path d="M105 425C205 425 185 231 302 231C413 231 382 388 485 388C585 388 534 166 688 166" stroke="#777" strokeOpacity=".32" strokeWidth="1" strokeDasharray="2 9" className="path-line" />
      <path d="M105 425C205 425 185 231 302 231C413 231 382 388 485 388C585 388 534 166 688 166" stroke="url(#route)" strokeOpacity=".56" strokeWidth="1" />
      {[105, 302, 485, 688].map((x, i) => <circle key={x} cx={x} cy={[425, 231, 388, 166][i]} r={i === 1 ? 7 : 5} fill="#E10E1A" />)}
      <circle cx="302" cy="231" r="17" stroke="#E10E1A" strokeOpacity=".2" />
      <defs><linearGradient id="route" x1="105" y1="425" x2="688" y2="166"><stop stopColor="#E10E1A" stopOpacity="0" /><stop offset=".52" stopColor="#E10E1A" stopOpacity=".8" /><stop offset="1" stopColor="#E10E1A" stopOpacity=".15" /></linearGradient></defs>
    </svg>
    <div className="absolute right-[25%] top-[20%] border border-white/10 bg-[#111]/90 px-4 py-3 backdrop-blur">
      <span className="block text-[9px] uppercase tracking-[.18em] text-[#858585]">{site.copy.visualMotif.eyebrow}</span>
      <span className="mt-1 block font-display text-[13px] text-white">{site.copy.visualMotif.note}</span>
    </div>
  </div>;
}

function ClientStrip() {
  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => apiRequest<Client[]>('/clients'),
    staleTime: 60_000,
  });
  const entries = clients === undefined
    ? site.clients.map((name, id) => ({ id, name, logoUrl: null, displayOrder: id }))
    : clients;
  return <div className="overflow-hidden border-y border-white/[.08] bg-[#0d0d0d] py-7">
      <div className="wrap mb-5 text-center text-[10px] font-semibold uppercase tracking-[.17em] text-[#737373]">{site.copy.home.clientsLabel}</div>
    <div className="flex w-max animate-[marquee_42s_linear_infinite] gap-10 whitespace-nowrap px-4 motion-reduce:animate-none" style={{ animationName: 'marquee' }}>
      {[...entries, ...entries].map((client, index) => <span key={`${client.id}-${index}`} className="flex items-center gap-10 font-display text-[13px] font-medium tracking-[-.02em] text-[#aaa]">{client.logoUrl ? <img src={client.logoUrl} alt={client.name} className="h-8 max-w-36 object-contain" loading="lazy" /> : <span>{client.name}</span>}<i className="h-1.5 w-1.5 rounded-full bg-[#e10e1a]" /></span>)}
    </div>
    <style>{'@keyframes marquee { to { transform: translateX(-50%); } }'}</style>
  </div>;
}

function WorkCard({ item, onSelect }: { item: WorkItem; onSelect: () => void }) {
  const mediaUrl = item.mediaUrl || item.imageUrl;
  const imageUrl = item.mediaType === 'image' ? mediaUrl : item.imageUrl;
  return <button type="button" onClick={onSelect} aria-label={`${site.copy.work.openProject}: ${item.title}`} className="card-hover overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#141414] text-left" data-testid={`work-card-${item.id}`}>
    <div className="work-art relative aspect-[1.58] overflow-hidden">
      {imageUrl ? <img src={imageUrl} alt={`${item.title} — ${item.clientName}`} width="800" height="500" loading="lazy" className="h-full w-full object-cover" /> : <div className="absolute inset-0 flex items-end justify-between p-6">
        <span className="font-display text-[clamp(24px,4vw,46px)] font-semibold tracking-[-.07em] text-white/90">{item.clientName}</span>
        <span className="mb-1 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white">{item.mediaType === 'video' ? <Video size={18} /> : <ArrowUpRight size={18} />}</span>
      </div>}
      <span className="absolute left-5 top-5 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-[9px] uppercase tracking-[.12em] text-white backdrop-blur">{item.category}</span>
    </div>
    <div className="p-5 md:p-6"><p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#e10e1a]">{item.clientName}</p><h3 className="mt-2 font-display text-lg font-semibold tracking-[-.04em] text-white">{item.title}</h3><p className="mt-2 text-[13px] leading-6 text-[#999]">{item.description}</p></div>
  </button>;
}

function categoryMatches(item: WorkItem, filter: string) {
  if (filter === 'All') return true;
  const category = `${item.category} ${item.title}`.toLowerCase();
  const matchers: Record<string, RegExp> = {
    Healthcare: /health|doctor|clinic|hospital|medical/,
    'Restaurants & Food': /restaurant|food|cafe|café/,
    Creators: /creator|content/,
    Hotels: /hotel|hospitality/,
    Websites: /website|web development|app development/,
  };
  return matchers[filter]?.test(category) ?? false;
}

function WorkCollection({ featured = false, filtering = false }: { featured?: boolean; filtering?: boolean }) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['public-work', featured],
    queryFn: () => apiRequest<WorkItem[]>(`/work${featured ? '?featured=true' : ''}`),
  });
  const [activeFilter, setActiveFilter] = useState('All');
  const [selected, setSelected] = useState<WorkItem | null>(null);
  useEffect(() => {
    if (!selected) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelected(null);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [selected]);
  const entries = featured ? (data ?? []).slice(0, 3) : (data ?? []);
  const filteredEntries = filtering ? entries.filter((item) => categoryMatches(item, activeFilter)) : entries;
  if (isLoading) return <div className="grid gap-5 md:grid-cols-3" aria-label="Loading work"><div className="h-[300px] animate-pulse rounded-2xl bg-[#151515]" /><div className="h-[300px] animate-pulse rounded-2xl bg-[#151515]" /><div className="h-[300px] animate-pulse rounded-2xl bg-[#151515]" /></div>;
  if (isError) return <div className="rounded-2xl border border-[#2a2a2a] bg-[#141414] p-8 text-center"><p className="text-sm text-[#aaa]">{site.copy.work.loadError}</p><button onClick={() => refetch()} className="mt-4 text-sm font-semibold text-white underline underline-offset-4" data-testid="button-retry-work">{site.copy.work.retry}</button></div>;
  if (!entries.length) return <div className="rounded-2xl border border-dashed border-[#353535] bg-[#101010] px-8 py-12 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#333] text-[#777]"><Layers3 size={18} /></div><h3 className="mt-4 font-display text-lg text-white">{site.copy.work.emptyTitle}</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#888]">{site.copy.work.emptyText}</p></div>;
  return <>
    {filtering ? <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter portfolio">
      {site.copy.work.filters.map((filter) => <button key={filter} type="button" aria-pressed={activeFilter === filter} onClick={() => setActiveFilter(filter)} className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${activeFilter === filter ? 'bg-[#e10e1a] text-white' : 'border border-[#343434] text-[#aaa] hover:border-[#666] hover:text-white'}`}>{filter}</button>)}
    </div> : null}
    {filteredEntries.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{filteredEntries.map((item) => <WorkCard key={item.id} item={item} onSelect={() => setSelected(item)} />)}</div> : <p className="rounded-xl border border-dashed border-[#353535] p-8 text-center text-sm text-[#999]">{site.copy.work.noCategoryItems}</p>}
    {selected ? <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="work-detail-title" className="my-6 w-full max-w-3xl overflow-hidden rounded-2xl border border-[#333] bg-[#111] shadow-2xl">
        <div className="flex items-start justify-between gap-4 p-5"><div><p className="eyebrow">{selected.category}</p><h2 id="work-detail-title" className="font-display mt-3 text-2xl font-semibold text-white">{selected.title}</h2></div><button type="button" onClick={() => setSelected(null)} aria-label={site.copy.work.closeProject} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#333] text-[#aaa]"><X size={17} /></button></div>
        {selected.mediaType === 'video' && selected.mediaUrl ? <video className="max-h-[65vh] w-full bg-black" src={selected.mediaUrl} controls playsInline /> : (selected.mediaUrl || selected.imageUrl) && selected.mediaType !== 'external' ? <img className="max-h-[65vh] w-full bg-black object-contain" src={selected.mediaUrl || selected.imageUrl || ''} alt={`${selected.clientName}: ${selected.title}`} /> : null}
        <div className="p-5"><p className="text-xs font-semibold uppercase tracking-[.12em] text-[#e10e1a]">{selected.clientName}</p><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#bbb]">{selected.description}</p>{selected.mediaType === 'external' && selected.mediaUrl ? <a className="btn btn-outline mt-5" href={selected.mediaUrl} target="_blank" rel="noopener noreferrer">{site.copy.work.viewExternal}<ArrowUpRight size={14} /></a> : null}</div>
      </section>
    </div> : null}
  </>;
}

function TestimonialsSection() {
  const query = useQuery({
    queryKey: ['testimonials'],
    queryFn: () => apiRequest<Testimonial[]>('/testimonials'),
    staleTime: 60_000,
  });
  if (!query.data?.length) return null;
  return <section className="section-pad">
    <div className="wrap">
      <div className="mb-10"><Eyebrow>{site.copy.testimonials.eyebrow}</Eyebrow><h2 className="section-title mt-5 text-4xl md:text-[52px]">{site.copy.testimonials.title}</h2></div>
      <div className="grid gap-4 md:grid-cols-2">{query.data.map((item) => <article key={item.id} className="rounded-2xl border border-[#2a2a2a] bg-[#141414] p-7">
        <p className="text-sm leading-7 text-[#c6c6c6]">“{item.quote}”</p><div className="mt-6 flex items-center gap-3">{item.imageUrl ? <img src={item.imageUrl} alt="" className="h-10 w-10 rounded-full object-cover" loading="lazy" /> : <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e10e1a]/10 font-display text-xs font-bold text-[#e10e1a]">{item.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span>}<div><p className="text-sm font-semibold text-white">{item.name}</p><p className="mt-1 text-xs text-[#888]">{item.role}</p></div></div>
      </article>)}</div>
    </div>
  </section>;
}

function HomePage() {
  const reducedMotion = useReducedMotion();
  return <SiteShell>
    <section className="relative flex min-h-[650px] items-center overflow-hidden border-b border-white/[.07] md:min-h-[710px]">
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-[.22]" /><DotPathArt />
      <div className="wrap relative z-10 py-24 md:py-32">
        <motion.div className="max-w-[700px]" initial={reducedMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : .65, ease: [.2, .72, .2, 1] }}>
          <div><Eyebrow>{site.copy.heroLabel}</Eyebrow></div>
          <h1 className="section-title mt-7 text-[43px] leading-[1.05] sm:text-6xl md:text-[76px]">{site.copy.heroTitle.replace(/\.$/, '')}<span className="red-dot">.</span></h1>
          <p className="mt-7 max-w-[560px] text-[15px] leading-7 text-[#a8a8a8] md:text-[17px] md:leading-8">{site.copy.heroText}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/contact" className="btn btn-primary" data-testid="hero-consultation">{site.copy.consultation}<ArrowRight size={15} /></Link>
            <Link href="/work" className="btn btn-outline" data-testid="hero-work">{site.copy.home.workCta}<ArrowUpRight size={15} /></Link>
          </div>
          <div className="mt-16 flex items-center gap-3 text-[11px] text-[#747474]"><span className="h-px w-9 bg-[#e10e1a]" />{site.copy.home.locality}</div>
        </motion.div>
      </div>
      <div className="absolute bottom-8 right-8 hidden items-center gap-3 text-[9px] uppercase tracking-[.18em] text-[#747474] lg:flex"><span>{site.copy.home.scroll}</span><ArrowDown size={13} /></div>
    </section>
    <ClientStrip />
    <section className="section-pad">
      <div className="wrap">
        <div className="grid gap-10 md:grid-cols-[.8fr_1.2fr] md:items-end">
          <div><Eyebrow>{site.copy.home.problemEyebrow}</Eyebrow><h2 className="section-title mt-6 text-4xl md:text-[54px]">{site.copy.home.problemTitle.replace(/\.$/, '')}<span className="red-dot">.</span></h2></div>
          <p className="max-w-[490px] pb-1 text-[15px] leading-7 text-[#9c9c9c]">{site.copy.home.problemIntro}</p>
        </div>
        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{site.copy.home.problems.map((item, index) => { const Icon = problemIcons[index]; return <article key={item.title} className="card-hover min-h-[205px] rounded-2xl border border-[#292929] bg-[#141414] p-6">
          <div className="flex items-center justify-between"><Icon size={19} strokeWidth={1.6} className="text-[#e10e1a]" /><span className="font-display text-[10px] tracking-[.1em] text-[#626262]">0{index + 1}</span></div><h3 className="mt-8 font-display text-[16px] font-semibold tracking-[-.03em] text-white">{item.title}</h3><p className="mt-2 text-[12px] leading-6 text-[#929292]">{item.text}</p>
        </article>; })}</div>
      </div>
    </section>
    <section className="section-pad border-y border-white/[.06] bg-[#0d0d0d]">
      <div className="wrap">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><Eyebrow>{site.copy.home.serviceEyebrow}</Eyebrow><h2 className="section-title mt-6 max-w-2xl text-4xl md:text-[54px]">{site.copy.home.serviceHeading}</h2></div><Link href="/services" className="group inline-flex items-center gap-2 text-sm font-semibold text-white">{site.copy.home.serviceLink} <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></Link></div>
        <div className="mt-12 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">{site.copy.home.serviceOverview.map((s, index) => { const Icon = overviewIcons[index]; return <Link key={s.title} href="/services" className="group flex gap-5 border-t border-[#292929] py-7" data-testid={`service-overview-${index}`}>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#333] bg-[#151515] text-[#e10e1a]"><Icon size={18} strokeWidth={1.6} /></div><div><h3 className="font-display text-[15px] font-semibold text-white">{s.title}</h3><p className="mt-2 max-w-[275px] text-[12px] leading-6 text-[#8d8d8d]">{s.text}</p><span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-[#b3b3b3] group-hover:text-white">{site.copy.home.learnMore} <ArrowRight size={12} /></span></div>
        </Link>; })}</div>
      </div>
    </section>
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="absolute inset-y-0 right-0 w-[54%] bg-[radial-gradient(ellipse_at_80%_50%,rgba(225,14,26,.09),transparent_55%)]" />
      <div className="wrap relative grid gap-12 md:grid-cols-[1fr_1fr] md:items-center">
        <div><Eyebrow>{site.copy.home.healthcareLabel}</Eyebrow><h2 className="section-title mt-6 text-4xl md:text-[52px]">{site.copy.home.healthcareTitle.replace(/\.$/, '')}<span className="red-dot">.</span></h2><p className="mt-6 max-w-[530px] text-[14px] leading-7 text-[#a0a0a0]">{site.copy.home.healthcareText}</p>
          <ul className="mt-7 space-y-4">{site.copy.home.healthcareBullets.map(text => <li key={text} className="flex gap-3 text-[13px] text-[#c8c8c8]"><span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#e10e1a]/15 text-[#f04750]"><Check size={10} /></span>{text}</li>)}</ul>
          <Link href="/healthcare" className="btn btn-outline mt-8" data-testid="healthcare-explore">{site.copy.home.healthcareLink} <ArrowRight size={14} /></Link>
        </div>
        <div className="relative min-h-[360px] overflow-hidden rounded-[24px] border border-[#2c2c2c] bg-[#141414] p-7 md:min-h-[440px] md:p-10">
          <div className="absolute inset-0 dot-grid opacity-[.28]" />
          <div className="relative flex h-full min-h-[300px] flex-col justify-between">
            <div className="flex items-center justify-between"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e10e1a]/10 text-[#e10e1a]"><HeartPulse size={22} /></div><span className="text-[9px] uppercase tracking-[.16em] text-[#737373]">{site.copy.home.healthcareArtLabel}</span></div>
            <div><div className="mb-6 h-px w-full bg-white/10" /><div className="flex items-end justify-between gap-4"><div><p className="font-display text-[30px] font-semibold leading-tight tracking-[-.05em] text-white md:text-[39px]">{site.copy.home.healthcareArtTitle}</p><p className="mt-3 text-[12px] text-[#8b8b8b]">{site.copy.home.healthcareArtDescription}</p></div><div className="mb-2 h-3 w-3 rounded-full bg-[#e10e1a] shadow-[0_0_0_9px_rgba(225,14,26,.1)]" /></div></div>
          </div>
        </div>
      </div>
    </section>
    <section className="section-pad border-y border-white/[.06] bg-[#0d0d0d]">
      <div className="wrap"><div className="grid gap-10 md:grid-cols-[.7fr_1.3fr]"><div><Eyebrow>{site.copy.home.processLabel}</Eyebrow><h2 className="section-title mt-6 text-4xl md:text-[52px]">{site.copy.home.processTitle.replace(/\.$/, '')}<span className="red-dot">.</span></h2><p className="mt-5 max-w-sm text-sm leading-7 text-[#929292]">{site.copy.home.processIntro}</p></div>
        <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-5">{site.copy.home.process.map(({ title, text }, i) => <div key={title} className="relative border-t border-[#333] py-6 sm:pr-5 lg:border-t-0 lg:border-l lg:pl-5 lg:first:border-l-0 lg:first:pl-0">
          <div className="mb-7 flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-[#e10e1a]" /><span className="font-mono text-[10px] tracking-[.14em] text-[#777]">{processNumbers[i]}</span>{i < site.copy.home.process.length - 1 && <span className="hidden h-px flex-1 border-t border-dashed border-[#3a3a3a] lg:block" />}</div><h3 className="font-display text-[16px] font-semibold text-white">{title}</h3><p className="mt-2 text-[12px] leading-6 text-[#929292]">{text}</p>
        </div>)}</div></div>
      </div>
    </section>
    <section className="section-pad">
      <div className="wrap"><div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><Eyebrow>{site.copy.home.featuredLabel}</Eyebrow><h2 className="section-title mt-5 text-4xl md:text-[52px]">{site.copy.home.featuredTitle}</h2></div><Link href="/work" className="group inline-flex items-center gap-2 text-sm font-semibold text-white" data-testid="view-all-work">{site.copy.home.featuredLink} <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></Link></div><WorkCollection featured />
      </div>
    </section>
    <section className="section-pad border-y border-white/[.06] bg-[#0d0d0d]">
      <div className="wrap"><div className="grid gap-10 md:grid-cols-[.75fr_1.25fr]"><div><Eyebrow>{site.copy.home.whyLabel}</Eyebrow><h2 className="section-title mt-6 text-4xl md:text-[50px]">{site.copy.home.whyTitle}</h2></div>
        <div className="grid gap-x-8 sm:grid-cols-2">{site.copy.home.why.map(({ title, text }, i) => <div key={title} className="border-t border-[#303030] py-6"><span className="font-mono text-[10px] text-[#e10e1a]">0{i + 1}</span><h3 className="mt-4 font-display text-[17px] font-semibold text-white">{title}</h3><p className="mt-2 text-[13px] leading-6 text-[#929292]">{text}</p></div>)}</div>
      </div></div>
    </section>
    <TestimonialsSection />
    <CallToAction />
  </SiteShell>;
}

function CallToAction() {
  return <section className="relative overflow-hidden bg-[#e10e1a] py-16 md:py-20">
    <div className="pointer-events-none absolute -right-12 -top-28 h-[360px] w-[360px] rounded-full border border-white/15" /><div className="pointer-events-none absolute -right-2 -top-16 h-[280px] w-[280px] rounded-full border border-white/15" />
    <div className="wrap relative flex flex-col justify-between gap-8 md:flex-row md:items-center"><div className="max-w-[680px]"><span className="text-[10px] font-bold uppercase tracking-[.17em] text-white/75">{site.copy.cta.eyebrow}</span><h2 className="section-title mt-4 text-[34px] text-white md:text-[48px]">{site.copy.cta.title}</h2><p className="mt-4 text-[14px] text-white/80">{site.copy.cta.text}</p></div><div className="flex flex-col gap-3 sm:flex-row"><Link href="/contact" className="btn bg-white text-[#111] hover:bg-[#f0efed]" data-testid="cta-book">{site.copy.cta.book} <ArrowRight size={14} /></Link><a href={`${site.whatsappBaseUrl}${site.phoneInternational}?text=${encodeURIComponent(site.whatsappMessage)}`} target="_blank" rel="noopener noreferrer" className="btn border border-white/55 text-white hover:bg-white/10" data-testid="cta-whatsapp">{site.copy.cta.whatsapp} <SiWhatsapp size={16} /></a></div></div>
  </section>;
}

const serviceIcons = [MonitorPlay, Target, Clapperboard, Video, PenTool, BadgeCheck, ClipboardList, Megaphone, ArrowUpRight, Smartphone, Building2, Layers3];
const services = site.services.map((service, index) => ({ ...service, icon: serviceIcons[index] }));

function ServicesPage() {
  return <SiteShell>
    <PageIntro label={site.copy.servicesPage.eyebrow} title={<>{site.copy.servicesPage.title.replace(/\.$/, '')}<span className="red-dot">.</span></>} text={site.copy.servicesPage.intro} />
    <section className="py-16 md:py-24"><div className="wrap">
      <div className="mb-10 flex items-start gap-4 border-b border-[#2b2b2b] pb-8"><span className="mt-1 font-mono text-[11px] text-[#e10e1a]">{site.copy.servicesPage.count}</span><p className="max-w-lg text-sm leading-6 text-[#929292]">{site.copy.servicesPage.lead}</p></div>
      <div>{services.map((service, index) => <article key={service.title} id={`service-${index}`} className="grid gap-8 border-b border-[#292929] py-12 md:grid-cols-2 md:items-center md:gap-16 md:py-16">
        <div className={`${index % 2 ? 'md:order-2' : ''}`}><div className="flex items-center gap-4"><span className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#323232] bg-[#141414] text-[#e10e1a]"><service.icon size={19} strokeWidth={1.7} /></span><span className="font-mono text-[10px] tracking-[.16em] text-[#6f6f6f]">{site.copy.servicesPage.serviceLabel} 0{index + 1}</span></div><h2 className="font-display mt-7 text-[28px] font-semibold leading-tight tracking-[-.045em] text-white md:text-[38px]">{service.title}</h2><p className="mt-4 max-w-[540px] text-[14px] leading-7 text-[#999]">{service.text}</p><Link href={`/contact?service=${encodeURIComponent(service.title)}`} className="btn btn-outline mt-7" data-testid={`discuss-service-${index}`}>{site.copy.servicesPage.discuss} <ArrowUpRight size={14} /></Link></div>
        <div className={`${index % 2 ? 'md:order-1' : ''} rounded-2xl border border-[#2a2a2a] bg-[#111] p-6 md:p-8`}>
          <div className="mb-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#777]"><span className="h-1.5 w-1.5 rounded-full bg-[#e10e1a]" />{site.copy.servicesPage.included}</div>
          <ul className="space-y-4">{service.included.map(point => <li key={point} className="flex items-start gap-3 text-[13px] leading-6 text-[#c1c1c1]"><Check size={14} className="mt-1 shrink-0 text-[#e10e1a]" />{point}</li>)}</ul>
          <div className="mt-8 h-px bg-[#282828]" /><p className="mt-4 text-[11px] leading-5 text-[#777]">{site.copy.servicesPage.note}</p>
        </div>
      </article>)}</div>
    </div></section>
    <CallToAction />
  </SiteShell>;
}

function HealthcareCaseStudy() {
  const query = useQuery({
    queryKey: ['public-case-study'],
    queryFn: () => apiRequest<HealthcareCaseStudy>('/case-study/healthcare'),
    staleTime: 60_000,
  });
  const clientName = query.data?.clientName ?? site.copy.healthcare.caseClient;
  const description = query.data?.description ?? site.copy.healthcare.caseDescription;
  const category = query.data?.category ?? 'Healthcare content';
  return <section className="border-y border-[#292929] bg-[#111] py-12"><div className="wrap grid gap-6 md:grid-cols-[.25fr_1fr_auto] md:items-center"><div className="font-mono text-[10px] uppercase tracking-[.16em] text-[#e10e1a]">{category}</div><div><h2 className="font-display text-xl font-semibold tracking-[-.04em] text-white">{clientName}</h2><p className="mt-2 text-sm leading-6 text-[#999]">{description}</p></div><span className="text-[10px] uppercase tracking-[.12em] text-[#686868]">{site.copy.healthcare.caseDisclaimer}</span></div></section>;
}

function HealthcarePage() {
  return <SiteShell>
    <PageIntro label={site.copy.healthcare.heroLabel} title={<>{site.copy.healthcare.heroTitle.replace(/\.$/, '')}<span className="red-dot">.</span></>} text={site.copy.healthcare.heroText} />
    <section className="section-pad"><div className="wrap grid gap-12 md:grid-cols-[.8fr_1.2fr]">
      <div><Eyebrow>{site.copy.healthcare.audienceEyebrow}</Eyebrow><h2 className="section-title mt-6 text-4xl md:text-[48px]">{site.copy.healthcare.audienceTitle.replace(/\.$/, '')}<span className="red-dot">.</span></h2><p className="mt-5 text-sm leading-7 text-[#949494]">{site.copy.healthcare.audienceIntro}</p></div>
      <div className="grid gap-3 sm:grid-cols-2">{site.copy.healthcare.audiences.map((audience, i) => <div key={audience} className="card-hover flex min-h-[110px] items-center gap-4 rounded-xl border border-[#292929] bg-[#141414] p-5"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e10e1a]/10 text-[#e10e1a]">{i === 5 ? <Building2 size={18} /> : <Stethoscope size={18} />}</span><span className="font-display text-[14px] font-medium text-white">{audience}</span></div>)}</div>
    </div></section>
    <section className="section-pad border-y border-white/[.06] bg-[#0d0d0d]"><div className="wrap grid gap-10 md:grid-cols-[1fr_1fr] md:items-center">
      <div className="relative min-h-[340px] overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#141414] p-8"><div className="dot-grid absolute inset-0 opacity-30" /><div className="relative flex h-full min-h-[270px] flex-col justify-between"><div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#333] bg-[#0c0c0c] text-[#e10e1a]"><HeartPulse size={21} /></div><div><div className="mb-5 flex items-center gap-2 text-[10px] uppercase tracking-[.15em] text-[#777]"><span className="h-1.5 w-1.5 rounded-full bg-[#e10e1a]" />{site.copy.healthcare.patientFirst}</div><p className="font-display text-3xl font-medium leading-tight tracking-[-.05em] text-white">{site.copy.healthcare.clarityTitle}</p></div></div></div>
      <div><Eyebrow>{site.copy.healthcare.consistencyEyebrow}</Eyebrow><h2 className="section-title mt-6 text-4xl md:text-[46px]">{site.copy.healthcare.consistencyTitle}</h2><p className="mt-5 text-[14px] leading-7 text-[#999]">{site.copy.healthcare.consistencyText}</p><div className="mt-7 flex items-center gap-3 border-l-2 border-[#e10e1a] pl-4 text-[13px] leading-6 text-[#bdbdbd]">{site.copy.healthcare.clarityNote}</div></div>
    </div></section>
    <section className="section-pad"><div className="wrap"><div className="max-w-2xl"><Eyebrow>{site.copy.healthcare.contentEyebrow}</Eyebrow><h2 className="section-title mt-6 text-4xl md:text-[50px]">{site.copy.healthcare.contentTitle.replace(/\.$/, '')}<span className="red-dot">.</span></h2></div><div className="mt-11 grid gap-x-12 sm:grid-cols-2 lg:grid-cols-3">{site.copy.healthcare.contentTypes.map((item, index) => <div key={item} className="flex items-center gap-4 border-t border-[#303030] py-6"><span className="font-mono text-[10px] text-[#e10e1a]">0{index + 1}</span><span className="font-display text-[15px] text-white">{item}</span></div>)}</div></div></section>
    <section className="section-pad border-y border-white/[.06] bg-[#0d0d0d]"><div className="wrap"><div className="max-w-xl"><Eyebrow>{site.copy.healthcare.busyEyebrow}</Eyebrow><h2 className="section-title mt-6 text-4xl md:text-[50px]">{site.copy.healthcare.busyTitle.replace(/\.$/, '')}<span className="red-dot">.</span></h2></div><div className="mt-12 grid gap-0 sm:grid-cols-2 lg:grid-cols-4">{site.copy.healthcare.workflow.map(({ title, text }, index) => <article key={title} className="border-t border-[#353535] py-6 sm:pr-6"><span className="font-mono text-[11px] text-[#e10e1a]">0{index + 1}</span><h3 className="mt-5 font-display text-[17px] font-semibold text-white">{title}</h3><p className="mt-2 text-[13px] leading-6 text-[#909090]">{text}</p></article>)}</div></div></section>
    <section className="section-pad"><div className="wrap"><div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]"><div><Eyebrow>{site.copy.healthcare.ethicsEyebrow}</Eyebrow><h2 className="section-title mt-6 text-4xl md:text-[48px]">{site.copy.healthcare.ethicsTitle.replace(/\.$/, '')}<span className="red-dot">.</span></h2><p className="mt-5 text-sm leading-7 text-[#999]">{site.copy.healthcare.ethicsIntro}</p></div><div className="rounded-2xl border border-[#343434] bg-[#141414] p-6 md:p-9"><div className="mb-7 flex items-center gap-3"><ShieldCheck size={20} className="text-[#e10e1a]" /><span className="text-[11px] font-bold uppercase tracking-[.16em] text-white">{site.copy.healthcare.ethicsStandards}</span></div><ul className="space-y-5">{site.copy.healthcare.ethics.map(item => <li key={item} className="flex gap-4 text-[13px] leading-6 text-[#c3c3c3]"><span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#e10e1a]/50 text-[#e10e1a]"><Check size={11} /></span>{item}</li>)}</ul></div></div></div></section>
    <HealthcareCaseStudy />
    <CallToAction />
  </SiteShell>;
}

function WorkPage() {
  return <SiteShell><PageIntro label={site.copy.work.eyebrow} title={<>{site.copy.work.title.replace(/\.$/, '')}<span className="red-dot">.</span></>} text={site.copy.work.intro} /><section className="section-pad"><div className="wrap"><div className="mb-9 flex items-center justify-between gap-4"><p className="max-w-md text-[13px] leading-6 text-[#929292]">{site.copy.work.note}</p><span className="hidden text-[10px] uppercase tracking-[.16em] text-[#666] sm:inline">{site.copy.work.selected}</span></div><WorkCollection filtering /></div></section><CallToAction /></SiteShell>;
}

function AboutPage() {
  return <SiteShell>
    <PageIntro label={site.copy.about.heroLabel} title={<>About {site.name}<span className="red-dot">.</span></>} text={site.copy.about.heroText} />
    <section className="section-pad"><div className="wrap grid gap-12 md:grid-cols-[.75fr_1.25fr]">
      <div><Eyebrow>{site.copy.about.storyEyebrow}</Eyebrow><h2 className="section-title mt-6 text-4xl md:text-[48px]">{site.copy.about.storyTitle}</h2></div>
      <div className="space-y-5 text-[15px] leading-8 text-[#a2a2a2]">{site.copy.about.story.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
    </div></section>
    <section className="border-y border-white/[.06] bg-[#0d0d0d] py-20 md:py-24"><div className="wrap grid gap-8 md:grid-cols-[.75fr_1.25fr] md:items-start"><div><Eyebrow>{site.copy.about.missionEyebrow}</Eyebrow><h2 className="section-title mt-6 text-4xl md:text-[48px]">{site.copy.about.missionTitle}</h2></div><p className="max-w-2xl text-[15px] leading-8 text-[#a2a2a2]">{site.copy.about.mission}</p></div></section>
    <section className="border-y border-white/[.06] bg-[#0d0d0d] py-20 md:py-28"><div className="wrap"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><Eyebrow>{site.copy.about.founderEyebrow}</Eyebrow><h2 className="section-title mt-6 text-4xl md:text-[50px]">{site.copy.about.foundersTitle}</h2></div><p className="max-w-sm text-sm leading-6 text-[#999]">{site.copy.about.foundersIntro}</p></div>
       <div className="mt-10 grid gap-4 md:grid-cols-2">{site.founders.map((founder, index) => <article key={founder.name} className="card-hover relative overflow-hidden rounded-2xl border border-[#2b2b2b] bg-[#141414] p-8 md:p-10"><span className="absolute right-7 top-5 font-display text-[88px] font-bold leading-none tracking-[-.1em] text-white/[.035]">0{index + 1}</span><div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#333] text-[#e10e1a]"><span className="font-display text-[12px] font-bold">{founder.name.split(' ').map(n => n[0]).join('')}</span></div><h3 className="font-display mt-12 text-[27px] font-semibold tracking-[-.045em] text-white">{founder.name}</h3><p className="mt-2 text-[12px] uppercase tracking-[.12em] text-[#888]">{founder.role}</p></article>)}</div><p className="mt-6 text-sm text-[#999]">{site.copy.about.teamSupport}</p>
    </div></section>
    <section className="section-pad"><div className="wrap grid gap-10 md:grid-cols-[.8fr_1.2fr]"><div><Eyebrow>{site.copy.about.valuesEyebrow}</Eyebrow><h2 className="section-title mt-6 text-4xl md:text-[48px]">{site.copy.about.valuesTitle}</h2></div><div className="grid gap-0 sm:grid-cols-2">{site.copy.about.values.map(({ title, text }, index) => <div key={title} className="border-t border-[#303030] py-6 sm:pr-5"><span className="font-mono text-[10px] text-[#e10e1a]">0{index + 1}</span><h3 className="mt-3 font-display text-[16px] font-semibold text-white">{title}</h3><p className="mt-2 text-[13px] leading-6 text-[#909090]">{text}</p></div>)}</div></div></section>
    <CallToAction />
  </SiteShell>;
}

function ContactPage() {
  const [params] = useLocation();
  const selectedService = new URLSearchParams(params.split('?')[1] ?? '').get('service') ?? '';
  const [name, setName] = useState('');
  const [business, setBusiness] = useState('');
  const [phone, setPhone] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [email, setEmail] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>(selectedService ? [selectedService] : []);
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => setSelectedServices(selectedService ? [selectedService] : []), [selectedService]);
  const toggleService = (title: string) => setSelectedServices((current) =>
    current.includes(title) ? current.filter((service) => service !== title) : [...current, title],
  );
  const composeWhatsAppUrl = () => {
    const detailText = [
      site.copy.contact.whatsappIntro,
      '',
      `${site.copy.contact.name}: ${name}`,
      `${site.copy.contact.phone}: ${phone}`,
      `${site.copy.contact.business}: ${business || site.copy.contact.notSpecified}`,
      `${site.copy.contact.businessType}: ${businessType || site.copy.contact.notSpecified}`,
      `${site.copy.contact.email}: ${email || site.copy.contact.notSpecified}`,
      `${site.copy.contact.services}: ${selectedServices.join(', ') || site.copy.contact.notSpecified}`,
      '',
      message,
    ].join('\n');
    return `${site.whatsappBaseUrl}${site.phoneInternational}?text=${encodeURIComponent(detailText)}`;
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !phone.trim()) { setError(site.copy.contact.validation); return; }
    setError('');
    setSubmitting(true);
    try {
      const response = await apiRequest<EnquiryCreatedResponse>('/enquiries', {
        method: 'POST',
        body: JSON.stringify({
          fullName: name.trim(),
          phone: phone.trim(),
          email: email.trim() || null,
          businessName: business.trim(),
          businessType,
          services: selectedServices,
          message: message.trim(),
          website,
        }),
      });
      setSuccessMessage(response.message || site.copy.contact.success);
      setWhatsappUrl(composeWhatsAppUrl());
      setSubmitted(true);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Your message could not be sent. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  return <SiteShell>
    <PageIntro label={site.copy.contact.eyebrow} title={<>{site.copy.contact.title.replace(/\.$/, '')}<span className="red-dot">.</span></>} text={site.copy.contact.intro} />
    <section className="section-pad"><div className="wrap grid gap-12 lg:grid-cols-[.72fr_1.28fr]">
      <aside><Eyebrow>{site.copy.contact.asideEyebrow}</Eyebrow><h2 className="section-title mt-6 text-3xl md:text-[39px]">{site.copy.contact.asideTitle}</h2><p className="mt-5 text-[14px] leading-7 text-[#999]">{site.copy.contact.asideText}</p>
        <div className="mt-9 space-y-5">
          <a href={`${site.whatsappBaseUrl}${site.phoneInternational}`} className="group flex items-start gap-4"><span className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#333] text-[#e10e1a]"><SiWhatsapp size={17} /></span><span><small className="block text-[10px] uppercase tracking-[.14em] text-[#777]">{site.copy.contact.phoneLabel}</small><b className="mt-1 block text-[14px] font-medium text-white">{site.phoneDisplay}</b></span></a>
          <a href={`mailto:${site.email}`} className="group flex items-start gap-4"><span className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#333] text-[#e10e1a]">@</span><span><small className="block text-[10px] uppercase tracking-[.14em] text-[#777]">{site.copy.contact.emailLabel}</small><b className="mt-1 block text-[14px] font-medium text-white">{site.email}</b></span></a>
          <div className="flex items-start gap-4"><span className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#333] text-[#e10e1a]"><Building2 size={17} /></span><span><small className="block text-[10px] uppercase tracking-[.14em] text-[#777]">{site.copy.contact.locationLabel}</small><b className="mt-1 block text-[14px] font-medium text-white">{site.locationShort}</b></span></div>
          <a href={site.instagramUrl} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-4"><span className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#333] text-[#e10e1a]"><Instagram size={17} /></span><span><small className="block text-[10px] uppercase tracking-[.14em] text-[#777]">{site.socialLabels.instagram}</small><b className="mt-1 block text-[14px] font-medium text-white">{site.instagramHandle}</b></span></a>
        </div>
      </aside>
      <form onSubmit={submit} className="relative rounded-2xl border border-[#2b2b2b] bg-[#111] p-6 md:p-9">
        <div className="mb-7"><h2 className="font-display text-[22px] font-semibold tracking-[-.04em] text-white">{site.copy.contact.formTitle}</h2><p className="mt-2 text-[12px] text-[#858585]">{site.copy.contact.formIntro}</p></div>
        {submitted ? <div className="mb-6 rounded-xl border border-emerald-900/70 bg-emerald-950/30 p-5" role="status"><h3 className="font-display text-lg font-semibold text-white">Enquiry received.</h3><p className="mt-2 text-sm leading-6 text-[#c6d8ca]">{successMessage}</p><a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline mt-4 min-h-10 px-4 text-xs"><SiWhatsapp size={15} />{site.copy.contact.whatsappInstead}</a></div> : null}
        <input aria-hidden="true" tabIndex={-1} autoComplete="off" name="website" value={website} onChange={(event) => setWebsite(event.target.value)} className="absolute -left-[10000px] h-px w-px opacity-0" />
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-[11px] font-semibold text-[#ccc]">{site.copy.contact.name}<input className="field mt-2" value={name} onChange={(event) => setName(event.target.value)} placeholder={site.copy.contact.namePlaceholder} autoComplete="name" required data-testid="input-contact-name" /></label>
          <label className="text-[11px] font-semibold text-[#ccc]">{site.copy.contact.phone}<input className="field mt-2" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder={site.copy.contact.phonePlaceholder} autoComplete="tel" type="tel" required data-testid="input-contact-phone" /></label>
          <label className="text-[11px] font-semibold text-[#ccc]">{site.copy.contact.business}<input className="field mt-2" value={business} onChange={(event) => setBusiness(event.target.value)} placeholder={site.copy.contact.businessPlaceholder} autoComplete="organization" data-testid="input-contact-business" /></label>
          <label className="text-[11px] font-semibold text-[#ccc]">{site.copy.contact.businessType}
            <select className="field mt-2" value={businessType} onChange={(event) => setBusinessType(event.target.value)} data-testid="select-contact-business-type">
              <option value="">{site.copy.contact.businessTypePlaceholder}</option>{site.copy.contact.businessTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </label>
          <label className="text-[11px] font-semibold text-[#ccc] sm:col-span-2">{site.copy.contact.email}<input className="field mt-2" value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder={site.copy.contact.emailPlaceholder} autoComplete="email" data-testid="input-contact-email" /></label>
        </div>
        <fieldset className="mt-5"><legend className="text-[11px] font-semibold text-[#ccc]">{site.copy.contact.services}</legend><div className="mt-3 grid gap-2 sm:grid-cols-2">{services.map((service) => <label key={service.title} className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#303030] px-3 py-3 text-xs text-[#bbb]"><input type="checkbox" checked={selectedServices.includes(service.title)} onChange={() => toggleService(service.title)} className="accent-[#e10e1a]" />{service.title}</label>)}</div></fieldset>
        <label className="mt-5 block text-[11px] font-semibold text-[#ccc]">{site.copy.contact.message}<textarea className="field mt-2 min-h-[130px] resize-y" value={message} onChange={(event) => setMessage(event.target.value)} placeholder={site.copy.contact.messagePlaceholder} data-testid="input-contact-message" /></label>
        {error && <p className="mt-4 text-sm text-[#ff777d]" role="alert">{error}</p>}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button type="submit" disabled={submitting || submitted} className="btn btn-primary w-full disabled:opacity-50 sm:w-auto" data-testid="button-contact-submit">{submitting ? 'Sending…' : submitted ? 'Enquiry sent' : site.copy.contact.submit} <ArrowRight size={14} /></button>
          {!submitted ? <a href={composeWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="btn btn-outline min-h-11 w-full text-xs sm:w-auto"><SiWhatsapp size={15} />{site.copy.contact.whatsappInstead}</a> : null}
        </div>
        {submitted ? <button type="button" onClick={() => { setSubmitted(false); setError(''); }} className="mt-4 text-xs text-[#aaa] underline underline-offset-4 hover:text-white">Send another enquiry</button> : null}
        <p className="mt-4 text-[10px] leading-5 text-[#737373]">{site.copy.contact.privacy}</p>
      </form>
    </div></section>
  </SiteShell>;
}

function AdminPage() {
  return <SiteShell><AdminDashboard /></SiteShell>;
}

function RoutedContent() {
  return <Switch>
    <Route path="/" component={HomePage} />
    <Route path="/services" component={ServicesPage} />
    <Route path="/healthcare" component={HealthcarePage} />
    <Route path="/work" component={WorkPage} />
    <Route path="/about" component={AboutPage} />
    <Route path="/contact" component={ContactPage} />
    <Route path="/admin" component={AdminPage} />
    <Route component={NotFound} />
  </Switch>;
}

function RouterApp() {
  const [location] = useLocation();
  return <RoutedContent key={location.split('?')[0]} />;
}

function App() {
  return <QueryClientProvider client={queryClient}><WouterRouter base={basePath}><RouterApp /></WouterRouter></QueryClientProvider>;
}

export default App;
