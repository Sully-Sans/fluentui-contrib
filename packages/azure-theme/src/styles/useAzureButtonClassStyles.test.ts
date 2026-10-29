import * as React from 'react';
import { render, renderHook, screen } from '@testing-library/react';
import {
  Button,
  createDOMRenderer,
  FluentProvider,
  RendererProvider,
  tokens,
} from '@fluentui/react-components';

import { AzureDarkTheme, AzureLightTheme, useAzureButtonClassStyles } from '..';

const gradient =
  'linear-gradient(90deg, #464FEB 35%, #47CFFA 70%, #B47CF8 92%)';

function renderStyles() {
  const renderer = createDOMRenderer(document);
  renderHook(useAzureButtonClassStyles, {
    wrapper: ({ children }) =>
      React.createElement(RendererProvider, { renderer, children }),
  });
  const rules = Object.values(renderer.stylesheets).flatMap((sheet) =>
    sheet.cssRules()
  );
  return rules;
}

describe('useAzureButtonClassStyles', () => {
  it('paints the gradient with theme-aware normal, hover, and pressed fills', () => {
    const rules = renderStyles();
    const css = rules.join('\n').replace(/\s+/g, '');

    for (const fill of [
      tokens.colorNeutralBackground1,
      tokens.colorNeutralBackground1Hover,
      tokens.colorNeutralBackground1Pressed,
    ]) {
      expect(css).toContain(
        `linear-gradient(${fill}, ${fill}), ${gradient}`.replace(/\s+/g, '')
      );
    }
    expect(css).toContain('background-clip:padding-box,border-box');
    expect(css).toContain('background-origin:border-box');
    expect(css).toContain(':hover');
    expect(css).toContain(':hover:active');
  });

  it('excludes disabled and aria-disabled buttons from every override', () => {
    const rules = renderStyles();

    expect(rules.length).toBeGreaterThan(0);
    for (const rule of rules) {
      expect(rule).toContain(':not(:disabled):not([aria-disabled="true"])');
    }
  });

  it('uses system-color borders instead of a gradient in forced colors', () => {
    const rules = renderStyles();
    const forcedColors = rules
      .filter((rule) => rule.includes('forced-colors'))
      .join('\n');

    expect(forcedColors).toContain('background-image: none');
    expect(forcedColors).toContain('ButtonText');
    expect(forcedColors).toContain('Highlight');
    expect(forcedColors).not.toContain('linear-gradient');
  });

  it.each([
    { name: 'light', theme: AzureLightTheme },
    { name: 'dark', theme: AzureDarkTheme },
  ])(
    'applies the public hook only to enabled opted-in Buttons in the $name theme',
    ({ theme }) => {
      const rules = renderStyles();
      const gradientSelectors = rules
        .filter(
          (rule) => rule.includes('linear-gradient') && !rule.includes(':hover')
        )
        .map((rule) => rule.slice(0, rule.indexOf('{')).trim());
      function Example() {
        const styles = useAzureButtonClassStyles();
        return React.createElement(
          React.Fragment,
          null,
          React.createElement(Button, { appearance: 'secondary' }, 'Standard'),
          React.createElement(
            Button,
            { appearance: 'secondary', className: styles.nudge },
            'Styled'
          ),
          React.createElement(
            Button,
            {
              appearance: 'secondary',
              className: styles.nudge,
              disabled: true,
            },
            'Disabled'
          ),
          React.createElement(
            Button,
            {
              appearance: 'secondary',
              className: styles.nudge,
              disabledFocusable: true,
            },
            'Disabled focusable'
          )
        );
      }
      render(
        React.createElement(FluentProvider, {
          theme,
          children: React.createElement(Example),
        })
      );

      const standard = screen.getByRole('button', { name: 'Standard' });
      const styled = screen.getByRole('button', { name: 'Styled' });
      expect(gradientSelectors.length).toBeGreaterThan(0);
      for (const selector of gradientSelectors) {
        expect(styled.matches(selector)).toBe(true);
        expect(standard.matches(selector)).toBe(false);
        expect(
          screen.getByRole('button', { name: 'Disabled' }).matches(selector)
        ).toBe(false);
        expect(
          screen
            .getByRole('button', { name: 'Disabled focusable' })
            .matches(selector)
        ).toBe(false);
      }
    }
  );
});
