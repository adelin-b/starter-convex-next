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

/** Floating car silhouette SVG */
function CarSilhouette() {
  return (
    <div className="-translate-x-1/2 absolute bottom-[12%] left-1/2 h-32 w-[320px] animate-float">
      <svg
        aria-hidden="true"
        className="h-full w-full fill-primary/30"
        viewBox="0 0 200 80"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M20,50 Q30,35 60,35 L80,35 Q90,25 110,20 L140,20 Q160,20 170,35 L180,35 Q190,35 190,50 L190,55 Q190,60 185,60 L175,60 Q175,70 165,70 Q155,70 155,60 L55,60 Q55,70 45,70 Q35,70 35,60 L15,60 Q10,60 10,55 L10,50 Q10,45 20,50 Z" />
      </svg>
    </div>
  );
}

/** Animated glow orbs for visual effect */
function GlowOrbs() {
  return (
    <>
      {/* Primary blue glow - top left */}
      <div className="-top-[20%] -left-[10%] absolute h-[500px] w-[500px] animate-pulse-glow rounded-full bg-primary/15 blur-[120px]" />
      {/* Subtle amber accent - center right, more diffuse */}
      <div
        className="-right-[15%] -translate-y-1/2 absolute top-1/2 h-[400px] w-[400px] animate-pulse-glow rounded-full bg-amber-500/10 blur-[150px]"
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

      {/* Floating car */}
      <CarSilhouette />
    </motion.div>
  );
}
