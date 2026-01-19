import { cn } from "@starter-saas/ui/utils";
import { motion } from "framer-motion";
import { BrandLogo } from "./brand-logo";

/** Speed line with staggered animation delay */
function SpeedLine({ delay, top, width }: { delay: string; top: string; width: string }) {
  return (
    <div
      className={cn(
        "absolute left-0 h-0.5 animate-speed-line bg-gradient-to-r from-transparent via-primary to-transparent opacity-0",
        width,
      )}
      style={{ top, animationDelay: delay }}
    />
  );
}

/** Floating abstract shape SVG */
function FloatingShape() {
  return (
    <div className="absolute bottom-[12%] left-1/2 h-32 w-[320px] -translate-x-1/2 animate-float">
      <svg
        aria-hidden="true"
        className="size-full fill-primary/30"
        viewBox="0 0 200 80"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Abstract geometric shape - waves/flow */}
        <path d="M10,40 Q30,20 50,40 T90,40 T130,40 T170,40 T190,40 L190,60 Q170,80 130,60 Q90,40 50,60 Q30,80 10,60 Z" />
      </svg>
    </div>
  );
}

/** Animated glow orbs for visual effect */
function GlowOrbs() {
  return (
    <>
      {/* Primary blue glow - top left */}
      <div className="absolute -top-[20%] -left-[10%] size-[500px] animate-pulse-glow rounded-full bg-primary/15 blur-[120px]" />
      {/* Subtle amber accent - center right, more diffuse */}
      <div
        className="absolute top-1/2 -right-[15%] size-[400px] -translate-y-1/2 animate-pulse-glow rounded-full bg-amber-500/10 blur-[150px]"
        style={{ animationDelay: "2s" }}
      />
    </>
  );
}

/** Brand content with logo */
function BrandContent() {
  return (
    <div className="relative z-10 animate-slide-up p-8 text-center">
      <BrandLogo className="mx-auto mb-8 drop-shadow-2xl" size="lg" variant="white" />
    </div>
  );
}

/**
 * Left visual panel with animated speed lines, glow effects, and brand content.
 * Hidden on mobile, shown on lg screens.
 * Uses layoutId for seamless transition to app sidebar.
 */
export function AuthVisualPanel() {
  return (
    <motion.div
      className="relative hidden items-center justify-center overflow-hidden bg-gradient-to-br from-primary/90 to-primary lg:flex"
      layoutId="sidebar-panel"
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Speed lines */}
      <div className="absolute inset-0 overflow-hidden">
        <SpeedLine delay="0s" top="20%" width="w-[60%]" />
        <SpeedLine delay="0.5s" top="35%" width="w-[80%]" />
        <SpeedLine delay="1s" top="50%" width="w-[70%]" />
        <SpeedLine delay="1.5s" top="65%" width="w-[90%]" />
        <SpeedLine delay="2s" top="80%" width="w-[50%]" />
      </div>

      {/* Glow effects */}
      <GlowOrbs />

      {/* Brand content */}
      <BrandContent />

      {/* Floating shape */}
      <FloatingShape />
    </motion.div>
  );
}
