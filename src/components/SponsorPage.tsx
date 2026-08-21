"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function Sponsors() {
  const cardCrop = {
    position: 'absolute' as const,
    width: '170.716%',
    height: '147.619%',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    objectFit: 'fill' as const,
    maxWidth: 'none',
  };

  const [mobileIdx, setMobileIdx] = useState(1); // 0=Gold, 1=Silver, 2=Bronze

  useEffect(() => {
    // Increased strands to 12 for a denser, more realistic web
    function initWebShooter(cardSelector = '.card', strandsPerCard = 12) { 
      const webLayer = document.getElementById('webLayer');
      if (!webLayer) return;
      const cards = document.querySelectorAll<HTMLElement>(cardSelector);

      function getOrigin(side: string, rect: DOMRect) {
        const vw = window.innerWidth, vh = window.innerHeight;
        // Shoot from BOTTOM RIGHT off-screen
        return { x: vw + 100, y: vh + 100 }; 
      }

      function getAnchors(side: string, rect: DOMRect) {
        const pts = [];
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height * 0.25; 
        
        const spreadWidth = rect.width * 0.8;
        const spreadHeight = rect.height * 0.3;

        for(let i=0; i<strandsPerCard; i++) {
          const fraction = strandsPerCard > 1 ? i / (strandsPerCard - 1) : 0.5;
          const offsetX = (fraction - 0.5) * spreadWidth;
          const offsetY = Math.sin(fraction * Math.PI) * (spreadHeight * 0.5);
          
          pts.push({ 
            x: centerX + offsetX, 
            y: centerY - offsetY + (Math.random() * 20 - 10) 
          });
        }
        return pts;
      }

      function makeStrand(from: {x:number, y:number}, to: {x:number, y:number}) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        const pathOuter = document.createElementNS('http://www.w3.org/2000/svg','path');
        pathOuter.setAttribute('class','web-strand');
        pathOuter.style.strokeWidth = (4 + Math.random() * 2).toString(); // Thicker glow
        pathOuter.style.stroke = 'rgba(255, 255, 255, 0.5)';
        pathOuter.style.filter = 'blur(2px)';
        
        const pathInner = document.createElementNS('http://www.w3.org/2000/svg','path');
        pathInner.setAttribute('class','web-strand');
        pathInner.style.strokeWidth = (1.5 + Math.random()).toString();
        pathInner.style.stroke = '#ffffff';
        pathInner.style.filter = 'drop-shadow(0 0 3px rgba(255,255,255,0.9))';
        
        const d = `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
        
        pathOuter.setAttribute('d', d);
        pathInner.setAttribute('d', d);
        
        const len = Math.hypot(to.x-from.x, to.y-from.y);
        [pathOuter, pathInner].forEach(p => {
          p.style.strokeDasharray = len.toString();
          p.style.strokeDashoffset = len.toString();
          (p as any)._len = len;
        });

        g.appendChild(pathOuter);
        g.appendChild(pathInner);
        webLayer!.appendChild(g);
        
        return { g, pathOuter, pathInner, len };
      }

      function drawConcentricWeb(origin: {x:number, y:number}, anchors: {x:number, y:number}[]) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        // Increased rings for a denser net (6 instead of 4)
        const ringFractions = [0.4, 0.55, 0.7, 0.82, 0.92, 0.98]; 

        const sortedAnchors = [...anchors].sort((a, b) => {
           const angleA = Math.atan2(a.y - origin.y, a.x - origin.x);
           const angleB = Math.atan2(b.y - origin.y, b.x - origin.x);
           return angleA - angleB;
        });

        ringFractions.forEach(frac => {
           const dOuter = [];
           
           for(let i=0; i<sortedAnchors.length - 1; i++) {
               const a = sortedAnchors[i];
               const b = sortedAnchors[i+1];
               
               const ptA = { x: origin.x + (a.x - origin.x)*frac, y: origin.y + (a.y - origin.y)*frac };
               const ptB = { x: origin.x + (b.x - origin.x)*frac, y: origin.y + (b.y - origin.y)*frac };
               
               const midX = (ptA.x + ptB.x)/2;
               const midY = (ptA.y + ptB.y)/2;
               
               const dist = Math.hypot(ptB.x - ptA.x, ptB.y - ptA.y);
               const pull = dist * 0.25; 
               
               const angleToOrigin = Math.atan2(origin.y - midY, origin.x - midX);
               const cpX = midX + Math.cos(angleToOrigin) * pull;
               const cpY = midY + Math.sin(angleToOrigin) * pull;
               
               if(i === 0) dOuter.push(`M ${ptA.x} ${ptA.y}`);
               dOuter.push(`Q ${cpX} ${cpY} ${ptB.x} ${ptB.y}`);
           }
           
           if (dOuter.length > 0) {
               const pathOuter = document.createElementNS('http://www.w3.org/2000/svg','path');
               pathOuter.setAttribute('d', dOuter.join(' '));
               pathOuter.style.fill = 'none';
               pathOuter.style.stroke = 'rgba(255, 255, 255, 0.4)';
               pathOuter.style.strokeWidth = '4';
               pathOuter.style.filter = 'blur(1px)';
               
               const pathInner = document.createElementNS('http://www.w3.org/2000/svg','path');
               pathInner.setAttribute('d', dOuter.join(' '));
               pathInner.style.fill = 'none';
               pathInner.style.stroke = 'rgba(255, 255, 255, 0.9)';
               pathInner.style.strokeWidth = '1.5';
               
               g.appendChild(pathOuter);
               g.appendChild(pathInner);
           }
        });

        g.style.opacity = '0';
        g.style.transition = 'opacity 0.1s ease-out';
        webLayer!.appendChild(g);
        
        return g;
      }

      function animateDash(strandObj: any, dir: 'in' | 'out', duration: number, delay: number, onDone?: () => void) {
        const len = strandObj.len;
        const from = dir === 'out' ? len : 0;
        const to   = dir === 'out' ? 0 : len;
        
        setTimeout(() => {
          const start = performance.now();
          function step(t: number){
            const p = Math.min(1, (t-start)/duration);
            const eased = 1 - Math.pow(1-p, 4);
            const offset = (from + (to-from)*eased).toString();
            
            strandObj.pathOuter.style.strokeDashoffset = offset;
            strandObj.pathInner.style.strokeDashoffset = offset;
            
            if(p < 1) requestAnimationFrame(step);
            else onDone && onDone();
          }
          requestAnimationFrame(step);
        }, delay);
      }

      function pullVector(side: string) {
        const forceX = 70; 
        const forceY = -120; 
        if(side === 'left')  return { x: -forceX, y: forceY, rotateZ: -12, rotateX: 20 };
        if(side === 'right') return { x: forceX,  y: forceY, rotateZ: 12, rotateX: 20 };
        return { x: 0, y: forceY * 1.2, rotateZ: (Math.random() > 0.5 ? 6 : -6), rotateX: 25 }; 
      }

      cards.forEach(card => {
        const controller = new AbortController();
        
        card.addEventListener('click', () => {
          if(card.dataset.busy === '1' || card.classList.contains('done')) return;
          card.dataset.busy = '1';

          const side = card.dataset.side || 'bottom';
          const rect = card.getBoundingClientRect();
          const origin = getOrigin(side, rect);
          const anchors = getAnchors(side, rect);

          const strands = anchors.map(a => makeStrand(origin, a)); 
          const webNet = drawConcentricWeb(origin, anchors);

          let landed = 0;
          strands.forEach((strandObj) => {
            animateDash(strandObj, 'out', 120, 0, () => {
              landed++;
              
              if(landed === strands.length){
                // Web hits instantly
                webNet.style.opacity = '1';
                
                const pv = pullVector(side);
                
                // PERFECT SYNCHRONIZATION: 
                // The very moment the card gets yanked, the web starts reeling back in!
                setTimeout(() => {
                  // Card gets pulled up
                  card.classList.add('pull');
                  card.style.transition = 'transform 0.4s cubic-bezier(0.3, 0.8, 0.2, 1)';
                  card.style.transform = `translate(${pv.x}px, ${pv.y}px) scale(0.9, 1.05) rotateX(${pv.rotateX}deg) rotateZ(${pv.rotateZ}deg)`;

                  // Web simultaneously retracts (pulls the card)
                  webNet.style.opacity = '0';
                  setTimeout(() => webNet.remove(), 200);
                  
                  strands.forEach((s) => {
                    animateDash(s, 'in', 250, 0, () => s.g.remove()); // Retracts over 250ms matching the yank
                  });

                  // Once pulled up, it flips
                  setTimeout(() => {
                    card.classList.remove('pull');
                    card.style.transform = '';
                    card.classList.add('flipped');

                    setTimeout(() => {
                      card.classList.add('done');
                      card.dataset.busy = '0';
                    }, 300);
                  }, 250); 
                }, 40); // Only a 40ms micro-pause so the net registers visually before ripping the card away
              }
            });
          });
        }, { signal: controller.signal });
        
        (card as any)._abortController = controller;
      });
    }

    initWebShooter();

    return () => {
      document.querySelectorAll<HTMLElement>('.card').forEach(card => {
        if ((card as any)._abortController) {
          (card as any)._abortController.abort();
        }
      });
    };
  }, []);

  return (
    <div
      className="relative w-full overflow-hidden bg-black min-h-[auto] md:min-h-[100svh]"
    >
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image src="/assets/Sponsors/bg.png" alt="Hexagonal background" fill className="object-cover" priority />
      </div>

      <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none" />

      <div className="relative z-20 flex flex-col items-center justify-start min-h-[auto] md:min-h-screen pt-12 md:pt-24 pb-20 md:pb-0">

        <div
          className="mb-20 md:mb-36 pointer-events-none"
          style={{ filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.25)) drop-shadow(0 16px 4px rgba(0,0,0,0.48))' }}
        >
          <Image src="/assets/Sponsors/SPONSORS.png" alt="SPONSORS" width={1135} height={150} style={{ width: 'clamp(350px, 90vw, 1400px)', height: 'auto', objectFit: 'contain' }} />
        </div>

        {/* ── DESKTOP VIEW ── */}
        <div
          className="hidden md:flex flex-row items-center justify-center"
          style={{ gap: 'clamp(20px, 12.45vw, 239px)', perspective: '1600px' }}
        >

          {/* Gold Card */}
          <div
            className="card relative flex-shrink-0 transition-transform duration-300 hover:scale-[1.03]"
            data-side="left"
            style={{
              width: 'clamp(180px, 18vw, 360px)',
              height: 'calc(clamp(180px, 18vw, 360px) * (420 / 321))',
              transform: 'rotateY(25deg) translateZ(-50px)',
            }}
          >
            <div className="face front absolute inset-0 overflow-hidden rounded-[25px]" style={{ boxShadow: '0 0 100px 0 #B96E1E' }}>
              <img src="/assets/Sponsors/Gold glow.png" alt="Gold Sponsor" style={cardCrop} />
            </div>
            <div className="face back absolute inset-0 rounded-[25px] flex items-center justify-center text-white text-2xl font-bold md:text-3xl lg:text-4xl shadow-xl" style={{ background: 'linear-gradient(135deg, #FFDF00, #B96E1E)', boxShadow: '0 0 100px 0 #B96E1E' }}>
              GOLD SPONSOR
            </div>
          </div>

          {/* Silver Card */}
          <div
            className="card relative flex-shrink-0 transition-transform duration-300 hover:scale-[1.05]"
            data-side="bottom"
            style={{
              width: 'clamp(180px, 18vw, 360px)',
              height: 'calc(clamp(180px, 18vw, 360px) * (420 / 321))',
              transform: 'translateZ(50px)',
              zIndex: 10,
            }}
          >
            <div className="face front absolute inset-0 overflow-hidden rounded-[25px]" style={{ boxShadow: '0 0 80px 0 #DFDEDC' }}>
              <img src="/assets/Sponsors/Silver glow.png" alt="Silver Sponsor" style={cardCrop} />
            </div>
            <div className="face back absolute inset-0 rounded-[25px] flex items-center justify-center text-white text-2xl font-bold md:text-3xl lg:text-4xl shadow-xl" style={{ background: 'linear-gradient(135deg, #FFFFFF, #DFDEDC, #9E9E9E)', boxShadow: '0 0 80px 0 #DFDEDC' }}>
              SILVER SPONSOR
            </div>
          </div>

          {/* Bronze Card */}
          <div
            className="card relative flex-shrink-0 transition-transform duration-300 hover:scale-[1.03]"
            data-side="right"
            style={{
              width: 'clamp(180px, 18vw, 360px)',
              height: 'calc(clamp(180px, 18vw, 360px) * (420 / 321))',
              transform: 'rotateY(-25deg) translateZ(-50px)',
            }}
          >
            <div className="face front absolute inset-0 overflow-hidden rounded-[25px]" style={{ boxShadow: '0 0 90px 0 #C14E23' }}>
              <img src="/assets/Sponsors/Bronze glow.png" alt="Bronze Sponsor" style={cardCrop} />
            </div>
            <div className="face back absolute inset-0 rounded-[25px] flex items-center justify-center text-white text-2xl font-bold md:text-3xl lg:text-4xl shadow-xl" style={{ background: 'linear-gradient(135deg, #E2725B, #C14E23)', boxShadow: '0 0 90px 0 #C14E23' }}>
              BRONZE SPONSOR
            </div>
          </div>

        </div>

        {/* ── MOBILE VIEW ── */}
        <div className="flex md:hidden items-center justify-center w-full gap-4 px-4">
          <button onClick={() => setMobileIdx((prev) => (prev - 1 + 3) % 3)} className="active:scale-90 transition-transform">
            <Image src="/assets/Sponsors/arrow-left.png" alt="Prev" width={40} height={40} className="w-10 h-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
          </button>

          {mobileIdx === 0 && (
            <div
              className="card relative flex-shrink-0"
              data-side="bottom"
              style={{
                width: 'clamp(200px, 60vw, 320px)',
                height: 'calc(clamp(200px, 60vw, 320px) * (420 / 321))',
              }}
            >
              <div className="face front absolute inset-0 overflow-hidden rounded-[25px]" style={{ boxShadow: '0 0 100px 0 #B96E1E' }}>
                <img src="/assets/Sponsors/Gold glow.png" alt="Gold Sponsor" style={cardCrop} />
              </div>
              <div className="face back absolute inset-0 rounded-[25px] flex items-center justify-center text-white text-2xl font-bold shadow-xl" style={{ background: 'linear-gradient(135deg, #FFDF00, #B96E1E)', boxShadow: '0 0 100px 0 #B96E1E' }}>
                GOLD SPONSOR
              </div>
            </div>
          )}

          {mobileIdx === 1 && (
            <div
              className="card relative flex-shrink-0"
              data-side="bottom"
              style={{
                width: 'clamp(200px, 60vw, 320px)',
                height: 'calc(clamp(200px, 60vw, 320px) * (420 / 321))',
              }}
            >
              <div className="face front absolute inset-0 overflow-hidden rounded-[25px]" style={{ boxShadow: '0 0 80px 0 #DFDEDC' }}>
                <img src="/assets/Sponsors/Silver glow.png" alt="Silver Sponsor" style={cardCrop} />
              </div>
              <div className="face back absolute inset-0 rounded-[25px] flex items-center justify-center text-white text-2xl font-bold shadow-xl" style={{ background: 'linear-gradient(135deg, #FFFFFF, #DFDEDC, #9E9E9E)', boxShadow: '0 0 80px 0 #DFDEDC' }}>
                SILVER SPONSOR
              </div>
            </div>
          )}

          {mobileIdx === 2 && (
            <div
              className="card relative flex-shrink-0"
              data-side="bottom"
              style={{
                width: 'clamp(200px, 60vw, 320px)',
                height: 'calc(clamp(200px, 60vw, 320px) * (420 / 321))',
              }}
            >
              <div className="face front absolute inset-0 overflow-hidden rounded-[25px]" style={{ boxShadow: '0 0 90px 0 #C14E23' }}>
                <img src="/assets/Sponsors/Bronze glow.png" alt="Bronze Sponsor" style={cardCrop} />
              </div>
              <div className="face back absolute inset-0 rounded-[25px] flex items-center justify-center text-white text-2xl font-bold shadow-xl" style={{ background: 'linear-gradient(135deg, #E2725B, #C14E23)', boxShadow: '0 0 90px 0 #C14E23' }}>
                BRONZE SPONSOR
              </div>
            </div>
          )}

          <button onClick={() => setMobileIdx((prev) => (prev + 1) % 3)} className="active:scale-90 transition-transform">
            <Image src="/assets/Sponsors/arrow-right.png" alt="Next" width={40} height={40} className="w-10 h-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
          </button>
        </div>
      </div>

      {/* SVG overlay given a massive inline z-index to completely ensure it renders over the cards */}
      <svg className="web-layer" id="webLayer" style={{ zIndex: 999999, pointerEvents: 'none', position: 'fixed', inset: 0, width: '100%', height: '100%' }}></svg>
    </div>
  );
}
