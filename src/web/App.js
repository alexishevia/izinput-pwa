import React from "react";
import { Router } from "@reach/router";
import Container from "./screens/Container";
import Transactions from "./screens/Transactions";
import Categories from "./screens/Categories";
import Sync from "./screens/Sync";

export default function App() {
  return (
    <Router>
      <Container path="/">
        <Transactions path="/" />
        <Categories path="/categories" />
        <Sync path="/sync" />
      </Container>
    </Router>
  );
}
