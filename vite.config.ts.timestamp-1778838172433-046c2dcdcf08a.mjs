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
        const key = (env.RESEND_API_KEY ?? "").trim();
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
        const orgTo = env.INTAKE_EMAIL_TO?.trim() || "";
        if (!orgTo) {
          const errBody = JSON.stringify({ error: "INTAKE_EMAIL_TO not set in env" });
          console.log("Resend API response status: (skipped \u2014 no recipient)");
          console.log("Resend API response body:", errBody);
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(errBody);
          return;
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
  return {
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgdHlwZSB7IEluY29taW5nTWVzc2FnZSB9IGZyb20gJ25vZGU6aHR0cCc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgdHlwZSB7IFBsdWdpbiB9IGZyb20gJ3ZpdGUnO1xuXG5mdW5jdGlvbiByZWFkUmVxQm9keShyZXE6IEluY29taW5nTWVzc2FnZSk6IFByb21pc2U8c3RyaW5nPiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgbGV0IG91dCA9ICcnO1xuICAgIHJlcS5zZXRFbmNvZGluZygndXRmOCcpO1xuICAgIHJlcS5vbignZGF0YScsIChjaHVuazogc3RyaW5nKSA9PiB7XG4gICAgICBvdXQgKz0gY2h1bms7XG4gICAgfSk7XG4gICAgcmVxLm9uKCdlbmQnLCAoKSA9PiByZXNvbHZlKG91dCkpO1xuICAgIHJlcS5vbignZXJyb3InLCByZWplY3QpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZXNjYXBlSHRtbChzOiBzdHJpbmcpIHtcbiAgcmV0dXJuIHMucmVwbGFjZSgvJi9nLCAnJmFtcDsnKS5yZXBsYWNlKC88L2csICcmbHQ7JykucmVwbGFjZSgvPi9nLCAnJmd0OycpO1xufVxuXG5mdW5jdGlvbiBpc05ld0VtYWlsUGF5bG9hZChvYmo6IHVua25vd24pOiBvYmogaXMge1xuICBvcmdhbml6YXRpb246IHsgc3ViamVjdDogc3RyaW5nOyBodG1sOiBzdHJpbmcgfTtcbiAgZG9ub3I/OiB7IHRvOiBzdHJpbmc7IHN1YmplY3Q6IHN0cmluZzsgaHRtbDogc3RyaW5nIH0gfCBudWxsO1xufSB7XG4gIGlmICh0eXBlb2Ygb2JqICE9PSAnb2JqZWN0JyB8fCBvYmogPT09IG51bGwpIHJldHVybiBmYWxzZTtcbiAgY29uc3QgbyA9IG9iaiBhcyB7IG9yZ2FuaXphdGlvbj86IHVua25vd24gfTtcbiAgaWYgKCFvLm9yZ2FuaXphdGlvbiB8fCB0eXBlb2Ygby5vcmdhbml6YXRpb24gIT09ICdvYmplY3QnKSByZXR1cm4gZmFsc2U7XG4gIGNvbnN0IG9yZyA9IG8ub3JnYW5pemF0aW9uIGFzIHsgc3ViamVjdD86IHVua25vd247IGh0bWw/OiB1bmtub3duIH07XG4gIHJldHVybiB0eXBlb2Ygb3JnLnN1YmplY3QgPT09ICdzdHJpbmcnICYmIHR5cGVvZiBvcmcuaHRtbCA9PT0gJ3N0cmluZyc7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHBvc3RSZXNlbmQoXG4gIGFwaUtleTogc3RyaW5nLFxuICBmcm9tOiBzdHJpbmcsXG4gIHJlY2lwaWVudDogc3RyaW5nLFxuICBzdWJqZWN0OiBzdHJpbmcsXG4gIGh0bWw6IHN0cmluZyxcbik6IFByb21pc2U8eyBvazogYm9vbGVhbjsgc3RhdHVzOiBudW1iZXI7IGJvZHk6IHN0cmluZzsgdG86IHN0cmluZyB9PiB7XG4gIGNvbnN0IHJlc2VuZFJlcyA9IGF3YWl0IGZldGNoKCdodHRwczovL2FwaS5yZXNlbmQuY29tL2VtYWlscycsIHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBoZWFkZXJzOiB7XG4gICAgICBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7YXBpS2V5fWAsXG4gICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgIH0sXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgZnJvbSxcbiAgICAgIHRvOiBbcmVjaXBpZW50XSxcbiAgICAgIHN1YmplY3QsXG4gICAgICBodG1sLFxuICAgIH0pLFxuICB9KTtcbiAgY29uc3QgYm9keSA9IGF3YWl0IHJlc2VuZFJlcy50ZXh0KCk7XG4gIGNvbnNvbGUubG9nKCdSZXNlbmQgQVBJIHJlc3BvbnNlIHN0YXR1czonLCByZXNlbmRSZXMuc3RhdHVzKTtcbiAgY29uc29sZS5sb2coJ1Jlc2VuZCBBUEkgcmVzcG9uc2UgYm9keTonLCBib2R5KTtcbiAgcmV0dXJuIHsgb2s6IHJlc2VuZFJlcy5vaywgc3RhdHVzOiByZXNlbmRSZXMuc3RhdHVzLCBib2R5LCB0bzogcmVjaXBpZW50IH07XG59XG5cbmZ1bmN0aW9uIGxlZ2FjeU9yZ2FuaXphdGlvbkVtYWlsKFxuICBmb3JtOiBzdHJpbmcsXG4gIGRhdGE6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxuKTogeyBzdWJqZWN0OiBzdHJpbmc7IGh0bWw6IHN0cmluZyB9IHtcbiAgaWYgKGZvcm0gPT09ICduZXdzbGV0dGVyJykge1xuICAgIGNvbnN0IGVtYWlsID0gU3RyaW5nKGRhdGEuZW1haWwgPz8gJycpO1xuICAgIHJldHVybiB7XG4gICAgICBzdWJqZWN0OiBgTmV3IG5ld3NsZXR0ZXIgc3Vic2NyaWJlciBcdTIwMTQgJHtlbWFpbH1gLFxuICAgICAgaHRtbDogYDxwIHN0eWxlPVwiZm9udC1mYW1pbHk6c3lzdGVtLXVpLHNhbnMtc2VyaWY7Zm9udC1zaXplOjE1cHg7XCI+RW1haWw6ICR7ZXNjYXBlSHRtbChlbWFpbCl9PC9wPmAsXG4gICAgfTtcbiAgfVxuICBjb25zdCBwYXlsb2FkU3RyID0gSlNPTi5zdHJpbmdpZnkoeyBmb3JtLCBkYXRhIH0sIG51bGwsIDIpO1xuICByZXR1cm4ge1xuICAgIHN1YmplY3Q6IGBbQmFsaSBGdXR1cmVdICR7Zm9ybX0gKGxlZ2FjeSBwYXlsb2FkKWAsXG4gICAgaHRtbDogYDxwcmUgc3R5bGU9XCJmb250LWZhbWlseTpzeXN0ZW0tdWksc2Fucy1zZXJpZjtmb250LXNpemU6MTNweDtcIj4ke2VzY2FwZUh0bWwocGF5bG9hZFN0cil9PC9wcmU+YCxcbiAgfTtcbn1cblxuZnVuY3Rpb24gc2VuZEVtYWlsRGV2QXBpKGVudjogUmVjb3JkPHN0cmluZywgc3RyaW5nPik6IFBsdWdpbiB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogJ3NlbmQtZW1haWwtZGV2LWFwaScsXG4gICAgY29uZmlndXJlU2VydmVyKHNlcnZlcikge1xuICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZShhc3luYyAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgICAgY29uc3QgcGF0aG5hbWUgPSByZXEudXJsPy5zcGxpdCgnPycpWzBdID8/ICcnO1xuICAgICAgICBpZiAocGF0aG5hbWUgIT09ICcvYXBpL3NlbmQtZW1haWwnKSB7XG4gICAgICAgICAgbmV4dCgpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyZXEubWV0aG9kICE9PSAnUE9TVCcpIHtcbiAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDQwNTtcbiAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ01ldGhvZCBOb3QgQWxsb3dlZCcgfSkpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnNvbGUubG9nKCdFbWFpbCBlbmRwb2ludCBoaXQnKTtcblxuICAgICAgICBjb25zdCBrZXkgPSAoZW52LlJFU0VORF9BUElfS0VZID8/ICcnKS50cmltKCk7XG4gICAgICAgIGNvbnN0IGhhc0tleSA9IEJvb2xlYW4oa2V5KTtcbiAgICAgICAgY29uc29sZS5sb2coJ1JFU0VORF9BUElfS0VZIGxvYWRlZDonLCBoYXNLZXkgPyAndHJ1ZScgOiAnZmFsc2UnKTtcblxuICAgICAgICBsZXQgY2xpZW50UGF5bG9hZDogdW5rbm93bjtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCByYXcgPSBhd2FpdCByZWFkUmVxQm9keShyZXEpO1xuICAgICAgICAgIGNsaWVudFBheWxvYWQgPSByYXcgPyBKU09OLnBhcnNlKHJhdykgOiB7fTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tzZW5kLWVtYWlsIG1pZGRsZXdhcmVdIEludmFsaWQgSlNPTiBib2R5JywgZSk7XG4gICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA0MDA7XG4gICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdJbnZhbGlkIEpTT04nIH0pKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWhhc0tleSkge1xuICAgICAgICAgIGNvbnN0IGJvZHkgPSBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICBza2lwcGVkOiB0cnVlLFxuICAgICAgICAgICAgcmVhc29uOiAnUkVTRU5EX0FQSV9LRVkgbm90IHNldCAoYWRkIHRvIC5lbnYubG9jYWwgZm9yIGxvY2FsIFJlc2VuZCBjYWxscyknLFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdSZXNlbmQgQVBJIHJlc3BvbnNlIHN0YXR1czogKHNraXBwZWQgXHUyMDE0IG5vIEFQSSBrZXkpJyk7XG4gICAgICAgICAgY29uc29sZS5sb2coJ1Jlc2VuZCBBUEkgcmVzcG9uc2UgYm9keTonLCBib2R5KTtcbiAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDIwMDtcbiAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgIHJlcy5lbmQoYm9keSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZnJvbSA9IGVudi5SRVNFTkRfRlJPTV9FTUFJTD8udHJpbSgpIHx8ICdCYWxpIEZ1dHVyZSA8b25ib2FyZGluZ0ByZXNlbmQuZGV2Pic7XG4gICAgICAgIGNvbnN0IG9yZ1RvID0gZW52LklOVEFLRV9FTUFJTF9UTz8udHJpbSgpIHx8ICcnO1xuICAgICAgICBpZiAoIW9yZ1RvKSB7XG4gICAgICAgICAgY29uc3QgZXJyQm9keSA9IEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdJTlRBS0VfRU1BSUxfVE8gbm90IHNldCBpbiBlbnYnIH0pO1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdSZXNlbmQgQVBJIHJlc3BvbnNlIHN0YXR1czogKHNraXBwZWQgXHUyMDE0IG5vIHJlY2lwaWVudCknKTtcbiAgICAgICAgICBjb25zb2xlLmxvZygnUmVzZW5kIEFQSSByZXNwb25zZSBib2R5OicsIGVyckJvZHkpO1xuICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNTAwO1xuICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICAgICAgcmVzLmVuZChlcnJCb2R5KTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByZXN1bHRzOiBBcnJheTx7IHRhcmdldDogc3RyaW5nOyBzdGF0dXM6IG51bWJlcjsgYm9keTogc3RyaW5nOyBvazogYm9vbGVhbiB9PiA9IFtdO1xuXG4gICAgICAgIGlmIChpc05ld0VtYWlsUGF5bG9hZChjbGllbnRQYXlsb2FkKSkge1xuICAgICAgICAgIGNvbnN0IG9yZyA9IGNsaWVudFBheWxvYWQub3JnYW5pemF0aW9uO1xuICAgICAgICAgIGNvbnN0IHIwID0gYXdhaXQgcG9zdFJlc2VuZChrZXksIGZyb20sIG9yZ1RvLCBvcmcuc3ViamVjdCwgb3JnLmh0bWwpO1xuICAgICAgICAgIHJlc3VsdHMucHVzaCh7IHRhcmdldDogJ29yZ2FuaXphdGlvbicsIHN0YXR1czogcjAuc3RhdHVzLCBib2R5OiByMC5ib2R5LCBvazogcjAub2sgfSk7XG5cbiAgICAgICAgICBjb25zdCBkb25vciA9IGNsaWVudFBheWxvYWQuZG9ub3I7XG4gICAgICAgICAgaWYgKGRvbm9yICYmIHR5cGVvZiBkb25vci50byA9PT0gJ3N0cmluZycgJiYgZG9ub3IudG8uaW5jbHVkZXMoJ0AnKSkge1xuICAgICAgICAgICAgY29uc3QgZFRvID0gZG9ub3IudG8udHJpbSgpO1xuICAgICAgICAgICAgY29uc3QgcjEgPSBhd2FpdCBwb3N0UmVzZW5kKGtleSwgZnJvbSwgZFRvLCBkb25vci5zdWJqZWN0LCBkb25vci5odG1sKTtcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaCh7IHRhcmdldDogJ2Rvbm9yJywgc3RhdHVzOiByMS5zdGF0dXMsIGJvZHk6IHIxLmJvZHksIG9rOiByMS5vayB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgcGwgPSBjbGllbnRQYXlsb2FkIGFzIHsgZm9ybT86IHN0cmluZzsgZGF0YT86IFJlY29yZDxzdHJpbmcsIHVua25vd24+IH07XG4gICAgICAgICAgY29uc3QgZm9ybSA9IHR5cGVvZiBwbC5mb3JtID09PSAnc3RyaW5nJyA/IHBsLmZvcm0gOiAndW5rbm93bic7XG4gICAgICAgICAgY29uc3QgZGF0YSA9XG4gICAgICAgICAgICBwbC5kYXRhICYmIHR5cGVvZiBwbC5kYXRhID09PSAnb2JqZWN0JyAmJiBwbC5kYXRhICE9PSBudWxsXG4gICAgICAgICAgICAgID8gKHBsLmRhdGEgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pXG4gICAgICAgICAgICAgIDoge307XG4gICAgICAgICAgY29uc3QgeyBzdWJqZWN0LCBodG1sIH0gPSBsZWdhY3lPcmdhbml6YXRpb25FbWFpbChmb3JtLCBkYXRhKTtcbiAgICAgICAgICBjb25zdCByMCA9IGF3YWl0IHBvc3RSZXNlbmQoa2V5LCBmcm9tLCBvcmdUbywgc3ViamVjdCwgaHRtbCk7XG4gICAgICAgICAgcmVzdWx0cy5wdXNoKHsgdGFyZ2V0OiAnb3JnYW5pemF0aW9uJywgc3RhdHVzOiByMC5zdGF0dXMsIGJvZHk6IHIwLmJvZHksIG9rOiByMC5vayB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGFsbE9rID0gcmVzdWx0cy5sZW5ndGggPiAwICYmIHJlc3VsdHMuZXZlcnkoKHgpID0+IHgub2spO1xuICAgICAgICByZXMuc3RhdHVzQ29kZSA9IGFsbE9rID8gMjAwIDogcmVzdWx0cy5zb21lKCh4KSA9PiB4Lm9rKSA/IDIwNyA6IDUwMjtcbiAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IHJlc3VsdHMgfSkpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgfTtcbn1cblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpLCAnJyk7XG5cbiAgcmV0dXJuIHtcbiAgICBwbHVnaW5zOiBbcmVhY3QoKSwgc2VuZEVtYWlsRGV2QXBpKGVudildLFxuICAgIHNlcnZlcjoge1xuICAgICAgaGVhZGVyczogeyAnQ2FjaGUtQ29udHJvbCc6ICduby1zdG9yZScgfSxcbiAgICB9LFxuICAgIG9wdGltaXplRGVwczoge1xuICAgICAgZXhjbHVkZTogWydsdWNpZGUtcmVhY3QnXSxcbiAgICB9LFxuICAgIGJ1aWxkOiB7XG4gICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgIG91dHB1dDoge1xuICAgICAgICAgIG1hbnVhbENodW5rcyhpZCkge1xuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvZnJhbWVyLW1vdGlvbicpKSByZXR1cm4gJ21vdGlvbic7XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9Ac3VwYWJhc2UnKSkgcmV0dXJuICdzdXBhYmFzZSc7XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy90aHJlZScpKSByZXR1cm4gJ3RocmVlJztcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9O1xufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQ0EsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsY0FBYyxlQUFlO0FBR3RDLFNBQVMsWUFBWSxLQUF1QztBQUMxRCxTQUFPLElBQUksUUFBUSxDQUFDLFNBQVMsV0FBVztBQUN0QyxRQUFJLE1BQU07QUFDVixRQUFJLFlBQVksTUFBTTtBQUN0QixRQUFJLEdBQUcsUUFBUSxDQUFDLFVBQWtCO0FBQ2hDLGFBQU87QUFBQSxJQUNULENBQUM7QUFDRCxRQUFJLEdBQUcsT0FBTyxNQUFNLFFBQVEsR0FBRyxDQUFDO0FBQ2hDLFFBQUksR0FBRyxTQUFTLE1BQU07QUFBQSxFQUN4QixDQUFDO0FBQ0g7QUFFQSxTQUFTLFdBQVcsR0FBVztBQUM3QixTQUFPLEVBQUUsUUFBUSxNQUFNLE9BQU8sRUFBRSxRQUFRLE1BQU0sTUFBTSxFQUFFLFFBQVEsTUFBTSxNQUFNO0FBQzVFO0FBRUEsU0FBUyxrQkFBa0IsS0FHekI7QUFDQSxNQUFJLE9BQU8sUUFBUSxZQUFZLFFBQVEsS0FBTSxRQUFPO0FBQ3BELFFBQU0sSUFBSTtBQUNWLE1BQUksQ0FBQyxFQUFFLGdCQUFnQixPQUFPLEVBQUUsaUJBQWlCLFNBQVUsUUFBTztBQUNsRSxRQUFNLE1BQU0sRUFBRTtBQUNkLFNBQU8sT0FBTyxJQUFJLFlBQVksWUFBWSxPQUFPLElBQUksU0FBUztBQUNoRTtBQUVBLGVBQWUsV0FDYixRQUNBLE1BQ0EsV0FDQSxTQUNBLE1BQ29FO0FBQ3BFLFFBQU0sWUFBWSxN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
