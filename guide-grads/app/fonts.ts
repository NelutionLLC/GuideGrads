// app/fonts.ts
import {
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
} from "next/font/google";

// Font loaders must be called and assigned to const in module scope
const fontLato = Lato({ subsets: ["latin"], variable: "--font-lato", weight: ["300","400","700","900"] });
const fontRoboto = Roboto({ subsets: ["latin"], variable: "--font-roboto", weight: ["300","400","500","700","900"] });
const fontNunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", weight: ["300","400","600","700","800","900"] });
const fontOpenSans = Open_Sans({ subsets: ["latin"], variable: "--font-open-sans", weight: ["300","400","600","700","800"] });
const fontWorkSans = Work_Sans({ subsets: ["latin"], variable: "--font-work-sans", weight: ["300","400","500","600","700","800"] });
const fontSourceSans = Source_Sans_3({ subsets: ["latin"], variable: "--font-source-sans", weight: ["300","400","600","700","800"] });
const fontIBMPlex = IBM_Plex_Sans({ subsets: ["latin"], variable: "--font-ibm-plex", weight: ["300","400","500","600","700"] });
const fontFiraSans = Fira_Sans({ subsets: ["latin"], variable: "--font-fira-sans", weight: ["300","400","500","600","700","800"] });
const fontTitillium = Titillium_Web({ subsets: ["latin"], variable: "--font-titillium", weight: ["300","400","600","700"] });
const fontRubik = Rubik({ subsets: ["latin"], variable: "--font-rubik", weight: ["300","400","500","600","700","800","900"] });
const fontJost = Jost({ subsets: ["latin"], variable: "--font-jost", weight: ["300","400","500","600","700","800","900"] });
const fontKarla = Karla({ subsets: ["latin"], variable: "--font-karla", weight: ["300","400","500","600","700","800"] });
const fontMulish = Mulish({ subsets: ["latin"], variable: "--font-mulish", weight: ["300","400","600","700","800","900"] });
const fontBarlow = Barlow({ subsets: ["latin"], variable: "--font-barlow", weight: ["300","400","500","600","700","800","900"] });
const fontAsap = Asap({ subsets: ["latin"], variable: "--font-asap", weight: ["300","400","500","600","700","800"] });

export const fontVars = {
    Lato: fontLato,
    Roboto: fontRoboto,
    Nunito: fontNunito,
    "Open Sans": fontOpenSans,
    "Work Sans": fontWorkSans,
    "Source Sans Pro": fontSourceSans,
    "IBM Plex Sans": fontIBMPlex,
    "Fira Sans": fontFiraSans,
    "Titillium Web": fontTitillium,
    Rubik: fontRubik,
    Jost: fontJost,
    Karla: fontKarla,
    Mulish: fontMulish,
    Barlow: fontBarlow,
    Asap: fontAsap,
};
  