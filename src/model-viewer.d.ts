import * as React from 'react';

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
          src?: string;
          alt?: string;
          'camera-controls'?: boolean | string;
          'touch-action'?: string;
          'auto-rotate'?: boolean | string;
          'rotation-per-second'?: string;
          'shadow-intensity'?: string | number;
          'shadow-softness'?: string | number;
          exposure?: string | number;
          loading?: string;
          poster?: string;
          ar?: boolean | string;
          'ar-modes'?: string;
        };
      }
    }
  }
}
