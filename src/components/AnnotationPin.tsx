import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, ArrowRight } from 'lucide-react';

interface Annotation {
  id: number;
  x: number;
  y: number;
  category: 'visual' | 'business' | 'heuristic' | 'contrast';
  tag: string;
  severity: 'critical' | 'minor';
  title: string;
  current: string;
  suggested: string;
  impact: string;
}

interface AnnotationPinProps {
  annotation: Annotation;
  isSelected: boolean;
  onSelect: (id: number | null) => void;
}

export function AnnotationPin({ annotation, isSelected, onSelect }: AnnotationPinProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [popoverPos, setPopoverPos] = useState<{
    x: number;
    y: number;
    placement: 'top' | 'bottom';
  } | null>(null);
  const pinRef = useRef<HTMLButtonElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const showPopover = isHovered;

  const calculatePosition = useCallback(() => {
    if (!pinRef.current) return;
    const rect = pinRef.current.getBoundingClientRect();
    const pinCenterX = rect.left + rect.width / 2;
    const pinTop = rect.top;
    const pinBottom = rect.bottom;

    const popoverHeight = 240;
    const placement = pinTop > popoverHeight + 24 ? 'top' : 'bottom';

    // Clamp horizontal position so popover stays on screen
    const popoverWidth = 340;
    const margin = 12;
    const clampedX = Math.max(
      popoverWidth / 2 + margin,
      Math.min(pinCenterX, window.innerWidth - popoverWidth / 2 - margin)
    );

    setPopoverPos({
      x: clampedX,
      y: placement === 'top' ? pinTop - 14 : pinBottom + 14,
      placement,
    });
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(true);
    calculatePosition();
  }, [calculatePosition]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 100);
  }, []);

  // Recalculate on scroll/resize while popover is visible
  useEffect(() => {
    if (!showPopover) return;
    const update = () => calculatePosition();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [showPopover, calculatePosition]);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  // Recalculate position when pin becomes selected (e.g. from sidebar click)
  useEffect(() => {
    if (isSelected) {
      // Small delay to let the DOM update (e.g. slide scroll)
      const timer = setTimeout(() => calculatePosition(), 100);
      return () => clearTimeout(timer);
    }
  }, [isSelected, calculatePosition]);

  const getSeverityColor = (sev: string, isActive?: boolean) => {
    switch (sev) {
      case 'critical': return 'bg-red-500';
      case 'minor': return 'bg-blue-500';
      default: return 'bg-slate-500';
    }
  };

  const getSeverityBadgeColor = (sev: string) => {
    switch (sev) {
      case 'critical': return 'text-red-600 bg-red-100/50 border-red-100';
      case 'minor': return 'text-blue-600 bg-blue-100/50 border-blue-100';
      default: return 'text-slate-600 bg-slate-100/50 border-slate-100';
    }
  };

  const getCategoryBadgeColor = (cat: string) => {
    switch (cat) {
      case 'contrast': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'visual': return 'bg-pink-50 text-pink-700 border-pink-100';
      case 'business': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'heuristic': return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const isActive = isSelected || isHovered;

  return (
    <>
      {/* The pin itself */}
      <button
        ref={pinRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(isSelected ? null : annotation.id);
        }}
        className={`absolute flex items-center justify-center rounded-full cursor-pointer
          border-[2px] border-white shadow-lg transition-all
          ${getSeverityColor(annotation.severity)}
          ${isSelected ? 'ring-[3px] ring-offset-1 ring-white/70' : ''}
        `}
        style={{
          left: `${annotation.x}%`,
          top: `${annotation.y}%`,
          width: 28,
          height: 28,
          transform: 'translate(-50%, -50%)',
          scale: isActive ? '1.2' : '1',
          zIndex: isActive ? 30 : 10,
        }}
      >
        <span className="text-[11px] text-white font-black leading-none select-none relative z-10">
          {annotation.id}
        </span>
        {/* Inner precision ring */}
        <div className="absolute inset-0 rounded-full border border-white/30 scale-90" />
      </button>

      {/* Portal-based popover */}
      {showPopover &&
        popoverPos &&
        createPortal(
          <AnimatePresence>
            <motion.div
              key={`popover-${annotation.id}`}
              ref={popoverRef}
              initial={{ opacity: 0, y: popoverPos.placement === 'top' ? 10 : -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: popoverPos.placement === 'top' ? 10 : -10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="fixed"
              style={{
                left: popoverPos.x,
                top: popoverPos.y,
                transform:
                  popoverPos.placement === 'top'
                    ? 'translate(-50%, -100%)'
                    : 'translate(-50%, 0)',
                zIndex: 9999,
              }}
            >
              <div className="w-[300px] bg-white rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.12)] border border-slate-200 p-4 transition-all duration-200">
                <div className="flex gap-4">
                  {/* Indicator Column */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black text-white shadow-sm ${annotation.severity === 'critical' ? 'bg-red-500' : 'bg-blue-500'}`}>
                      {annotation.id}
                    </div>
                  </div>

                  {/* Content Column */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#0066ff] bg-[#0066ff]/5 px-2 py-0.5 rounded border border-[#0066ff]/10">
                        {annotation.tag}
                      </span>
                    </div>
                    <h3 className="font-bold text-[14px] text-slate-900 leading-tight mb-3">
                      {annotation.title}
                    </h3>

                    <div className="space-y-3">
                      <div>
                        <span className="block text-[10px] text-slate-400 mb-0.5 lowercase font-medium">issue</span>
                        <p className="text-[11px] text-slate-600 leading-normal">{annotation.current}</p>
                      </div>
                      
                      <div>
                        <span className="block text-[10px] text-[rgba(15,123,63,0.8)] mb-0.5 lowercase font-bold">solution</span>
                        <p className="text-[11px] text-[rgb(0,0,0)] font-bold leading-normal">{annotation.suggested}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div
                className={`absolute left-1/2 w-3 h-3 bg-white rotate-45 border ${
                  annotation.severity === 'critical' ? 'border-red-200/50' : 'border-blue-200/50'
                }`}
                style={{
                  transform: 'translateX(-50%) rotate(45deg)',
                  zIndex: -1,
                  ...(popoverPos.placement === 'top'
                    ? { bottom: -6, borderRightWidth: 1, borderBottomWidth: 1, borderLeftWidth: 0, borderTopWidth: 0 }
                    : { top: -6, borderLeftWidth: 1, borderTopWidth: 1, borderRightWidth: 0, borderBottomWidth: 0 }),
                }}
              />
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
