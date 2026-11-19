import { cn } from "@/lib/cn";

/*
 * Kathmandu valley illustration for the green hero: Himalaya, hills, the city with
 * Dharahara, Boudhanath and Nyatapola, and a collection truck on the ring road.
 * Drawn only in white/black tints so it sits on the accent green in light and dark mode.
 *
 * The viewBox is 1600x1000 and scaled with "slice", anchored to the bottom. The landmarks
 * and the truck sit between x 560 and 1300, the part that stays visible from a phone-width
 * band up to a full desktop panel.
 */

type Pt = [number, number];

/** Small deterministic random generator, so the server and browser draw the same city. */
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const d = (pts: Pt[]) => "M" + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L") + "Z";

/* Himalaya ridge line (left to right). */
const RIDGE: Pt[] = [
  [0, 560], [90, 500], [150, 525], [240, 430], [300, 470], [380, 400], [450, 455], [520, 420], [600, 480],
  [680, 440], [760, 360], [830, 420], [900, 395], [980, 450], [1060, 410], [1140, 330], [1210, 400],
  [1290, 370], [1370, 430], [1450, 390], [1530, 440], [1600, 410],
];
const MOUNTAINS = d([...RIDGE, [1600, 1000], [0, 1000]]);

/** Snow on the higher peaks: follow both slopes down `depth`, with a ragged lower edge. */
const SNOW = RIDGE.map((p, i) => {
  if (i === 0 || i === RIDGE.length - 1 || p[1] > 440) return null;
  const depth = Math.max(26, (450 - p[1]) * 0.55);
  const l = lerp(p, RIDGE[i - 1], depth / (RIDGE[i - 1][1] - p[1]));
  const r = lerp(p, RIDGE[i + 1], depth / (RIDGE[i + 1][1] - p[1]));
  const jag: Pt[] = [];
  for (let k = 1; k < 6; k++) {
    const q = lerp(r, l, k / 6);
    jag.push([q[0], q[1] + (k % 2 ? 9 : -4)]);
  }
  return d([p, r, ...jag, l]);
}).filter((x): x is string => !!x);

/* Brick houses of the old city, with a few lit windows. */
const HOUSES: { x: number; w: number; h: number }[] = [];
const WINDOWS: Pt[] = [];
{
  const rand = rng(17);
  for (let x = -10; x < 1610; ) {
    const w = 26 + rand() * 34;
    const h = 28 + rand() * 62;
    HOUSES.push({ x, w, h });
    for (let wy = 770 - h + 10; wy < 760; wy += 16) {
      for (let wx = x + 7; wx < x + w - 10; wx += 13) if (rand() < 0.35) WINDOWS.push([wx, wy]);
    }
    x += w + rand() * 6;
  }
}

/* Prayer flags strung from the stupa's spire to the ground. */
const FLAG_COLOURS = ["#4f8cff", "#ffffff", "#ff6b6b", "#3ddc84", "#ffd54a"];
function flagLine(from: Pt, to: Pt, sag: number, n: number) {
  const ctrl: Pt = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2 + sag];
  const at = (t: number): Pt => [
    (1 - t) ** 2 * from[0] + 2 * (1 - t) * t * ctrl[0] + t ** 2 * to[0],
    (1 - t) ** 2 * from[1] + 2 * (1 - t) * t * ctrl[1] + t ** 2 * to[1],
  ];
  const flags = Array.from({ length: n }, (_, i) => {
    const [x, y] = at((i + 0.5) / n);
    return { path: d([[x - 4.5, y], [x + 4.5, y], [x, y + 10]]), colour: FLAG_COLOURS[i % FLAG_COLOURS.length] };
  });
  return { line: `M${from[0]} ${from[1]}Q${ctrl[0]} ${ctrl[1]} ${to[0]} ${to[1]}`, flags };
}
const STUPA_X = 960;
const FLAGS = [
  flagLine([STUPA_X, 566], [820, 770], 40, 14),
  flagLine([STUPA_X, 566], [1100, 770], 40, 14),
  flagLine([STUPA_X, 590], [760, 775], 50, 18),
  flagLine([STUPA_X, 590], [1160, 775], 50, 18),
];

/* Nyatapola: five-step plinth and a five-roofed pagoda. */
const NYATAPOLA_X = 1240;
const PLINTH = [118, 98, 80, 64, 50].map((w, i) => ({ x: NYATAPOLA_X - w / 2, y: 770 - (i + 1) * 10, w }));
const ROOFS = [92, 76, 62, 50, 40].map((w, i) => {
  const y = 712 - i * 19;
  return d([[NYATAPOLA_X - w / 2, y], [NYATAPOLA_X + w / 2, y], [NYATAPOLA_X + w * 0.28, y - 11], [NYATAPOLA_X - w * 0.28, y - 11]]);
});

export function ValleyScene({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1600 1000"
      preserveAspectRatio="xMidYMax slice"
      className={cn("pointer-events-none", className)}
      aria-hidden
    >
      {/* Sky: sun, clouds and birds */}
      <circle cx="1230" cy="290" r="150" fill="#fff" opacity="0.06" />
      <circle cx="1230" cy="290" r="78" fill="#fff" opacity="0.16" />
      <g fill="#fff" opacity="0.1">
        <path d="M230 250a34 34 0 0 1 64-14a26 26 0 0 1 40 22H206a24 24 0 0 1 24-8z" />
        <path d="M1380 170a40 40 0 0 1 76-16a30 30 0 0 1 46 26h-150a28 28 0 0 1 28-10z" />
        <path d="M640 200a26 26 0 0 1 50-10a20 20 0 0 1 30 18h-98a18 18 0 0 1 18-8z" />
      </g>
      <g fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.45">
        <path d="M1040 230q9-9 18 0q9-9 18 0" />
        <path d="M1088 262q7-7 14 0q7-7 14 0" />
        <path d="M1006 276q6-6 12 0q6-6 12 0" />
      </g>

      {/* Himalaya */}
      <path d={MOUNTAINS} fill="#fff" opacity="0.13" />
      <g fill="#fff" opacity="0.32">
        {SNOW.map((s, i) => (
          <path key={i} d={s} />
        ))}
      </g>

      {/* Valley hills */}
      <path d="M0 650C200 600 360 630 520 612S860 570 1040 610S1380 590 1600 620V1000H0Z" fill="#fff" opacity="0.08" />
      <path d="M0 720C240 690 420 705 640 700S1100 680 1320 698S1500 700 1600 690V1000H0Z" fill="#000" opacity="0.05" />

      {/* Old city */}
      <g fill="#000" opacity="0.08">
        {HOUSES.map((h, i) => (
          <rect key={i} x={h.x} y={770 - h.h} width={h.w} height={h.h + 40} />
        ))}
      </g>
      <g fill="#fff" opacity="0.16">
        {WINDOWS.map(([x, y], i) => (
          <rect key={i} x={x} y={y} width="5" height="7" rx="1" />
        ))}
      </g>

      {/* Landmarks */}
      <g fill="#000" opacity="0.14">
        {/* Dharahara */}
        <path d="M585 772L590 636H610L615 772Z" />
        <rect x="580" y="626" width="40" height="10" rx="2" />
        <path d="M592 626L594 598H606L608 626Z" />
        <path d="M592 598Q600 570 608 598Z" />
        <rect x="599" y="560" width="2" height="22" />

        {/* Boudhanath */}
        <rect x={STUPA_X - 120} y="752" width="240" height="20" />
        <rect x={STUPA_X - 100} y="734" width="200" height="18" />
        <rect x={STUPA_X - 80} y="718" width="160" height="16" />
        <path d={`M${STUPA_X - 70} 718A70 70 0 0 1 ${STUPA_X + 70} 718Z`} />
        <rect x={STUPA_X - 18} y="630" width="36" height="20" />
        <path d={`M${STUPA_X - 16} 630H${STUPA_X + 16}L${STUPA_X + 5} 566H${STUPA_X - 5}Z`} />
        <path d={`M${STUPA_X - 11} 566H${STUPA_X + 11}L${STUPA_X} 552Z`} />
        <rect x={STUPA_X - 1} y="538" width="2" height="14" />

        {/* Nyatapola */}
        {PLINTH.map((p, i) => (
          <rect key={i} x={p.x} y={p.y} width={p.w} height="10" />
        ))}
        {ROOFS.map((r, i) => (
          <path key={i} d={r} />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={NYATAPOLA_X - 15 + i * 3} y={701 - i * 19} width={30 - i * 6} height="8" />
        ))}
        <path d={`M${NYATAPOLA_X - 6} 625H${NYATAPOLA_X + 6}L${NYATAPOLA_X} 604Z`} />
      </g>

      {/* Buddha eyes and spire rings on the stupa */}
      <g fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.4">
        <path d={`M${STUPA_X - 13} 640q4-4 8 0M${STUPA_X + 5} 640q4-4 8 0`} />
        <path d={`M${STUPA_X - 1} 643q1 4 3 4`} />
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const y = 622 - i * 10;
          const half = 15 - i * 1.7;
          return <path key={i} d={`M${STUPA_X - half} ${y}H${STUPA_X + half}`} strokeWidth="1.2" />;
        })}
      </g>

      {/* Prayer flags */}
      <g fill="none" stroke="#fff" strokeWidth="1" opacity="0.35">
        {FLAGS.map((f, i) => (
          <path key={i} d={f.line} />
        ))}
      </g>
      <g opacity="0.75">
        {FLAGS.flatMap((f, i) => f.flags.map((fl, j) => <path key={`${i}-${j}`} d={fl.path} fill={fl.colour} />))}
      </g>

      {/* Ground and ring road */}
      <path d="M0 772H1600V1000H0Z" fill="#000" opacity="0.1" />
      <path d="M0 800H1600V820H0Z" fill="#000" opacity="0.12" />
      <path d="M0 810H1600" stroke="#fff" strokeWidth="2" strokeDasharray="16 14" opacity="0.3" />

      {/* Collection truck */}
      <g transform="translate(650 742)">
        <rect x="0" y="6" width="104" height="54" rx="8" fill="#fff" opacity="0.94" />
        <path d="M108 22H134L150 40V60H108Z" fill="#fff" opacity="0.94" />
        <path d="M114 28H131L142 41H114Z" fill="#000" opacity="0.22" />
        <rect x="0" y="54" width="150" height="8" rx="3" fill="#000" opacity="0.18" />
        {/* leaf badge */}
        <circle cx="52" cy="32" r="15" fill="var(--ac)" />
        <path d="M45 38c0-10 6-15 15-15c0 10-5 15-15 15zM45 38l8-8" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="30" cy="66" r="11" fill="#000" opacity="0.45" />
        <circle cx="122" cy="66" r="11" fill="#000" opacity="0.45" />
        <circle cx="30" cy="66" r="4" fill="#fff" opacity="0.7" />
        <circle cx="122" cy="66" r="4" fill="#fff" opacity="0.7" />
      </g>

      {/* Foreground hills and trees, framing the corners */}
      <path d="M0 845C160 820 330 830 520 860S760 900 900 1000H0Z" fill="#000" opacity="0.14" />
      <path d="M1600 850C1460 830 1330 840 1200 875S1040 940 980 1000H1600Z" fill="#000" opacity="0.14" />
      <g fill="#000" opacity="0.18">
        <circle cx="120" cy="812" r="34" />
        <circle cx="160" cy="826" r="24" />
        <rect x="117" y="830" width="6" height="40" />
        <circle cx="1470" cy="818" r="30" />
        <circle cx="1510" cy="832" r="20" />
        <rect x="1467" y="834" width="6" height="40" />
        <circle cx="390" cy="836" r="18" />
        <rect x="388" y="846" width="4" height="22" />
      </g>
    </svg>
  );
}
