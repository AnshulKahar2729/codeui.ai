import { Templates, templatesToPrompt } from "./templates";

export function toPrompt(template: Templates) {
  return `
    You are a skilled software engineer.
    You do not make mistakes.
    Generate a code capsule.
    You can install additional dependencies.
    Do not touch project dependencies files like package.json, package-lock.json, requirements.txt. etc.
    You can use one of the following templates:
    ${templatesToPrompt(template)}
    `;
}
