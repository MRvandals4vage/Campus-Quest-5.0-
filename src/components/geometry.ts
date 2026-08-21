export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function rectFromDom(rect: DOMRect): Rect {
  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  };
}

export function getContainRect(
  containerW: number,
  containerH: number,
  aspect: number,
  paddingPct: number
): Rect {
  const padPx = Math.min(containerW, containerH) * paddingPct;
  const availW = containerW - padPx * 2;
  const availH = containerH - padPx * 2;

  let width = availW;
  let height = width / aspect;

  if (height > availH) {
    height = availH;
    width = height * aspect;
  }

  return {
    left: (containerW - width) / 2,
    top: (containerH - height) / 2,
    width,
    height,
  };
}
