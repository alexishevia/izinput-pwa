import React from 'react';
import MainMenu from './MainMenu';
import Errors from './Errors';
import { Container as SemanticContainer } from 'semantic-ui-react';

export default function Container(props) {
  const {
    children,
    location, // location prop comes from @reach/router
  } = props;
  return (
    <div>
      <MainMenu location={location} />
      <Errors />
      <SemanticContainer>
        { children }
      </SemanticContainer>
    </div>
  );
}
