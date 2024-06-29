import { classMap } from "@decky/ui";

export var classHashMap = new Map<string, string>();

export function initializeClassHashMap() {
  const withoutLocalizationClasses = classMap.filter((module) => Object.keys(module).length < 1000);

  const allClasses = withoutLocalizationClasses
    .map((module) => {
      let filteredModule = {};
      Object.entries(module).forEach(([propertyName, value]) => {
        // Filter out things that start with a number (eg: Breakpoints like 800px)
        // I have confirmed the new classes don't start with numbers
        if (isNaN(Number(value.charAt(0)))) {
          filteredModule[propertyName] = value;
        }
      });
      return filteredModule;
    })
    .filter((module) => {
      // Some modules will be empty after the filtering, remove those
      return Object.keys(module).length > 0;
    });

  const mappings = allClasses.reduce((acc, cur) => {
    Object.entries(cur).forEach(([property, value]) => {
      if (acc[property]) {
        acc[property].push(value);
      } else {
        acc[property] = [value];
      }
    });
    return acc;
  }, {});

  const hashMapNoDupes = Object.entries<string[]>(mappings).reduce<Map<string, string>>(
    (acc, entry) => {
      if (entry[1].length === 1) {
        acc.set(entry[1][0], entry[0]);
      }
      return acc;
    },
    new Map()
  );

  classHashMap = hashMapNoDupes;
}
