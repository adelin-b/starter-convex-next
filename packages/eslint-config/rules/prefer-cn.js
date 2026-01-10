/**
 * @fileoverview Enforce using cn() utility instead of manual className concatenation
 * @author Starter SaaS
 */

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Enforce using cn() from @starter-saas/ui/utils instead of manual className concatenation",
      recommended: true,
    },
    messages: {
      preferCnTemplate:
        "Use cn() from @starter-saas/ui/utils instead of template literal for className",
      preferCnConcat:
        "Use cn() from @starter-saas/ui/utils instead of string concatenation for className",
      preferCnArray:
        "Use cn() from @starter-saas/ui/utils instead of array.join() for className",
    },
    schema: [],
  },

  create(context) {
    /**
     * Check if expression is a cn/clsx/classNames call
     */
    function isClassNameUtilityCall(node) {
      if (node.type !== "CallExpression") return false;
      const callee = node.callee;
      if (callee.type === "Identifier") {
        return ["cn", "clsx", "classNames"].includes(callee.name);
      }
      return false;
    }

    /**
     * Check if this is a JSX className attribute
     */
    function isClassNameAttribute(node) {
      return (
        node.parent?.type === "JSXExpressionContainer" &&
        node.parent.parent?.type === "JSXAttribute" &&
        node.parent.parent.name?.name === "className"
      );
    }

    return {
      // Match template literals in className
      TemplateLiteral(node) {
        if (!isClassNameAttribute(node)) return;

        // Only flag if it has expressions (interpolation)
        if (node.expressions.length > 0) {
          context.report({
            node,
            messageId: "preferCnTemplate",
          });
        }
      },

      // Match binary expressions (string concatenation) in className
      BinaryExpression(node) {
        if (!isClassNameAttribute(node)) return;

        if (node.operator === "+") {
          context.report({
            node,
            messageId: "preferCnConcat",
          });
        }
      },

      // Match array.filter().join() or array.join() patterns in className
      CallExpression(node) {
        if (!isClassNameAttribute(node)) return;
        if (isClassNameUtilityCall(node)) return; // Allow cn/clsx/classNames

        // Check for .join(" ") or .join(' ') pattern
        if (node.callee.type === "MemberExpression" && node.callee.property.name === "join") {
          context.report({
            node,
            messageId: "preferCnArray",
          });
        }
      },
    };
  },
};
