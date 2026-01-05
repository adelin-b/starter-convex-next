import { BrandLogo } from "./brand-logo";

/**
 * Mobile-only brand logo, hidden on desktop where visual panel is shown.
 * Shows color logo in light mode, white logo in dark mode.
 */
export function MobileBrand() {
  return (
    <div className="mb-8 flex items-center justify-center lg:hidden">
      <BrandLogo className="dark:hidden" size="sm" variant="color" />
      <BrandLogo className="hidden dark:block" size="sm" variant="white" />
    </div>
  );
}
