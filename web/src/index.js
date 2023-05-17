import App from "tama-common/modules/App";
import { AppRegistry } from "react-native";

const Web = () => {
  return <App />;
};

AppRegistry.registerComponent("Web", () => Web);

AppRegistry.runApplication("Web", {
  rootTag: document.getElementById("app"),
});
