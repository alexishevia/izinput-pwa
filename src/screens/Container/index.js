import React from 'react';
import { Menu, Dropdown } from 'semantic-ui-react';
import { navigate } from "@reach/router"

const styles = {
  navbar: {
    backgroundColor: '#6AC36D',
  },
};

function MenuItem({active, to, children}) {
  return (
    <Dropdown.Item active={active} onClick={() => navigate(to) }>
      {children}
    </Dropdown.Item>
  );
}

const routes = [
  { label: 'Transactions', path: '/' },
  { label: 'Categories', path: '/categories' },
  { label: 'Sync', path: '/sync' },
];

export default function Container(props) {
  const {
    children,
    location, // location prop comes from @reach/router
  } = props;
  return (
    <div>
      <Menu attached='top' text style={styles.navbar}>
        <Menu.Item>IZ Input</Menu.Item>
        <Menu.Menu position='right'>
          <Dropdown item icon='bars'>
            <Dropdown.Menu>
              {
                routes.map(({label, path}) => (
                  <MenuItem key={path} to={path} active={path === location.pathname}>{label}</MenuItem>
                ))
              }
            </Dropdown.Menu>
          </Dropdown>
        </Menu.Menu>
      </Menu>
      <div>
        { children }
      </div>
    </div>
  );
}
