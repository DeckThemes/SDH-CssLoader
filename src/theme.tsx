import {
    ButtonItem,
    definePlugin,
    DialogButton,
    Menu,
    MenuItem,
    PanelSection,
    PanelSectionRow,
    Router,
    ServerAPI,
    showContextMenu,
    staticClasses,
    ToggleField,
  } from "decky-frontend-lib";
import { useState, VFC } from "react";
import { FaShip } from "react-icons/fa";
import { GoGear } from "react-icons/go"
import * as python from "./python";

export class Theme {
    data : any
    checked : boolean = false
    name : string = ""
    description : string = ""

    init(){
      this.name = this.data.name
      this.checked = this.data.enabled
      
      this.description = this.data.version
      if (this.data.author != ""){
        this.description += "| " + this.data.author
      }
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
                <ButtonItem
                  layout="inline"
                >
                  <GoGear />
                </ButtonItem>
        
              </PanelSectionRow>
          );
    }
}