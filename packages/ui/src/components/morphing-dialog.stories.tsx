import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  MorphingDialog,
  MorphingDialogClose,
  MorphingDialogContent,
  MorphingDialogDescription,
  MorphingDialogImage,
  MorphingDialogSubtitle,
  MorphingDialogTitle,
  MorphingDialogTrigger,
} from "./morphing-dialog";

/**
 * A morphing dialog component with smooth animations that transitions from a
 * trigger button into a full dialog modal using Framer Motion layout animations.
 */
const meta: Meta<typeof MorphingDialog> = {
  title: "ui/MorphingDialog",
  component: MorphingDialog,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof MorphingDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Basic morphing dialog with title, subtitle, description and an image.
 */
export const Default: Story = {
  render: () => (
    <MorphingDialog>
      <MorphingDialogTrigger className="flex max-w-[300px] flex-col overflow-hidden rounded-lg border border-zinc-950/10 dark:border-zinc-50/10">
        <MorphingDialogImage
          alt="Product preview"
          className="h-48 w-full object-cover"
          height={192}
          src="https://images.unsplash.com/photo-1517404215738-15263e9f9178?w=800&auto=format&fit=crop&q=60"
          width={800}
        />
        <div className="flex flex-grow flex-row items-end justify-between p-2">
          <div>
            <MorphingDialogTitle className="text-zinc-950 dark:text-zinc-50">
              Modern Design
            </MorphingDialogTitle>
            <MorphingDialogSubtitle className="text-zinc-700 dark:text-zinc-400">
              Click to explore
            </MorphingDialogSubtitle>
          </div>
        </div>
      </MorphingDialogTrigger>
      <MorphingDialogContent className="relative flex h-auto w-full max-w-[500px] flex-col overflow-hidden rounded-lg border border-zinc-950/10 bg-white dark:border-zinc-50/10 dark:bg-zinc-900">
        <MorphingDialogImage
          alt="Product detail"
          className="h-full w-full"
          height={600}
          src="https://images.unsplash.com/photo-1517404215738-15263e9f9178?w=800&auto=format&fit=crop&q=60"
          width={800}
        />
        <div className="p-6">
          <MorphingDialogTitle className="font-semibold text-2xl text-zinc-950 dark:text-zinc-50">
            Modern Design
          </MorphingDialogTitle>
          <MorphingDialogSubtitle className="text-zinc-700 dark:text-zinc-400">
            Explore the details
          </MorphingDialogSubtitle>
          <MorphingDialogDescription
            disableLayoutAnimation
            variants={{
              initial: { opacity: 0, scale: 0.8, y: 100 },
              animate: { opacity: 1, scale: 1, y: 0 },
              exit: { opacity: 0, scale: 0.8, y: 100 },
            }}
          >
            <p className="mt-2 text-zinc-500 dark:text-zinc-500">
              This is a beautiful morphing dialog that smoothly transitions from a compact card into
              a full modal view. Perfect for showcasing products, articles, or any content that
              needs detailed exploration.
            </p>
            <p className="mt-2 text-zinc-500 dark:text-zinc-500">
              The animation uses Framer Motion's layout animations to create a seamless morphing
              effect between the trigger and the content.
            </p>
          </MorphingDialogDescription>
        </div>
        <MorphingDialogClose />
      </MorphingDialogContent>
    </MorphingDialog>
  ),
};

/**
 * Morphing dialog with custom transition timing for smoother animations.
 */
export const CustomTransition: Story = {
  render: () => (
    <MorphingDialog
      transition={{
        type: "spring",
        bounce: 0.05,
        duration: 0.25,
      }}
    >
      <MorphingDialogTrigger className="flex max-w-[300px] flex-col overflow-hidden rounded-lg border border-zinc-950/10 dark:border-zinc-50/10">
        <MorphingDialogImage
          alt="Gallery preview"
          className="h-48 w-full object-cover"
          height={192}
          src="https://images.unsplash.com/photo-1579353977828-2a4eab540b9a?w=800&auto=format&fit=crop&q=60"
          width={800}
        />
        <div className="flex flex-grow flex-row items-end justify-between p-2">
          <div>
            <MorphingDialogTitle className="text-zinc-950 dark:text-zinc-50">
              Spring Animation
            </MorphingDialogTitle>
            <MorphingDialogSubtitle className="text-zinc-700 dark:text-zinc-400">
              Smooth & bouncy
            </MorphingDialogSubtitle>
          </div>
        </div>
      </MorphingDialogTrigger>
      <MorphingDialogContent className="relative flex h-auto w-full max-w-[500px] flex-col overflow-hidden rounded-lg border border-zinc-950/10 bg-white dark:border-zinc-50/10 dark:bg-zinc-900">
        <MorphingDialogImage
          alt="Gallery detail"
          className="h-full w-full"
          height={600}
          src="https://images.unsplash.com/photo-1579353977828-2a4eab540b9a?w=800&auto=format&fit=crop&q=60"
          width={800}
        />
        <div className="p-6">
          <MorphingDialogTitle className="font-semibold text-2xl text-zinc-950 dark:text-zinc-50">
            Spring Animation
          </MorphingDialogTitle>
          <MorphingDialogSubtitle className="text-zinc-700 dark:text-zinc-400">
            Custom timing configuration
          </MorphingDialogSubtitle>
          <MorphingDialogDescription
            disableLayoutAnimation
            variants={{
              initial: { opacity: 0, scale: 0.8, y: 100 },
              animate: { opacity: 1, scale: 1, y: 0 },
              exit: { opacity: 0, scale: 0.8, y: 100 },
            }}
          >
            <p className="mt-2 text-zinc-500 dark:text-zinc-500">
              This dialog uses a custom spring animation with reduced bounce and shorter duration
              for a smoother, more professional feel.
            </p>
          </MorphingDialogDescription>
        </div>
        <MorphingDialogClose />
      </MorphingDialogContent>
    </MorphingDialog>
  ),
};

/**
 * Compact morphing dialog showcasing minimal content.
 */
export const Compact: Story = {
  render: () => (
    <MorphingDialog>
      <MorphingDialogTrigger className="flex max-w-[200px] flex-col overflow-hidden rounded-lg border border-zinc-950/10 dark:border-zinc-50/10">
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4">
          <MorphingDialogTitle className="font-bold text-white">Quick Info</MorphingDialogTitle>
        </div>
      </MorphingDialogTrigger>
      <MorphingDialogContent className="relative flex h-auto w-full max-w-[400px] flex-col overflow-hidden rounded-lg border border-zinc-950/10 bg-white dark:border-zinc-50/10 dark:bg-zinc-900">
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-8">
          <MorphingDialogTitle className="font-bold text-2xl text-white">
            Quick Info
          </MorphingDialogTitle>
        </div>
        <div className="p-6">
          <MorphingDialogDescription
            disableLayoutAnimation
            variants={{
              initial: { opacity: 0, y: 50 },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: 50 },
            }}
          >
            <p className="text-zinc-500 dark:text-zinc-500">
              A minimal, compact morphing dialog perfect for quick information or simple
              confirmations.
            </p>
          </MorphingDialogDescription>
        </div>
        <MorphingDialogClose />
      </MorphingDialogContent>
    </MorphingDialog>
  ),
};

/**
 * Morphing dialog with article-style content layout.
 */
export const ArticleLayout: Story = {
  render: () => (
    <MorphingDialog>
      <MorphingDialogTrigger className="flex max-w-[300px] flex-col overflow-hidden rounded-lg border border-zinc-950/10 transition-shadow hover:shadow-lg dark:border-zinc-50/10">
        <MorphingDialogImage
          alt="Article preview"
          className="h-48 w-full object-cover"
          height={192}
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60"
          width={800}
        />
        <div className="p-4">
          <MorphingDialogTitle className="font-semibold text-lg text-zinc-950 dark:text-zinc-50">
            The Future of Design
          </MorphingDialogTitle>
          <MorphingDialogSubtitle className="mt-1 text-sm text-zinc-700 dark:text-zinc-400">
            Read full article
          </MorphingDialogSubtitle>
        </div>
      </MorphingDialogTrigger>
      <MorphingDialogContent className="relative flex h-auto w-full max-w-[600px] flex-col overflow-hidden rounded-lg border border-zinc-950/10 bg-white dark:border-zinc-50/10 dark:bg-zinc-900">
        <MorphingDialogImage
          alt="Article header"
          className="h-64 w-full object-cover"
          height={256}
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60"
          width={800}
        />
        <div className="p-8">
          <MorphingDialogTitle className="font-bold text-3xl text-zinc-950 dark:text-zinc-50">
            The Future of Design
          </MorphingDialogTitle>
          <MorphingDialogSubtitle className="mt-2 text-sm text-zinc-700 dark:text-zinc-400">
            Published on January 15, 2025
          </MorphingDialogSubtitle>
          <MorphingDialogDescription
            disableLayoutAnimation
            variants={{
              initial: { opacity: 0, y: 50 },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: 50 },
            }}
          >
            <p className="mt-4 text-zinc-600 leading-relaxed dark:text-zinc-400">
              The landscape of modern design is constantly evolving, driven by new technologies and
              changing user expectations. This morphing dialog component represents the kind of
              smooth, delightful interactions that users have come to expect from modern web
              applications.
            </p>
            <p className="mt-4 text-zinc-600 leading-relaxed dark:text-zinc-400">
              By leveraging Framer Motion's layout animations, we can create seamless transitions
              that feel natural and intuitive, enhancing the overall user experience without adding
              complexity.
            </p>
            <p className="mt-4 text-zinc-600 leading-relaxed dark:text-zinc-400">
              This article layout demonstrates how the morphing dialog can be used for long-form
              content, providing a focused reading experience while maintaining visual continuity
              with the trigger element.
            </p>
          </MorphingDialogDescription>
        </div>
        <MorphingDialogClose />
      </MorphingDialogContent>
    </MorphingDialog>
  ),
};
