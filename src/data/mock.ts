export const categories = [
  { slug: "diseno", name: "Diseño gráfico", icon: "🎨", count: 142, color: "from-fuchsia-500 to-violet-600" },
  { slug: "video", name: "Edición de video", icon: "🎬", count: 98, color: "from-orange-500 to-pink-600" },
  { slug: "marketing", name: "Marketing & CM", icon: "📣", count: 76, color: "from-emerald-500 to-cyan-600" },
  { slug: "dev", name: "Desarrollo web", icon: "💻", count: 121, color: "from-indigo-500 to-blue-600" },
  { slug: "ux", name: "Diseño UX/UI", icon: "✨", count: 64, color: "from-violet-500 to-indigo-600" },
  { slug: "ia", name: "IA & Automatización", icon: "🤖", count: 53, color: "from-cyan-500 to-violet-600" },
];

export const freelancers = [
  { id: "1", name: "Camila Rojas", role: "Diseñadora gráfica", avatar: "CR", skills: ["Branding","Logos","Social Media"], rating: 4.9, reviews: 38, price: 90, match: 94, location: "Lima, PE", level: "Top Rated" },
  { id: "2", name: "Diego Salazar", role: "Editor de video TikTok", avatar: "DS", skills: ["Premiere","CapCut","Reels"], rating: 4.8, reviews: 51, price: 110, match: 88, location: "Arequipa, PE", level: "Pro" },
  { id: "3", name: "Lucía Ferrer", role: "Community Manager", avatar: "LF", skills: ["Instagram","Estrategia","Copywriting"], rating: 5.0, reviews: 22, price: 75, match: 91, location: "Trujillo, PE", level: "Rising" },
  { id: "4", name: "Mateo Quispe", role: "Desarrollador web", avatar: "MQ", skills: ["React","Landing","Shopify"], rating: 4.7, reviews: 44, price: 180, match: 86, location: "Cusco, PE", level: "Pro" },
  { id: "5", name: "Sofía Molina", role: "Diseñadora UX/UI", avatar: "SM", skills: ["Figma","Prototipos","Research"], rating: 4.9, reviews: 29, price: 140, match: 82, location: "Lima, PE", level: "Top Rated" },
  { id: "6", name: "Joaquín Pérez", role: "Automatizaciones IA", avatar: "JP", skills: ["n8n","ChatGPT","Make"], rating: 4.8, reviews: 17, price: 160, match: 78, location: "Piura, PE", level: "Rising" },
];

export const services = [
  { id: "s1", title: "Diseño de logo profesional + manual de marca", category: "Diseño gráfico", price: 120, days: 3, freelancer: "Camila Rojas", avatar: "CR", rating: 4.9, reviews: 38, tag: "Más vendido" },
  { id: "s2", title: "Edición de 10 videos para TikTok / Reels", category: "Edición de video", price: 200, days: 5, freelancer: "Diego Salazar", avatar: "DS", rating: 4.8, reviews: 51, tag: "Trending" },
  { id: "s3", title: "Plan de contenido mensual para Instagram", category: "Marketing & CM", price: 350, days: 7, freelancer: "Lucía Ferrer", avatar: "LF", rating: 5.0, reviews: 22, tag: "Top" },
  { id: "s4", title: "Landing page en React lista para vender", category: "Desarrollo web", price: 480, days: 6, freelancer: "Mateo Quispe", avatar: "MQ", rating: 4.7, reviews: 44, tag: "Nuevo" },
  { id: "s5", title: "Rediseño UX/UI de tu app o sitio", category: "Diseño UX/UI", price: 520, days: 10, freelancer: "Sofía Molina", avatar: "SM", rating: 4.9, reviews: 29, tag: "Premium" },
  { id: "s6", title: "Automatización de WhatsApp con IA", category: "IA & Automatización", price: 600, days: 8, freelancer: "Joaquín Pérez", avatar: "JP", rating: 4.8, reviews: 17, tag: "IA" },
];

export const conversations = [
  { id: "c1", name: "Camila Rojas", last: "Te paso la propuesta hoy 🚀", time: "10:24", unread: 2, avatar: "CR", online: true },
  { id: "c2", name: "Mateo Quispe", last: "Listo, ya subí el primer avance", time: "Ayer", unread: 0, avatar: "MQ", online: false },
  { id: "c3", name: "Lucía Ferrer", last: "Hola! Vi tu publicación 👋", time: "Lun", unread: 1, avatar: "LF", online: true },
  { id: "c4", name: "Diego Salazar", last: "¿Lo necesitas en 9:16 o 1:1?", time: "Dom", unread: 0, avatar: "DS", online: false },
];

export const messages = [
  { from: "them", text: "Hola! Vi que necesitas branding para tu cafetería ☕", time: "10:02" },
  { from: "me", text: "Sí! Buscamos algo moderno y juvenil.", time: "10:05" },
  { from: "them", text: "Te paso 3 propuestas iniciales hoy. Precio: S/ 120", time: "10:10" },
  { from: "me", text: "Perfecto, vamos!", time: "10:12" },
  { from: "them", text: "Te paso la propuesta hoy 🚀", time: "10:24" },
];

export const transactions = [
  { id: "t1", title: "Branding cafetería", client: "Lúmen Café", amount: 480, status: "Liberado", date: "12 May" },
  { id: "t2", title: "Edición Reels", client: "Boutique Aria", amount: 220, status: "En escrow", date: "15 May" },
  { id: "t3", title: "Landing menú", client: "Sushi Roll", amount: 650, status: "Pendiente", date: "18 May" },
  { id: "t4", title: "Plan mensual IG", client: "Yoga Studio", amount: 350, status: "Liberado", date: "20 May" },
];

export const portfolio = [
  { id: "p1", title: "Rebrand Café Lúmen", category: "Branding", emoji: "☕", color: "from-amber-500 to-rose-500" },
  { id: "p2", title: "Reels Boutique Aria", category: "Video", emoji: "🎥", color: "from-fuchsia-500 to-violet-600" },
  { id: "p3", title: "Landing Sushi Roll", category: "Web", emoji: "🍣", color: "from-emerald-500 to-cyan-600" },
  { id: "p4", title: "Identidad Yoga Flow", category: "Branding", emoji: "🧘", color: "from-violet-500 to-indigo-600" },
  { id: "p5", title: "App Delivery UX", category: "UX/UI", emoji: "📱", color: "from-indigo-500 to-blue-600" },
  { id: "p6", title: "Bot WhatsApp IA", category: "IA", emoji: "🤖", color: "from-cyan-500 to-violet-600" },
];

export const projects = [
  { id: "pr1", title: "Branding cafetería", freelancer: "Camila Rojas", progress: 60, status: "En progreso" },
  { id: "pr2", title: "Edición de 10 reels", freelancer: "Diego Salazar", progress: 30, status: "Esperando entrega" },
  { id: "pr3", title: "Landing menú online", freelancer: "Mateo Quispe", progress: 90, status: "Revisión" },
];

export const stats = {
  freelancers: 1240,
  mypes: 380,
  projectsClosed: 2150,
  avgRating: 4.9,
};
