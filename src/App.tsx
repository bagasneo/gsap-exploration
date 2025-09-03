import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface MouseTracking {
  oldX: number;
  oldY: number;
  deltaX: number;
  deltaY: number;
}

gsap.registerPlugin(useGSAP);

function App() {
  const container = useRef<HTMLDivElement>(null);
  const mouseTracking = useRef<MouseTracking>({
    oldX: 0,
    oldY: 0,
    deltaX: 0,
    deltaY: 0,
  });

  useGSAP(
    () => {
      const root = container.current;
      if (!root) return;

      // Mouse move handler
      const handleMouseMove = (e: MouseEvent) => {
        mouseTracking.current.deltaX = e.clientX - mouseTracking.current.oldX;
        mouseTracking.current.deltaY = e.clientY - mouseTracking.current.oldY;
        mouseTracking.current.oldX = e.clientX;
        mouseTracking.current.oldY = e.clientY;
      };

      root.addEventListener('mousemove', handleMouseMove);

      const mediaElements = root.querySelectorAll('.media');
      const handlers = new Map();

      mediaElements.forEach((el) => {
        const handleMouseEnter = () => {
          const tl = gsap.timeline({
            onComplete: () => {
              tl.kill();
            },
          });

          tl.timeScale(1.2);

          const image = el.querySelector('img');
          if (!image) return;

          // Simple inertia (single phase like original)
          tl.to(image, {
            x: mouseTracking.current.deltaX * 3, // Much smaller multiplier
            y: mouseTracking.current.deltaY * 3,
            duration: 0.5,
            ease: 'power2.out',
          }).to(
            image,
            {
              x: 0,
              y: 0,
              duration: 0.4,
              ease: 'power1.out',
            },
            '-=0.4'
          );

          // Subtle rotation (exactly like original)
          tl.fromTo(
            image,
            { rotate: 0 },
            {
              duration: 0.4,
              rotate: (Math.random() - 0.5) * 12, // Reduced from 30 to 12
              yoyo: true,
              repeat: 1,
              ease: 'power3.inOut',
            },
            '<'
          ); // Start with first animation
        };

        el.addEventListener('mouseenter', handleMouseEnter);
        handlers.set(el, handleMouseEnter);
      });

      return () => {
        root.removeEventListener('mousemove', handleMouseMove);
        handlers.forEach((handler, el) => {
          el.removeEventListener('mouseenter', handler);
        });
        handlers.clear();
      };
    },
    { scope: container }
  );

  return (
    <>
      <div ref={container} className="mwg_effect000">
        <div className="medias">
          {Array.from({ length: 12 }, (_, i) => {
            // Format number with leading zero (01, 02, 03, etc.)
            const imageNumber = String(i + 1).padStart(2, '0');
            return (
              <div key={i} className="media">
                <img
                  src={`/images/${imageNumber}.png`}
                  alt={`Media ${i + 1}`}
                  className="rounded-lg"
                  onError={(e) => {
                    // Fallback if image doesn't exist
                    e.currentTarget.src = `https://picsum.photos/200/200?random=${
                      i + 1
                    }`;
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default App;
