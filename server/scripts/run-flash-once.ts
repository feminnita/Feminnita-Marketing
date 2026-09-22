/** Runner supervisionado — dispara rodarAgora 1x e imprime a prova em JSON. */
import { rodarAgora } from "../agents/shopee-flash-agent";

const arg = (process.argv[2] || "both").toLowerCase();
const only = arg === "feminnita" || arg === "fnt" ? (arg as any) : undefined;

rodarAgora(only)
  .then((r) => { console.log("RESULT_JSON_START"); console.log(JSON.stringify(r, null, 1)); console.log("RESULT_JSON_END"); process.exit(0); })
  .catch((e) => { console.error("RUNNER_ERR", e && e.stack ? e.stack : e); process.exit(1); });
