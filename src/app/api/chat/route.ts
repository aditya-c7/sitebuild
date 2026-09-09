import { NextResponse } from "next/server";
import { sanitizeUserMessage } from "@/lib/sanitize";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { SYSTEM_PROMPT } from "@/lib/assistant-knowledge";

export const runtime = "nodejs";

type ChatRole = "user" | "assistant";
type HistoryItem = { role: ChatRole; content: string };

type ChatResponse = {
  reply: string;
  followups: [string, string];
  action: { label: string; url: string } | null;
};

function fallbackParse(raw: string): ChatResponse | null {
  try {
    let s = raw.trim();
    // Strip markdown fences if model added them
    if (s.startsWith("```")) {
      s = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    }
    const j = JSON.parse(s) as Record<string, unknown>;
    const reply = typeof j.reply === "string" ? j.reply.trim() : "";
    const followups = Array.isArray(j.followups) ? (j.followups as unknown[]) : [];
    const action = j.action as Record<string, unknown> | null | undefined;
    if (!reply || followups.length < 2) return null;
    const f1 = String(followups[0] ?? "").trim();
    const f2 = String(followups[1] ?? "").trim();
    if (!f1 || !f2) return null;
    let act: { label: string; url: string } | null = null;
    if (action && typeof action.label === "string" && typeof action.url === "string") {
      const label = action.label.trim();
      const url = action.url.trim();
      if (label && url) act = { label, url };
    }
    return { reply, followups: [f1, f2], action: act };
  } catch {
    return null;
  }
}

function localReply(message: string): ChatResponse {
  const m = message.toLowerCase();

  const isSalary = /salary|compensation|ctc|package|pay/.test(m);
  if (isSalary) {
    return {
      reply:
        "Salary details are not shared here, please reach out via LinkedIn or email for professional discussions. You can explore his work in the Projects section or check his availability for internships.",
      followups: ["How to contact Aditya?", "What is Precedent?"],
      action: { label: "Contact on LinkedIn", url: "https://linkedin.com/in/adityachitragar" },
    };
  }

  if (/precedent|legal|contract/.test(m)) {
    return {
      reply:
        "Precedent [AI Legal Contract Reviewer] is an LLM-powered tool that learns a law firm's past decisions and reviews new agreements clause by clause, telling lawyers whether to accept, counter, or escalate. It surfaces risks with evidence from previous documents and is on GitHub at testlitmus.",
      followups: ["What is Farmer's Swag?", "What is Aditya's tech stack?"],
      action: { label: "View Precedent Repo", url: "https://github.com/aditya-c7/testlitmus" },
    };
  }

  if (/farmer|agricultur|crop|livestock/.test(m)) {
    return {
      reply:
        "Farmer's Swag is an AI-powered agricultural decision-support web app with crop disease detection, live market price tracking, and livestock care assistance. It is built with React, FastAPI, Gemini API, and Tailwind.",
      followups: ["What is Precedent?", "What technologies does Aditya use?"],
      action: { label: "View Projects", url: "/#projects" },
    };
  }

  if (/project/.test(m)) {
    return {
      reply:
        "Aditya has two featured projects, Farmer's Swag for agriculture and Precedent for legal contract review. Farmer's Swag helps with crop disease and market prices, Precedent reviews contracts clause by clause with evidence.",
      followups: ["Tell me about Precedent", "Tell me about Farmer's Swag"],
      action: { label: "View Projects", url: "/#projects" },
    };
  }

  if (/tech|stack|skill|language|framework/.test(m)) {
    return {
      reply:
        "His stack includes Python, JavaScript, HTML, C, SQL, NumPy, Linux, CI/CD, FastAPI, Node.js, MongoDB, Firebase, React, Next.js, Tailwind CSS, RAG architectures, Git, GitHub Actions, Postman, and Vercel. He builds AI-driven web apps and scalable backends.",
      followups: ["What is his experience?", "What projects has he built?"],
      action: null,
    };
  }

  if (/experience|marvedge|sdet|intern/.test(m)) {
    return {
      reply:
        "Aditya is an SDET Intern at Marvedge since Sep 2026, remote, where he writes automated test scripts and validates API reliability. He focuses on testing and improving security across backend services.",
      followups: ["What is his tech stack?", "How to contact him?"],
      action: { label: "View Experience", url: "/#experience" },
    };
  }

  if (/education|college|vtu|jain|university|study|graduat/.test(m)) {
    return {
      reply:
        "He is a 2nd year B.Tech student in Computer Science and Engineering at Jain College of Engineering and Technology, VTU, expected to graduate in 2029. He is based in Hubli-Dharwad, Karnataka, India.",
      followups: ["Where is he based?", "What is his career goal?"],
      action: null,
    };
  }

  if (/where|location|hubli|dharwad|karnataka|based/.test(m)) {
    return {
      reply:
        "Aditya is based in Hubli-Dharwad, Karnataka, India, in the Asia/Kolkata timezone. He studies at VTU and interns remotely at Marvedge.",
      followups: ["What does he study?", "How to contact him?"],
      action: null,
    };
  }

  if (/contact|email|hire|availability|freelance|reach/.test(m)) {
    return {
      reply:
        "You can reach him via email at adityac@googlegroups.com, GitHub at aditya-c7, or LinkedIn at adityachitragar. He is open for selective engineering internships and freelance opportunities.",
      followups: ["What is his tech stack?", "What projects has he built?"],
      action: { label: "Contact on LinkedIn", url: "https://linkedin.com/in/adityachitragar" },
    };
  }

  if (/github/.test(m)) {
    return {
      reply:
        "His GitHub is https://github.com/aditya-c7 and Precedent is at https://github.com/aditya-c7/testlitmus. You can also find Farmer's Swag and other work there.",
      followups: ["What is Precedent?", "How to contact him?"],
      action: { label: "Open GitHub", url: "https://github.com/aditya-c7" },
    };
  }

  if (/linkedin/.test(m)) {
    return {
      reply:
        "His LinkedIn is https://linkedin.com/in/adityachitragar. It is the best place for professional inquiries and internship discussions.",
      followups: ["What is his experience?", "How to contact via email?"],
      action: { label: "Open LinkedIn", url: "https://linkedin.com/in/adityachitragar" },
    };
  }

  if (/career|goal|aim|future/.test(m)) {
    return {
      reply:
        "His career goal is AI and Full-Stack Software Engineering, building AI-driven web applications, scalable backend systems, and automated testing workflows. He blends AI, backend, and polished frontend work.",
      followups: ["What projects has he built?", "What is his tech stack?"],
      action: null,
    };
  }

  if (/^hi|^hello|^hey|^yo|^hii|help/.test(m)) {
    return {
      reply:
        "Hi! I am Aditya's portfolio assistant, I can answer from his facts about education, work, projects, and tech stack. Ask me about Farmer's Swag, Precedent, his VTU background, or how to contact him.",
      followups: ["What projects has he built?", "What is his experience?"],
      action: null,
    };
  }

  // Fallback — friendly redirect
  return {
    reply:
      "I can answer from Aditya's facts about his studies at VTU, his SDET internship at Marvedge, and his projects Farmer's Swag and Precedent. For anything outside that, please reach out via LinkedIn or email and he will get back to you.",
    followups: ["What is Precedent?", "How to contact Aditya?"],
    action: { label: "View Projects", url: "/#projects" },
  };
}

async function callGroq(message: string, history: HistoryItem[]): Promise<ChatResponse | null> {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;
  const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const messages: { role: string; content: string }[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.slice(-8).map((h) => ({ role: h.role, content: h.content.slice(0, 500) })),
      { role: "user", content: message },
    ];
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.4,
        max_tokens: 300,
        // @ts-ignore - Groq supports this
        reasoning_effort: "low",
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) return null;
    return fallbackParse(content);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req.headers);
    const rl = await checkRateLimit(ip);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again in a few minutes.", remaining: 0 },
        { status: 429 }
      );
    }

    const body = (await req.json().catch(() => null)) as {
      message?: string;
      history?: HistoryItem[];
      sessionId?: string;
    } | null;

    const rawMessage = typeof body?.message === "string" ? body.message : "";
    if (!rawMessage.trim()) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const history = Array.isArray(body?.history) ? (body.history as HistoryItem[]).slice(-10) : [];
    const message = sanitizeUserMessage(rawMessage);

    // Try Groq first if key exists, else local
    let result = await callGroq(message, history);
    if (!result) {
      result = localReply(message);
    }

    // Fire-and-forget DB logging if configured (optional, no crash if missing)
    // Keep simple without Prisma dependency — if you add Prisma later, log here.

    return NextResponse.json(result, {
      headers: { "X-RateLimit-Remaining": String(rl.remaining) },
    });
  } catch (err) {
    // Safe fallback
    const fallback: ChatResponse = {
      reply:
        "I had trouble processing that, please try again. You can also reach Aditya via LinkedIn or email for direct contact.",
      followups: ["What projects has he built?", "How to contact Aditya?"],
      action: { label: "Contact on LinkedIn", url: "https://linkedin.com/in/adityachitragar" },
    };
    return NextResponse.json(fallback, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, chat: "POST /api/chat with { message, history, sessionId }" });
}
