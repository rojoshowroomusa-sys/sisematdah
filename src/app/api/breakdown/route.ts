import { NextResponse } from "next/server";

const systemPrompt = `Eres un asistente especializado en ejecutividad asistida para personas con TDAH y depresión.
Tu único objetivo es reducir la parálisis por análisis y la fricción cognitiva, convirtiendo una tarea abrumadora en una serie de micro-pasos ridículamente sencillos y ejecutables.

REGLAS ESTRICTAS DE FORMATO Y CONTENIDO:
1. NUNCA uses verbos vagos como "Organizar", "Planificar", "Gestionar", "Preparar" o "Revisar". Usa verbos de acción física directa: "Abrir", "Hacer clic en", "Escribir", "Buscar", "Copiar".
2. Adapta la respuesta según el "energy_level":
   - "cero_energia": Máximo 3 pasos. El paso 1 DEBE ser una acción física trivial de 30 segundos (ej: abrir una pestaña, agarrar un lápiz).
   - "media_energia": Entre 3 y 5 pasos. Cada uno ejecutable en menos de 10 minutos.
   - "hiperfoco": Entre 5 y 8 pasos estructurados, manteniendo la claridad de acción única.
3. Cada paso debe ser autosuficiente: la persona no debería tener que pensar qué hacer a continuación.
4. Responde EXCLUSIVAMENTE en formato JSON válido.

ESTRUCTURA DEL JSON DE SALIDA:
{
  "original_task": "String con la tarea original",
  "energy_level": "cero_energia | media_energia | hiperfoco",
  "micro_steps": [
    {
      "step_order": 1,
      "action": "Verbo + acción física concreta",
      "estimated_minutes": 2,
      "friction_level": "muy_baja | baja | media"
    }
  ],
  "encouragement": "Una frase corta (máximo 12 palabras) empática y sin positividad tóxica."
}`;

export async function POST(request: Request) {
  try {
    const { taskTitle, energyLevel } = await request.json();

    if (!taskTitle) {
      return NextResponse.json({ error: "Se requiere taskTitle" }, { status: 400 });
    }

    const level = energyLevel || "media_energia";

    const userPrompt = `Tarea a desglosar: "${taskTitle}"
Nivel de energía actual del usuario: "${level}"`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY || ""}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("OpenRouter error:", text);
      return NextResponse.json(fallbackBreakdown(taskTitle, level));
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(fallbackBreakdown(taskTitle, level));
    }

    const result = JSON.parse(content);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Breakdown error:", error);
    const body = await request.json().catch(() => ({ taskTitle: "Tarea" }));
    return NextResponse.json(fallbackBreakdown(body.taskTitle, "media_energia"));
  }
}

function fallbackBreakdown(taskTitle: string, energyLevel: string) {
  return {
    original_task: taskTitle,
    energy_level: energyLevel,
    micro_steps: [
      {
        step_order: 1,
        action: `Abrir el archivo o herramienta relacionado con "${taskTitle}"`,
        estimated_minutes: 1,
        friction_level: "muy_baja",
      },
      {
        step_order: 2,
        action: "Escribir el primer punto que viene a la mente",
        estimated_minutes: 5,
        friction_level: "baja",
      },
      {
        step_order: 3,
        action: energyLevel === "cero_energia"
          ? "Cerrar y descansar. Este paso ya es suficiente."
          : "Revisar lo escrito y marcar como listo el avance",
        estimated_minutes: 2,
        friction_level: "baja",
      },
    ],
    encouragement: "Comenzar es el único requisito de hoy.",
  };
}
