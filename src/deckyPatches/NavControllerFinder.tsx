import { Module, findModuleChild } from "decky-frontend-lib";

export const NavController = findModuleChild((m: Module) => m?.CFocusNavNode);
