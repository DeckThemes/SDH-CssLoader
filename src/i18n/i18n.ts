import languagesData from "./languages.json";
import steamLanguageMap from "../../defaults/i18n/steam_language_map.json";
import languageMetadata from "../../defaults/i18n/language_metadata.json";
import { getSteamLanguage } from "../python";

type LanguageStrings = Record<string, string>;

const allLanguages: Record<string, LanguageStrings> = languagesData as any;
const langMap: Record<string, string> = steamLanguageMap as any;
const langMeta: Record<string, string> = languageMetadata as any;

const normalizeLanguage = (language: string): string => {
  if (!language || typeof language !== "string") return "en";
  const normalized = language.trim().toLowerCase();
  return langMap[normalized] ?? normalized;
};

let cachedLanguage: string | null = null;

export const setCachedLanguage = (lang: string) => {
  cachedLanguage = lang;
  try {
    window?.localStorage?.setItem("decky_plugin_steam_language", lang);
  } catch {}
};

export const initLanguage = async () => {
  try {
    const rawLang = await getSteamLanguage();
    if (rawLang) {
      const norm = normalizeLanguage(rawLang);
      if (allLanguages[norm]) {
        setCachedLanguage(norm);
      }
    }
  } catch (e) {
    console.warn("Failed to get steam language from python:", e);
  }
};

// Initiate background fetch
try {
  void initLanguage();
} catch {}

export const getCurrentLanguage = (): string => {
  if (cachedLanguage && allLanguages[cachedLanguage]) {
    return cachedLanguage;
  }

  try {
    const win = window as any;

    // 0. Check localStorage cached language
    const stored = win?.localStorage?.getItem("decky_plugin_steam_language");
    if (stored && allLanguages[stored]) {
      cachedLanguage = stored;
      return stored;
    }

    // Check windows: win, top, parent, opener
    for (const w of [win, win?.top, win?.parent, win?.opener]) {
      if (!w) continue;

      // 1. Primary Steam Big Picture locales list
      const locales = w?.LocalizationManager?.m_rgLocalesToUse;
      if (Array.isArray(locales) && locales.length > 0) {
        for (const loc of locales) {
          if (typeof loc === "string") {
            const norm = normalizeLanguage(loc);
            if (allLanguages[norm]) {
              setCachedLanguage(norm);
              return norm;
            }
          }
        }
      }

      // 2. Steam Big Picture current language string
      const currentSteamLang = w?.LocalizationManager?.m_strCurrentLanguage;
      if (typeof currentSteamLang === "string") {
        const norm = normalizeLanguage(currentSteamLang);
        if (allLanguages[norm]) {
          setCachedLanguage(norm);
          return norm;
        }
      }

      // 3. SteamClient Settings API if available
      if (typeof w?.SteamClient?.Settings?.GetCurrentLanguage === "function") {
        const clientLang = w.SteamClient.Settings.GetCurrentLanguage();
        if (typeof clientLang === "string") {
          const norm = normalizeLanguage(clientLang);
          if (allLanguages[norm]) {
            setCachedLanguage(norm);
            return norm;
          }
        }
      }
    }

    // 4. Browser / CEF fallback
    if (Array.isArray(navigator.languages)) {
      for (const loc of navigator.languages) {
        if (typeof loc === "string") {
          const norm = normalizeLanguage(loc);
          if (allLanguages[norm]) return norm;
        }
      }
    }

    if (typeof navigator.language === "string") {
      const norm = normalizeLanguage(navigator.language);
      if (allLanguages[norm]) return norm;
    }
  } catch (err) {
    console.warn("Error detecting current Steam language:", err);
  }

  return "en";
};

export const getLanguageName = (lang?: string): string => {
  const targetLang = normalizeLanguage(lang || getCurrentLanguage());
  return langMeta[targetLang] || targetLang;
};

export const t = (
  key: string,
  originalString: string,
  params?: Record<string, string | number>
): string => {
  const lang = getCurrentLanguage();

  let text = originalString;
  if (lang !== "en" && allLanguages[lang]?.[key]) {
    text = allLanguages[lang][key];
  } else if (allLanguages["en"]?.[key]) {
    text = allLanguages["en"][key];
  }

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }

  return text;
};

export const translateThemeTitle = (title?: string, name?: string): string => {
  return title || name || "";
};

const SORT_OPTIONS_RU: Record<string, string> = {
  "Alphabetical (A to Z)": "По алфавиту (А — Я)",
  "Alphabetical (Z to A)": "По алфавиту (Я — А)",
  "Last Updated": "Последнее обновление",
  "Last Updated (Newest)": "Последнее обновление (новые)",
  "Last Updated (Oldest)": "Последнее обновление (старые)",
  "First Updated": "Первое обновление",
  "Most Downloaded": "Больше всего скачиваний",
  "Least Downloaded": "Меньше всего скачиваний",
  "Most Stars": "Больше всего звёзд",
  "Least Stars": "Меньше всего звёзд",
  "Alphabetical": "По алфавиту",
  "Highest Rated": "С высоким рейтингом",
  "Random": "Случайно",
};

export const translateSortOrder = (order: string): string => {
  if (!order) return "";
  const trimmed = order.trim();
  switch (trimmed) {
    case "Alphabetical (A to Z)":
      return t("SORT_ALPHABETICAL_AZ", "Alphabetical (A to Z)");
    case "Alphabetical (Z to A)":
      return t("SORT_ALPHABETICAL_ZA", "Alphabetical (Z to A)");
    case "Last Updated":
      return t("SORT_LAST_UPDATED", "Last Updated");
    case "Last Updated (Newest)":
      return t("SORT_LAST_UPDATED_NEWEST", "Last Updated (Newest)");
    case "Last Updated (Oldest)":
      return t("SORT_LAST_UPDATED_OLDEST", "Last Updated (Oldest)");
    case "First Updated":
      return t("SORT_FIRST_UPDATED", "First Updated");
    case "Most Downloaded":
      return t("SORT_MOST_DOWNLOADED", "Most Downloaded");
    case "Least Downloaded":
      return t("SORT_LEAST_DOWNLOADED", "Least Downloaded");
    case "Most Stars":
      return t("SORT_MOST_STARS", "Most Stars");
    case "Least Stars":
      return t("SORT_LEAST_STARS", "Least Stars");
    case "Alphabetical":
      return t("SORT_ALPHABETICAL", "Alphabetical");
    case "Highest Rated":
      return t("SORT_HIGHEST_RATED", "Highest Rated");
    case "Random":
      return t("SORT_RANDOM", "Random");
    default: {
      const lang = getCurrentLanguage();
      if ((lang === "ru" || lang === "uk") && SORT_OPTIONS_RU[trimmed]) {
        return SORT_OPTIONS_RU[trimmed];
      }
      return order;
    }
  }
};

const FILTER_OPTIONS_RU: Record<string, string> = {
  "All": "Все",
  "Profile": "Профиль",
  "Tweak": "Твики",
  "System-Wide": "Вся система",
  "System Wide": "Вся система",
  "Library": "Библиотека",
  "Home": "Главный экран",
  "Other": "Другое",
  "Keyboard": "Клавиатура",
  "Snippet": "Сниппеты",
  "Desktop": "Рабочий стол",
  "Desktop-Library": "Рабочий стол: Библиотека",
  "Desktop-Tweak": "Рабочий стол: Твики",
  "Desktop-Store": "Рабочий стол: Магазин",
  "Desktop-Friends": "Рабочий стол: Друзья",
  "Store": "Магазин",
  "Lock Screen": "Экран блокировки",
  "Lockscreen": "Экран блокировки",
  "Media": "Медиа",
  "Downloads": "Загрузки",
  "Friends and Chat": "Друзья и чат",
  "Friends & Chat": "Друзья и чат",
  "Background": "Фон",
  "Settings": "Настройки",
  "Boot": "Экран загрузки",
  "Audio": "Звуки",
  "Clean": "Минималистичные",
  "Minimal": "Минимализм",
  "System": "Системные",
  "UI": "Интерфейс",
  "Theme": "Темы",
  "Colors": "Цвета",
  "Animation": "Анимации",
  "Layout": "Макет",
  "Misc": "Разное",
  "Icons": "Иконки",
  "Fonts": "Шрифты",
  "Sound": "Звуки",
  "Sounds": "Звуки",
  "Login": "Вход в систему",
  "Notification": "Уведомления",
  "Notifications": "Уведомления",
  "Header": "Верхняя панель",
  "Footer": "Нижняя панель",
  "Navbar": "Навигация",
  "Navigation": "Навигация",
  "Quick Access": "Быстрый доступ",
};

export const translateFilter = (filter: string): string => {
  if (!filter) return "";
  const trimmed = filter.trim();
  switch (trimmed) {
    case "All":
      return t("FILTER_ALL", "All");
    case "Profile":
      return t("FILTER_PROFILE", "Profile");
    case "Tweak":
      return t("FILTER_TWEAK", "Tweak");
    case "System-Wide":
    case "System Wide":
      return t("FILTER_SYSTEM_WIDE", "System-Wide");
    case "Library":
      return t("FILTER_LIBRARY", "Library");
    case "Home":
      return t("FILTER_HOME", "Home");
    case "Other":
      return t("FILTER_OTHER", "Other");
    case "Keyboard":
      return t("FILTER_KEYBOARD", "Keyboard");
    case "Snippet":
      return t("FILTER_SNIPPET", "Snippet");
    case "Desktop":
      return t("FILTER_DESKTOP", "Desktop");
    case "Desktop-Library":
      return t("FILTER_DESKTOP_LIBRARY", "Desktop-Library");
    case "Desktop-Tweak":
      return t("FILTER_DESKTOP_TWEAK", "Desktop-Tweak");
    case "Desktop-Store":
      return t("FILTER_DESKTOP_STORE", "Desktop-Store");
    case "Desktop-Friends":
      return t("FILTER_DESKTOP_FRIENDS", "Desktop-Friends");
    case "Store":
      return t("FILTER_STORE", "Store");
    case "Lock Screen":
    case "Lockscreen":
      return t("FILTER_LOCKSCREEN", "Lockscreen");
    case "Media":
      return t("FILTER_MEDIA", "Media");
    case "Downloads":
      return t("FILTER_DOWNLOADS", "Downloads");
    case "Friends and Chat":
    case "Friends & Chat":
      return t("FILTER_FRIENDS_CHAT", "Friends and Chat");
    case "Background":
      return t("FILTER_BACKGROUND", "Background");
    case "Settings":
      return t("FILTER_SETTINGS", "Settings");
    case "Boot":
      return t("FILTER_BOOT", "Boot");
    case "Audio":
      return t("FILTER_AUDIO", "Audio");
    case "Clean":
      return t("FILTER_CLEAN", "Clean");
    case "Minimal":
      return t("FILTER_MINIMAL", "Minimal");
    case "System":
      return t("FILTER_SYSTEM", "System");
    case "UI":
      return t("FILTER_UI", "UI");
    case "Theme":
      return t("FILTER_THEME", "Theme");
    case "Colors":
      return t("FILTER_COLORS", "Colors");
    case "Animation":
      return t("FILTER_ANIMATION", "Animation");
    case "Layout":
      return t("FILTER_LAYOUT", "Layout");
    case "Misc":
      return t("FILTER_MISC", "Misc");
    case "Icons":
      return t("FILTER_ICONS", "Icons");
    case "Fonts":
      return t("FILTER_FONTS", "Fonts");
    case "Sound":
    case "Sounds":
      return t("FILTER_SOUND", "Sound");
    case "Login":
      return t("FILTER_LOGIN", "Login");
    case "Notification":
    case "Notifications":
      return t("FILTER_NOTIFICATIONS", "Notifications");
    case "Header":
      return t("FILTER_HEADER", "Header");
    case "Footer":
      return t("FILTER_FOOTER", "Footer");
    case "Navbar":
    case "Navigation":
      return t("FILTER_NAVIGATION", "Navigation");
    case "Quick Access":
      return t("FILTER_QUICK_ACCESS", "Quick Access");
    default: {
      const lang = getCurrentLanguage();
      if ((lang === "ru" || lang === "uk") && FILTER_OPTIONS_RU[trimmed]) {
        return FILTER_OPTIONS_RU[trimmed];
      }
      if (trimmed.includes("-")) {
        const parts = trimmed.split("-").map((p) => translateFilter(p));
        if (lang === "ru" || lang === "uk") {
          return parts.join(": ");
        }
        return parts.join("-");
      }
      return filter;
    }
  }
};

const PATCH_VALUES_RU: Record<string, string> = {
  "Yes": "Да",
  "No": "Нет",
  "Default": "По умолчанию",
  "Enabled": "Включено",
  "Disabled": "Отключено",
  "On": "Вкл",
  "Off": "Выкл",
  "Show": "Показать",
  "Hide": "Скрыть",
  "None": "Нет",
  "Top": "Сверху",
  "Bottom": "Снизу",
  "Left": "Слева",
  "Right": "Справа",
  "Center": "По центру",
  "Light": "Светлая",
  "Dark": "Тёмная",
  "Small": "Маленький",
  "Medium": "Средний",
  "Large": "Большой",
  "Big": "Большой",
  "Raised": "Приподнятый",
  "Blurred": "Размытый",
  "Extra Large": "Очень большой",
  "Very Large": "Очень большой",
  "True": "Да",
  "False": "Нет",
  "Visible": "Видимый",
  "Hidden": "Скрытый",
  "Normal": "Обычный",
  "Compact": "Компактный",
  "Auto": "Авто",
};

export const translatePatchValue = (val: string): string => {
  if (!val) return "";
  const trimmed = val.trim();
  switch (trimmed) {
    case "Yes":
      return t("PATCH_VAL_YES", "Yes");
    case "No":
      return t("PATCH_VAL_NO", "No");
    case "Default":
      return t("PATCH_VAL_DEFAULT", "Default");
    case "Enabled":
      return t("PATCH_VAL_ENABLED", "Enabled");
    case "Disabled":
      return t("PATCH_VAL_DISABLED", "Disabled");
    case "On":
      return t("PATCH_VAL_ON", "On");
    case "Off":
      return t("PATCH_VAL_OFF", "Off");
    case "Show":
      return t("PATCH_VAL_SHOW", "Show");
    case "Hide":
      return t("PATCH_VAL_HIDE", "Hide");
    case "None":
      return t("PATCH_VAL_NONE", "None");
    case "Top":
      return t("PATCH_VAL_TOP", "Top");
    case "Bottom":
      return t("PATCH_VAL_BOTTOM", "Bottom");
    case "Left":
      return t("PATCH_VAL_LEFT", "Left");
    case "Right":
      return t("PATCH_VAL_RIGHT", "Right");
    case "Center":
      return t("PATCH_VAL_CENTER", "Center");
    case "Light":
      return t("PATCH_VAL_LIGHT", "Light");
    case "Dark":
      return t("PATCH_VAL_DARK", "Dark");
    case "Small":
      return t("PATCH_VAL_SMALL", "Small");
    case "Medium":
      return t("PATCH_VAL_MEDIUM", "Medium");
    case "Large":
      return t("PATCH_VAL_LARGE", "Large");
    case "Big":
      return t("PATCH_VAL_BIG", "Big");
    case "Raised":
      return t("PATCH_VAL_RAISED", "Raised");
    case "Blurred":
      return t("PATCH_VAL_BLURRED", "Blurred");
    case "Extra Large":
    case "Very Large":
      return t("PATCH_VAL_EXTRA_LARGE", "Extra Large");
    default: {
      const lang = getCurrentLanguage();
      if ((lang === "ru" || lang === "uk") && PATCH_VALUES_RU[trimmed]) {
        return PATCH_VALUES_RU[trimmed];
      }
      return val;
    }
  }
};

const PATCH_NAMES_RU: Record<string, string> = {
  "Theme Color": "Цвет темы",
  "Accent Color": "Цвет акцента",
  "Background": "Фон",
  "Position": "Позиция",
  "Size": "Размер",
  "Style": "Стиль",
  "Opacity": "Прозрачность",
  "Blur": "Размытие",
  "Font": "Шрифт",
  "Radius": "Радиус",
  "Game Title Font Size": "Размер шрифта названия игры",
  "Disable 'Recent Games' Text": "Скрыть текст «Недавние игры»",
  "Disable Recent Games Text": "Скрыть текст «Недавние игры»",
  "Disable Game Highlight": "Отключить подсветку игры",
  "Hide Bottom Buttons": "Скрыть нижние кнопки",
  "Show Recent Games": "Показывать недавние игры",
  "Grid Size": "Размер сетки",
  "Navbar": "Панель навигации",
  "Header": "Верхняя панель",
  "Footer": "Нижняя панель",
  "Sidebar": "Боковая панель",
  "Clock": "Часы",
  "Battery": "Батарея",
  "Round Corners": "Скруглённые углы",
  "Icons": "Иконки",
  "Colors": "Цвета",
  "Animation": "Анимации",
  "Layout": "Макет",
  "Transparency": "Прозрачность",
  "Borders": "Рамки",
  "Lock Screen": "Экран блокировки",
  "Quick Access": "Меню быстрого доступа",
};

export const translatePatchName = (name: string): string => {
  if (!name) return "";
  const trimmed = name.trim();
  switch (trimmed) {
    case "Theme Color":
      return t("PATCH_NAME_THEME_COLOR", "Theme Color");
    case "Accent Color":
      return t("PATCH_NAME_ACCENT_COLOR", "Accent Color");
    case "Background":
      return t("PATCH_NAME_BACKGROUND", "Background");
    case "Position":
      return t("PATCH_NAME_POSITION", "Position");
    case "Size":
      return t("PATCH_NAME_SIZE", "Size");
    case "Style":
      return t("PATCH_NAME_STYLE", "Style");
    case "Opacity":
      return t("PATCH_NAME_OPACITY", "Opacity");
    case "Blur":
      return t("PATCH_NAME_BLUR", "Blur");
    case "Font":
      return t("PATCH_NAME_FONT", "Font");
    case "Radius":
      return t("PATCH_NAME_RADIUS", "Radius");
    case "Game Title Font Size":
      return t("PATCH_NAME_GAME_TITLE_FONT_SIZE", "Game Title Font Size");
    case "Disable 'Recent Games' Text":
    case "Disable Recent Games Text":
      return t("PATCH_NAME_DISABLE_RECENT_GAMES_TEXT", "Disable 'Recent Games' Text");
    case "Disable Game Highlight":
      return t("PATCH_NAME_DISABLE_GAME_HIGHLIGHT", "Disable Game Highlight");
    case "Hide Bottom Buttons":
      return t("PATCH_NAME_HIDE_BOTTOM_BUTTONS", "Hide Bottom Buttons");
    case "Show Recent Games":
      return t("PATCH_NAME_SHOW_RECENT_GAMES", "Show Recent Games");
    case "Grid Size":
      return t("PATCH_NAME_GRID_SIZE", "Grid Size");
    case "Navbar":
      return t("PATCH_NAME_NAVBAR", "Navbar");
    case "Header":
      return t("PATCH_NAME_HEADER", "Header");
    case "Footer":
      return t("PATCH_NAME_FOOTER", "Footer");
    case "Sidebar":
      return t("PATCH_NAME_SIDEBAR", "Sidebar");
    case "Clock":
      return t("PATCH_NAME_CLOCK", "Clock");
    case "Battery":
      return t("PATCH_NAME_BATTERY", "Battery");
    case "Round Corners":
      return t("PATCH_NAME_ROUND_CORNERS", "Round Corners");
    default: {
      const lang = getCurrentLanguage();
      if ((lang === "ru" || lang === "uk") && PATCH_NAMES_RU[trimmed]) {
        return PATCH_NAMES_RU[trimmed];
      }
      return name;
    }
  }
};

export default t;
