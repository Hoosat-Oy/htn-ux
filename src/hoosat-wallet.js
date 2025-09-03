export * from "./flow-ux.js";

import { HoosatWalletDesktop } from "./hoosat-wallet-desktop.js";
import { HoosatWalletMobile, isMobile, dontInitiatedComponent } from "./hoosat-wallet-mobile.js";

if (isMobile) document.body.classList.add("is-mobile");
export { isMobile };

export const HoosatWallet = isMobile ? HoosatWalletMobile : HoosatWalletDesktop;

if (!dontInitiatedComponent) HoosatWallet.define("hoosat-wallet");
