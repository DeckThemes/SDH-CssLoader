import {
    DropdownItem,
    PanelSectionRow,
    ToggleField,
  } from "decky-frontend-lib";
import * as python from "./python";

export class Theme {
    data : any
    checked : boolean = false
    name : string = ""
    description : string = ""
    patches : Patch[] = []

    init(){
      this.name = this.data.name
      this.checked = this.data.enabled
      
      this.description = this.data.version
      if (this.data.author != ""){
        this.description += " | " + this.data.author
      }

      this.patches = []
      this.data.patches.forEach((x : any) => {
        let patch = new Patch(this)
        patch.data = x
        patch.init()
        this.patches.push(patch)
      })
      console.log(`Init-ed theme ${this.name} with state ${this.checked}`)
    }

    setState(){
      python.execute(python.setThemeState(this.name, this.checked))
    }

    generate(){
        return (
              <PanelSectionRow>
                <ToggleField
                  checked={this.checked}
                  label={this.name}
                  description={this.description}
                  onChange={(checked : boolean) => {
                    this.checked = checked
                    this.setState()
                  }}
                >

                </ToggleField>

              {this.patches.map(x => x.generate())}
        
              </PanelSectionRow>
          );
    }
}

export class Patch {
  data : any
  theme : Theme
  name : string = ""
  default : string = ""
  value : string = ""
  options : string[] = []
  index : number = 0

  constructor(theme : Theme){
    this.theme = theme
  }

  init(){
    this.name = this.data.name
    this.default = this.data.default
    this.value = this.data.value
    this.options = this.data.options

    this.index = this.options.indexOf(this.value)
  }

  generate(){
    return (<DropdownItem
      rgOptions={this.options.map((x, i) => {
        return {data: i, label: x}
      })}
      label={`${this.name} of ${this.theme.name}`}
      selectedOption={this.index}
      onChange={(index) => {
          this.index = index.data
          this.value = index.label
          python.execute(python.setPatchOfTheme(this.theme.name, this.name, this.value))
      }}
    />)
  }
}