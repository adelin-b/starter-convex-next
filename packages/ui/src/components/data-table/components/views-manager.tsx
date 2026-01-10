"use client";

import { Check, Copy, MoreVertical, Plus, Save, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { cn } from "../../../utils";
import { Button } from "../../button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPositioner,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../dropdown-menu";
import { Input } from "../../input";
import { Label } from "../../label";
import { ScrollArea } from "../../scroll-area";
import type { SavedView } from "../hooks/use-saved-views";
import type { DataTableLabels } from "../labels";
import { defaultDataTableLabels } from "../labels";

export type ViewsManagerProps = {
  views: SavedView[];
  activeViewId: string | null;
  onApplyView: (viewId: string) => void;
  onCreateView: (name: string, description?: string) => void;
  onDeleteView: (viewId: string) => void;
  onDuplicateView: (viewId: string) => void;
  onSetDefaultView: (viewId: string | null) => void;
  className?: string;
  trigger?: React.ReactElement;
  labels?: DataTableLabels;
};

/**
 * ViewsManager - Manage saved table views
 * Features:
 * - Create new views with name and description
 * - Apply saved views
 * - Set default view
 * - Duplicate views
 * - Delete views
 * - Shows active view indicator
 *
 * @example
 * <ViewsManager
 *   views={views}
 *   activeViewId={activeViewId}
 *   onApplyView={applyView}
 *   onCreateView={(name, desc) => createView(name, currentState, { description: desc })}
 *   onDeleteView={deleteView}
 *   onDuplicateView={duplicateView}
 *   onSetDefaultView={setDefaultView}
 * />
 */
export function ViewsManager({
  views,
  activeViewId,
  onApplyView,
  onCreateView,
  onDeleteView,
  onDuplicateView,
  onSetDefaultView,
  className,
  trigger,
  labels,
}: ViewsManagerProps) {
  const mergedLabels = { ...defaultDataTableLabels, ...labels };
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newViewName, setNewViewName] = useState("");
  const [newViewDescription, setNewViewDescription] = useState("");

  const handleCreateView = () => {
    if (!newViewName.trim()) {
      return;
    }

    onCreateView(newViewName.trim(), newViewDescription.trim() || undefined);
    setNewViewName("");
    setNewViewDescription("");
    setCreateDialogOpen(false);
  };

  const defaultView = views.find((v) => v.isDefault);

  return (
    <div className={cn("@container", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            trigger || (
              <Button aria-label={mergedLabels.manageViews} size="sm" variant="outline">
                <Save className="mr-2 size-4" />
                <span className="@md:inline hidden">{mergedLabels.views}</span>
                {views.length > 0 && (
                  <span className="ml-2 flex size-5 items-center justify-center rounded-full bg-muted font-medium text-xs">
                    {views.length}
                  </span>
                )}
              </Button>
            )
          }
        />
        <DropdownMenuPositioner align="end">
          <DropdownMenuContent className="w-72">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>{mergedLabels.savedViews}</span>
                <Dialog onOpenChange={setCreateDialogOpen} open={createDialogOpen}>
                  <DialogTrigger
                    render={
                      <Button size="sm" variant="ghost">
                        <Plus className="mr-1 size-3" />
                        {mergedLabels.new}
                      </Button>
                    }
                  />
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{mergedLabels.createNewView}</DialogTitle>
                      <DialogDescription>{mergedLabels.saveCurrentConfig}</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="view-name">{mergedLabels.name}</Label>
                        <Input
                          id="view-name"
                          onChange={(e) => setNewViewName(e.target.value)}
                          placeholder={mergedLabels.viewNamePlaceholder}
                          value={newViewName}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="view-description">{mergedLabels.descriptionOptional}</Label>
                        <Input
                          id="view-description"
                          onChange={(e) => setNewViewDescription(e.target.value)}
                          placeholder={mergedLabels.describeView}
                          value={newViewDescription}
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button onClick={() => setCreateDialogOpen(false)} variant="outline">
                        {mergedLabels.cancel}
                      </Button>
                      <Button disabled={!newViewName.trim()} onClick={handleCreateView}>
                        {mergedLabels.createView}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />

            {views.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                {mergedLabels.noSavedViews}
              </div>
            ) : (
              <ScrollArea className="max-h-96">
                <div className="space-y-1 p-1">
                  {views.map((view) => (
                    <div
                      className={cn(
                        "group flex items-center gap-2 rounded-md p-2 hover:bg-accent",
                        activeViewId === view.id && "bg-accent",
                      )}
                      key={view.id}
                    >
                      <Button
                        className="flex-1 justify-start gap-2 font-normal"
                        onClick={() => onApplyView(view.id)}
                        size="sm"
                        variant="ghost"
                      >
                        {view.isDefault && <Star className="size-3 fill-current" />}
                        {activeViewId === view.id && <Check className="size-3" />}
                        <div className="flex-1 truncate text-left">
                          <div className="font-medium text-sm">{view.name}</div>
                          {view.description && (
                            <div className="truncate text-muted-foreground text-xs">
                              {view.description}
                            </div>
                          )}
                        </div>
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              aria-label={`Actions for ${view.name}`}
                              className="opacity-0 group-hover:opacity-100"
                              size="sm"
                              variant="ghost"
                            >
                              <MoreVertical className="size-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuPositioner align="end">
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => onApplyView(view.id)}>
                              <Check className="mr-2 size-4" />
                              {mergedLabels.applyView}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onSetDefaultView(view.isDefault ? null : view.id)}
                            >
                              <Star className="mr-2 size-4" />
                              {view.isDefault
                                ? mergedLabels.unsetAsDefault
                                : mergedLabels.setAsDefault}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDuplicateView(view.id)}>
                              <Copy className="mr-2 size-4" />
                              {mergedLabels.duplicate}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => onDeleteView(view.id)}
                            >
                              <Trash2 className="mr-2 size-4" />
                              {mergedLabels.delete}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenuPositioner>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            {defaultView && (
              <>
                <DropdownMenuSeparator />
                <div className="p-2 text-muted-foreground text-xs">
                  <Star className="mr-1 inline size-3 fill-current" />
                  {mergedLabels.defaultView} {defaultView.name}
                </div>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenuPositioner>
      </DropdownMenu>
    </div>
  );
}
