import React from 'react';
import dapp from './src/hoc/dapp';

export const wrapPageElement = ({
  element,
  props,
}: {
  element: React.ReactElement;
  props: Record<string, unknown> & { location: Location };
}) => {
  return dapp(element, props);
};

const HeadComponents = [
  <link key="head-1" rel="preconnect" href="https://fonts.googleapis.com" />,
  <link key="head-2" rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />,
  <link
    key="head-3"
    href="https://fonts.googleapis.com/css2?family=Inter:wght@100;300;600&family=Josefin+Sans:wght@200;600&family=Montserrat:wght@500&display=swap"
    rel="stylesheet"
  />,
  <style key="head-4">{`html {
        background-color: #000;
    }`}</style>,
];

export const onRenderBody = ({ setHeadComponents, setHtmlAttributes }) => {
  setHeadComponents(HeadComponents);
  setHtmlAttributes({ className: 'dark' });
};
