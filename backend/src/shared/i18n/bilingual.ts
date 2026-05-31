export interface BilingualText {
  pt: string;
  en: string;
}

export const inline = (text: BilingualText): string => `${text.pt} | ${text.en}`;

export const multiline = (text: BilingualText): string => `${text.pt}\n\n${text.en}`;

export const asMessagePayload = (text: BilingualText) => ({
  message: inline(text),
});
