export const categories = [
  { slug: "diseno", name: "Diseño gráfico", icon: "🎨", count: 142 },
  { slug: "video", name: "Edición de video", icon: "🎬", count: 98 },
  { slug: "marketing", name: "Marketing & CM", icon: "📣", count: 76 },
  { slug: "dev", name: "Desarrollo web", icon: "💻", count: 121 },
  { slug: "ux", name: "Diseño UX/UI", icon: "✨", count: 64 },
  { slug: "ia", name: "IA & Automatización", icon: "🤖", count: 53 },
];

export const freelancers = [
  { id: "1", name: "Camila Rojas", role: "Diseñadora gráfica", avatar: "CR", skills: ["Branding","Logos","Social Media"], rating: 4.9, reviews: 38, price: 90, match: 94, location: "Lima, PE" },
  { id: "2", name: "Diego Salazar", role: "Editor de video TikTok", avatar: "DS", skills: ["Premiere","CapCut","Reels"], rating: 4.8, reviews: 51, price: 110, match: 88, location: "Arequipa, PE" },
  { id: "3", name: "Lucía Ferrer", role: "Community Manager", avatar: "LF", skills: ["Instagram","Estrategia","Copywriting"], rating: 5.0, reviews: 22, price: 75, match: 91, location: "Trujillo, PE" },
  { id: "4", name: "Mateo Quispe", role: "Desarrollador web", avatar: "MQ", skills: ["React","Landing","Shopify"], rating: 4.7, reviews: 44, price: 180, match: 86, location: "Cusco, PE" },
  { id: "5", name: "Sofía Molina", role: "Diseñadora UX/UI", avatar: "SM", skills: ["Figma","Prototipos","Research"], rating: 4.9, reviews: 29, price: 140, match: 82, location: "Lima, PE" },
  { id: "6", name: "Joaquín Pérez", role: "Automatizaciones IA", avatar: "JP", skills: ["n8n","ChatGPT","Make"], rating: 4.8, reviews: 17, price: 160, match: 78, location: "Piura, PE" },
];

export const services = [
  { id: "s1", title: "Diseño de logo profesional + manual de marca", category: "Diseño gráfico", price: 120, days: 3, freelancer: "Camila Rojas", rating: 4.9 },
  { id: "s2", title: "Edición de 10 videos para TikTok / Reels", category: "Edición de video", price: 200, days: 5, freelancer: "Diego Salazar", rating: 4.8 },
  { id: "s3", title: "Plan de contenido mensual para Instagram", category: "Marketing & CM", price: 350, days: 7, freelancer: "Lucía Ferrer", rating: 5.0 },
  { id: "s4", title: "Landing page en React lista para vender", category: "Desarrollo web", price: 480, days: 6, freelancer: "Mateo Quispe", rating: 4.7 },
  { id: "s5", title: "Rediseño UX/UI de tu app o sitio", category: "Diseño UX/UI", price: 520, days: 10, freelancer: "Sofía Molina", rating: 4.9 },
  { id: "s6", title: "Automatización de WhatsApp con IA", category: "IA & Automatización", price: 600, days: 8, freelancer: "Joaquín Pérez", rating: 4.8 },
];

export const conversations = [
  { id: "c1", name: "Camila Rojas", last: "Te paso la propuesta hoy 🚀", time: "10:24", unread: 2, avatar: "CR" },
  { id: "c2", name: "Mateo Quispe", last: "Listo, ya subí el primer avance", time: "Ayer", unread: 0, avatar: "MQ" },
  { id: "c3", name: "Lucía Ferrer", last: "Hola! Vi tu publicación 👋", time: "Lun", unread: 1, avatar: "LF" },
  { id: "c4", name: "Diego Salazar", last: "¿Lo necesitas en 9:16 o 1:1?", time: "Dom", unread: 0, avatar: "DS" },
];

export const messages = [
  { from: "them", text: "Hola! Vi que necesitas branding para tu cafetería ☕" },
  { from: "me", text: "Sí! Buscamos algo moderno y juvenil." },
  { from: "them", text: "Te paso 3 propuestas iniciales hoy mismo. Precio: S/ 120" },
  { from: "me", text: "Perfecto, vamos!" },
  { from: "them", text: "Te paso la propuesta hoy 🚀" },
];
