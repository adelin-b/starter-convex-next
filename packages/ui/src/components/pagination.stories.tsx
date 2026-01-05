import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/pagination";

/**
 * Pagination with page navigation, next and previous links.
 */
const meta: Meta<typeof Pagination> = {
  title: "ui/Pagination",
  component: Pagination,
  tags: ["autodocs"],
  argTypes: {},
  render: (args) => (
    <Pagination {...args}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" size="default" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" size="icon">
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" size="icon">
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" size="icon">
            3
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" size="default" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the pagination.
 */
export const Default: Story = {};
