import { type AutoFormUIComponents, AutoForm as BaseAutoForm } from "@autoform/react";
import { ArrayElementWrapper } from "./components/array-element-wrapper";
import { ArrayWrapper } from "./components/array-wrapper";
import { BooleanField } from "./components/boolean-field";
import { DateField } from "./components/date-field";
import { ErrorMessage } from "./components/error-message";
import { FieldWrapper } from "./components/field-wrapper";
import { Form } from "./components/form";
import { NumberField } from "./components/number-field";
import { ObjectWrapper } from "./components/object-wrapper";
import { SelectField } from "./components/select-field";
import { StringField } from "./components/string-field";
import { SubmitButton } from "./components/submit-button";
import type { AutoFormProps } from "./types";

const ShadcnUIComponents: AutoFormUIComponents = {
  Form,
  FieldWrapper,
  ErrorMessage,
  SubmitButton,
  ObjectWrapper,
  ArrayWrapper,
  ArrayElementWrapper,
};

export const ShadcnAutoFormFieldComponents = {
  string: StringField,
  number: NumberField,
  boolean: BooleanField,
  date: DateField,
  select: SelectField,
} as const;
export type FieldTypes = keyof typeof ShadcnAutoFormFieldComponents;

export function AutoForm<T extends Record<string, any>>({
  uiComponents,
  formComponents,
  ...props
}: AutoFormProps<T>) {
  return (
    <BaseAutoForm
      {...props}
      formComponents={{ ...ShadcnAutoFormFieldComponents, ...formComponents }}
      uiComponents={{ ...ShadcnUIComponents, ...uiComponents }}
    />
  );
}
