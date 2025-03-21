import { Plugin } from "obsidian";

export default class HorizontalRibbonPlugin extends Plugin {
  private ribbonEl: HTMLElement | null = null;
  private leftSidebarEl: HTMLElement | null = null;
  private originalRibbonParent: HTMLElement | null = null;

  onload() {
    this.app.workspace.onLayoutReady(() => this.injectRibbon());
		// if the layout is already loaded, inject the ribbon immediately
    if (this.app.workspace.layoutReady) {
      this.injectRibbon();
    }
  }

  onunload() {
    if (this.ribbonEl) {
      // Restore tooltip positions
      this.ribbonEl.querySelectorAll(".side-dock-ribbon-action")
        .forEach((el) => {
          const icon = el as HTMLElement;
          icon.setAttribute("data-tooltip-position", "right");
        });

      // Remove horizontal-ribbon class
      this.ribbonEl.removeClass("horizontal-ribbon");

      // Move back to original parent if it exists
      if (!this.originalRibbonParent || !document.contains(this.originalRibbonParent)) {
        console.warn("HorizontalRibbonPlugin: unable to move ribbon back to original parent, skipping");
        return;
      }
      this.originalRibbonParent.insertBefore(this.ribbonEl, this.originalRibbonParent.firstChild);
    }
  }

  private injectRibbon() {
    this.ribbonEl = document.querySelector(".workspace-ribbon.mod-left");
		// todo: might be not robust enough in case of multiple left splits
    this.leftSidebarEl = document.querySelector(".workspace-split.mod-left-split");

    if (!this.ribbonEl || !this.leftSidebarEl) {
      console.warn("HorizontalRibbonPlugin: Required elements not found.");
      return;
    }

    if (this.ribbonEl.hasClass("horizontal-ribbon")) {
      return;
    }

    this.originalRibbonParent = this.ribbonEl.parentElement;
    this.ribbonEl.addClass("horizontal-ribbon");

    // Move the ribbon inside the left sidebar
    const resizeHandle = this.leftSidebarEl.querySelector("hr.workspace-leaf-resize-handle");
    if (resizeHandle) {
      resizeHandle.insertAdjacentElement("afterend", this.ribbonEl);
    } else {
      console.warn("HorizontalRibbonPlugin: Resize handle not found, appending ribbon as the first child.");
      this.leftSidebarEl.insertBefore(this.ribbonEl, this.leftSidebarEl.firstChild);
    }

    // Change icon tooltip position
    this.ribbonEl.querySelectorAll(".side-dock-ribbon-action")
      .forEach((el) => {
        const icon = el as HTMLElement;
        icon.setAttribute("data-tooltip-position", "top");
      });
  }
}
