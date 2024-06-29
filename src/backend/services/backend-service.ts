import { Theme, ThemeError } from "../../types";
import { IBackendRepository } from "../repositories";

export class Backend {
  private static instance: Backend;
  private static repository: IBackendRepository;

  constructor(repository: IBackendRepository) {
    if (!Backend.repository) {
      Backend.repository = repository;
    }
  }

  static getInstance(repository: IBackendRepository) {
    if (!Backend.instance) {
      Backend.instance = new Backend(repository);
    }
    return Backend.instance;
  }

  async reset(): Promise<void> {
    await Backend.repository.call<[], void>("reset", []);
  }
  async dummyFunction(): Promise<boolean> {
    return await Backend.repository.call<[], boolean>("dummy_function", []);
  }
  async storeRead(key: string) {
    return Backend.repository.call<[string], string>("store_read", [key]);
  }
  async storeWrite(key: string, value: string) {
    await Backend.repository.call<[string, string], void>("store_write", [key, value]);
  }
  async getThemes() {
    return await Backend.repository.call<[], Theme[]>("get_themes", []);
  }
  async getThemeErrors() {
    return await Backend.repository.call<[], { fails: ThemeError[] }>("get_theme_errors", []);
  }
  async setThemeState(
    themeName: string,
    state: boolean,
    enableDeps: boolean = true,
    enableDepValues: boolean = true
  ) {
    return await Backend.repository.call<[string, boolean, boolean, boolean], void>(
      "set_theme_state",
      [themeName, state, enableDeps, enableDepValues]
    );
  }
  async setPatchOfTheme(themeName: string, patchName: string, value: string) {
    return await Backend.repository.call<[string, string, string], void>("set_patch_of_theme", [
      themeName,
      patchName,
      value,
    ]);
  }
  async setComponentOfThemePatch(
    themeName: string,
    patchName: string,
    componentName: string,
    value: string
  ) {
    return await Backend.repository.call<[string, string, string, string], void>(
      "set_component_of_theme_patch",
      [themeName, patchName, componentName, value]
    );
  }
  async generatePresetThemeFromThemeNames(presetName: string, dependencies: string[]) {
    return await Backend.repository.call<[string, string[]], void>(
      "generate_preset_theme_from_theme_names",
      [presetName, dependencies]
    );
  }
  async fetchThemePath() {
    return await Backend.repository.call<[], string>("fetch_theme_path", []);
  }
  async downloadThemeFromUrl(themeId: string, apiUrl: string) {
    return Backend.repository.call<[string, string]>("download_theme_from_url", [themeId, apiUrl]);
  }
  async getBackendVersion() {
    return await Backend.repository.call<[], number>("get_backend_version", []);
  }

  async fetch<Return>(url: string, request: RequestInit = {}) {
    return Backend.repository.fetch<Return>(url, request);
  }

  toast(title: string, body?: string) {
    Backend.repository.toast(title, body);
  }
}
