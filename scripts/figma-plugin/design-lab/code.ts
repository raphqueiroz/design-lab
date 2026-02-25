// ── Figma Plugin: Create Design Tokens + Button Component ──────────────────
//
// IDEMPOTENT: Safe to run multiple times.
// - Finds existing collections by name → updates values (never duplicates)
// - Finds existing Button component set → removes and recreates
//
// Run via: Plugins → Development → design-lab → Create Tokens & Components
// ────────────────────────────────────────────────────────────────────────────

async function createTokensAndComponents() {
  try {
    figma.notify("⏳ Starting — syncing token variables...", { timeout: 3000 });

    // ═══════════════════════════════════════════════════════════════════════════
    // STEP 1: Create/update all design token variables
    // ═══════════════════════════════════════════════════════════════════════════

    console.log("📦 Syncing design token variables...");

    // ── Token definitions ──

    const colorTokens: Record<string, string> = {
      "brand/50": "#E8FAF0",
      "brand/100": "#B8F0D2",
      "brand/200": "#88E6B4",
      "brand/300": "#58DC96",
      "brand/400": "#28D278",
      "brand/500": "#00B84A",
      "brand/600": "#009E3F",
      "brand/700": "#008435",
      "brand/800": "#006A2A",
      "brand/900": "#00501F",
      "semantic/success": "#16A34A",
      "semantic/success-light": "#DCFCE7",
      "semantic/warning": "#D97706",
      "semantic/warning-light": "#FEF3C7",
      "semantic/error": "#DC2626",
      "semantic/error-light": "#FEE2E2",
      "semantic/info": "#2563EB",
      "semantic/info-light": "#DBEAFE",
      "neutral/50": "#F9FAFB",
      "neutral/100": "#F3F4F6",
      "neutral/200": "#E5E7EB",
      "neutral/300": "#D1D5DB",
      "neutral/400": "#9CA3AF",
      "neutral/500": "#6B7280",
      "neutral/600": "#4B5563",
      "neutral/700": "#374151",
      "neutral/800": "#1F2937",
      "neutral/900": "#111827",
      "surface/background": "#F5F6F8",
      "surface/primary": "#FFFFFF",
      "surface/secondary": "#F0F1F3",
      "surface/elevated": "#FFFFFF",
      "content/primary": "#1d211a",
      "content/secondary": "#4B5563",
      "content/tertiary": "#9CA3AF",
      "content/inverse": "#FFFFFF",
      "interactive/default": "#c8f91f",
      "interactive/hover": "#aad41a",
      "interactive/pressed": "#8cae16",
      "interactive/disabled": "#D1D5DB",
      "border/default": "#E5E7EB",
      "border/strong": "#D1D5DB",
    };

    const spacingTokens: Record<string, number> = {
      "spacing/0": 0,
      "spacing/0-5": 2,
      "spacing/1": 4,
      "spacing/2": 8,
      "spacing/3": 12,
      "spacing/4": 16,
      "spacing/5": 20,
      "spacing/6": 24,
      "spacing/8": 32,
      "spacing/10": 40,
      "spacing/12": 48,
      "spacing/16": 64,
      "spacing/20": 80,
      "named/xs": 4,
      "named/sm": 8,
      "named/md": 16,
      "named/lg": 24,
      "named/xl": 32,
      "named/2xl": 48,
    };

    const typographyTokens: Record<string, number> = {
      "display/font-size": 32,
      "display/line-height": 40,
      "display/font-weight": 600,
      "heading-lg/font-size": 24,
      "heading-lg/line-height": 32,
      "heading-lg/font-weight": 600,
      "heading-md/font-size": 20,
      "heading-md/line-height": 28,
      "heading-md/font-weight": 600,
      "heading-sm/font-size": 17,
      "heading-sm/line-height": 24,
      "heading-sm/font-weight": 500,
      "body-lg/font-size": 17,
      "body-lg/line-height": 24,
      "body-lg/font-weight": 400,
      "body-md/font-size": 15,
      "body-md/line-height": 20,
      "body-md/font-weight": 400,
      "body-sm/font-size": 13,
      "body-sm/line-height": 18,
      "body-sm/font-weight": 400,
      "caption/font-size": 11,
      "caption/line-height": 16,
      "caption/font-weight": 400,
    };

    const radiiTokens: Record<string, number> = {
      "radius/none": 0,
      "radius/sm": 8,
      "radius/md": 12,
      "radius/lg": 16,
      "radius/xl": 24,
      "radius/full": 9999,
    };

    // ── Helpers ──

    function hexToRgba(hex: string): RGBA {
      const h = hex.replace("#", "");
      return {
        r: parseInt(h.slice(0, 2), 16) / 255,
        g: parseInt(h.slice(2, 4), 16) / 255,
        b: parseInt(h.slice(4, 6), 16) / 255,
        a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1,
      };
    }

    // ── Find or create collection (idempotent, async) ──

    async function getOrCreateCollection(name: string): Promise<VariableCollection> {
      const allCollections = await figma.variables.getLocalVariableCollectionsAsync();
      const existing = allCollections.find((c) => c.name === name);
      if (existing) {
        console.log(`   ♻️  Found existing collection: ${name}`);
        return existing;
      }
      console.log(`   🆕 Creating collection: ${name}`);
      return figma.variables.createVariableCollection(name);
    }

    // ── Build a name→Variable map for an existing collection (async) ──

    async function getExistingVarsMap(
      collection: VariableCollection
    ): Promise<Record<string, Variable>> {
      const map: Record<string, Variable> = {};
      for (const varId of collection.variableIds) {
        const v = await figma.variables.getVariableByIdAsync(varId);
        if (v) map[v.name] = v;
      }
      return map;
    }

    // ── Sync variables into a collection (create missing, update existing, async) ──

    async function syncCollection(
      name: string,
      tokens: Record<string, string | number>,
      resolvedType: VariableResolvedDataType
    ): Promise<Record<string, Variable>> {
      const collection = await getOrCreateCollection(name);
      const modeId = collection.modes[0].modeId;
      const existingVars = await getExistingVarsMap(collection);
      const vars: Record<string, Variable> = {};
      let created = 0;
      let updated = 0;

      for (const [tokenName, rawValue] of Object.entries(tokens)) {
        let variable = existingVars[tokenName];

        if (!variable) {
          // Create new variable (async)
          variable = figma.variables.createVariable(tokenName, collection, resolvedType);
          created++;
        } else {
          updated++;
        }

        // Set/update value
        if (resolvedType === "COLOR") {
          variable.setValueForMode(modeId, hexToRgba(rawValue as string));
        } else {
          variable.setValueForMode(modeId, rawValue as number);
        }

        vars[tokenName] = variable;
      }

      console.log(
        `   ✅ ${name}: ${Object.keys(tokens).length} variables (${created} new, ${updated} updated)`
      );
      return vars;
    }

    const colorVars = await syncCollection("Colors", colorTokens, "COLOR");
    const spacingVars = await syncCollection("Spacing", spacingTokens, "FLOAT");
    const typographyVars = await syncCollection("Typography", typographyTokens, "FLOAT");
    const radiiVars = await syncCollection("Radii", radiiTokens, "FLOAT");

    const totalVars =
      Object.keys(colorVars).length +
      Object.keys(spacingVars).length +
      Object.keys(typographyVars).length +
      Object.keys(radiiVars).length;

    console.log(`\n📊 Total: ${totalVars} variables in 4 collections\n`);
    figma.notify(`✅ ${totalVars} token variables synced! Loading fonts for Button...`, {
      timeout: 3000,
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // STEP 2: Load fonts with timeout, then create Button component set
    // ═══════════════════════════════════════════════════════════════════════════

    console.log("🧩 Loading fonts for Button component...");

    let usedFamily = "Inter";
    try {
      await Promise.race([
        Promise.all([
          figma.loadFontAsync({ family: "Inter", style: "Medium" }),
          figma.loadFontAsync({ family: "Inter", style: "Regular" }),
        ]),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), 10000)
        ),
      ]);
      console.log("   ✅ Inter fonts loaded");
    } catch {
      console.warn("⚠️ Inter unavailable, trying Roboto...");
      try {
        await Promise.race([
          Promise.all([
            figma.loadFontAsync({ family: "Roboto", style: "Medium" }),
            figma.loadFontAsync({ family: "Roboto", style: "Regular" }),
          ]),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("timeout")), 5000)
          ),
        ]);
        usedFamily = "Roboto";
        console.log("   ✅ Roboto fonts loaded");
      } catch {
        figma.notify(
          `✅ ${totalVars} tokens synced! ⚠️ Button skipped — no fonts. Install "Inter" and re-run.`,
          { timeout: 8000 }
        );
        figma.closePlugin();
        return;
      }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // STEP 3: Remove existing Button component set, then recreate
    // ═══════════════════════════════════════════════════════════════════════════

    // Remove previous Button component set (if any)
    for (const node of figma.currentPage.children) {
      if (node.type === "COMPONENT_SET" && node.name === "Button") {
        console.log("   🗑️  Removing previous Button component set");
        node.remove();
      }
    }

    interface VariantConfig {
      fill: string | null;
      text: string;
      border: string | null;
    }

    interface SizeConfig {
      height: number;
      paddingVar: string;
      radiusVar: string;
      fontSize: number;
      lineHeight: number;
    }

    const variants: Record<string, VariantConfig> = {
      primary: { fill: "interactive/default", text: "content/primary", border: null },
      secondary: {
        fill: "surface/primary",
        text: "content/primary",
        border: "border/default",
      },
      ghost: { fill: null, text: "interactive/default", border: null },
      destructive: { fill: "semantic/error", text: "content/inverse", border: null },
    };

    const sizes: Record<string, SizeConfig> = {
      sm: {
        height: 36,
        paddingVar: "named/md",
        radiusVar: "radius/sm",
        fontSize: 13,
        lineHeight: 18,
      },
      md: {
        height: 44,
        paddingVar: "named/lg",
        radiusVar: "radius/md",
        fontSize: 15,
        lineHeight: 20,
      },
      lg: {
        height: 52,
        paddingVar: "named/xl",
        radiusVar: "radius/md",
        fontSize: 17,
        lineHeight: 24,
      },
    };

    // ── Apply helpers ──

    function applyFill(node: FrameNode | ComponentNode, colorVarName: string) {
      const variable = colorVars[colorVarName];
      let paint = figma.util.solidPaint("#000000");
      if (variable) {
        paint = figma.variables.setBoundVariableForPaint(paint, "color", variable);
      }
      node.fills = [paint];
    }

    function applyStroke(node: FrameNode | ComponentNode, colorVarName: string) {
      const variable = colorVars[colorVarName];
      let paint = figma.util.solidPaint("#000000");
      if (variable) {
        paint = figma.variables.setBoundVariableForPaint(paint, "color", variable);
      }
      node.strokes = [paint];
      node.strokeWeight = 1;
    }

    function applyPadding(node: FrameNode | ComponentNode, spacingVarName: string) {
      const variable = spacingVars[spacingVarName];
      if (variable) {
        node.setBoundVariable("paddingLeft", variable);
        node.setBoundVariable("paddingRight", variable);
      } else {
        node.paddingLeft = 16;
        node.paddingRight = 16;
      }
      node.paddingTop = 0;
      node.paddingBottom = 0;
    }

    function applyRadius(node: FrameNode | ComponentNode, radiusVarName: string) {
      const variable = radiiVars[radiusVarName];
      if (variable) {
        node.setBoundVariable("topLeftRadius", variable);
        node.setBoundVariable("topRightRadius", variable);
        node.setBoundVariable("bottomLeftRadius", variable);
        node.setBoundVariable("bottomRightRadius", variable);
      } else {
        node.cornerRadius = 12;
      }
    }

    // ── Build each variant × size as a component ──

    const componentNodes: ComponentNode[] = [];
    let yOffset = 0;

    for (const [variantName, variantCfg] of Object.entries(variants)) {
      let xOffset = 0;

      for (const [sizeName, sizeCfg] of Object.entries(sizes)) {
        const comp = figma.createComponent();
        comp.name = `Variant=${variantName}, Size=${sizeName}`;
        comp.resize(140, sizeCfg.height);

        comp.layoutMode = "HORIZONTAL";
        comp.primaryAxisAlignItems = "CENTER";
        comp.counterAxisAlignItems = "CENTER";
        comp.primaryAxisSizingMode = "AUTO";
        comp.counterAxisSizingMode = "FIXED";
        comp.itemSpacing = 8;

        applyPadding(comp, sizeCfg.paddingVar);
        applyRadius(comp, sizeCfg.radiusVar);

        if (variantCfg.fill) {
          applyFill(comp, variantCfg.fill);
        } else {
          comp.fills = [];
        }

        if (variantCfg.border) {
          applyStroke(comp, variantCfg.border);
        }

        // Text label — set fontName BEFORE characters
        const textNode = figma.createText();
        textNode.fontName = { family: usedFamily, style: "Medium" };
        textNode.characters = "Button";
        textNode.fontSize = sizeCfg.fontSize;
        textNode.lineHeight = { value: sizeCfg.lineHeight, unit: "PIXELS" };

        const textColorVar = colorVars[variantCfg.text];
        if (textColorVar) {
          let textPaint = figma.util.solidPaint("#000000");
          textPaint = figma.variables.setBoundVariableForPaint(
            textPaint,
            "color",
            textColorVar
          );
          textNode.fills = [textPaint];
        } else {
          const fallback =
            variantName === "primary" || variantName === "destructive"
              ? "#FFFFFF"
              : "#111827";
          textNode.fills = [figma.util.solidPaint(fallback)];
        }

        comp.appendChild(textNode);
        comp.x = xOffset;
        comp.y = yOffset;

        componentNodes.push(comp);
        xOffset += comp.width + 24;
      }

      yOffset += 72;
    }

    // ── Combine into a Component Set ──

    const componentSet = figma.combineAsVariants(componentNodes, figma.currentPage);
    componentSet.name = "Button";
    componentSet.x = 100;
    componentSet.y = 100;

    componentSet.fills = [figma.util.solidPaint("#FAFAFA", { opacity: 0.5 })];
    componentSet.paddingTop = 40;
    componentSet.paddingBottom = 40;
    componentSet.paddingLeft = 40;
    componentSet.paddingRight = 40;

    figma.viewport.scrollAndZoomIntoView([componentSet]);

    figma.notify(
      `✅ Done! ${totalVars} tokens synced + Button (${componentNodes.length} variants)`,
      { timeout: 5000 }
    );
    console.log("🎉 All done!");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("❌ Plugin error:", message);
    figma.notify(`❌ Error: ${message}`, { timeout: 10000, error: true });
  }

  figma.closePlugin();
}

// ── Command dispatch ──
switch (figma.command) {
  case "create-tokens":
  default:
    createTokensAndComponents();
    break;
}
