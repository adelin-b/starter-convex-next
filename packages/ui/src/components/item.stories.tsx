import { PlusIcon } from "@radix-ui/react-icons";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { BadgeCheckIcon, ChevronDownIcon, ChevronRightIcon, ShieldAlertIcon } from "lucide-react";
import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/avatar";
import { Button } from "@/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPositioner,
  DropdownMenuTrigger,
} from "@/components/dropdown-menu";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/item";

/**
 * A versatile component that you can use to display any content.
 */
const meta: Meta<typeof Item> = {
  title: "ui/Item",
  component: Item,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline", "muted"],
    },
    size: {
      control: "select",
      options: ["default", "sm"],
    },
  },
  parameters: {
    layout: "centered",
  },
  args: {
    variant: "default",
    size: "default",
  },
} satisfies Meta<typeof Item>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Basic item with title, description, and actions.
 */
export const Default: Story = {
  render: (args) => (
    <div className="flex w-full max-w-md flex-col gap-6">
      <Item {...args} variant="outline">
        <ItemContent>
          <ItemTitle>Basic Item</ItemTitle>
          <ItemDescription>A simple item with title and description.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm" variant="outline">
            Action
          </Button>
        </ItemActions>
      </Item>
      <Item asChild size="sm" variant="outline">
        <a href="/example">
          <ItemMedia>
            <BadgeCheckIcon className="size-5" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Your profile has been verified.</ItemTitle>
          </ItemContent>
          <ItemActions>
            <ChevronRightIcon className="size-4" />
          </ItemActions>
        </a>
      </Item>
    </div>
  ),
};

/**
 * Use the `outline` variant to add a visible border to the item.
 */
export const Outline: Story = {
  render: (args) => (
    <div className="flex w-full max-w-md flex-col gap-6">
      <Item {...args} variant="outline">
        <ItemMedia>
          <Avatar className="size-10">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Software Update Available</ItemTitle>
          <ItemDescription>Version 2.0 is now available for download.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm" variant="outline">
            Update
          </Button>
        </ItemActions>
      </Item>
    </div>
  ),
};

/**
 * Use the `muted` variant to add a subtle background to the item.
 */
export const Muted: Story = {
  render: (args) => (
    <div className="flex w-full max-w-md flex-col gap-6">
      <Item {...args} variant="muted">
        <ItemMedia variant="icon">
          <BadgeCheckIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Account Verified</ItemTitle>
          <ItemDescription>Your account has been successfully verified.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm" variant="ghost">
            Dismiss
          </Button>
        </ItemActions>
      </Item>
    </div>
  ),
};

/**
 * Use the `sm` size for a more compact item layout.
 */
export const Small: Story = {
  render: (args) => (
    <div className="flex w-full max-w-md flex-col gap-6">
      <ItemGroup>
        <Item {...args} size="sm" variant="outline">
          <ItemMedia>
            <Avatar className="size-8">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </ItemMedia>
          <ItemContent>
            <ItemTitle>New message from shadcn</ItemTitle>
            <ItemDescription>Hey, how are you doing?</ItemDescription>
          </ItemContent>
        </Item>
        <ItemSeparator />
        <Item size="sm" variant="outline">
          <ItemMedia>
            <Avatar className="size-8">
              <AvatarImage src="https://github.com/maxleiter.png" />
              <AvatarFallback>ML</AvatarFallback>
            </Avatar>
          </ItemMedia>
          <ItemContent>
            <ItemTitle>New message from maxleiter</ItemTitle>
            <ItemDescription>Check out this new feature!</ItemDescription>
          </ItemContent>
        </Item>
      </ItemGroup>
    </div>
  ),
};

/**
 * Item with icon media element.
 */
export const WithIcon: Story = {
  render: (args) => (
    <div className="flex w-full max-w-lg flex-col gap-6">
      <Item {...args} variant="outline">
        <ItemMedia variant="icon">
          <ShieldAlertIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Security Alert</ItemTitle>
          <ItemDescription>New login detected from unknown device.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm" variant="outline">
            Review
          </Button>
        </ItemActions>
      </Item>
    </div>
  ),
};

/**
 * Items with avatar media elements.
 */
export const WithAvatar: Story = {
  render: (args) => (
    <div className="flex w-full max-w-lg flex-col gap-6">
      <Item {...args} variant="outline">
        <ItemMedia>
          <Avatar className="size-10">
            <AvatarImage src="https://github.com/evilrabbit.png" />
            <AvatarFallback>ER</AvatarFallback>
          </Avatar>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Evil Rabbit</ItemTitle>
          <ItemDescription>Last seen 5 months ago</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button aria-label="Invite" className="rounded-full" size="icon-sm" variant="outline">
            <PlusIcon />
          </Button>
        </ItemActions>
      </Item>
      <Item variant="outline">
        <ItemMedia>
          <div className="-space-x-2 flex *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background *:data-[slot=avatar]:grayscale">
            <Avatar className="hidden sm:flex">
              <AvatarImage alt="@shadcn" src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <Avatar className="hidden sm:flex">
              <AvatarImage alt="@maxleiter" src="https://github.com/maxleiter.png" />
              <AvatarFallback>LR</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage alt="@evilrabbit" src="https://github.com/evilrabbit.png" />
              <AvatarFallback>ER</AvatarFallback>
            </Avatar>
          </div>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>No Team Members</ItemTitle>
          <ItemDescription>Invite your team to collaborate on this project.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm" variant="outline">
            Invite
          </Button>
        </ItemActions>
      </Item>
    </div>
  ),
};

/**
 * Items with image media elements for music playlist.
 */
export const WithImage: Story = {
  render: (args) => {
    const music = [
      {
        title: "Midnight City Lights",
        artist: "Neon Dreams",
        album: "Electric Nights",
        duration: "3:45",
      },
      {
        title: "Coffee Shop Conversations",
        artist: "The Morning Brew",
        album: "Urban Stories",
        duration: "4:05",
      },
      {
        title: "Digital Rain",
        artist: "Cyber Symphony",
        album: "Binary Beats",
        duration: "3:30",
      },
    ];

    return (
      <div className="flex w-full max-w-md flex-col gap-6">
        <ItemGroup className="gap-4">
          {music.map((song) => (
            <Item key={song.title} {...args} asChild role="listitem" variant="outline">
              <a href="/example">
                <ItemMedia variant="image">
                  <img
                    alt={song.title}
                    className="object-cover grayscale"
                    height={32}
                    src={`https://avatar.vercel.sh/${song.title}`}
                    width={32}
                  />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle className="line-clamp-1">
                    {song.title} - <span className="text-muted-foreground">{song.album}</span>
                  </ItemTitle>
                  <ItemDescription>{song.artist}</ItemDescription>
                </ItemContent>
                <ItemContent className="flex-none text-center">
                  <ItemDescription>{song.duration}</ItemDescription>
                </ItemContent>
              </a>
            </Item>
          ))}
        </ItemGroup>
      </div>
    );
  },
};

/**
 * Grouped items with separators.
 */
export const WithGroup: Story = {
  render: (args) => {
    const people = [
      {
        username: "shadcn",
        avatar: "https://github.com/shadcn.png",
        email: "shadcn@vercel.com",
      },
      {
        username: "maxleiter",
        avatar: "https://github.com/maxleiter.png",
        email: "maxleiter@vercel.com",
      },
      {
        username: "evilrabbit",
        avatar: "https://github.com/evilrabbit.png",
        email: "evilrabbit@vercel.com",
      },
    ];

    return (
      <div className="flex w-full max-w-md flex-col gap-6">
        <ItemGroup>
          {people.map((person, index) => (
            <React.Fragment key={person.username}>
              <Item {...args}>
                <ItemMedia>
                  <Avatar>
                    <AvatarImage className="grayscale" src={person.avatar} />
                    <AvatarFallback>{person.username.charAt(0)}</AvatarFallback>
                  </Avatar>
                </ItemMedia>
                <ItemContent className="gap-1">
                  <ItemTitle>{person.username}</ItemTitle>
                  <ItemDescription>{person.email}</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Button className="rounded-full" size="icon" variant="ghost">
                    <PlusIcon />
                  </Button>
                </ItemActions>
              </Item>
              {index !== people.length - 1 && <ItemSeparator />}
            </React.Fragment>
          ))}
        </ItemGroup>
      </div>
    );
  },
};

/**
 * Items with header sections for model cards.
 */
export const WithHeader: Story = {
  render: (args) => {
    const models = [
      {
        name: "v0-1.5-sm",
        description: "Everyday tasks and UI generation.",
        image:
          "https://images.unsplash.com/photo-1650804068570-7fb2e3dbf888?q=80&w=640&auto=format&fit=crop",
        credit: "Valeria Reverdo on Unsplash",
      },
      {
        name: "v0-1.5-lg",
        description: "Advanced thinking or reasoning.",
        image:
          "https://images.unsplash.com/photo-1610280777472-54133d004c8c?q=80&w=640&auto=format&fit=crop",
        credit: "Michael Oeser on Unsplash",
      },
      {
        name: "v0-2.0-mini",
        description: "Open Source model for everyone.",
        image:
          "https://images.unsplash.com/photo-1602146057681-08560aee8cde?q=80&w=640&auto=format&fit=crop",
        credit: "Cherry Laithang on Unsplash",
      },
    ];

    return (
      <div className="flex w-full max-w-xl flex-col gap-6">
        <ItemGroup className="grid grid-cols-3 gap-4">
          {models.map((model) => (
            <Item key={model.name} {...args} variant="outline">
              <ItemHeader>
                <img
                  alt={model.name}
                  className="aspect-square w-full rounded-sm object-cover"
                  height={128}
                  src={model.image}
                  width={128}
                />
              </ItemHeader>
              <ItemContent>
                <ItemTitle>{model.name}</ItemTitle>
                <ItemDescription>{model.description}</ItemDescription>
              </ItemContent>
            </Item>
          ))}
        </ItemGroup>
      </div>
    );
  },
};

/**
 * Items in a dropdown menu.
 */
export const WithDropdown: Story = {
  render: (args) => {
    const people = [
      {
        username: "shadcn",
        avatar: "https://github.com/shadcn.png",
        email: "shadcn@vercel.com",
      },
      {
        username: "maxleiter",
        avatar: "https://github.com/maxleiter.png",
        email: "maxleiter@vercel.com",
      },
      {
        username: "evilrabbit",
        avatar: "https://github.com/evilrabbit.png",
        email: "evilrabbit@vercel.com",
      },
    ];

    return (
      <div className="flex min-h-64 w-full max-w-md flex-col items-center gap-6">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button className="w-fit" size="sm" variant="outline">
                Select <ChevronDownIcon />
              </Button>
            }
          />
          <DropdownMenuPositioner align="end">
            <DropdownMenuContent className="w-72 [--radius:0.65rem]">
              {people.map((person) => (
                <DropdownMenuItem className="p-0" key={person.username}>
                  <Item {...args} className="w-full p-2" size="sm">
                    <ItemMedia>
                      <Avatar className="size-8">
                        <AvatarImage className="grayscale" src={person.avatar} />
                        <AvatarFallback>{person.username.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </ItemMedia>
                    <ItemContent className="gap-0.5">
                      <ItemTitle>{person.username}</ItemTitle>
                      <ItemDescription>{person.email}</ItemDescription>
                    </ItemContent>
                  </Item>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenuPositioner>
        </DropdownMenu>
      </div>
    );
  },
};
