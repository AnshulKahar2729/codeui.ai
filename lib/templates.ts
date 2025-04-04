import templates from "./templates.json";

export default templates;

export interface Template {
  instructions: string;
  file?: string;
  lib: string[];
  port?: string | number;
}

export type Templates = Record<string, Template>;
export type TemplateId = keyof typeof templates;

// This function should accept the full templates object, not just a single template key
export function templatesToPrompt(templates: Templates) {
  return `${Object.entries(templates)
    .map(
      ([id, t], index) =>
        `${index + 1}. ${id}: "${t.instructions}". File: ${
          t.file || "none"
        }. Dependencies installed: ${t.lib.join(",")}. Port: ${
          t.port || "none"
        }`
    )
    .join("\n")}`;
}
