
import fs from "fs";
import { processUserMessage } from "./src/components/AiScheduler/AiSchedulingEngine.js";

const history = [{ sender: "user", text: "can you search for the cooking events that is going to happen in Delhi this month" }];
const contextData = { existingEvents: [], staffRole: "Cook", currentView: "Staff App" };

processUserMessage(history, contextData).then(console.log).catch(console.error);

