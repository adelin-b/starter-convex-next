"use client";
/* eslint-disable lingui/no-unlocalized-strings */

import { Button } from "@starter-saas/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@starter-saas/ui/card";
import { Textarea } from "@starter-saas/ui/textarea";
import { cn } from "@starter-saas/ui/utils";
import { Check, ChevronDown, ChevronUp, Copy, Edit2, X } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

type ScriptPhaseCardProps = {
  title: string;
  description: string;
  content: string;
  icon: React.ReactNode;
  colorClass: string;
  isEditable?: boolean;
  onContentChange?: (content: string) => void;
};

export function ScriptPhaseCard({
  title,
  description,
  content,
  icon,
  colorClass,
  isEditable = false,
  onContentChange,
}: ScriptPhaseCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  }, [content]);

  const handleSave = useCallback(() => {
    onContentChange?.(editedContent);
    setIsEditing(false);
    toast.success("Changes saved");
  }, [editedContent, onContentChange]);

  const handleCancel = useCallback(() => {
    setEditedContent(content);
    setIsEditing(false);
  }, [content]);

  return (
    <Card className={cn("transition-all", colorClass)}>
      <CardHeader
        className="cursor-pointer"
        onClick={() => !isEditing && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background/50">
              {icon}
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy();
                  }}
                  size="icon"
                  variant="ghost"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                {isEditable && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                    }}
                    size="icon"
                    variant="ghost"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </>
            )}
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              size="icon"
              variant="ghost"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <Textarea
                className="min-h-[200px] font-mono text-sm"
                onChange={(e) => setEditedContent(e.target.value)}
                value={editedContent}
              />
              <div className="flex justify-end gap-2">
                <Button onClick={handleCancel} size="sm" variant="outline">
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button onClick={handleSave} size="sm">
                  <Check className="mr-2 h-4 w-4" />
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap rounded-lg bg-background/50 p-4 text-sm leading-relaxed">
                {content}
              </pre>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
