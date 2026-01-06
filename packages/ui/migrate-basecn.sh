#!/bin/bash
# Script to migrate components from basecn

COMPONENTS=(
  "accordion"
  "alert-dialog"
  "alert"
  "avatar"
  "badge"
  "breadcrumb"
  "button"
  "calendar"
  "card"
  "checkbox"
  "collapsible"
  "context-menu"
  "dialog"
  "drawer"
  "dropdown-menu"
  "form"
  "hover-card"
  "input"
  "label"
  "menubar"
  "navigation-menu"
  "pagination"
  "popover"
  "progress"
  "radio-group"
  "scroll-area"
  "select"
  "separator"
  "sheet"
  "sidebar"
  "skeleton"
  "slider"
  "switch"
  "table"
  "tabs"
  "textarea"
  "toggle"
  "toggle-group"
  "tooltip"
)

for component in "${COMPONENTS[@]}"; do
  echo "Adding @basecn/$component..."
  echo "y" | bunx --bun shadcn@latest add "@basecn/$component" --overwrite 2>/dev/null
done

# Move files from src/components/ui/ to src/components/
echo "Moving files..."
for f in src/components/ui/*.tsx; do
  if [ -f "$f" ]; then
    filename=$(basename "$f")
    # Fix imports and move
    sed -i '' 's|from "@/utils"|from "@starter-saas/ui/utils"|g' "$f"
    sed -i '' 's|from "@/lib/utils"|from "@starter-saas/ui/utils"|g' "$f"
    mv "$f" "src/components/$filename"
    echo "Moved $filename"
  fi
done

# Cleanup
rmdir src/components/ui 2>/dev/null

echo "Done!"
