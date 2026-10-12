import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { resolve, join, extname } from "node:path";
import puppeteer from "puppeteer-core";

const rootDir = process.cwd();
const mime = {".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",".svg":"image/svg+xml",".ico":"image/x-icon",".json":"application/json"};
const server = createServer((req, res) => {
  const url = new URL(req.url, "http://127.0.0.1");
  let rel = decodeURIComponent(url.pathname).replace(/^\/+/, "");
  if (rel.endsWith("/") || rel === "") rel += "index.html";
  const file = resolve(rootDir, rel);
  if (!file.startsWith(rootDir + "/") || !existsSync(file)) {
    res.writeHead(404);res.end("Not found");return;
  }
  try {
    const body = readFileSync(file);
    res.writeHead(200,{"Content-Type": mime[extname(file)] || "application/octet-stream","Cache-Control":"no-store"});
    res.end(body);
  } catch(e) {res.writeHead(500);res.end(String(e));}
});
await new Promise(r => server.listen(0, "127.0.0.1", r));
const base = "http://127.0.0.1:" + server.address().port;
const pathNames = ["de","en","es","pt","it","fr"];
let chrome = process.env.CHROME_BIN;
if(!chrome){
  for(const candidate of ["/usr/bin/google-chrome","/usr/bin/google-chrome-stable","/usr/bin/chromium"]){
    if(existsSync(candidate)){chrome=candidate;break;}
  }
}
assert(chrome,"No Chromium/Chrome executable found for browser smoke tests");
const browser = await puppeteer.launch({executablePath:chrome,headless:true,args:["--no-sandbox","--disable-dev-shm-usage"]});
let scenarios = 0;
async function pageFor(lang="en-US",mobile=false){
  const page = await browser.newPage();
  await page.setViewport(mobile ? {width:375,height:812,isMobile:true,hasTouch:true} : {width:1365,height:850});
  await page.evaluateOnNewDocument(preferred => {
    Object.defineProperty(navigator,"language",{configurable:true,get:()=>preferred});
    Object.defineProperty(navigator,"languages",{configurable:true,get:()=>[preferred]});
  },lang);
  await page.setRequestInterception(true);
  page.on("request",r => {const url = new URL(r.url()); if(url.hostname === "127.0.0.1") r.continue(); else r.abort();});
  return page;
}
async function open(page,path){
  await page.goto(base+path,{waitUntil:"domcontentloaded",timeout:30000});
  await page.waitForSelector("#langSelect",{timeout:15000});
  await page.waitForFunction(() => !!document.querySelector("#langSelect")?.value,{timeout:15000});
}
try{
  for(const lang of pathNames){
    const page=await pageFor("en-US");
    await open(page,"/"+lang+"/");
    const result=await page.evaluate(()=>({
      url:location.pathname,title:document.title,
      headLang:document.documentElement.lang,
      selected:document.querySelector("#langSelect").value,
      h1:document.querySelector("h1")?.textContent,
      canonical:document.querySelector('link[rel="canonical"]')?.getAttribute("href")
    }));
    assert.equal(result.url,"/"+lang+"/",lang+" redirected unexpectedly");
    assert.equal(result.selected,lang,lang+" initial language dropdown");
    assert.equal(result.headLang,lang === "pt"?"pt":lang,lang+" document language");
    assert.equal(result.canonical,"https://betinsight.club/"+lang+"/");
    assert(result.h1 && result.h1.length>15);
    assert(lang==="de" || !result.h1.startsWith("Sport verstehen"),"German flash on "+lang);
    assert(lang==="de" || !result.title.includes("Sport verstehen"),"German SEO title on "+lang);
    scenarios++; await page.close();
  }

  const page=await pageFor("en-US");
  await page.goto(base+"/?ref=TEST123&utm_source=smoke",{waitUntil:"domcontentloaded"});
  await page.waitForFunction(()=>location.pathname==="/en/",{timeout:15000});
  assert.equal(new URL(page.url()).searchParams.get("ref"),"TEST123");
  assert.equal(new URL(page.url()).searchParams.get("utm_source"),"smoke");
  scenarios++;

  await page.select("#langSelect","pt");
  await page.waitForFunction(()=>location.pathname==="/pt/" && document.querySelector("#langSelect")?.value==="pt",{timeout:15000});
  assert.equal(new URL(page.url()).searchParams.get("ref"),"TEST123");
  assert.equal(new URL(page.url()).searchParams.get("utm_source"),"smoke");
  assert.equal(await page.evaluate(()=>localStorage.getItem("betinsight_language")),"pt");
  scenarios++;

  await page.goto(base+"/",{waitUntil:"domcontentloaded"});
  await page.waitForFunction(()=>location.pathname==="/pt/",{timeout:15000});
  scenarios++;
  await page.close();

  const nl=await pageFor("nl-NL",true);
  await nl.goto(base+"/?utm_campaign=nltest",{waitUntil:"domcontentloaded"});
  await nl.waitForFunction(()=>location.pathname==="/en/" && new URLSearchParams(location.search).get("lang")==="nl",{timeout:15000});
  await nl.waitForFunction(()=>document.querySelector("#langSelect")?.value==="nl",{timeout:15000});
  assert((await nl.$eval("h1",el=>el.textContent)).startsWith("Sport begrijpen"));
  assert.equal(new URL(nl.url()).searchParams.get("utm_campaign"),"nltest");
  scenarios++;await nl.close();

  const zh=await pageFor("zh-TW",true);
  await zh.goto(base+"/?ref=ZH-TEST",{waitUntil:"domcontentloaded"});
  await zh.waitForFunction(()=>location.pathname==="/en/" && new URLSearchParams(location.search).get("lang")==="zh-tw",{timeout:15000});
  await zh.waitForFunction(()=>document.querySelector("#langSelect")?.value==="zh-tw",{timeout:15000});
  assert((await zh.$eval("h1",el=>el.textContent)).includes("足球"));
  assert.equal(new URL(zh.url()).searchParams.get("ref"),"ZH-TEST");
  scenarios++;await zh.close();

  const mobile=await pageFor("en-US",true);
  await open(mobile,"/fr/?ref=MOBILE");
  const result=await mobile.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:innerWidth,sel:document.querySelector("#langSelect")?.value}));
  assert.equal(result.sel,"fr");
  await mobile.select("#langSelect","en");
  await mobile.waitForFunction(()=>location.pathname==="/en/"&&document.querySelector("#langSelect")?.value==="en",{timeout:15000});
  assert.equal(new URL(mobile.url()).searchParams.get("ref"),"MOBILE");
  scenarios++;await mobile.close();

  console.log("Browser tests passed: "+scenarios+" scenarios. 6 direct language pages, localized roots, language switching, saved preference, ref/UTM, NL/ZH fallback, mobile.");
} finally {await browser.close();await new Promise(r=>server.close(r));}
