// app/fonts.ts
import {
  // Sans
  Asap,
  Barlow,
  Fira_Sans,
  IBM_Plex_Sans,
  Jost,
  Karla,
  Lato,
  Mulish,
  Nunito,
  Open_Sans,
  Roboto,
  Rubik,
  Source_Sans_3,
  Titillium_Web,
  Work_Sans,
  // Serif
  Lora,
  Source_Serif_4,
  Zilla_Slab,
  PT_Serif,
  Literata,
  EB_Garamond,
  Aleo,
  Crimson_Pro,
  Cormorant_Garamond,
  Vollkorn,
  Amiri,
  Crimson_Text,
  Alegreya,
  // Mono
  Inconsolata,
  Source_Code_Pro,
  IBM_Plex_Mono,
  Overpass_Mono,
  Space_Mono,
  Courier_Prime,
} from "next/font/google";

// ── Sans ──────────────────────────────────────────────────────────────────────
const fontLato         = Lato(         { subsets: ["latin"], variable: "--font-lato",          weight: ["300","400","700","900"] });
const fontRoboto       = Roboto(       { subsets: ["latin"], variable: "--font-roboto",        weight: ["300","400","500","700","900"] });
const fontNunito       = Nunito(       { subsets: ["latin"], variable: "--font-nunito",        weight: ["300","400","600","700","800","900"] });
const fontOpenSans     = Open_Sans(    { subsets: ["latin"], variable: "--font-open-sans",     weight: ["300","400","600","700","800"] });
const fontWorkSans     = Work_Sans(    { subsets: ["latin"], variable: "--font-work-sans",     weight: ["300","400","500","600","700","800"] });
const fontSourceSans   = Source_Sans_3({ subsets: ["latin"], variable: "--font-source-sans",   weight: ["300","400","600","700","800"] });
const fontIBMPlexSans  = IBM_Plex_Sans({ subsets: ["latin"], variable: "--font-ibm-plex-sans", weight: ["300","400","500","600","700"] });
const fontFiraSans     = Fira_Sans(    { subsets: ["latin"], variable: "--font-fira-sans",     weight: ["300","400","500","600","700","800"] });
const fontTitillium    = Titillium_Web({ subsets: ["latin"], variable: "--font-titillium",     weight: ["300","400","600","700"] });
const fontRubik        = Rubik(        { subsets: ["latin"], variable: "--font-rubik",         weight: ["300","400","500","600","700","800","900"] });
const fontJost         = Jost(         { subsets: ["latin"], variable: "--font-jost",          weight: ["300","400","500","600","700","800","900"] });
const fontKarla        = Karla(        { subsets: ["latin"], variable: "--font-karla",         weight: ["300","400","500","600","700","800"] });
const fontMulish       = Mulish(       { subsets: ["latin"], variable: "--font-mulish",        weight: ["300","400","600","700","800","900"] });
const fontBarlow       = Barlow(       { subsets: ["latin"], variable: "--font-barlow",        weight: ["300","400","500","600","700","800","900"] });
const fontAsap         = Asap(         { subsets: ["latin"], variable: "--font-asap",          weight: ["300","400","500","600","700","800"] });

// ── Serif ─────────────────────────────────────────────────────────────────────
const fontLora              = Lora(              { subsets: ["latin"], variable: "--font-lora",               weight: ["400","500","600","700"] });
const fontSourceSerif       = Source_Serif_4(    { subsets: ["latin"], variable: "--font-source-serif",       weight: ["300","400","600","700","900"] });
const fontZillaSlab         = Zilla_Slab(        { subsets: ["latin"], variable: "--font-zilla-slab",         weight: ["300","400","500","600","700"] });
const fontPTSerif           = PT_Serif(          { subsets: ["latin"], variable: "--font-pt-serif",           weight: ["400","700"] });
const fontLiterata          = Literata(          { subsets: ["latin"], variable: "--font-literata",           weight: ["300","400","500","600","700"] });
const fontEBGaramond        = EB_Garamond(       { subsets: ["latin"], variable: "--font-eb-garamond",        weight: ["400","500","600","700","800"] });
const fontAleo              = Aleo(              { subsets: ["latin"], variable: "--font-aleo",               weight: ["300","400","500","600","700"] });
const fontCrimsonPro        = Crimson_Pro(       { subsets: ["latin"], variable: "--font-crimson-pro",        weight: ["200","300","400","500","600","700","800","900"] });
const fontCormorantGaramond = Cormorant_Garamond({ subsets: ["latin"], variable: "--font-cormorant-garamond", weight: ["300","400","500","600","700"] });
const fontVollkorn          = Vollkorn(          { subsets: ["latin"], variable: "--font-vollkorn",           weight: ["400","500","600","700","800","900"] });
const fontAmiri             = Amiri(             { subsets: ["latin"], variable: "--font-amiri",              weight: ["400","700"] });
const fontCrimsonText       = Crimson_Text(      { subsets: ["latin"], variable: "--font-crimson-text",       weight: ["400","600","700"] });
const fontAlegreya          = Alegreya(          { subsets: ["latin"], variable: "--font-alegreya",           weight: ["400","500","600","700","800","900"] });

// ── Mono ──────────────────────────────────────────────────────────────────────
const fontInconsolata  = Inconsolata(  { subsets: ["latin"], variable: "--font-inconsolata",   weight: ["200","300","400","500","600","700","800","900"] });
const fontSourceCode   = Source_Code_Pro({ subsets: ["latin"], variable: "--font-source-code", weight: ["200","300","400","500","600","700","800","900"] });
const fontIBMPlexMono  = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-ibm-plex-mono", weight: ["100","200","300","400","500","600","700"] });
const fontOverpassMono = Overpass_Mono({ subsets: ["latin"], variable: "--font-overpass-mono", weight: ["300","400","500","600","700"] });
const fontSpaceMono    = Space_Mono(   { subsets: ["latin"], variable: "--font-space-mono",    weight: ["400","700"] });
const fontCourierPrime = Courier_Prime({ subsets: ["latin"], variable: "--font-courier-prime", weight: ["400","700"] });

export const fontVars = {
  // Sans
  Lato:              fontLato,
  Roboto:            fontRoboto,
  Nunito:            fontNunito,
  "Open Sans":       fontOpenSans,
  "Work Sans":       fontWorkSans,
  "Source Sans Pro": fontSourceSans,
  "IBM Plex Sans":   fontIBMPlexSans,
  "Fira Sans":       fontFiraSans,
  "Titillium Web":   fontTitillium,
  Rubik:             fontRubik,
  Jost:              fontJost,
  Karla:             fontKarla,
  Mulish:            fontMulish,
  Barlow:            fontBarlow,
  Asap:              fontAsap,
  // Serif
  Lora:                    fontLora,
  "Source Serif Pro":      fontSourceSerif,
  "Zilla Slab":            fontZillaSlab,
  "PT Serif":              fontPTSerif,
  Literata:                fontLiterata,
  "EB Garamond":           fontEBGaramond,
  Aleo:                    fontAleo,
  "Crimson Pro":           fontCrimsonPro,
  "Cormorant Garamond":    fontCormorantGaramond,
  Vollkorn:                fontVollkorn,
  Amiri:                   fontAmiri,
  "Crimson Text":          fontCrimsonText,
  Alegreya:                fontAlegreya,
  // Mono
  Inconsolata:       fontInconsolata,
  "Source Code Pro": fontSourceCode,
  "IBM Plex Mono":   fontIBMPlexMono,
  "Overpass Mono":   fontOverpassMono,
  "Space Mono":      fontSpaceMono,
  "Courier Prime":   fontCourierPrime,
};
