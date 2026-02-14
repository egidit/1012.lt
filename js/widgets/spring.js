// ── Spring-Connected Nodes ──
import { setupCanvas, registerAnimCallback } from '../app.js';
import { onInteract } from '../utils/touch.js';
import { springForce, applyFriction, eulerStep } from '../utils/physics.js';
import { TAU, distance, randomRange, clamp } from '../utils/math.js';

export function initSprings(containerId, pageIndex) {
  const container = document.getElementById(containerId);
  const canvas = document.createElement('canvas');
  container.appendChild(canvas);

  let { ctx, width, height } = setupCanvas(canvas);

  const nodeCount = 7;
  const nodes = [];
  const connections = [];
  let dragNode = null;
  const damping = 0.93;
  const stiffness = 0.15;
  const nodeRadius = 14;

  function createNetwork() {
    nodes.length = 0;
    connections.length = 0;

    // Create nodes in a rough circle
    for (let i = 0; i < nodeCount; i++) {
      const angle = (TAU / nodeCount) * i;
      const r = Math.min(width, height) * 0.25;
      nodes.push({
        x: width / 2 + Math.cos(angle) * r + randomRange(-20, 20),
        y: height / 2 + Math.sin(angle) * r + randomRange(-20, 20),
        vx: 0,
        vy: 0,
        radius: nodeRadius,
        pinned: false,
      });
    }

    // Connect each node to its neighbors and a few cross-links
    for (let i = 0; i < nodeCount; i++) {
      const next = (i + 1) % nodeCount;
      const across = (i + Math.floor(nodeCount / 2)) % nodeCount;
      connections.push({ a: i, b: next, restLength: distance(nodes[i].x, nodes[i].y, nodes[next].x, nodes[next].y) });
      if (i < Math.floor(nodeCount / 2)) {
        connections.push({ a: i, b: across, restLength: distance(nodes[i].x, nodes[i].y, nodes[across].x, nodes[across].y) * 0.8 });
      }
    }
  }

  createNetwork();

  onInteract(canvas, {
    onStart(x, y) {
      // Find nearest node
      let minDist = Infinity;
      for (const node of nodes) {
        const d = distance(x, y, node.x, node.y);
        if (d < minDist && d < 40) {
          minDist = d;
          dragNode = node;
        }
      }
    },
    onMove(x, y) {
      if (dragNode) {
        dragNode.x = x;
        dragNode.y = y;
        dragNode.vx = 0;
        dragNode.vy = 0;
      }
    },
    onEnd() {
      dragNode = null;
    },
  });

  registerAnimCallback(pageIndex, (dt) => {
    ctx.clearRect(0, 0, width, height);

    // Apply spring forces
    for (const conn of connections) {
      const a = nodes[conn.a];
      const b = nodes[conn.b];
      const { fx, fy } = springForce(a.x, a.y, b.x, b.y, conn.restLength, stiffness);

      if (a !== dragNode) { a.vx += fx; a.vy += fy; }
      if (b !== dragNode) { b.vx -= fx; b.vy -= fy; }
    }

    // Update nodes
    for (const node of nodes) {
      if (node === dragNode) continue;
      applyFriction(node, damping);
      node.x += node.vx;
      node.y += node.vy;

      // Keep in bounds
      node.x = clamp(node.x, nodeRadius, width - nodeRadius);
      node.y = clamp(node.y, nodeRadius, height - nodeRadius);
    }

    // Draw connections
    for (const conn of connections) {
      const a = nodes[conn.a];
      const b = nodes[conn.b];
      const d = distance(a.x, a.y, b.x, b.y);
      const stretch = Math.abs(d - conn.restLength) / conn.restLength;
      const tension = clamp(stretch, 0, 1);

      // Zigzag spring visualization
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const nx = -dy / len; // perpendicular
      const ny = dx / len;
      const segments = 12;
      const amplitude = 6 * (1 - tension * 0.5);

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      for (let i = 1; i < segments; i++) {
        const t = i / segments;
        const mx = a.x + dx * t;
        const my = a.y + dy * t;
        const side = (i % 2 === 0) ? 1 : -1;
        const zigX = mx + nx * amplitude * side;
        const zigY = my + ny * amplitude * side;
        ctx.lineTo(zigX, zigY);
      }
      ctx.lineTo(b.x, b.y);

      // Color based on tension
      const r = Math.round(124 + tension * 121);
      const g = Math.round(91 - tension * 30);
      const b2 = Math.round(245 - tension * 100);
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b2}, ${0.4 + tension * 0.3})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Draw nodes
    for (const node of nodes) {
      const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
      const glow = clamp(speed / 10, 0, 1);

      // Glow
      if (glow > 0.1) {
        const glowGrad = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, nodeRadius * 2.5
        );
        glowGrad.addColorStop(0, `rgba(124, 91, 245, ${glow * 0.3})`);
        glowGrad.addColorStop(1, 'rgba(124, 91, 245, 0)');
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeRadius * 2.5, 0, TAU);
        ctx.fillStyle = glowGrad;
        ctx.fill();
      }

      // Node
      const grad = ctx.createRadialGradient(
        node.x - 3, node.y - 3, 0,
        node.x, node.y, nodeRadius
      );
      grad.addColorStop(0, `rgba(${124 + glow * 60}, ${91 + glow * 40}, 245, 0.9)`);
      grad.addColorStop(1, `rgba(124, 91, 245, 0.3)`);
      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeRadius, 0, TAU);
      ctx.fillStyle = grad;
      ctx.fill();

      // Highlight if dragging
      if (node === dragNode) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeRadius + 3, 0, TAU);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  });

  window.addEventListener('canvas-resize', () => {
    ({ ctx, width, height } = setupCanvas(canvas));
    createNetwork();
  });
}
