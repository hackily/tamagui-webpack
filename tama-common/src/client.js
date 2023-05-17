import React from 'react';
import { hydrate } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import Application from './Application';

function Root() {
  return (
    <BrowserRouter>
      <Application  />
    </BrowserRouter>
  );
}

function render() {
  const ele = document.getElementById('application');
  const root = <Root />;

  hydrate(root, ele);
}

render();
