// vite.config.ts
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { defineConfig, loadEnv } from "file:///home/project/node_modules/vite/dist/node/index.js";
function readReqBody(req) {
  return new Promise((resolve, reject) => {
    let out = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      out += chunk;
    });
    req.on("end", () => resolve(out));
    req.on("error", reject);
  });
}
function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function normalizeResendApiKey(raw) {
  if (raw === void 0 || raw === null) return "";
  let s = String(raw).trim().replace(/^\uFEFF/, "");
  s = s.replace(/^["']|["']$/g, "");
  if (s.toLowerCase().startsWith("bearer ")) s = s.slice(7).trim();
  s = s.replace(/\s+/g, "");
  return s;
}
function isNewEmailPayload(obj) {
  if (typeof obj !== "object" || obj === null) return false;
  const o = obj;
  if (!o.organization || typeof o.organization !== "object") return false;
  const org = o.organization;
  return typeof org.subject === "string" && typeof org.html === "string";
}
async function postResend(apiKey, from, recipient, subject, html) {
  const resendRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: [recipient],
      subject,
      html
    })
  });
  const body = await resendRes.text();
  console.log("Resend API response status:", resendRes.status);
  console.log("Resend API response body:", body);
  return { ok: resendRes.ok, status: resendRes.status, body, to: recipient };
}
function legacyOrganizationEmail(form, data) {
  if (form === "newsletter") {
    const email = String(data.email ?? "");
    return {
      subject: `New newsletter subscriber \u2014 ${email}`,
      html: `<p style="font-family:system-ui,sans-serif;font-size:15px;">Email: ${escapeHtml(email)}</p>`
    };
  }
  const payloadStr = JSON.stringify({ form, data }, null, 2);
  return {
    subject: `[Bali Future] ${form} (legacy payload)`,
    html: `<pre style="font-family:system-ui,sans-serif;font-size:13px;">${escapeHtml(payloadStr)}</pre>`
  };
}
function sendEmailDevApi(env) {
  return {
    name: "send-email-dev-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = req.url?.split("?")[0] ?? "";
        if (pathname !== "/api/send-email") {
          next();
          return;
        }
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Method Not Allowed" }));
          return;
        }
        console.log("Email endpoint hit");
        const key = normalizeResendApiKey(env.RESEND_API_KEY);
        const hasKey = Boolean(key);
        console.log("RESEND_API_KEY loaded:", hasKey ? "true" : "false");
        let clientPayload;
        try {
          const raw = await readReqBody(req);
          clientPayload = raw ? JSON.parse(raw) : {};
        } catch (e) {
          console.error("[send-email middleware] Invalid JSON body", e);
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Invalid JSON" }));
          return;
        }
        if (!hasKey) {
          const body = JSON.stringify({
            skipped: true,
            reason: "RESEND_API_KEY not set (add to .env.local for local Resend calls)"
          });
          console.log("Resend API response status: (skipped \u2014 no API key)");
          console.log("Resend API response body:", body);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(body);
          return;
        }
        const from = env.RESEND_FROM_EMAIL?.trim() || "Bali Future <onboarding@resend.dev>";
        const orgToRaw = env.INTAKE_EMAIL_TO?.trim() || "";
        const orgTo = orgToRaw || "donate@balifuture.com";
        if (!orgToRaw) {
          console.warn("[send-email middleware] INTAKE_EMAIL_TO not set; using donate@balifuture.com");
        }
        const results = [];
        if (isNewEmailPayload(clientPayload)) {
          const org = clientPayload.organization;
          const r0 = await postResend(key, from, orgTo, org.subject, org.html);
          results.push({ target: "organization", status: r0.status, body: r0.body, ok: r0.ok });
          const donor = clientPayload.donor;
          if (donor && typeof donor.to === "string" && donor.to.includes("@")) {
            const dTo = donor.to.trim();
            const r1 = await postResend(key, from, dTo, donor.subject, donor.html);
            results.push({ target: "donor", status: r1.status, body: r1.body, ok: r1.ok });
          }
        } else {
          const pl = clientPayload;
          const form = typeof pl.form === "string" ? pl.form : "unknown";
          const data = pl.data && typeof pl.data === "object" && pl.data !== null ? pl.data : {};
          const { subject, html } = legacyOrganizationEmail(form, data);
          const r0 = await postResend(key, from, orgTo, subject, html);
          results.push({ target: "organization", status: r0.status, body: r0.body, ok: r0.ok });
        }
        const allOk = results.length > 0 && results.every((x) => x.ok);
        res.statusCode = allOk ? 200 : results.some((x) => x.ok) ? 207 : 502;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ results }));
      });
    }
  };
}
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) {
    console.warn(
      "[vite build] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing \u2014 production forms will not save until set and redeployed."
    );
  }
  return {
    envDir: process.cwd(),
    plugins: [react(), sendEmailDevApi(env)],
    server: {
      headers: { "Cache-Control": "no-store" }
    },
    optimizeDeps: {
      exclude: ["lucide-react"]
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules/framer-motion")) return "motion";
            if (id.includes("node_modules/@supabase")) return "supabase";
            if (id.includes("node_modules/three")) return "three";
          }
        }
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgdHlwZSB7IEluY29taW5nTWVzc2FnZSB9IGZyb20gJ25vZGU6aHR0cCc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgdHlwZSB7IFBsdWdpbiB9IGZyb20gJ3ZpdGUnO1xuXG5mdW5jdGlvbiByZWFkUmVxQm9keShyZXE6IEluY29taW5nTWVzc2FnZSk6IFByb21pc2U8c3RyaW5nPiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgbGV0IG91dCA9ICcnO1xuICAgIHJlcS5zZXRFbmNvZGluZygndXRmOCcpO1xuICAgIHJlcS5vbignZGF0YScsIChjaHVuazogc3RyaW5nKSA9PiB7XG4gICAgICBvdXQgKz0gY2h1bms7XG4gICAgfSk7XG4gICAgcmVxLm9uKCdlbmQnLCAoKSA9PiByZXNvbHZlKG91dCkpO1xuICAgIHJlcS5vbignZXJyb3InLCByZWplY3QpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZXNjYXBlSHRtbChzOiBzdHJpbmcpIHtcbiAgcmV0dXJuIHMucmVwbGFjZSgvJi9nLCAnJmFtcDsnKS5yZXBsYWNlKC88L2csICcmbHQ7JykucmVwbGFjZSgvPi9nLCAnJmd0OycpO1xufVxuXG5mdW5jdGlvbiBub3JtYWxpemVSZXNlbmRBcGlLZXkocmF3OiBzdHJpbmcgfCB1bmRlZmluZWQpOiBzdHJpbmcge1xuICBpZiAocmF3ID09PSB1bmRlZmluZWQgfHwgcmF3ID09PSBudWxsKSByZXR1cm4gJyc7XG4gIGxldCBzID0gU3RyaW5nKHJhdykudHJpbSgpLnJlcGxhY2UoL15cXHVGRUZGLywgJycpO1xuICBzID0gcy5yZXBsYWNlKC9eW1wiJ118W1wiJ10kL2csICcnKTtcbiAgaWYgKHMudG9Mb3dlckNhc2UoKS5zdGFydHNXaXRoKCdiZWFyZXIgJykpIHMgPSBzLnNsaWNlKDcpLnRyaW0oKTtcbiAgcyA9IHMucmVwbGFjZSgvXFxzKy9nLCAnJyk7XG4gIHJldHVybiBzO1xufVxuXG5mdW5jdGlvbiBpc05ld0VtYWlsUGF5bG9hZChvYmo6IHVua25vd24pOiBvYmogaXMge1xuICBvcmdhbml6YXRpb246IHsgc3ViamVjdDogc3RyaW5nOyBodG1sOiBzdHJpbmcgfTtcbiAgZG9ub3I/OiB7IHRvOiBzdHJpbmc7IHN1YmplY3Q6IHN0cmluZzsgaHRtbDogc3RyaW5nIH0gfCBudWxsO1xufSB7XG4gIGlmICh0eXBlb2Ygb2JqICE9PSAnb2JqZWN0JyB8fCBvYmogPT09IG51bGwpIHJldHVybiBmYWxzZTtcbiAgY29uc3QgbyA9IG9iaiBhcyB7IG9yZ2FuaXphdGlvbj86IHVua25vd24gfTtcbiAgaWYgKCFvLm9yZ2FuaXphdGlvbiB8fCB0eXBlb2Ygby5vcmdhbml6YXRpb24gIT09ICdvYmplY3QnKSByZXR1cm4gZmFsc2U7XG4gIGNvbnN0IG9yZyA9IG8ub3JnYW5pemF0aW9uIGFzIHsgc3ViamVjdD86IHVua25vd247IGh0bWw/OiB1bmtub3duIH07XG4gIHJldHVybiB0eXBlb2Ygb3JnLnN1YmplY3QgPT09ICdzdHJpbmcnICYmIHR5cGVvZiBvcmcuaHRtbCA9PT0gJ3N0cmluZyc7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHBvc3RSZXNlbmQoXG4gIGFwaUtleTogc3RyaW5nLFxuICBmcm9tOiBzdHJpbmcsXG4gIHJlY2lwaWVudDogc3RyaW5nLFxuICBzdWJqZWN0OiBzdHJpbmcsXG4gIGh0bWw6IHN0cmluZyxcbik6IFByb21pc2U8eyBvazogYm9vbGVhbjsgc3RhdHVzOiBudW1iZXI7IGJvZHk6IHN0cmluZzsgdG86IHN0cmluZyB9PiB7XG4gIGNvbnN0IHJlc2VuZFJlcyA9IGF3YWl0IGZldGNoKCdodHRwczovL2FwaS5yZXNlbmQuY29tL2VtYWlscycsIHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBoZWFkZXJzOiB7XG4gICAgICBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7YXBpS2V5fWAsXG4gICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgIH0sXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgZnJvbSxcbiAgICAgIHRvOiBbcmVjaXBpZW50XSxcbiAgICAgIHN1YmplY3QsXG4gICAgICBodG1sLFxuICAgIH0pLFxuICB9KTtcbiAgY29uc3QgYm9keSA9IGF3YWl0IHJlc2VuZFJlcy50ZXh0KCk7XG4gIGNvbnNvbGUubG9nKCdSZXNlbmQgQVBJIHJlc3BvbnNlIHN0YXR1czonLCByZXNlbmRSZXMuc3RhdHVzKTtcbiAgY29uc29sZS5sb2coJ1Jlc2VuZCBBUEkgcmVzcG9uc2UgYm9keTonLCBib2R5KTtcbiAgcmV0dXJuIHsgb2s6IHJlc2VuZFJlcy5vaywgc3RhdHVzOiByZXNlbmRSZXMuc3RhdHVzLCBib2R5LCB0bzogcmVjaXBpZW50IH07XG59XG5cbmZ1bmN0aW9uIGxlZ2FjeU9yZ2FuaXphdGlvbkVtYWlsKFxuICBmb3JtOiBzdHJpbmcsXG4gIGRhdGE6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxuKTogeyBzdWJqZWN0OiBzdHJpbmc7IGh0bWw6IHN0cmluZyB9IHtcbiAgaWYgKGZvcm0gPT09ICduZXdzbGV0dGVyJykge1xuICAgIGNvbnN0IGVtYWlsID0gU3RyaW5nKGRhdGEuZW1haWwgPz8gJycpO1xuICAgIHJldHVybiB7XG4gICAgICBzdWJqZWN0OiBgTmV3IG5ld3NsZXR0ZXIgc3Vic2NyaWJlciBcdTIwMTQgJHtlbWFpbH1gLFxuICAgICAgaHRtbDogYDxwIHN0eWxlPVwiZm9udC1mYW1pbHk6c3lzdGVtLXVpLHNhbnMtc2VyaWY7Zm9udC1zaXplOjE1cHg7XCI+RW1haWw6ICR7ZXNjYXBlSHRtbChlbWFpbCl9PC9wPmAsXG4gICAgfTtcbiAgfVxuICBjb25zdCBwYXlsb2FkU3RyID0gSlNPTi5zdHJpbmdpZnkoeyBmb3JtLCBkYXRhIH0sIG51bGwsIDIpO1xuICByZXR1cm4ge1xuICAgIHN1YmplY3Q6IGBbQmFsaSBGdXR1cmVdICR7Zm9ybX0gKGxlZ2FjeSBwYXlsb2FkKWAsXG4gICAgaHRtbDogYDxwcmUgc3R5bGU9XCJmb250LWZhbWlseTpzeXN0ZW0tdWksc2Fucy1zZXJpZjtmb250LXNpemU6MTNweDtcIj4ke2VzY2FwZUh0bWwocGF5bG9hZFN0cil9PC9wcmU+YCxcbiAgfTtcbn1cblxuZnVuY3Rpb24gc2VuZEVtYWlsRGV2QXBpKGVudjogUmVjb3JkPHN0cmluZywgc3RyaW5nPik6IFBsdWdpbiB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogJ3NlbmQtZW1haWwtZGV2LWFwaScsXG4gICAgY29uZmlndXJlU2VydmVyKHNlcnZlcikge1xuICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZShhc3luYyAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgICAgY29uc3QgcGF0aG5hbWUgPSByZXEudXJsPy5zcGxpdCgnPycpWzBdID8/ICcnO1xuICAgICAgICBpZiAocGF0aG5hbWUgIT09ICcvYXBpL3NlbmQtZW1haWwnKSB7XG4gICAgICAgICAgbmV4dCgpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyZXEubWV0aG9kICE9PSAnUE9TVCcpIHtcbiAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDQwNTtcbiAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ01ldGhvZCBOb3QgQWxsb3dlZCcgfSkpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnNvbGUubG9nKCdFbWFpbCBlbmRwb2ludCBoaXQnKTtcblxuICAgICAgICBjb25zdCBrZXkgPSBub3JtYWxpemVSZXNlbmRBcGlLZXkoZW52LlJFU0VORF9BUElfS0VZKTtcbiAgICAgICAgY29uc3QgaGFzS2V5ID0gQm9vbGVhbihrZXkpO1xuICAgICAgICBjb25zb2xlLmxvZygnUkVTRU5EX0FQSV9LRVkgbG9hZGVkOicsIGhhc0tleSA/ICd0cnVlJyA6ICdmYWxzZScpO1xuXG4gICAgICAgIGxldCBjbGllbnRQYXlsb2FkOiB1bmtub3duO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHJhdyA9IGF3YWl0IHJlYWRSZXFCb2R5KHJlcSk7XG4gICAgICAgICAgY2xpZW50UGF5bG9hZCA9IHJhdyA/IEpTT04ucGFyc2UocmF3KSA6IHt9O1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignW3NlbmQtZW1haWwgbWlkZGxld2FyZV0gSW52YWxpZCBKU09OIGJvZHknLCBlKTtcbiAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDQwMDtcbiAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ0ludmFsaWQgSlNPTicgfSkpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghaGFzS2V5KSB7XG4gICAgICAgICAgY29uc3QgYm9keSA9IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgIHNraXBwZWQ6IHRydWUsXG4gICAgICAgICAgICByZWFzb246ICdSRVNFTkRfQVBJX0tFWSBub3Qgc2V0IChhZGQgdG8gLmVudi5sb2NhbCBmb3IgbG9jYWwgUmVzZW5kIGNhbGxzKScsXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgY29uc29sZS5sb2coJ1Jlc2VuZCBBUEkgcmVzcG9uc2Ugc3RhdHVzOiAoc2tpcHBlZCBcdTIwMTQgbm8gQVBJIGtleSknKTtcbiAgICAgICAgICBjb25zb2xlLmxvZygnUmVzZW5kIEFQSSByZXNwb25zZSBib2R5OicsIGJvZHkpO1xuICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gMjAwO1xuICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICAgICAgcmVzLmVuZChib2R5KTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBmcm9tID0gZW52LlJFU0VORF9GUk9NX0VNQUlMPy50cmltKCkgfHwgJ0JhbGkgRnV0dXJlIDxvbmJvYXJkaW5nQHJlc2VuZC5kZXY+JztcbiAgICAgICAgY29uc3Qgb3JnVG9SYXcgPSBlbnYuSU5UQUtFX0VNQUlMX1RPPy50cmltKCkgfHwgJyc7XG4gICAgICAgIGNvbnN0IG9yZ1RvID0gb3JnVG9SYXcgfHwgJ2RvbmF0ZUBiYWxpZnV0dXJlLmNvbSc7XG4gICAgICAgIGlmICghb3JnVG9SYXcpIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oJ1tzZW5kLWVtYWlsIG1pZGRsZXdhcmVdIElOVEFLRV9FTUFJTF9UTyBub3Qgc2V0OyB1c2luZyBkb25hdGVAYmFsaWZ1dHVyZS5jb20nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJlc3VsdHM6IEFycmF5PHsgdGFyZ2V0OiBzdHJpbmc7IHN0YXR1czogbnVtYmVyOyBib2R5OiBzdHJpbmc7IG9rOiBib29sZWFuIH0+ID0gW107XG5cbiAgICAgICAgaWYgKGlzTmV3RW1haWxQYXlsb2FkKGNsaWVudFBheWxvYWQpKSB7XG4gICAgICAgICAgY29uc3Qgb3JnID0gY2xpZW50UGF5bG9hZC5vcmdhbml6YXRpb247XG4gICAgICAgICAgY29uc3QgcjAgPSBhd2FpdCBwb3N0UmVzZW5kKGtleSwgZnJvbSwgb3JnVG8sIG9yZy5zdWJqZWN0LCBvcmcuaHRtbCk7XG4gICAgICAgICAgcmVzdWx0cy5wdXNoKHsgdGFyZ2V0OiAnb3JnYW5pemF0aW9uJywgc3RhdHVzOiByMC5zdGF0dXMsIGJvZHk6IHIwLmJvZHksIG9rOiByMC5vayB9KTtcblxuICAgICAgICAgIGNvbnN0IGRvbm9yID0gY2xpZW50UGF5bG9hZC5kb25vcjtcbiAgICAgICAgICBpZiAoZG9ub3IgJiYgdHlwZW9mIGRvbm9yLnRvID09PSAnc3RyaW5nJyAmJiBkb25vci50by5pbmNsdWRlcygnQCcpKSB7XG4gICAgICAgICAgICBjb25zdCBkVG8gPSBkb25vci50by50cmltKCk7XG4gICAgICAgICAgICBjb25zdCByMSA9IGF3YWl0IHBvc3RSZXNlbmQoa2V5LCBmcm9tLCBkVG8sIGRvbm9yLnN1YmplY3QsIGRvbm9yLmh0bWwpO1xuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHsgdGFyZ2V0OiAnZG9ub3InLCBzdGF0dXM6IHIxLnN0YXR1cywgYm9keTogcjEuYm9keSwgb2s6IHIxLm9rIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBwbCA9IGNsaWVudFBheWxvYWQgYXMgeyBmb3JtPzogc3RyaW5nOyBkYXRhPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfTtcbiAgICAgICAgICBjb25zdCBmb3JtID0gdHlwZW9mIHBsLmZvcm0gPT09ICdzdHJpbmcnID8gcGwuZm9ybSA6ICd1bmtub3duJztcbiAgICAgICAgICBjb25zdCBkYXRhID1cbiAgICAgICAgICAgIHBsLmRhdGEgJiYgdHlwZW9mIHBsLmRhdGEgPT09ICdvYmplY3QnICYmIHBsLmRhdGEgIT09IG51bGxcbiAgICAgICAgICAgICAgPyAocGwuZGF0YSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPilcbiAgICAgICAgICAgICAgOiB7fTtcbiAgICAgICAgICBjb25zdCB7IHN1YmplY3QsIGh0bWwgfSA9IGxlZ2FjeU9yZ2FuaXphdGlvbkVtYWlsKGZvcm0sIGRhdGEpO1xuICAgICAgICAgIGNvbnN0IHIwID0gYXdhaXQgcG9zdFJlc2VuZChrZXksIGZyb20sIG9yZ1RvLCBzdWJqZWN0LCBodG1sKTtcbiAgICAgICAgICByZXN1bHRzLnB1c2goeyB0YXJnZXQ6ICdvcmdhbml6YXRpb24nLCBzdGF0dXM6IHIwLnN0YXR1cywgYm9keTogcjAuYm9keSwgb2s6IHIwLm9rIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYWxsT2sgPSByZXN1bHRzLmxlbmd0aCA+IDAgJiYgcmVzdWx0cy5ldmVyeSgoeCkgPT4geC5vayk7XG4gICAgICAgIHJlcy5zdGF0dXNDb2RlID0gYWxsT2sgPyAyMDAgOiByZXN1bHRzLnNvbWUoKHgpID0+IHgub2spID8gMjA3IDogNTAyO1xuICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgcmVzdWx0cyB9KSk7XG4gICAgICB9KTtcbiAgICB9LFxuICB9O1xufVxuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xuICAvLyBWSVRFXyogbXVzdCBleGlzdCBpbiB0aGUgZW52aXJvbm1lbnQgd2hlbiBgdml0ZSBidWlsZGAgcnVucyAoVmVyY2VsIFx1MjE5MiBQcm9kdWN0aW9uICsgUHJldmlldykuXG4gIGNvbnN0IGVudiA9IGxvYWRFbnYobW9kZSwgcHJvY2Vzcy5jd2QoKSwgJycpO1xuICBpZiAoIWVudi5WSVRFX1NVUEFCQVNFX1VSTCB8fCAhZW52LlZJVEVfU1VQQUJBU0VfQU5PTl9LRVkpIHtcbiAgICBjb25zb2xlLndhcm4oXG4gICAgICAnW3ZpdGUgYnVpbGRdIFZJVEVfU1VQQUJBU0VfVVJMIG9yIFZJVEVfU1VQQUJBU0VfQU5PTl9LRVkgaXMgbWlzc2luZyBcdTIwMTQgcHJvZHVjdGlvbiBmb3JtcyB3aWxsIG5vdCBzYXZlIHVudGlsIHNldCBhbmQgcmVkZXBsb3llZC4nLFxuICAgICk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGVudkRpcjogcHJvY2Vzcy5jd2QoKSxcbiAgICBwbHVnaW5zOiBbcmVhY3QoKSwgc2VuZEVtYWlsRGV2QXBpKGVudildLFxuICAgIHNlcnZlcjoge1xuICAgICAgaGVhZGVyczogeyAnQ2FjaGUtQ29udHJvbCc6ICduby1zdG9yZScgfSxcbiAgICB9LFxuICAgIG9wdGltaXplRGVwczoge1xuICAgICAgZXhjbHVkZTogWydsdWNpZGUtcmVhY3QnXSxcbiAgICB9LFxuICAgIGJ1aWxkOiB7XG4gICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgIG91dHB1dDoge1xuICAgICAgICAgIG1hbnVhbENodW5rcyhpZCkge1xuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvZnJhbWVyLW1vdGlvbicpKSByZXR1cm4gJ21vdGlvbic7XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9Ac3VwYWJhc2UnKSkgcmV0dXJuICdzdXBhYmFzZSc7XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy90aHJlZScpKSByZXR1cm4gJ3RocmVlJztcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9O1xufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQ0EsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsY0FBYyxlQUFlO0FBR3RDLFNBQVMsWUFBWSxLQUF1QztBQUMxRCxTQUFPLElBQUksUUFBUSxDQUFDLFNBQVMsV0FBVztBQUN0QyxRQUFJLE1BQU07QUFDVixRQUFJLFlBQVksTUFBTTtB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
