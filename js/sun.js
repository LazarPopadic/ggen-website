/* ============================================================
   GGEN — dekorativno sunce / decorative scroll-sun
   A small spinning sun rides a faint flowy line down each page,
   advancing along the line as the visitor scrolls.
   Pure decoration: no pointer events, hidden for reduced motion.
   ============================================================ */
(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const NS = "http://www.w3.org/2000/svg";

  /* ---------- build the layer ---------- */
  const layer = document.createElement("div");
  layer.className = "sun-layer";
  layer.setAttribute("aria-hidden", "true");

  const svg = document.createElementNS(NS, "svg");
  const line = document.createElementNS(NS, "path");
  line.setAttribute("class", "sun-line");

  const orb = document.createElementNS(NS, "g");
  orb.setAttribute("class", "sun-orb");
  const spin = document.createElementNS(NS, "g");
  spin.setAttribute("class", "sun-spin");

  const glow = document.createElementNS(NS, "circle");
  glow.setAttribute("r", "17");
  glow.setAttribute("fill", "#f2b705");
  glow.setAttribute("opacity", "0.16");
  const disc = document.createElementNS(NS, "circle");
  disc.setAttribute("r", "8");
  disc.setAttribute("fill", "#f2b705");
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const ray = document.createElementNS(NS, "line");
    ray.setAttribute("x1", (Math.cos(a) * 11.5).toFixed(2));
    ray.setAttribute("y1", (Math.sin(a) * 11.5).toFixed(2));
    ray.setAttribute("x2", (Math.cos(a) * 15.5).toFixed(2));
    ray.setAttribute("y2", (Math.sin(a) * 15.5).toFixed(2));
    ray.setAttribute("stroke", "#f2b705");
    ray.setAttribute("stroke-width", "2.2");
    ray.setAttribute("stroke-linecap", "round");
    spin.appendChild(ray);
  }
  spin.appendChild(disc);
  orb.appendChild(glow);
  orb.appendChild(spin);
  svg.appendChild(line);
  svg.appendChild(orb);
  layer.appendChild(svg);
  document.body.appendChild(layer);

  /* ---------- flowy path down the whole page ---------- */
  let topY = 0, botY = 0, scale = 1, docH = 0;

  function build() {
    layer.style.height = "0px"; // measure the document without this layer
    const newDocH = document.documentElement.scrollHeight;
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    docH = newDocH;
    layer.style.height = docH + "px";
    svg.setAttribute("viewBox", "0 0 " + vw + " " + docH);

    scale = vw < 640 ? 0.72 : 1;
    topY = vh * 0.78;             // start below the hero headline
    botY = docH - vh * 0.45;      // settle before the footer ends
    if (botY < topY + vh * 0.5) botY = topY + vh * 0.5;

    // waypoints swinging gently from side to side
    const pts = [];
    const step = vh * 1.3;
    let side = 1;
    for (let y = topY; y < botY; y += step, side = -side) {
      const swing = 0.34 + 0.05 * Math.sin(y * 0.004); // slight irregularity
      pts.push([vw * (0.5 + side * swing), y]);
    }
    pts.push([vw * (0.5 + side * 0.3), botY]);

    // smooth S-curves with vertical tangents
    let d = "M " + pts[0][0].toFixed(1) + " " + pts[0][1].toFixed(1);
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      const dy = ((y1 - y0) * 0.5).toFixed(1);
      d += " C " + x0.toFixed(1) + " " + (y0 + +dy).toFixed(1) +
           ", " + x1.toFixed(1) + " " + (y1 - +dy).toFixed(1) +
           ", " + x1.toFixed(1) + " " + y1.toFixed(1);
    }
    line.setAttribute("d", d);
  }

  // the path only ever moves downward, so we can binary-search by height
  function pointAtY(yTarget) {
    const total = line.getTotalLength();
    let lo = 0, hi = total;
    for (let i = 0; i < 18; i++) {
      const mid = (lo + hi) / 2;
      if (line.getPointAtLength(mid).y < yTarget) lo = mid; else hi = mid;
    }
    return line.getPointAtLength((lo + hi) / 2);
  }

  /* ---------- glide with the scroll ---------- */
  let curY = null;

  function frame() {
    const vh = window.innerHeight;
    const target = Math.min(Math.max(window.scrollY + vh * 0.45, topY), botY);
    if (curY === null) curY = target;
    curY += (target - curY) * 0.09; // gentle ease toward the scroll position
    const p = pointAtY(curY);
    orb.setAttribute("transform",
      "translate(" + p.x.toFixed(1) + " " + p.y.toFixed(1) + ") scale(" + scale + ")");
    requestAnimationFrame(frame);
  }

  /* ---------- react to layout/content size changes ---------- */
  let roQueued = false;
  const ro = new ResizeObserver(() => {
    if (roQueued) return;
    roQueued = true;
    requestAnimationFrame(() => {
      roQueued = false;
      layer.style.height = "0px";
      const h = document.documentElement.scrollHeight;
      layer.style.height = docH + "px";
      if (Math.abs(h - docH) > 2) build();
    });
  });

  build();
  ro.observe(document.body);
  window.addEventListener("resize", build);
  requestAnimationFrame(frame);
})();
