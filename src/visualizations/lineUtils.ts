export function renderLine(
  ctx: CanvasRenderingContext2D,
  value: readonly { x: number; y: number }[],
  xScale: (v: number) => number,
  yScale: (v: number) => number
) {
  ctx.beginPath();
  let first = true;
  for (const v of value) {
    if (v.y == null || Number.isNaN(v.y)) {
      first = true;
      continue;
    }
    if (first) {
      ctx.moveTo(xScale(v.x), yScale(v.y));
      first = false;
    } else {
      ctx.lineTo(xScale(v.x), yScale(v.y));
    }
  }
  ctx.stroke();
}

export function renderArea(
  ctx: CanvasRenderingContext2D,
  value: readonly { x: number; y: number }[],
  xScale: (v: number) => number,
  yScale: (v: number) => number,
  height: number
) {
  ctx.beginPath();
  let firstIndex: number | null = null;
  let lastIndex: number | null = null;
  for (const v of value) {
    if (v.y == null || Number.isNaN(v.y)) {
      if (lastIndex != null) {
        ctx.lineTo(xScale(lastIndex), height);
        ctx.lineTo(xScale(firstIndex!), height);
      }
      lastIndex = null;
      firstIndex = null;
      continue;
    }
    lastIndex = v.x;
    if (firstIndex == null) {
      ctx.moveTo(xScale(v.x), height);
      ctx.lineTo(xScale(v.x), yScale(v.y));
      firstIndex = v.x;
    } else {
      ctx.lineTo(xScale(v.x), yScale(v.y));
    }
  }
  if (lastIndex != null) {
    ctx.lineTo(xScale(lastIndex), height);
    ctx.lineTo(xScale(firstIndex!), height);
  }
  ctx.fill();
}
