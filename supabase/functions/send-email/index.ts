import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function normalizeResendApiKey(raw: string | undefined): string {
  if (!raw) return "";
  let s = raw.trim().replace(/^\uFEFF/, "");
  for (let i = 0; i < 2; i++) {
    s = s.replace(/^["']+|["']+$/g, "");
  }
  if (s.toLowerCase().startsWith("bearer ")) s = s.slice(7).trim();
  s = s.replace(/\s+/g, "");
  s = s.replace(/^resend_api_key=/i, "");
  return s;
}

const RESEND_API_KEY = normalizeResendApiKey(Deno.env.get("RESEND_API_KEY") ?? "");
const FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL")?.trim() || "Bali Future <onboarding@resend.dev>";
const ORG_EMAIL = Deno.env.get("INTAKE_EMAIL_TO")?.trim().replace(/\s+/g, "") || "donate@balifuture.com";

function isValidPayload(obj: unknown): obj is {
  organization: { subject: string; html: string };
  donor?: { to: string; subject: string; html: string } | null;
} {
  if (typeof obj !== "object" || obj === null) return false;
  const o = obj as Record<string, unknown>;
  if (!o.organization || typeof o.organization !== "object") return false;
  const org = o.organization as Record<string, unknown>;
  return typeof org.subject === "string" && typeof org.html === "string";
}

async function postResend(
  to: string,
  subject: string,
  html: string,
): Promise<{ ok: boolean; status: number; body: string }> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
    }),
  });
  const body = await res.text();
  return { ok: res.ok, status: res.status, body };
}

function jsonResponse(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    if (req.method !== "POST") {
      return jsonResponse({ error: "Method Not Allowed" }, 405);
    }

    if (!RESEND_API_KEY) {
      return jsonResponse({ skipped: true, reason: "RESEND_API_KEY not configured" }, 200);
    }

    let payload: unknown;
    try {
      payload = await req.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON" }, 400);
    }

    if (!isValidPayload(payload)) {
      return jsonResponse({ error: "Invalid payload structure" }, 400);
    }

    const results: Array<{ target: string; ok: boolean; status: number }> = [];

    const orgResult = await postResend(ORG_EMAIL, payload.organization.subject, payload.organization.html);
    results.push({ target: "organization", ok: orgResult.ok, status: orgResult.status });

    if (payload.donor && typeof payload.donor.to === "string" && payload.donor.to.includes("@")) {
      const donorResult = await postResend(payload.donor.to.trim(), payload.donor.subject, payload.donor.html);
      results.push({ target: "donor", ok: donorResult.ok, status: donorResult.status });
    }

    const allOk = results.every((r) => r.ok);
    return jsonResponse({ results }, allOk ? 200 : 502);
  } catch (err) {
    return jsonResponse({ error: String(err) }, 500);
  }
});
