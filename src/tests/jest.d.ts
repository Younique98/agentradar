import { RenderOptions, RenderResult } from '@testing-library/react';
import React from 'react';

declare global {
  function customRender(
    ui: React.ReactElement,
    options?: RenderOptions,
  ): RenderResult;
}
