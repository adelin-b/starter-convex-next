"use client";

import { DotsSixVertical, Pencil, Plus, Trash } from "@phosphor-icons/react";
import { Badge } from "@starter-saas/ui/badge";
import { Button } from "@starter-saas/ui/button";
import { Card, CardContent } from "@starter-saas/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@starter-saas/ui/dialog";
import { Input } from "@starter-saas/ui/input";
import { Label } from "@starter-saas/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@starter-saas/ui/select";
import { Switch } from "@starter-saas/ui/switch";
import { Textarea } from "@starter-saas/ui/textarea";
import { useState } from "react";
import { cn } from "@/lib/utils";

export type SchemaField = {
  name: string;
  type: "text" | "number" | "boolean" | "select" | "date";
  label: string;
  options?: string[];
  required: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
};

type SchemaFieldBuilderProps = {
  fields: SchemaField[];
  onChange: (fields: SchemaField[]) => void;
  className?: string;
};

function SchemaFieldBuilder({ fields, onChange, className }: SchemaFieldBuilderProps) {
  const [selectedField, setSelectedField] = useState<SchemaField | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleAddField = () => {
    const newField: SchemaField = {
      name: `field_${fields.length + 1}`,
      type: "text",
      label: "New Question",
      required: false,
    };
    setSelectedField(newField);
    setEditingIndex(fields.length);
  };

  const handleEditField = (index: number) => {
    setSelectedField(fields[index] ?? null);
    setEditingIndex(index);
  };

  const handleSaveField = (field: SchemaField) => {
    const newFields = [...fields];
    if (editingIndex !== null) {
      if (editingIndex >= fields.length) {
        newFields.push(field);
      } else {
        newFields[editingIndex] = field;
      }
      onChange(newFields);
    }
    setSelectedField(null);
    setEditingIndex(null);
  };

  const handleDeleteField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index);
    onChange(newFields);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) {
      return;
    }

    const newFields = [...fields];
    const draggedField = newFields[draggedIndex];
    if (!draggedField) {
      return;
    }
    newFields.splice(draggedIndex, 1);
    newFields.splice(index, 0, draggedField);

    onChange(newFields);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Schema Fields</h3>
          <p className="text-muted-foreground text-sm">Define the questions your agent will ask</p>
        </div>
        <Button onClick={handleAddField} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Field
        </Button>
      </div>

      <div className="space-y-2">
        {fields.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground text-sm">
                No fields yet. Click "Add Field" to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          fields.map((field, index) => (
            <Card
              className={cn("cursor-move transition-all", draggedIndex === index && "opacity-50")}
              draggable
              key={index}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragStart={() => handleDragStart(index)}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <DotsSixVertical className="h-5 w-5 text-muted-foreground" />

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{field.label}</p>
                    {field.required && (
                      <Badge className="text-xs" variant="outline">
                        Required
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge className="text-xs" variant="secondary">
                      {field.type}
                    </Badge>
                    <p className="text-muted-foreground text-xs">Field name: {field.name}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => handleEditField(index)} size="sm" variant="ghost">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => handleDeleteField(index)} size="sm" variant="ghost">
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {selectedField && (
        <FieldEditorDialog
          field={selectedField}
          onClose={() => {
            setSelectedField(null);
            setEditingIndex(null);
          }}
          onSave={handleSaveField}
        />
      )}
    </div>
  );
}

type FieldEditorDialogProps = {
  field: SchemaField;
  onSave: (field: SchemaField) => void;
  onClose: () => void;
};

function FieldEditorDialog({ field, onSave, onClose }: FieldEditorDialogProps) {
  const [editedField, setEditedField] = useState<SchemaField>(field);

  const handleTypeChange = (type: SchemaField["type"]) => {
    const updated = { ...editedField, type };
    if (type !== "select") {
      updated.options = undefined;
    }
    setEditedField(updated);
  };

  const handleOptionsChange = (optionsText: string) => {
    const options = optionsText.split("\n").filter((opt) => opt.trim());
    setEditedField({ ...editedField, options });
  };

  return (
    <Dialog onOpenChange={onClose} open>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Field</DialogTitle>
          <DialogDescription>Configure the field properties and validation rules</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="field-name">Field Name</Label>
              <Input
                id="field-name"
                onChange={(e) => setEditedField({ ...editedField, name: e.target.value })}
                placeholder="companySize"
                value={editedField.name}
              />
              <p className="text-muted-foreground text-xs">Unique identifier (camelCase)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="field-type">Field Type</Label>
              <Select onValueChange={handleTypeChange} value={editedField.type}>
                <SelectTrigger id="field-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="boolean">Boolean (Yes/No)</SelectItem>
                  <SelectItem value="select">Select (Options)</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="field-label">Question / Label</Label>
            <Input
              id="field-label"
              onChange={(e) => setEditedField({ ...editedField, label: e.target.value })}
              placeholder="What's the size of your company?"
              value={editedField.label}
            />
            <p className="text-muted-foreground text-xs">The question the agent will ask</p>
          </div>

          {editedField.type === "select" && (
            <div className="space-y-2">
              <Label htmlFor="field-options">Options (one per line)</Label>
              <Textarea
                id="field-options"
                onChange={(e) => handleOptionsChange(e.target.value)}
                placeholder="1-10&#10;11-50&#10;51-200&#10;200+"
                rows={5}
                value={editedField.options?.join("\n") || ""}
              />
            </div>
          )}

          {editedField.type === "number" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="field-min">Min Value</Label>
                <Input
                  id="field-min"
                  onChange={(e) =>
                    setEditedField({
                      ...editedField,
                      validation: {
                        ...editedField.validation,
                        min: e.target.value ? Number(e.target.value) : undefined,
                      },
                    })
                  }
                  type="number"
                  value={editedField.validation?.min ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="field-max">Max Value</Label>
                <Input
                  id="field-max"
                  onChange={(e) =>
                    setEditedField({
                      ...editedField,
                      validation: {
                        ...editedField.validation,
                        max: e.target.value ? Number(e.target.value) : undefined,
                      },
                    })
                  }
                  type="number"
                  value={editedField.validation?.max ?? ""}
                />
              </div>
            </div>
          )}

          {editedField.type === "text" && (
            <div className="space-y-2">
              <Label htmlFor="field-pattern">Validation Pattern (Regex)</Label>
              <Input
                id="field-pattern"
                onChange={(e) =>
                  setEditedField({
                    ...editedField,
                    validation: {
                      ...editedField.validation,
                      pattern: e.target.value || undefined,
                    },
                  })
                }
                placeholder="^[A-Za-z0-9]+$"
                value={editedField.validation?.pattern ?? ""}
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              checked={editedField.required}
              id="field-required"
              onCheckedChange={(checked) => setEditedField({ ...editedField, required: checked })}
            />
            <Label htmlFor="field-required">Required field</Label>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={() => onSave(editedField)}>Save Field</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { SchemaFieldBuilder };
export type { SchemaFieldBuilderProps };
