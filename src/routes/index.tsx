import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clapperboard,
  Clock3,
  Code2,
  Gift,
  MapPin,
  Megaphone,
  Monitor,
  Palette,
  Quote,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  UserRound,
  Wallet,
  WandSparkles,
} from "lucide-react";
import { Shell } from "@/components/layout/Shell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Skill-to-Money · Donde tus habilidades se convierten en ingresos reales" },
      {
        name: "description",
        content:
          "Conectamos talento digital con MYPES. Más oportunidades, trabajos de calidad y pagos seguros.",
      },
      { property: "og:title", content: "Skill-to-Money · Ingresos reales con tus habilidades" },
      {
        property: "og:description",
        content:
          "Plataforma para freelancers, MYPES y talento digital con pagos seguros e IA incluida.",
      },
    ],
  }),
  component: Landing,
});

const categories = [
  {
    icon: Palette,
    title: "Diseño Gráfico",
    count: "142",
    tone: "from-[#051b1e] to-[#063b3b]",
    iconTone: "bg-[#ff3dca]",
  },
  {
    icon: Clapperboard,
    title: "Edición de Video",
    count: "98",
    tone: "from-[#ffe4d9] to-[#fff2e8]",
    iconTone: "bg-[#ff442f]",
    light: true,
  },
  {
    icon: Megaphone,
    title: "Marketing & CM",
    count: "76",
    tone: "from-[#d9fbf5] to-[#ecfffb]",
    iconTone: "bg-[#00bfae]",
    light: true,
  },
  {
    icon: Monitor,
    title: "Desarrollo Web",
    count: "121",
    tone: "from-[#dcd7ff] to-[#f4f1ff]",
    iconTone: "bg-[#6c5cff]",
    light: true,
  },
  {
    icon: WandSparkles,
    title: "Diseño UX/UI",
    count: "64",
    tone: "from-[#120928] to-[#251052]",
    iconTone: "bg-[#8d5cff]",
  },
  {
    icon: Bot,
    title: "IA & Automatización",
    count: "53",
    tone: "from-[#ccecff] to-[#eaf7ff]",
    iconTone: "bg-[#5b8cff]",
    light: true,
  },
];

const freelancers = [
  {
    name: "Camila R.",
    role: "Diseñadora Gráfica",
    rating: "4.9 (128)",
    city: "Lima, Perú",
    tags: ["Branding", "UI Design", "Logo"],
    price: "80",
    tone: "from-[#ff6838] to-[#ffd5bf]",
  },
  {
    name: "Ricardo V.",
    role: "Editor de Video",
    rating: "4.9 (96)",
    city: "Arequipa, Perú",
    tags: ["Video Ads", "TikTok", "YouTube"],
    price: "120",
    tone: "from-[#00c9ba] to-[#e4fffa]",
  },
  {
    name: "Lucía F.",
    role: "Community Manager",
    rating: "5.0 (75)",
    city: "Trujillo, Perú",
    tags: ["Instagram", "Contenido", "Estrategia"],
    price: "90",
    tone: "from-[#8b5cff] to-[#ffe0ef]",
  },
];

const testimonials = [
  {
    text: "En 2 semanas conseguí 4 clientes. La IA me ayudó a fijar mejores precios y mi portafolio se ve mucho más pro.",
    name: "Camila R.",
    role: "Diseñadora Gráfica",
    city: "Lima, Perú",
  },
  {
    text: "Encontré un editor de video buenísimo y a muy buen precio para nuestro TikTok. Subimos 3x los seguidores.",
    name: "Ricardo Vega",
    role: "Cafetería Limen · MYPE",
    city: "Arequipa, Perú",
  },
  {
    text: "Por fin una plataforma pensada para principiantes. Súper intuitiva y los pagos son seguros.",
    name: "Lucía F.",
    role: "Community Manager",
    city: "Trujillo, Perú",
  },
];

function Landing() {
  return (
    <Shell>
      <HeroSection />
      <CategoriesSection />
      <HowItWorksSection />
      <FreelancersSection />
      <AudienceSection />
      <CommunitySection />
      <FinalCtaSection />
    </Shell>
  );
}

function HeroSection() {
  return (
    <section id="inicio" className="relative overflow-hidden bg-gradient-hero text-white">
      <div className="absolute inset-0 grid-pattern opacity-70" />
      <div className="absolute inset-0 noise opacity-[0.04]" />
      <div className="absolute left-0 top-24 h-80 w-80 rounded-full border border-accent/20 opacity-30" />
      <div className="absolute right-8 top-28 h-72 w-72 rounded-full border border-accent/30 opacity-40" />
      <div className="absolute right-0 top-10 h-36 w-36 dot-field opacity-45" />
      <div className="absolute left-5 top-32 h-24 w-24 dot-field opacity-25" />

      <div className="relative mx-auto max-w-7xl px-6 pb-10 pt-16 lg:pb-12 lg:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.95fr]">
          <div className="max-w-2xl">
            <div className="mb-7 hidden text-white/80 sm:block">
              <Sparkles className="h-6 w-6" />
            </div>
            <h1 className="font-display text-5xl font-extrabold leading-[0.98] tracking-[-0.07em] sm:text-6xl lg:text-[4.9rem]">
              Donde tus habilidades
              <br />
              se convierten en
              <br />
              <span className="text-primary">ingresos</span>{" "}
              <span className="text-accent">reales.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/82">
              Conectamos talento digital con MYPES. Más oportunidades, trabajos de calidad y pagos
              seguros.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/register"
                search={{ role: "freelancer" }}
                className="inline-flex items-center gap-3 rounded-xl bg-gradient-primary px-6 py-4 text-sm font-extrabold text-white shadow-[0_22px_50px_-24px_#ff442f] transition hover:-translate-y-0.5"
              >
                Empieza como Freelancer
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/register"
                search={{ role: "mype" }}
                className="inline-flex items-center gap-3 rounded-xl border border-accent/70 bg-accent/5 px-6 py-4 text-sm font-extrabold text-accent transition hover:-translate-y-0.5 hover:bg-accent/10"
              >
                Buscar talento
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <HeroPill icon={Gift} text="Recomendaciones personalizadas" />
              <HeroPill icon={ShieldCheck} text="Pagos protegidos" />
              <HeroPill icon={Clock3} text="IA incluida" />
            </div>
          </div>

          <HeroVisual />
        </div>

        <div className="mt-10 grid overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] shadow-ring backdrop-blur md:grid-cols-4">
          <StatItem icon={UserRound} value="12K+" label="Freelancers activos" />
          <StatItem icon={Gift} value="3K+" label="Proyectos publicados" />
          <StatItem icon={BriefcaseBusiness} value="+3,240" label="Oportunidades activas" />
          <StatItem icon={MapPin} value="98%" label="Satisfacción" last />
        </div>
      </div>
    </section>
  );
}

function HeroPill({ icon: Icon, text }: { icon: typeof Wallet; text: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/25 px-4 py-2 text-sm font-bold text-white shadow-ring">
      <Icon className="h-4 w-4 text-accent" />
      {text}
    </div>
  );
}

function StatItem({
  icon: Icon,
  value,
  label,
  last = false,
}: {
  icon: typeof UserRound;
  value: string;
  label: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-4 px-6 py-5 ${last ? "" : "border-b border-white/10 md:border-b-0 md:border-r"}`}
    >
      <Icon className="h-7 w-7 text-primary" />
      <div>
        <div className="font-display text-xl font-extrabold leading-none text-white">{value}</div>
        <div className="mt-1 text-xs font-semibold text-white/70">{label}</div>
      </div>
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="relative min-h-[470px] lg:min-h-[560px]">
      <div className="absolute left-12 top-2 h-[310px] w-[310px] rounded-full border border-accent/50 p-3 shadow-glow sm:left-24 sm:h-[360px] sm:w-[360px]">
        <div className="h-full w-full rounded-full bg-gradient-to-br from-accent/30 via-white/10 to-primary/15" />
      </div>
      <div className="absolute left-24 top-12 h-[245px] w-[245px] rounded-full bg-[#dffefb]/90 shadow-elegant sm:left-36 sm:h-[285px] sm:w-[285px]" />
      <div className="absolute left-32 top-20 h-[190px] w-[190px] rounded-full bg-gradient-to-br from-[#07333a] to-[#00c9ba] opacity-80 sm:left-44 sm:h-[225px] sm:w-[225px]" />
      <div className="absolute left-40 top-28 h-[115px] w-[115px] rounded-full bg-[#020608]/20 blur-2xl sm:left-56" />

      <div className="absolute right-0 top-10 w-[260px] rounded-2xl border border-white/14 bg-[#081217]/90 p-5 shadow-elegant backdrop-blur">
        <div className="text-sm font-semibold text-white/70">Oportunidades activas</div>
        <div className="mt-3 font-display text-3xl font-extrabold text-accent">+3,240</div>
        <div className="mt-3 flex items-center gap-2 text-xs font-bold text-accent">
          <TrendingUp className="h-4 w-4" />
          +22% vs. mes pasado
        </div>
        <div className="absolute right-4 top-4 h-12 w-12 dot-field opacity-70" />
      </div>

      <div className="absolute bottom-28 left-8 h-40 w-40 overflow-hidden rounded-full border-4 border-[#061013] bg-gradient-to-br from-[#ffe0d7] to-[#00c9ba] shadow-elegant sm:h-48 sm:w-48">
        <div className="absolute bottom-0 left-1/2 h-28 w-24 -translate-x-1/2 rounded-t-full bg-[#06262d]/70" />
      </div>
      <div className="absolute bottom-24 left-48 grid h-20 w-20 place-items-center rounded-full bg-accent text-[#061013] shadow-glow sm:left-64">
        <CircleDollarSign className="h-12 w-12" />
      </div>

      <div className="absolute bottom-10 right-3 w-[285px] rounded-2xl bg-[#eafff9] p-6 text-[#061013] shadow-elegant sm:right-0">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent text-[#061013]">
            <Bot className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-extrabold">Asistente IA</span>
        </div>
        <p className="mt-4 text-sm font-semibold leading-relaxed text-[#38484d]">
          Te sugiero ajustar tus precios y mejorar tu visibilidad.
        </p>
        <button className="absolute bottom-5 right-5 grid h-10 w-10 place-items-center rounded-full border border-accent/40 bg-white text-accent">
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function CategoriesSection() {
  return (
    <section
      id="categorias"
      className="relative overflow-hidden bg-[#fff7ee] py-16 text-[#071014] cream-pattern"
    >
      <div className="absolute -left-16 bottom-6 h-48 w-48 rounded-full border border-accent/50" />
      <div className="absolute right-10 top-20 h-36 w-24 dot-field opacity-50" />
      <svg
        className="absolute left-[13%] top-[62%] hidden h-32 w-52 text-accent lg:block"
        viewBox="0 0 220 130"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M5 103C78 129 159 88 202 17"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M178 17H204V43"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="mx-auto grid max-w-7xl gap-9 px-6 lg:grid-cols-[0.58fr_1.42fr]">
        <div className="relative flex flex-col justify-center">
          <SectionEyebrow tone="teal" text="CATEGORÍAS" />
          <h2 className="mt-4 font-display text-4xl font-extrabold leading-[1.02] sm:text-5xl">
            Servicios digitales
            <br />
            <span className="text-primary">más demandados</span>
          </h2>
          <p className="mt-5 max-w-sm text-sm font-medium leading-relaxed text-muted-foreground">
            Explora oportunidades reales en las habilidades que las MYPES están buscando hoy.
          </p>
          <a
            href="/register?role=mype"
            className="mt-8 inline-flex w-fit items-center gap-3 rounded-full bg-[#071014] px-7 py-3.5 text-sm font-extrabold text-white shadow-elegant"
          >
            Ver todas las categorías
            <ArrowRight className="h-4 w-4 text-accent" />
          </a>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <a
              key={category.title}
              href="/register?role=mype"
              className={`group relative min-h-[168px] overflow-hidden rounded-[1.35rem] bg-gradient-to-br ${category.tone} p-6 shadow-elegant ring-1 ring-black/5 transition hover:-translate-y-1`}
            >
              <Sparkles
                className={`absolute right-8 top-6 h-4 w-4 ${category.light ? "text-accent/45" : "text-white/35"}`}
              />
              <div className="relative z-10 flex items-start gap-5 pr-14">
                <span
                  className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl ${category.iconTone} text-white shadow-soft`}
                >
                  <category.icon className="h-9 w-9" />
                </span>
                <div className={category.light ? "text-[#071014]" : "text-white"}>
                  <h3 className="font-display text-2xl font-extrabold leading-[1.04]">
                    {category.title}
                  </h3>
                </div>
              </div>
              <div
                className={`absolute bottom-6 left-6 ${category.light ? "text-[#071014]" : "text-white"}`}
              >
                <p className="text-2xl font-extrabold leading-none">{category.count}</p>
                <p className="text-sm font-semibold opacity-75">freelancers activos</p>
              </div>
              <span className="absolute right-6 top-[54%] grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/70 bg-white/88 text-accent shadow-soft transition group-hover:-translate-y-[55%] group-hover:translate-x-1">
                <ArrowRight className="h-5 w-5" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section
      id="como-funciona"
      className="relative overflow-hidden bg-gradient-primary py-16 text-white"
    >
      <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_90%_30%,white_1px,transparent_1.5px)] [background-size:18px_18px]" />
      <div className="absolute right-0 top-0 h-full w-1/2 rounded-l-full border-l border-white/20 opacity-30" />
      <div className="relative mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[0.7fr_1.3fr]">
        <div>
          <SectionEyebrow text="CÓMO FUNCIONA" />
          <h2 className="mt-3 font-display text-4xl font-extrabold leading-tight sm:text-5xl">
            Empieza a vender
            <br />
            en <span className="text-[#061013]">3 simples pasos</span>
          </h2>
          <p className="mt-5 max-w-sm text-sm font-semibold leading-relaxed text-white/85">
            Sin enredos. Sin comisiones ocultas. Solo tú, tu talento y oportunidades reales.
          </p>
        </div>
        <div className="relative grid gap-5 md:grid-cols-3">
          <StepConnector className="left-[30.5%]" />
          <StepConnector className="left-[64.5%]" />
          <StepCard
            number="01"
            icon={UserRound}
            title="Crea tu perfil"
            text="Completa tu información, muestra tus habilidades y destaca tu talento."
          />
          <StepCard
            dark
            number="02"
            icon={Rocket}
            title="Publica tu servicio"
            text="Define qué ofreces, tu precio y tiempo de entrega. La IA te ayuda a optimizarlo."
          />
          <StepCard
            number="03"
            icon={ShieldCheck}
            title="Cobra protegido"
            text="El cliente paga con escrow y recibes tu dinero de forma segura y sin sustos."
          />
        </div>
      </div>
    </section>
  );
}

function StepConnector({ className }: { className: string }) {
  return (
    <div
      className={`pointer-events-none absolute top-1/2 z-20 hidden w-[8.5%] -translate-y-1/2 md:block ${className}`}
      aria-hidden="true"
    >
      <div className="border-t-2 border-dashed border-[#071014]/75" />
      <span className="absolute left-1/2 top-1/2 grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-[#071014] shadow-soft ring-4 ring-primary">
        <ArrowRight className="h-4 w-4" />
      </span>
    </div>
  );
}

function StepCard({
  number,
  icon: Icon,
  title,
  text,
  dark = false,
}: {
  number: string;
  icon: typeof UserRound;
  title: string;
  text: string;
  dark?: boolean;
}) {
  return (
    <div
      className={`relative min-h-[250px] rounded-[1.8rem] p-7 shadow-elegant ring-1 ${dark ? "bg-[#071014] text-white ring-white/10" : "bg-[#fff7ee] text-[#071014] ring-white/70"}`}
    >
      <span
        className={`grid h-16 w-16 place-items-center rounded-full font-display text-2xl font-extrabold text-white shadow-soft ${dark ? "bg-gradient-primary" : "bg-gradient-teal"}`}
      >
        {number}
      </span>
      <Icon
        className={`absolute right-8 top-8 h-16 w-16 stroke-[1.6] ${dark ? "text-primary" : "text-[#071014]"}`}
      />
      <h3 className="mt-9 font-display text-2xl font-extrabold">{title}</h3>
      <p
        className={`mt-3 text-base font-semibold leading-relaxed ${dark ? "text-white/72" : "text-[#4d5b60]"}`}
      >
        {text}
      </p>
    </div>
  );
}

function FreelancersSection() {
  return (
    <section id="freelancers" className="relative overflow-hidden bg-[#eafbf6] py-16 text-[#071014]">
      <div className="absolute right-12 top-16 h-36 w-24 dot-field opacity-55" />
      <div className="absolute -left-20 bottom-16 h-56 w-56 rounded-full border border-accent/50" />
      <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[0.52fr_1.48fr]">
        <div className="flex flex-col justify-center">
          <SectionEyebrow tone="teal" text="CONOCE A ALGUNOS FREELANCERS" />
          <h2 className="mt-3 font-display text-4xl font-extrabold leading-tight sm:text-5xl">
            Talento <span className="text-accent">verificado,</span>
            <br />
            listo para impulsar
            <br />
            tu proyecto
          </h2>
          <a
            href="/register?role=mype"
            className="mt-8 inline-flex w-fit items-center gap-3 rounded-full bg-[#071014] px-6 py-3 text-sm font-extrabold text-white shadow-elegant"
          >
            Ver todos los freelancers
            <ArrowRight className="h-4 w-4 text-primary" />
          </a>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {freelancers.map((freelancer) => (
            <FreelancerCard key={freelancer.name} {...freelancer} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FreelancerCard({
  name,
  role,
  rating,
  city,
  tags,
  price,
  tone,
}: (typeof freelancers)[number]) {
  return (
    <article className="group overflow-hidden rounded-[1.7rem] bg-white shadow-elegant ring-1 ring-black/5 transition hover:-translate-y-1">
      <div className={`relative h-[220px] overflow-hidden bg-gradient-to-br ${tone}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_18%,rgba(255,255,255,0.34),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0)_45%,rgba(255,255,255,0.18)_100%)]" />
        <div className="absolute bottom-0 left-1/2 h-44 w-36 -translate-x-1/2 rounded-t-full bg-[#071014]/22" />
        <div className="absolute bottom-0 left-1/2 h-36 w-28 -translate-x-1/2 rounded-t-full bg-white/22 blur-sm" />
        <div className="absolute left-10 top-10 h-20 w-20 rounded-full bg-white/18" />
        <span className="absolute right-5 top-4 z-20 inline-flex items-center gap-1 rounded-full bg-white/92 px-3 py-1 text-xs font-extrabold text-[#071014] shadow-soft">
          <BadgeCheck className="h-3.5 w-3.5 text-accent" />
          Verificado
        </span>
      </div>

      <div className="relative bg-white px-6 pb-6 pt-7">
        <div className="absolute -top-5 left-5 right-5 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-black/10 bg-white/95 px-3 py-1 text-xs font-bold shadow-soft backdrop-blur"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-6 flex items-start justify-between gap-4">
          <div>
            <h3 className="flex items-center gap-2 font-display text-2xl font-extrabold leading-tight text-[#071014]">
              {name}
              <BadgeCheck className="h-5 w-5 shrink-0 text-accent" />
            </h3>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">{role}</p>
          </div>
          <div className="rounded-full bg-[#eafff9] px-3 py-1 text-xs font-extrabold text-[#008c84]">
            Top
          </div>
        </div>

        <div className="mt-4 grid gap-2 text-sm font-bold text-[#071014]">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 fill-warning text-warning" />
            {rating}
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            {city}
          </div>
        </div>

        <div className="mt-5 flex items-end justify-between border-t border-border pt-5">
          <div>
            <div className="text-xs font-bold text-muted-foreground">Desde</div>
            <div className="font-display text-3xl font-extrabold leading-none">S/ {price}</div>
          </div>
          <a
            href="/register?role=mype"
            className="grid h-14 w-14 place-items-center rounded-full bg-[#071014] text-white shadow-soft transition hover:-translate-y-0.5"
          >
            <ArrowRight className="h-6 w-6" />
          </a>
        </div>
      </div>
    </article>
  );
}

function AudienceSection() {
  return (
    <section id="mypes" className="grid border-y-4 border-[#071014] lg:grid-cols-2">
      <div className="relative min-h-[430px] overflow-hidden bg-gradient-to-br from-[#008c84] via-[#01756f] to-[#05272c] px-6 py-16 text-white lg:px-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]">
        <div className="absolute right-12 top-10 h-44 w-44 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute bottom-10 right-16 h-28 w-28 rounded-full border border-accent/40" />
        <TrendingUp className="absolute right-20 top-14 h-40 w-40 rotate-12 text-accent/45" />
        <SectionEyebrow text="PARA FREELANCERS" />
        <h2 className="relative mt-3 font-display text-4xl font-extrabold leading-tight sm:text-5xl">
          Vende tus habilidades
          <br />y genera ingresos reales
        </h2>
        <ul className="relative mt-7 space-y-3 text-sm font-bold text-white/88">
          {[
            "Publica servicios ilimitados",
            "Pagos protegidos con escrow",
            "IA que te ayuda a vender más",
            "Comunidad y soporte 24/7",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-accent" />
              {item}
            </li>
          ))}
        </ul>
        <Link
          to="/register"
          search={{ role: "freelancer" }}
          className="relative mt-8 inline-flex items-center gap-3 rounded-xl bg-[#eafff9] px-6 py-3 text-sm font-extrabold text-[#061013] shadow-elegant"
        >
          Crear mi perfil
          <ArrowRight className="h-4 w-4" />
        </Link>
        <div className="relative mt-9 w-fit rounded-2xl border border-white/10 bg-[#061013]/78 p-5 shadow-elegant backdrop-blur">
          <div className="text-xs font-bold text-white/60">Ganancias este mes</div>
          <div className="mt-1 font-display text-2xl font-extrabold text-accent">S/ 4,560</div>
          <div className="mt-2 text-xs font-bold text-accent">+31% vs. mes pasado</div>
          <div className="absolute right-4 top-4 h-10 w-10 dot-field opacity-70" />
        </div>
      </div>

      <div className="relative min-h-[430px] overflow-hidden bg-gradient-primary px-6 py-16 text-white lg:px-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]">
        <div className="absolute bottom-8 right-8 h-72 w-72 rounded-full border border-white/25 opacity-40" />
        <div className="absolute right-12 top-12 h-28 w-20 dot-field opacity-60" />
        <SectionEyebrow text="PARA MYPES" />
        <h2 className="relative mt-3 max-w-xl font-display text-4xl font-extrabold leading-tight sm:text-5xl">
          Encuentra talento digital confiable para tu negocio
        </h2>
        <ul className="relative mt-7 space-y-3 text-sm font-bold text-white/90">
          {[
            "Talento verificado y calificado",
            "Compara perfiles y precios",
            "Pagos seguros y protegidos",
            "Contratos y entregas claras",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-white" />
              {item}
            </li>
          ))}
        </ul>
        <Link
          to="/register"
          search={{ role: "mype" }}
          className="relative mt-8 inline-flex items-center gap-3 rounded-xl bg-[#071014] px-6 py-3 text-sm font-extrabold text-white shadow-elegant"
        >
          Buscar talento
          <ArrowRight className="h-4 w-4 text-accent" />
        </Link>
        <div className="absolute bottom-10 right-12 hidden h-44 w-52 rotate-[-8deg] rounded-3xl bg-white/88 p-5 shadow-elegant lg:block">
          <Search className="absolute -left-10 top-12 h-20 w-20 text-[#071014]" />
          <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-accent to-white" />
          <div className="mt-4 h-3 rounded-full bg-[#071014]/20" />
          <div className="mt-2 h-3 w-2/3 rounded-full bg-[#071014]/15" />
          <div className="mt-4 flex gap-1 text-warning">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CommunitySection() {
  return (
    <section id="comunidad" className="relative overflow-hidden bg-[#020608] py-16 text-white">
      <div className="absolute inset-0 grid-pattern opacity-35" />
      <div className="absolute right-8 top-16 h-24 w-24 dot-field opacity-50" />
      <div className="relative mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[0.7fr_1.3fr]">
        <div>
          <SectionEyebrow text="COMUNIDAD" color="primary" />
          <h2 className="mt-3 font-display text-4xl font-extrabold leading-tight sm:text-5xl">
            Lo que dicen quienes ya construyen <span className="text-primary">su futuro</span>
          </h2>
          <div className="mt-8 grid grid-cols-3 gap-3">
            <MiniStat icon={BriefcaseBusiness} value="12K+" label="Freelancers activos" />
            <MiniStat icon={CircleDollarSign} value="S/ 2M+" label="Ingresos generados" />
            <MiniStat icon={ShieldCheck} value="98%" label="Tasa de satisfacción" />
          </div>
        </div>

        <div className="relative">
          <button className="absolute -left-5 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/8 text-white ring-1 ring-white/10 lg:grid">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <article
                key={testimonial.name}
                className="min-h-[310px] rounded-2xl border border-white/10 bg-white/[0.055] p-7 shadow-ring backdrop-blur"
              >
                <div
                  className={`flex items-center gap-2 ${index === 1 ? "text-accent" : "text-primary"}`}
                >
                  <Quote className="h-8 w-8" />
                  <div className="flex text-warning">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="mt-5 text-sm font-semibold leading-relaxed text-white/82">
                  {testimonial.text}
                </p>
                <div className="mt-7 flex items-center gap-3">
                  <div
                    className={`h-12 w-12 rounded-full ring-4 ${index === 1 ? "bg-gradient-teal ring-accent/30" : "bg-gradient-primary ring-primary/25"}`}
                  />
                  <div>
                    <div className="font-display text-sm font-extrabold">{testimonial.name}</div>
                    <div className="text-xs font-semibold text-white/65">{testimonial.role}</div>
                    <div className="text-xs text-white/45">{testimonial.city}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <button className="absolute -right-5 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/8 text-white ring-1 ring-white/10 lg:grid">
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="mt-6 flex justify-center gap-2">
            <span className="h-2 w-8 rounded-full bg-accent" />
            <span className="h-2 w-2 rounded-full bg-white/25" />
            <span className="h-2 w-2 rounded-full bg-white/25" />
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniStat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof BriefcaseBusiness;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 text-center shadow-ring">
      <Icon className="mx-auto h-7 w-7 text-primary" />
      <div className="mt-3 font-display text-2xl font-extrabold">{value}</div>
      <div className="mt-1 text-xs font-semibold text-white/65">{label}</div>
    </div>
  );
}

function FinalCtaSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-[#008c84] via-[#061013] to-[#ff442f] py-10 text-white">
      <div className="absolute inset-0 grid-pattern opacity-25" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-6 lg:grid-cols-[0.8fr_1fr_0.8fr]">
        <div className="hidden h-40 rounded-full bg-gradient-to-br from-accent/60 to-white/15 lg:block" />
        <div>
          <h2 className="font-display text-4xl font-extrabold leading-tight sm:text-5xl">
            ¿Listo para vivir de tus habilidades?
          </h2>
          <p className="mt-3 max-w-xl text-sm font-semibold text-white/78">
            Únete a miles de jóvenes que ya están generando ingresos reales con su talento.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Link
            to="/register"
            search={{ role: "freelancer" }}
            className="inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-primary px-7 py-4 text-sm font-extrabold text-white shadow-elegant"
          >
            Soy Freelancer
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            to="/register"
            search={{ role: "mype" }}
            className="inline-flex items-center justify-center gap-3 rounded-xl border border-white/15 bg-[#071014] px-7 py-4 text-sm font-extrabold text-white shadow-elegant"
          >
            Buscar Talento
            <ArrowRight className="h-5 w-5 text-accent" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function SectionEyebrow({
  text,
  tone = "white",
  color,
}: {
  text: string;
  tone?: "white" | "teal";
  color?: "primary";
}) {
  const dotColor = color === "primary" ? "bg-primary" : tone === "teal" ? "bg-accent" : "bg-white";
  const textColor = tone === "teal" ? "text-accent" : "text-white";
  return (
    <div
      className={`inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] ${textColor}`}
    >
      <span className={`h-2 w-2 rounded-full ${dotColor}`} />
      {text}
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
    </div>
  );
}
