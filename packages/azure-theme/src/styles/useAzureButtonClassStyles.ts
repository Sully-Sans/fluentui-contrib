import { makeStyles, shorthands, tokens } from '@fluentui/react-components';

const nudgeGradient =
  'linear-gradient(90deg, #464FEB 35%, #47CFFA 70%, #B47CF8 92%)';
const background = (color: string): string =>
  `linear-gradient(${color}, ${color}), ${nudgeGradient}`;

/**
 * Opt-in gradient stroke for Fluent secondary Buttons.
 * Apply the returned `nudge` class to the Button's root.
 */
export const useAzureButtonClassStyles = makeStyles({
  nudge: {
    '&:not(:disabled):not([aria-disabled="true"])': {
      ...shorthands.borderColor('transparent'),
      // The solid fill covers the gradient except at the existing rounded border.
      backgroundImage: background(tokens.colorNeutralBackground1),
      backgroundOrigin: 'border-box',
      backgroundClip: 'padding-box, border-box',
      ':hover': {
        ...shorthands.borderColor('transparent'),
        backgroundImage: background(tokens.colorNeutralBackground1Hover),
      },
      ':hover:active': {
        ...shorthands.borderColor('transparent'),
        backgroundImage: background(tokens.colorNeutralBackground1Pressed),
      },
      '@media (forced-colors: active)': {
        backgroundImage: 'none',
        ...shorthands.borderColor('ButtonText'),
        ':hover': {
          ...shorthands.borderColor('Highlight'),
        },
        ':hover:active': {
          ...shorthands.borderColor('Highlight'),
        },
      },
    },
  },
});
