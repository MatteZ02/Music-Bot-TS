import Client from "./base/Client";
import { getCommands } from "./utils/getCommands";

const client = new Client(getCommands());

client.log("Client initialized");

export default client;
