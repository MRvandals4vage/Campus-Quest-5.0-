export interface PastEvent {
  id: string;
  title: string;
  /** Path to the polaroid artwork (already has the photo + caption baked in) */
  image: string;
  /** Natural aspect ratio of the polaroid image, width / height */
  aspect: number;
  /** Resting position & rotation on the rooftop scene, in % of the scene box */
  left: number;
  top: number;
  width: number;
  rotate: number;
  expandedRotate: number;
  clipX: number;
  clipY: number;
  clipWidth: number;
  clipHeight: number;
  clipRotate: number;
}

// Positions are read directly off the target mockup (measured against a
// 2162x1226 reference render, expressed here as % so it stays responsive).
export const pastEvents: PastEvent[] = [
  {
    id: 'campus-quest',
    title: 'Campus Quest 4.0',
    image: '/assets/Past events/Polaroid 1.svg',
    aspect: 257 / 291,
    left: 14.5,
    top: 6,
    width: 12,
    rotate: -2,
    expandedRotate: -12,
    clipX: 8,
    clipY: -13,
    clipWidth: 5,
    clipHeight: 5.2,
    clipRotate: 3,
  },
  {
    id: 'cad-4',
    title: 'CAD 4.0',
    image: '/assets/Past events/Polaroid 2.svg',
    aspect: 172 / 199,
    left: 48,
    top: 20,
    width: 8,
    rotate: 5,
    expandedRotate: -9,
    clipX: 2,
    clipY: -19,
    clipWidth: 4,
    clipHeight: 4,
    clipRotate: 1,
  },
  {
    id: 'cad-3',
    title: 'CaD 3.0',
    image: '/assets/Past events/Polaroid 3.svg',
    aspect: 196 / 225,
    left: 80,
    top: 9,
    width: 9,
    rotate: -3,
    expandedRotate: 10,
    clipX: -11,
    clipY: -14,
    clipWidth: 4,
    clipHeight: 4,
    clipRotate: -30,
  },
];
