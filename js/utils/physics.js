// ── Lightweight physics engine ──

export class Vec2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  add(v) { return new Vec2(this.x + v.x, this.y + v.y); }
  sub(v) { return new Vec2(this.x - v.x, this.y - v.y); }
  scale(s) { return new Vec2(this.x * s, this.y * s); }
  magnitude() { return Math.sqrt(this.x * this.x + this.y * this.y); }

  normalize() {
    const m = this.magnitude();
    return m > 0 ? this.scale(1 / m) : new Vec2(0, 0);
  }

  dot(v) { return this.x * v.x + this.y * v.y; }

  static distance(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

// Particle: { x, y, vx, vy, ax, ay, radius, mass, restitution }

export function applyGravity(p, gravity = 800, dt) {
  p.vy += gravity * dt;
}

export function applyFriction(p, friction = 0.999) {
  p.vx *= friction;
  p.vy *= friction;
}

export function eulerStep(p, dt) {
  p.vx += (p.ax || 0) * dt;
  p.vy += (p.ay || 0) * dt;
  p.x += p.vx * dt;
  p.y += p.vy * dt;
}

export function bounceOffWalls(p, bounds, restitution = 0.8) {
  const r = p.radius || 0;

  if (p.x - r < bounds.left) {
    p.x = bounds.left + r;
    p.vx = Math.abs(p.vx) * restitution;
  } else if (p.x + r > bounds.right) {
    p.x = bounds.right - r;
    p.vx = -Math.abs(p.vx) * restitution;
  }

  if (p.y - r < bounds.top) {
    p.y = bounds.top + r;
    p.vy = Math.abs(p.vy) * restitution;
  } else if (p.y + r > bounds.bottom) {
    p.y = bounds.bottom - r;
    p.vy = -Math.abs(p.vy) * restitution;
  }
}

export function springForce(ax, ay, bx, by, restLength, stiffness = 0.3) {
  const dx = bx - ax;
  const dy = by - ay;
  const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
  const displacement = dist - restLength;
  const force = displacement * stiffness;
  const fx = (dx / dist) * force;
  const fy = (dy / dist) * force;
  return { fx, fy };
}

export function circleCollision(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const minDist = (a.radius || 10) + (b.radius || 10);

  if (dist >= minDist || dist === 0) return false;

  // Normal vector
  const nx = dx / dist;
  const ny = dy / dist;

  // Relative velocity
  const dvx = a.vx - b.vx;
  const dvy = a.vy - b.vy;
  const dvn = dvx * nx + dvy * ny;

  // Don't resolve if separating
  if (dvn < 0) return false;

  const restitution = Math.min(a.restitution || 0.8, b.restitution || 0.8);
  const massA = a.mass || 1;
  const massB = b.mass || 1;
  const impulse = (2 * dvn) / (massA + massB);

  a.vx -= impulse * massB * nx * restitution;
  a.vy -= impulse * massB * ny * restitution;
  b.vx += impulse * massA * nx * restitution;
  b.vy += impulse * massA * ny * restitution;

  // Separate overlapping circles
  const overlap = minDist - dist;
  const sep = overlap / 2 + 0.5;
  a.x -= nx * sep;
  a.y -= ny * sep;
  b.x += nx * sep;
  b.y += ny * sep;

  return true;
}
