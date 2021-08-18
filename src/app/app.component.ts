import { ElementRef, ViewChild } from '@angular/core';
import { AfterViewInit } from '@angular/core';
import { Component } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import * as ace from "ace-builds";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {

  title = 'json-schema-tree-viewer';
  @ViewChild("editor")
  private editor!: ElementRef<HTMLElement>;

  sampleSchema = {
    "$schema": "http://json-schema.org/draft-04/schema#",
    "$id": "https://example.com/employee.schema.json",
    "title": "Record of employee",
    "description": "This document records the details of an employee",
    "type": "object",
    "properties": {
      "id": {
        "description": "A unique identifier for an employee",
        "type": "number"
      },
      "name": {
        "description": "Full name of the employee",
        "type": "string"
      },
      "age": {
        "description": "Age of the employee",
        "type": "number"
      },
      "hobbies": {
        "description": "Hobbies of the employee",
        "type": "object",
        "properties": {
          "indoor": {
            "type": "array",
            "items": {
              "description": "List of indoor hobbies",
              "type": "string"
            }
          },
          "outdoor": {
            "type": "array",
            "items": {
              "description": "List of outdoor hobbies",
              "type": "string"
            }
          }
        }
      }
    }
  };


  ngAfterViewInit(): void {

    ace.config.set(
      "basePath",
      "https://unpkg.com/ace-builds@1.4.12/src-noconflict"
    );
    ace.config.set("fontSize", "14px");
    const aceEditor = ace.edit(this.editor.nativeElement);
    aceEditor.session.setMode("ace/mode/json");
    aceEditor.session.setValue(JSON.stringify(this.sampleSchema, null, "\t"));
  }
  treeControl = new NestedTreeControl<any>(node => node.children);
  dataSource = new MatTreeNestedDataSource<any>();

  constructor() {
    this.updateTree(this.sampleSchema);
  }

  hasChild = (_: number, node: any) => !!node.children && node.children.length > 0;

  updateTree(object: any) {
    if (object) {
      const treeItems = this.parseSchema(object);
      this.dataSource.data = treeItems.children;
    }
  }

  generateTree(){
    const aceEditor = ace.edit(this.editor.nativeElement);
    const value = aceEditor.session.getValue();
    try {
      this.updateTree(JSON.parse(value));
    } catch (error) {
      alert("Invalid JSON")
    }
  }

  parseSchema(value: any, name?: string): any {
    if (typeof value === "object") {
      if (value.type === "object") {
        const text = `${name} - ${value.type}`;
        const item = {
          text,
          name,
          type: value.type,
          children: [] as any,
        };
        if (typeof value.properties === "object") {
          for (const propertyName in value.properties) {
            const propertyValue = value.properties[propertyName];
            if (propertyValue) {
              const childItem = this.parseSchema(propertyValue, propertyName) as any;
              item.children.push(childItem);
            }
          }
        }
        return item;
      }
      else if (value.type === "array") {
        const text = `${name} - ${value.type}`;
        const item = {
          text,
          name,
          type: value.type,
          children: [] as any,
        };
        if (value.items) {
          const childItem = this.parseSchema(value.items, "items");
          item.children.push(childItem);
        }
        return item;
      }
      else if (value.type === "string") {
        let text;
        if (value.format) {
          text = `${name} - ${value.format}`;
        } else {
          if (typeof value.maxLength === "number") {
            text = `${name} - ${value.type}(${value.maxLength})`;
          } else {
            text = `${name} - ${value.type}`;
          }
        }
        const item = {
          text,
          name,
          type: value.type,
          format: value.format,
          maxLength: value.maxLength,
        };
        return item;
      }
      else if (Array.isArray(value.type) && value.type.length) {
        const text = `${name} - ${value.type[0]}`;
        const item = {
          text,
          name,
          type: value.type,
        };
        return item;
      }
      else {
        const text = `${name} - ${value.type}`;
        const item = {
          text,
          name,
          type: value.type,
        };
        return item;
      }
    }

  }

}
