const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY ?? "";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export type FreelancerData = {
  skills: string[];
  tools: string[];
  description: string;
  linkedin: string;
  instagram: string;
  website: string;
  areas: string[];
  certificates: string[];
};

export type GeminiAnalysis = {
  headline: string;
  category: string;
  suggestedRate: string;
  bio: string;
  suggestedProjects: { title: string; description: string }[];
  tips: string[];
};

export async function analyzeFreelancerProfile(data: FreelancerData): Promise<GeminiAnalysis> {
  const prompt = `Eres un asesor experto en perfiles freelancer para la plataforma Skill-to-Money (mercado peruano).

Analiza este perfil de freelancer y devuelve SOLO un JSON válido sin markdown ni explicaciones adicionales:

{
  "headline": "Título profesional corto y atractivo (máx 60 caracteres)",
  "category": "Categoría principal (Diseño Gráfico, Edición de Video, Marketing, Desarrollo Web, UX/UI, IA, etc.)",
  "suggestedRate": "Tarifa sugerida por hora en soles peruanos (S/ XX)",
  "bio": "Descripción profesional breve y persuasiva (2-3 oraciones) destacando su valor único",
  "suggestedProjects": [
    {"title": "Nombre proyecto sugerido 1", "description": "Descripción breve del proyecto"},
    {"title": "Nombre proyecto sugerido 2", "description": "Descripción breve del proyecto"},
    {"title": "Nombre proyecto sugerido 3", "description": "Descripción breve del proyecto"}
  ],
  "tips": ["Consejo 1 para mejorar su perfil", "Consejo 2", "Consejo 3"]
}

Datos del freelancer:
- Habilidades: ${JSON.stringify(data.skills)}
- Herramientas: ${JSON.stringify(data.tools)}
- Descripción personal: "${data.description}"
- Área de desempeño: ${JSON.stringify(data.areas)}
- Certificados: ${JSON.stringify(data.certificates)}
- LinkedIn: ${data.linkedin}
- Instagram: ${data.instagram}
- Website: ${data.website}`;

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Gemini no devolvió un JSON válido.");
  }

  return JSON.parse(jsonMatch[0]) as GeminiAnalysis;
}
