export class Theme {
  data: any;
  id: string = "";
  checked: boolean = false;
  name: string = "";
  description: string = "";
  patches: Patch[] = [];
  dependencies: string[] = [];

  // This init function is called by the setter function in GlobalState
  init() {
    this.name = this.data.name;
    this.id = this.data.id;
    this.checked = this.data.enabled;
    this.dependencies = this.data.dependencies;

    this.description = this.data.version;
    if (this.data.author != "") {
      this.description += " | " + this.data.author;
    }

    this.patches = [];
    this.data.patches.forEach((x: any) => {
      let patch = new Patch(this);
      patch.data = x;
      patch.init();
      this.patches.push(patch);
    });
  }
}

export interface themePatchComponent {
  name: string;
  on: string;
  type: string;
  value: string;
}

export class Patch {
  data: any;
  theme: Theme;
  name: string = "";
  default: string = "";
  value: string = "";
  options: string[] = [];
  index: number = 0;
  type: string = "dropdown";
  components: themePatchComponent[] = [];

  constructor(theme: Theme) {
    this.theme = theme;
  }

  init() {
    this.name = this.data.name;
    this.default = this.data.default;
    this.value = this.data.value;
    this.options = this.data.options;
    this.type = this.data.type;
    this.components = this.data.components;

    this.index = this.options.indexOf(this.value);
  }
}
