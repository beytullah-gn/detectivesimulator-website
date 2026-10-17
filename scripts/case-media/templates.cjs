// HTML templates for rendered evidence images. Each returns { width, height, html }.

const esc = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

// height === null renders at content height (used by paper documents).
const base = (width, height, css, body, background = "#2a2622") => ({
  width,
  height,
  html: `<!doctype html><html><head><meta charset="utf-8"><style>
    *{box-sizing:border-box;margin:0;padding:0}
    html,body{width:${width}px;${height ? `height:${height}px;overflow:hidden;` : ""}background:${background};font-family:-apple-system,"Helvetica Neue",Arial,sans-serif}
    .grain{position:absolute;inset:0;pointer-events:none;opacity:.18;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='.55'/></svg>")}
    ${css}
  </style></head><body>${body}</body></html>`,
});

// Dot-matrix style system printout on continuous paper.
function printout({ title, subtitle, columns, rows, footer, highlight = [] }) {
  const head = columns.map((column) => `<th>${esc(column)}</th>`).join("");
  const body = rows
    .map(
      (row, index) =>
        `<tr class="${highlight.includes(index) ? "hl" : ""}">${row.map((cell) => `<td>${esc(cell)}</td>`).join("")}</tr>`
    )
    .join("");
  return base(
    900,
    120 + rows.length * 34 + 150,
    `.paper{position:absolute;left:40px;right:40px;top:30px;bottom:30px;background:#f4f1e8;color:#262420;padding:36px 48px;font-family:"Courier New",monospace;box-shadow:0 10px 30px rgba(0,0,0,.5);transform:rotate(-.6deg)}
     .paper:before,.paper:after{content:"";position:absolute;top:0;bottom:0;width:22px;background:radial-gradient(circle at 11px 18px,#2a2622 5px,transparent 6px) 0 0/22px 36px repeat-y}
     .paper:before{left:-2px}.paper:after{right:-2px}
     h1{font-size:20px;letter-spacing:.08em}h2{font-size:13px;font-weight:400;margin:4px 0 18px;opacity:.75}
     table{width:100%;border-collapse:collapse;font-size:14px}th{text-align:left;border-bottom:1.5px dashed #555;padding:6px 6px;font-size:12px}
     td{padding:7px 6px;border-bottom:1px dotted #bbb;white-space:nowrap}
     tr.hl td{background:rgba(214,170,40,.35)}
     .foot{margin-top:16px;font-size:12px;opacity:.8}`,
    `<div class="paper"><h1>${esc(title)}</h1><h2>${esc(subtitle)}</h2><table><tr>${head}</tr>${body}</table><div class="foot">${esc(footer || "")}</div><div class="grain"></div></div>`
  );
}

// Sensor line chart with an annotated point.
function chart({ title, subtitle, unit, points, yMin, yMax, markIndex, markLabel, xLabels, alarmLine }) {
  const width = 960;
  const height = 560;
  const left = 80;
  const top = 110;
  const plotW = 820;
  const plotH = 340;
  const x = (index) => left + (index / (points.length - 1)) * plotW;
  const y = (value) => top + plotH - ((value - yMin) / (yMax - yMin)) * plotH;
  const path = points.map((value, index) => `${index ? "L" : "M"}${x(index).toFixed(1)},${y(value).toFixed(1)}`).join(" ");
  const grid = Array.from({ length: 5 }, (_, i) => {
    const value = yMin + ((yMax - yMin) * i) / 4;
    return `<line x1="${left}" x2="${left + plotW}" y1="${y(value)}" y2="${y(value)}" stroke="#2b3a33" />
      <text x="${left - 12}" y="${y(value) + 4}" text-anchor="end">${value.toFixed(1)}${esc(unit)}</text>`;
  }).join("");
  const labels = xLabels
    .map((label, i) => `<text x="${left + (i / (xLabels.length - 1)) * plotW}" y="${top + plotH + 28}" text-anchor="middle">${esc(label)}</text>`)
    .join("");
  const alarm = alarmLine
    ? `<line x1="${left}" x2="${left + plotW}" y1="${y(alarmLine)}" y2="${y(alarmLine)}" stroke="#c0503c" stroke-dasharray="6 6"/><text x="${left + plotW}" y="${y(alarmLine) - 8}" text-anchor="end" fill="#e07a63">alarm eşiği ${alarmLine}${esc(unit)}</text>`
    : "";
  const mark = `<circle cx="${x(markIndex)}" cy="${y(points[markIndex])}" r="9" fill="none" stroke="#f0c040" stroke-width="3"/>
    <text x="${x(markIndex) + 14}" y="${y(points[markIndex]) - 14}" fill="#f0c040">${esc(markLabel)}</text>`;
  return base(
    width,
    height,
    `.screen{position:absolute;inset:24px;background:#0d1512;border:2px solid #24332c;border-radius:10px;color:#9fd8b8;font-family:Menlo,monospace}
     .hd{position:absolute;left:56px;top:30px}.hd b{font-size:20px;color:#c8f2da}.hd span{display:block;font-size:13px;opacity:.7;margin-top:4px}
     svg{position:absolute;inset:0}text{fill:#7fae96;font-size:13px;font-family:Menlo,monospace}`,
    `<div class="screen"><div class="hd"><b>${esc(title)}</b><span>${esc(subtitle)}</span></div>
     <svg width="${width - 48}" height="${height - 48}" viewBox="24 24 ${width - 48} ${height - 48}">${grid}${labels}${alarm}
     <path d="${path}" fill="none" stroke="#5fe0a0" stroke-width="3"/>${mark}</svg><div class="grain"></div></div>`
  );
}

// Security camera still: dark scene drawn with simple shapes, timestamp overlay.
function cctv({ camera, timestamp, caption, scene }) {
  return base(
    960,
    600,
    `.frame{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 60%,#4a4e47 0%,#22241f 60%,#0c0d0b 100%);filter:grayscale(1) contrast(1.15)}
     .osd{position:absolute;color:#e8e8e8;font-family:Menlo,monospace;font-size:20px;text-shadow:0 0 4px #000}
     .tl{left:24px;top:20px}.tr{right:24px;top:20px}.bl{left:24px;bottom:20px;font-size:16px;max-width:80%}
     .rec{display:inline-block;width:12px;height:12px;border-radius:50%;background:#e33;margin-right:8px}
     .scan{position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(0,0,0,.25) 0 2px,transparent 2px 4px)}
     svg{position:absolute;inset:0}`,
    `<div class="frame"><svg width="960" height="600">${scene}</svg></div><div class="scan"></div><div class="grain" style="opacity:.4"></div>
     <div class="osd tl"><span class="rec"></span>${esc(camera)}</div><div class="osd tr">${esc(timestamp)}</div><div class="osd bl">${esc(caption)}</div>`,
    "#000"
  );
}

// Architectural floor plan on blueprint paper. rooms: [{x,y,w,h,label,mark?}], extras: raw svg.
function floorplan({ title, rooms, extras = "", legend = [] }) {
  const roomSvg = rooms
    .map(
      (room) => `<rect x="${room.x}" y="${room.y}" width="${room.w}" height="${room.h}" fill="${room.mark ? "rgba(240,192,64,.18)" : "none"}" stroke="#dfe9f5" stroke-width="3"/>
      <text x="${room.x + room.w / 2}" y="${room.y + room.h / 2}" text-anchor="middle" dominant-baseline="middle">${esc(room.label)}</text>`
    )
    .join("");
  const legendHtml = legend.map((item) => `<li>${esc(item)}</li>`).join("");
  return base(
    1000,
    680,
    `.bp{position:absolute;inset:0;background:#1d3b63;background-image:linear-gradient(#2a4c78 1px,transparent 1px),linear-gradient(90deg,#2a4c78 1px,transparent 1px);background-size:25px 25px}
     .t{position:absolute;left:32px;top:24px;color:#e6eef8;font:600 22px Menlo,monospace;letter-spacing:.06em}
     svg{position:absolute;left:0;top:0}text{fill:#e6eef8;font:14px Menlo,monospace}
     ul{position:absolute;right:28px;bottom:24px;list-style:none;color:#cfdced;font:13px Menlo,monospace;background:rgba(10,25,45,.6);padding:10px 14px;border:1px solid #6f8db3}li{margin:3px 0}`,
    `<div class="bp"></div><div class="t">${esc(title)}</div><svg width="1000" height="680">${roomSvg}${extras}</svg><ul>${legendHtml}</ul><div class="grain"></div>`
  );
}

// Phone lock screen with notifications.
function lockscreen({ time, date, notifications }) {
  const cards = notifications
    .map(
      (n) => `<div class="n"><div class="a"><span class="ic" style="background:${n.color || "#555"}">${esc(n.app[0])}</span>${esc(n.app)}<em>${esc(n.when)}</em></div><b>${esc(n.title)}</b><p>${esc(n.body)}</p></div>`
    )
    .join("");
  return base(
    520,
    900,
    `.ph{position:absolute;left:40px;top:30px;width:440px;height:840px;border-radius:56px;background:#111;padding:14px;box-shadow:0 20px 50px rgba(0,0,0,.6);transform:rotate(-2deg)}
     .sc{width:100%;height:100%;border-radius:44px;background:linear-gradient(160deg,#3c4a6b,#1b2033 60%,#0d0f18);position:relative;overflow:hidden;color:#fff}
     .tm{text-align:center;margin-top:90px;font-size:84px;font-weight:300;letter-spacing:-2px}.dt{text-align:center;font-size:18px;opacity:.85}
     .ns{position:absolute;left:14px;right:14px;top:300px}.n{background:rgba(255,255,255,.16);backdrop-filter:blur(8px);border-radius:20px;padding:14px 16px;margin-bottom:10px}
     .a{font-size:13px;opacity:.8;display:flex;align-items:center;gap:8px;margin-bottom:4px}.a em{margin-left:auto;font-style:normal}
     .ic{width:20px;height:20px;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:700}
     b{font-size:16px}p{font-size:15px;margin-top:2px;line-height:1.3}
     .crack{position:absolute;inset:0;background:linear-gradient(115deg,transparent 48%,rgba(255,255,255,.35) 48.4%,transparent 49%),linear-gradient(35deg,transparent 70%,rgba(255,255,255,.25) 70.3%,transparent 70.8%)}`,
    `<div class="ph"><div class="sc"><div class="tm">${esc(time)}</div><div class="dt">${esc(date)}</div><div class="ns">${cards}</div><div class="crack"></div></div></div>`
  );
}

// Official letter / form on paper with letterhead, fields and stamps.
function document({ org, docTitle, ref, date, paragraphs = [], fields = [], table, signatures = [], stamp, stampColor = "#9a2f25", note }) {
  const fieldRows = fields.map(([label, value]) => `<tr><th>${esc(label)}</th><td>${esc(value)}</td></tr>`).join("");
  const tableHtml = table
    ? `<table class="grid"><tr>${table.columns.map((c) => `<th>${esc(c)}</th>`).join("")}</tr>${table.rows
        .map((row, index) => `<tr class="${(table.highlight || []).includes(index) ? "hl" : ""}">${row.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`)
        .join("")}</table>`
    : "";
  const sigs = signatures
    .map((s) => `<div class="sig"><div class="line">${s.signed ? `<span class="hand">${esc(s.signed)}</span>` : ""}</div><small>${esc(s.label)}</small></div>`)
    .join("");
  return base(
    900,
    null,
    `body{padding:30px 50px 40px}.pg{position:relative;min-height:${note ? 520 : 380}px;padding-bottom:${note ? 150 : 60}px;background:#f7f4ec;color:#222;padding:44px 56px;box-shadow:0 12px 34px rgba(0,0,0,.5);transform:rotate(.5deg);font-family:Georgia,"Times New Roman",serif}
     .org{font:700 15px Arial,sans-serif;letter-spacing:.1em;text-transform:uppercase;border-bottom:2px solid #222;padding-bottom:8px;display:flex;justify-content:space-between}
     .org span{font-weight:400;letter-spacing:0;text-transform:none}
     h1{font-size:22px;margin:22px 0 6px}.ref{font:13px Arial,sans-serif;color:#555;margin-bottom:18px}
     p{font-size:16px;line-height:1.55;margin-bottom:10px}
     table.f{border-collapse:collapse;margin:8px 0 14px;font-size:15px}table.f th{text-align:left;padding:5px 18px 5px 0;color:#555;font-weight:400}table.f td{padding:5px 0;font-weight:600}
     table.grid{width:100%;border-collapse:collapse;margin:10px 0 16px;font:14px Arial,sans-serif}table.grid th,table.grid td{border:1px solid #888;padding:7px 8px;text-align:left}table.grid th{background:#e6e1d3}
     tr.hl td{background:rgba(214,170,40,.35)}
     .sigs{display:flex;gap:40px;margin-top:26px}.sig{flex:1}.line{height:52px;border-bottom:1px solid #333;position:relative}.sig small{font:12px Arial,sans-serif;color:#555}
     .hand{position:absolute;left:10px;bottom:6px;font:34px "Snell Roundhand","Bradley Hand",cursive;color:#1f3b8a}
     .stamp{position:absolute;right:70px;top:120px;border:4px double ${stampColor};color:${stampColor};font:700 22px Arial,sans-serif;letter-spacing:.12em;padding:8px 16px;transform:rotate(-12deg);opacity:.75;text-transform:uppercase}
     .note{position:absolute;right:60px;bottom:70px;width:230px;background:#fff6a8;padding:14px;font:22px Noteworthy,"Bradley Hand",cursive;color:#2b2bd0;transform:rotate(3deg);box-shadow:0 6px 14px rgba(0,0,0,.25)}`,
    `<div class="pg"><div class="org">${esc(org)}<span>${esc(date)}</span></div><h1>${esc(docTitle)}</h1><div class="ref">${esc(ref)}</div>
     ${paragraphs.map((p) => `<p>${esc(p)}</p>`).join("")}${fieldRows ? `<table class="f">${fieldRows}</table>` : ""}${tableHtml}
     ${sigs ? `<div class="sigs">${sigs}</div>` : ""}${stamp ? `<div class="stamp">${esc(stamp)}</div>` : ""}${note ? `<div class="note">${esc(note)}</div>` : ""}<div class="grain"></div></div>`
  );
}

// Team chat channel screenshot.
function chat({ workspace, channel, messages }) {
  const items = messages
    .map(
      (m) => `<div class="m"><div class="av" style="background:${m.color}">${esc(m.author[0])}</div><div><div class="h"><b>${esc(m.author)}</b><span>${esc(m.time)}</span></div><p>${esc(m.text)}</p></div></div>`
    )
    .join("");
  return base(
    960,
    150 + messages.length * 92,
    `.app{position:absolute;inset:0;display:flex;background:#1a1d21;color:#d1d2d3}
     .side{width:220px;background:#19171d;padding:20px 16px;border-right:1px solid #2c2d30}.side b{color:#fff;font-size:17px}.side p{margin-top:20px;font-size:14px;opacity:.7}.side .on{opacity:1;color:#fff;background:#1164a3;border-radius:6px;padding:4px 8px;margin-left:-8px}
     .main{flex:1}.top{height:56px;border-bottom:1px solid #2c2d30;display:flex;align-items:center;padding:0 20px;font-weight:700;color:#fff;font-size:17px}
     .m{display:flex;gap:12px;padding:12px 20px}.av{width:38px;height:38px;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;flex-shrink:0}
     .h b{color:#fff;font-size:15px}.h span{font-size:12px;opacity:.6;margin-left:8px}p{font-size:15px;line-height:1.45;margin-top:2px}`,
    `<div class="app"><div class="side"><b>${esc(workspace)}</b><p># genel</p><p class="on">${esc(channel)}</p><p># veri-ekibi</p><p># satın-alma</p></div><div class="main"><div class="top">${esc(channel)}</div>${items}</div></div>`
  );
}

// Presentation slide photographed from the audience.
function slide({ brand, heading, items, footer }) {
  const cards = items.map((item) => `<div class="c"><b>${esc(item[0])}</b><span>${esc(item[1])}</span></div>`).join("");
  return base(
    1000,
    640,
    `.room{position:absolute;inset:0;background:#0b0b0d}
     .s{position:absolute;left:70px;top:46px;width:860px;height:500px;background:#f5f7fb;color:#1a2140;padding:34px 40px;transform:perspective(1200px) rotateY(-7deg) rotateX(2deg);box-shadow:0 0 80px rgba(120,150,255,.25)}
     .br{font:700 14px Arial;letter-spacing:.12em;color:#5b4cdb}h1{font:700 30px Arial;margin:10px 0 22px}
     .g{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.c{background:#e8ebff;border-radius:10px;padding:14px;min-height:96px}.c b{display:block;font:700 16px Arial}.c span{font:13px Arial;color:#4a5170;display:block;margin-top:6px}
     .ft{position:absolute;bottom:20px;left:40px;font:12px Arial;color:#7a809a}
     .heads{position:absolute;left:0;right:0;bottom:-30px;height:160px;background:radial-gradient(ellipse 90px 70px at 12% 100%,#000 98%,transparent),radial-gradient(ellipse 80px 64px at 35% 100%,#050505 98%,transparent),radial-gradient(ellipse 96px 74px at 62% 100%,#000 98%,transparent),radial-gradient(ellipse 84px 66px at 88% 100%,#030303 98%,transparent)}`,
    `<div class="room"></div><div class="s"><div class="br">${esc(brand)}</div><h1>${esc(heading)}</h1><div class="g">${cards}</div><div class="ft">${esc(footer)}</div></div><div class="heads"></div><div class="grain" style="opacity:.3"></div>`,
    "#000"
  );
}

// Email client view with several messages.
function email({ mails }) {
  const items = mails
    .map(
      (m) => `<div class="mail"><div class="h"><b>${esc(m.subject)}</b><span>${esc(m.date)}</span></div><div class="meta">Kimden: ${esc(m.from)} · Kime: ${esc(m.to)}</div><p>${esc(m.body)}</p></div>`
    )
    .join("");
  return base(
    940,
    140 + mails.length * 190,
    `.w{position:absolute;inset:20px;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.4)}
     .bar{height:44px;background:#eef1f5;border-bottom:1px solid #d9dee5;display:flex;align-items:center;padding:0 16px;gap:8px}.bar i{width:12px;height:12px;border-radius:50%;background:#e0605a}.bar i+i{background:#e8b84a}.bar i+i+i{background:#5cc06a}
     .mail{padding:20px 26px;border-bottom:1px solid #e6e9ee;color:#222}.h{display:flex;justify-content:space-between}.h b{font-size:17px}.h span{font-size:13px;color:#777}
     .meta{font-size:13px;color:#666;margin:6px 0 10px}p{font-size:15px;line-height:1.5}`,
    `<div class="w"><div class="bar"><i></i><i></i><i></i></div>${items}</div>`
  );
}

// Handwritten note: sticky note or torn notebook page.
function note({ lines, style = "sticky", pin = true }) {
  const sticky = style === "sticky";
  return base(
    720,
    sticky ? 620 : 760,
    `.n{position:absolute;left:90px;top:70px;width:540px;${sticky ? "height:470px;background:#fff3a1" : "height:620px;background:#fbfaf4;background-image:repeating-linear-gradient(#fbfaf4 0 38px,#9fb8d8 38px 39px)"};padding:${sticky ? "46px 40px" : "62px 44px"};transform:rotate(${sticky ? -3 : 2}deg);box-shadow:0 14px 30px rgba(0,0,0,.45)}
     p{font:30px/${sticky ? "1.55" : "39px"} Noteworthy,"Bradley Hand","Marker Felt",cursive;color:${sticky ? "#2a2a2a" : "#1d2e86"};min-height:${sticky ? "0" : "39px"}}
     .pin{position:absolute;left:50%;top:-14px;width:28px;height:28px;margin-left:-14px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#ff8a7a,#b3261e);box-shadow:0 4px 6px rgba(0,0,0,.4)}
     .tape{position:absolute;left:38%;top:-16px;width:120px;height:34px;background:rgba(240,235,210,.7);transform:rotate(-4deg)}`,
    `<div class="n">${pin ? (sticky ? '<div class="pin"></div>' : '<div class="tape"></div>') : ""}${lines.map((l) => `<p>${esc(l)}</p>`).join("")}<div class="grain"></div></div>`
  );
}

module.exports = { printout, chart, cctv, floorplan, lockscreen, document, chat, slide, email, note };
