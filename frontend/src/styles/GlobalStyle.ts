
import { createGlobalStyle } from 'styled-components';
import 'pretendard/dist/web/static/pretendard.css';

export const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  html, body, #root {
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  }

  body {
    font-weight: 400;
  }

  a[x-apple-data-detectors],
  a[x-apple-data-detectors]:hover,
  a[x-apple-data-detectors]:focus,
  a[x-apple-data-detectors]:active {
    color: inherit !important;
    text-decoration: none !important;
  }
`;