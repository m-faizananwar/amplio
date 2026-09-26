"use client";

import { createContext, useContext } from "react";
import type { AgentCall } from "./useAgentCall";

// The call lives in the app shell; anything under it (the rail, ⌘K, the agent
// page) can start it or read it. Null outside the shell or with agent mode off.
export const CallContext = createContext<AgentCall | null>(null);
export const useCall = () => useContext(CallContext);
