import { Route, Switch } from "wouter";
import Buzzer from "./buzzer";
import Controller from "./controller";
import Scoreboard from "./scoreboard";

export default function App() {
  return (
    <Switch>
      <Route path="/scoreboard" component={Scoreboard} />
      <Route path="/controller" component={Controller} />
      <Route path="/buzzer" component={Buzzer} />
    </Switch>
  );
}
