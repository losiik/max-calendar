import type { ReactElement } from 'react';
import type { IconBaseProps } from 'react-icons/lib/iconBase';

declare module 'react-icons/lib/iconBase' {
  export type IconType = (props: IconBaseProps) => ReactElement;
}
