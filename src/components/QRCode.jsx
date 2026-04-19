export default function QRCode({ size = 180, value }) {
  const modules = 21;
  const grid = [];
  const hash = s => { let h = 0; for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0; return h; };
  for (let r = 0; r < modules; r++) {
    grid[r] = [];
    for (let c = 0; c < modules; c++) {
      const finderVal = (rr, cc) => {
        for (const [br, bc] of [[0,0],[0,modules-7],[modules-7,0]]) {
          const lr = rr-br, lc = cc-bc;
          if (lr>=0&&lr<=6&&lc>=0&&lc<=6) {
            if (lr===0||lr===6||lc===0||lc===6) return 1;
            if (lr>=2&&lr<=4&&lc>=2&&lc<=4) return 1;
            return 0;
          }
        }
        return -1;
      };
      const fv = finderVal(r, c);
      if (fv !== -1) { grid[r][c] = fv; continue; }
      if (r === 6 || c === 6) { grid[r][c] = (r+c)%2===0 ? 1 : 0; continue; }
      const seed = hash(`${value}${r}${c}${r*modules+c}`);
      grid[r][c] = (seed >>> 0) % 3 === 0 ? 1 : 0;
    }
  }
  const cell = size / modules;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
      <rect width={size} height={size} fill="#fff"/>
      {grid.map((row, r) => row.map((v, c) =>
        v ? <rect key={`${r}-${c}`} x={c*cell+.5} y={r*cell+.5} width={cell-1} height={cell-1} rx={cell*.18} fill="#0f172a"/> : null
      ))}
    </svg>
  );
}
