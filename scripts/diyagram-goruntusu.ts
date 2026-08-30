import { chromium } from "playwright";
import path from "node:path";
import { pathToFileURL } from "node:url";

async function main() {
  const html = path.join(process.cwd(), "rapor", "diyagramlar.html");
  const cikti = path.join(process.cwd(), "ekran-goruntuleri");
  const tarayici = await chromium.launch();
  const sayfa = await tarayici.newPage({ deviceScaleFactor: 2 });
  await sayfa.goto(pathToFileURL(html).href, { waitUntil: "networkidle" });
  for (const [sec, dosya] of [["#er", "ek1-er-diyagrami.png"], ["#akis", "ek6-zimmet-akis.png"]] as const) {
    const el = await sayfa.$(sec);
    if (el) { await el.screenshot({ path: path.join(cikti, dosya) }); console.log("✓", dosya); }
  }
  await tarayici.close();
}
main();
