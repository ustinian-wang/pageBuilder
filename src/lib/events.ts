export const FORM_FIELD_FOCUS_EVENT = 'builder:formFieldActive'

export interface FormFieldFocusDetail {
  elementId: string
  fieldId: string | null
}

export type FormFieldFocusEvent = CustomEvent<FormFieldFocusDetail>
