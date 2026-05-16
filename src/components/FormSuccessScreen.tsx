import type { ComponentProps } from 'react';
import FormSuccessState from './FormSuccessState';

export type FormSuccessScreenProps = ComponentProps<typeof FormSuccessState>;

/** Shared wrapper so Donate and Volunteer success states match layout (tree backdrop, spacing). */
export default function FormSuccessScreen(props: FormSuccessScreenProps) {
  return (
    <div className="section-container relative">
      <FormSuccessState {...props} />
    </div>
  );
}
