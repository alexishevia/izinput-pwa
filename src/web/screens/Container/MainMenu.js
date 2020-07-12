import React from "react";
import PropTypes from "prop-types";
import { Menu, Dropdown } from "semantic-ui-react";
import { navigate } from "@reach/router";

const styles = {
  navbar: {
    backgroundColor: "#6AC36D",
  },
};

const routes = [
  { label: "Transactions", path: "/" },
  { label: "Categories", path: "/categories" },
  { label: "Sync", path: "/sync" },
];

function MenuItem({ active, to, children }) {
  return (
    <Dropdown.Item active={active} onClick={() => navigate(to)}>
      {children}
    </Dropdown.Item>
  );
}

MenuItem.defaultProps = {
  active: false,
};

MenuItem.propTypes = {
  active: PropTypes.bool,
  to: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

export default function MainMenu({ location }) {
  return (
    <Menu attached="top" text style={styles.navbar}>
      <Menu.Item>IZ Input</Menu.Item>
      <Menu.Menu position="right">
        <Dropdown item icon="bars">
          <Dropdown.Menu>
            {routes.map(({ label, path }) => (
              <MenuItem
                key={path}
                to={path}
                active={path === location.pathname}
              >
                {label}
              </MenuItem>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </Menu.Menu>
    </Menu>
  );
}

MainMenu.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
};
