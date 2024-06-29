import { Backend } from "@cssloader/backend";
import DeckyBackendRepository from "./decky-backend-repository-impl";

export const backend = Backend.getInstance(new DeckyBackendRepository());
