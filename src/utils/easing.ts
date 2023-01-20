export function Linear(p: number) {
  return p;
}
export function InQuadratic(p: number) {
  return p * p;
}
export function InCubic(p: number) {
  return p * p * p;
}
export function InQuartic(p: number) {
  return p * p * p * p;
}
export function InQuintic(p: number) {
  return p * p * p * p * p;
}
export function InSextic(p: number) {
  return p * p * p * p * p * p;
}
export function InSeptic(p: number) {
  return p * p * p * p * p * p * p;
}
export function InOctic(p: number) {
  return p * p * p * p * p * p * p * p;
}

export function OutQuadratic(p: number) {
  const m = p - 1;
  return 1 - m * m;
}
export function OutCubic(p: number) {
  const m = p - 1;
  return 1 + m * m * m;
}
export function OutQuartic(p: number) {
  const m = p - 1;
  return 1 - m * m * m * m;
}
export function OutQuintic(p: number) {
  const m = p - 1;
  return 1 + m * m * m * m * m;
}
export function OutSextic(p: number) {
  const m = p - 1;
  return 1 - m * m * m * m * m * m;
}
export function OutSeptic(p: number) {
  const m = p - 1;
  return 1 + m * m * m * m * m * m * m;
}
export function OutOctic(p: number) {
  const m = p - 1;
  return 1 - m * m * m * m * m * m * m * m;
}

export function InOutQuadratic(p: number) {
  const m = p - 1,
    t = p * 2;
  if (t < 1) return p * t;
  return 1 - m * m * 2;
}
export function InOutCubic(p: number) {
  const m = p - 1,
    t = p * 2;
  if (t < 1) return p * t * t;
  return 1 + m * m * m * 4;
}
export function InOutQuartic(p: number) {
  const m = p - 1,
    t = p * 2;
  if (t < 1) return p * t * t * t;
  return 1 - m * m * m * m * 8;
}
export function InOutQuintic(p: number) {
  const m = p - 1,
    t = p * 2;
  if (t < 1) return p * t * t * t * t;
  return 1 + m * m * m * m * m * 16;
}
export function InOutSextic(p: number) {
  const m = p - 1,
    t = p * 2;
  if (t < 1) return p * t * t * t * t * t;
  return 1 - m * m * m * m * m * m * 32;
}
export function InOutSeptic(p: number) {
  const m = p - 1,
    t = p * 2;
  if (t < 1) return p * t * t * t * t * t * t;
  return 1 + m * m * m * m * m * m * m * 64;
}
export function InOutOctic(p: number) {
  const m = p - 1,
    t = p * 2;
  if (t < 1) return p * t * t * t * t * t * t * t;
  return 1 - m * m * m * m * m * m * m * m * 128;
}

// Standard -- grouped by Type
export function InBack(p: number) {
  const k = 1.70158;
  return p * p * (p * (k + 1) - k);
}
export function InOutBack(p: number) {
  const m = p - 1,
    t = p * 2,
    k = 1.70158 * 1.525;
  if (p < 0.5) return p * t * (t * (k + 1) - k);
  else return 1 + 2 * m * m * (2 * m * (k + 1) + k);
} // NOTE: Can go negative! i.e. p = 0.008
export function OutBack(p: number) {
  const m = p - 1,
    k = 1.70158;
  return 1 + m * m * (m * (k + 1) + k);
}

export function InBounce(p: number) {
  return 1 - OutBounce(1 - p);
}
export function InOutBounce(p: number) {
  const t = p * 2;
  if (t < 1) return 0.5 - 0.5 * OutBounce(1 - t);
  return 0.5 + 0.5 * OutBounce(t - 1);
}
export function OutBounce(p: number) {
  const r = 1 / 2.75;
  const k1 = r;
  const k2 = 2 * r;
  const k3 = 1.5 * r;
  const k4 = 2.5 * r;
  const k5 = 2.25 * r;
  const k6 = 2.625 * r;
  const k0 = 7.5625;
  let t: number;

  if (p < k1) {
    return k0 * p * p;
  } else if (p < k2) {
    t = p - k3;
    return k0 * t * t + 0.75;
  } else if (p < k4) {
    t = p - k5;
    return k0 * t * t + 0.9375;
  } else {
    t = p - k6;
    return k0 * t * t + 0.984375;
  }
}

export function InCircle(p: number) {
  return 1 - Math.sqrt(1 - p * p);
}
export function InOutCircle(p: number) {
  const m = p - 1,
    t = p * 2;
  if (t < 1) return (1 - Math.sqrt(1 - t * t)) * 0.5;
  else return (Math.sqrt(1 - 4 * m * m) + 1) * 0.5;
}
export function OutCircle(p: number) {
  const m = p - 1;
  return Math.sqrt(1 - m * m);
}

export function InElastic(p: number) {
  const m = p - 1;
  return -Math.pow(2, 10 * m) * Math.sin(((m * 40 - 3) * Math.PI) / 6);
}
export function InOutElastic(p: number) {
  const s = 2 * p - 1; // remap: [0,0.5] -> [-1,0]
  const k = ((80 * s - 9) * Math.PI) / 18; // and    [0.5,1] -> [0,+1]

  if (s < 0) return -0.5 * Math.pow(2, 10 * s) * Math.sin(k);
  else return 1 + 0.5 * Math.pow(2, -10 * s) * Math.sin(k);
}
export function OutElastic(p: number) {
  return 1 + Math.pow(2, 10 * -p) * Math.sin(((-p * 40 - 3) * Math.PI) / 6);
}

export function InExponent2(p: number) {
  if (p <= 0) return 0;
  return Math.pow(2, 10 * (p - 1));
}
export function InOutExponent2(p: number) {
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  if (p < 0.5) return Math.pow(2, 10 * (2 * p - 1) - 1);
  else return 1 - Math.pow(2, -10 * (2 * p - 1) - 1);
}
export function OutExponent2(p: number) {
  if (p >= 1) return 1;
  return 1 - Math.pow(2, -10 * p);
}

export function InSine(p: number) {
  return 1 - Math.cos(p * Math.PI * 0.5);
}
export function InOutSine(p: number) {
  return 0.5 * (1 - Math.cos(p * Math.PI));
}
export function OutSine(p: number) {
  return Math.sin(p * Math.PI * 0.5);
}

export function InExponentE(p: number) {
  if (p <= 0) return 0;
  return Math.pow(Math.E, -10 * (1 - p));
}

export function InOutExponentE(p: number) {
  const t = p * 2;
  if (t < 1) return 0.5 - 0.5 * OutExponentE(1 - t);
  return 0.5 + 0.5 * OutExponentE(t - 1);
}
export function OutExponentE(p: number) {
  return 1 - InExponentE(1 - p);
}

export function InLog10(p: number) {
  return 1 - OutLog10(1 - p);
}
export function InOutLog10(p: number) {
  const t = p * 2;
  if (t < 1) return 0.5 - 0.5 * OutLog10(1 - t);
  return 0.5 + 0.5 * OutLog10(t - 1);
}
export function OutLog10(p: number) {
  return Math.log10(p * 9 + 1);
}

export function InSquareRoot(p: number) {
  return 1 - OutSquareRoot(1 - p);
}
export function InOutSquareRoot(p: number) {
  const t = p * 2;
  if (t < 1) return 0.5 - 0.5 * OutSquareRoot(1 - t);
  return 0.5 + 0.5 * OutSquareRoot(t - 1);
}
export function OutSquareRoot(p: number) {
  return Math.sqrt(p);
}
