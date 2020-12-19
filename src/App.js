import React from "react";
import { HashRouter, Switch, Route } from "react-router-dom";
import IrregularVerbs from "./views/IrregularVerbs";

function App() {
  return (
    <HashRouter>
      <Switch>
        <Route path="/irregular-verbs" component={IrregularVerbs} />
      </Switch>
    </HashRouter>
  );
}

export default App;
