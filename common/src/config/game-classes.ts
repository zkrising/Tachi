// Classes refer to things like dans.
// Not the JS construct.

import { COLOUR_SET } from "../constants/colour-set";
import type { GPTStrings, integer } from "../types";

export interface ClassInfo {
	display: string;
	id: string;
	mouseover?: string;
	css?: {
		backgroundColor: string;
		color: string;
	};
	variant?: "danger" | "info" | "primary" | "secondary" | "success" | "warning";
}

function mouseoverCSS(id: string, d: string, m: string, bg = "black", color = "white") {
	return { id, display: d, mouseover: m, css: { backgroundColor: bg, color } };
}

function mouseoverVariant(
	id: string,
	d: string,
	m: string,
	variant: "danger" | "info" | "primary" | "secondary" | "success" | "warning"
) {
	return { id, display: d, mouseover: m, variant };
}

function noMouseoverVariant(
	id: string,
	d: string,
	variant: "danger" | "info" | "primary" | "secondary" | "success" | "warning"
) {
	return { id, display: d, variant };
}

function noMouseoverCSS(id: string, d: string, bg = "#131313", color = "white") {
	return { id, display: d, css: { backgroundColor: bg, color } };
}

export const IIDXDans: Array<ClassInfo> = [
	mouseoverCSS("KYU_7", "七級", "7th Kyu", "green"),
	mouseoverCSS("KYU_6", "六級", "6th Kyu", "green"),
	mouseoverCSS("KYU_5", "五級", "5th Kyu", "green"),
	mouseoverCSS("KYU_4", "四級", "4th Kyu", "green"),
	mouseoverCSS("KYU_3", "三級", "3rd Kyu", "green"),
	mouseoverCSS("KYU_2", "二級", "2nd Kyu", "green"),
	mouseoverCSS("KYU_1", "一級", "1st Kyu", "green"),
	mouseoverVariant("DAN_1", "初段", "1st Dan", "info"),
	mouseoverVariant("DAN_2", "二段", "2nd Dan", "info"),
	mouseoverVariant("DAN_3", "三段", "3rd Dan", "info"),
	mouseoverVariant("DAN_4", "四段", "4th Dan", "info"),
	mouseoverVariant("DAN_5", "五段", "5th Dan", "info"),
	mouseoverVariant("DAN_6", "六段", "6th Dan", "info"),
	mouseoverVariant("DAN_7", "七段", "7th Dan", "info"),
	mouseoverVariant("DAN_8", "八段", "8th Dan", "info"),
	mouseoverVariant("DAN_9", "九段", "9th Dan", "danger"),
	mouseoverVariant("DAN_10", "十段", "10th Dan", "danger"),
	mouseoverCSS("CHUUDEN", "中伝", "Chuuden", "silver", "black"),
	mouseoverVariant("KAIDEN", "皆伝", "Kaiden", "warning"),
];

export const GitadoraColours: Array<ClassInfo> = [
	mouseoverCSS("WHITE", "白", "White", "white", "black"),
	mouseoverCSS("ORANGE", "橙", "Orange", "orange"),
	mouseoverCSS("ORANGE_GRD", "橙グラ", "Orange Gradient", "orange"),
	mouseoverVariant("YELLOW", "黄", "Yellow", "warning"),
	mouseoverVariant("YELLOW_GRD", "黄グラ", "Yellow Gradient", "warning"),
	mouseoverCSS("GREEN", "緑", "Green", "green"),
	mouseoverCSS("GREEN_GRD", "緑グラ", "Green Gradient", "green"),
	mouseoverVariant("BLUE", "青", "Blue", "info"),
	mouseoverVariant("BLUE_GRD", "青グラ", "Blue Gradient", "info"),
	mouseoverCSS("PURPLE", "紫", "Purple", "purple"),
	mouseoverCSS("PURPLE_GRD", "紫グラ", "Purple Gradient", "purple"),
	mouseoverVariant("RED", "赤", "Red", "danger"),
	mouseoverVariant("RED_GRD", "赤グラ", "Red Gradient", "danger"),
	mouseoverCSS("BRONZE", "銅", "Bronze", "bronze"),
	mouseoverCSS("SILVER", "銀", "Silver", "silver", "black"),
	mouseoverCSS("GOLD", "金", "Gold", "gold"),

	mouseoverCSS(
		"RAINBOW",
		"虹",
		"Rainbow",
		"background: linear-gradient(-45deg, #f0788a, #f48fb1, #9174c2, #79bcf2, #70a173, #f7ff99, #faca7d, #ff9d80, #f0788a)"
	),
];

export const BMSGenocideDans: Array<ClassInfo> = [
	mouseoverCSS("NORMAL_1", "☆1", "Normal 1st Dan", "lightblue"),
	mouseoverCSS("NORMAL_2", "☆2", "Normal 2nd Dan", "lightblue"),
	mouseoverCSS("NORMAL_3", "☆3", "Normal 3rd Dan", "lightblue"),
	mouseoverCSS("NORMAL_4", "☆4", "Normal 4th Dan", "lightblue"),
	mouseoverCSS("NORMAL_5", "☆5", "Normal 5th Dan", "lightblue"),
	mouseoverCSS("NORMAL_6", "☆6", "Normal 6th Dan", "lightblue"),
	mouseoverCSS("NORMAL_7", "☆7", "Normal 7th Dan", "lightblue"),
	mouseoverCSS("NORMAL_8", "☆8", "Normal 8th Dan", "lightblue"),
	mouseoverCSS("NORMAL_9", "☆9", "Normal 9th Dan", "lightred"),
	mouseoverCSS("NORMAL_10", "☆10", "Normal 10th Dan", "lightred"),
	mouseoverVariant("INSANE_1", "★1", "Insane 1st Dan", "info"),
	mouseoverVariant("INSANE_2", "★2", "Insane 2nd Dan", "info"),
	mouseoverVariant("INSANE_3", "★3", "Insane 3rd Dan", "info"),
	mouseoverVariant("INSANE_4", "★4", "Insane 4th Dan", "info"),
	mouseoverVariant("INSANE_5", "★5", "Insane 5th Dan", "info"),
	mouseoverVariant("INSANE_6", "★6", "Insane 6th Dan", "info"),
	mouseoverVariant("INSANE_7", "★7", "Insane 7th Dan", "info"),
	mouseoverVariant("INSANE_8", "★8", "Insane 8th Dan", "info"),
	mouseoverCSS("INSANE_9", "★9", "Insane 9th Dan", "red"),
	mouseoverCSS("INSANE_10", "★10", "Insane 10th Dan", "red"),
	mouseoverCSS("INSANE_KAIDEN", "★★", "Insane Kaiden", "teal"),
	mouseoverCSS("OVERJOY", "(^^)", "Overjoy", "purple"),
];

export const BMSStSlDans: Array<ClassInfo> = [
	mouseoverCSS("SL0", "sl0", "Satellite 0"),
	mouseoverCSS("SL1", "sl1", "Satellite 1"),
	mouseoverCSS("SL2", "sl2", "Satellite 2"),
	mouseoverCSS("SL3", "sl3", "Satellite 3"),
	mouseoverCSS("SL4", "sl4", "Satellite 4"),
	mouseoverCSS("SL5", "sl5", "Satellite 5"),
	mouseoverCSS("SL6", "sl6", "Satellite 6"),
	mouseoverCSS("SL7", "sl7", "Satellite 7"),
	mouseoverCSS("SL8", "sl8", "Satellite 8"),
	mouseoverCSS("SL9", "sl9", "Satellite 9"),
	mouseoverCSS("SL10", "sl10", "Satellite 10"),
	mouseoverCSS("SL11", "sl11", "Satellite 11"),
	mouseoverCSS("SL12", "sl12", "Satellite 12"),
	mouseoverCSS("ST0", "st0", "Stella 0"),
	mouseoverCSS("ST1", "st1", "Stella 1"),
	mouseoverCSS("ST2", "st2", "Stella 2"),
	mouseoverCSS("ST3", "st3", "Stella 3"),
	mouseoverCSS("ST4", "st4", "Stella 4"),
	mouseoverCSS("ST5", "st5", "Stella 5"),
	mouseoverCSS("ST6", "st6", "Stella 6"),
	mouseoverCSS("ST7", "st7", "Stella 7"),
	mouseoverCSS("ST8", "st8", "Stella 8"),
	mouseoverCSS("ST9", "st9", "Stella 9"),
	mouseoverCSS("ST10", "st10", "Stella 10"),
	mouseoverCSS("ST11", "st11", "Stella 11"),
];

export const BMSDPSlDans: Array<ClassInfo> = [
	mouseoverCSS("SL0", "sl0", "Satellite 0"),
	mouseoverCSS("SL1", "sl1", "Satellite 1"),
	mouseoverCSS("SL2", "sl2", "Satellite 2"),
	mouseoverCSS("SL3", "sl3", "Satellite 3"),
	mouseoverCSS("SL4", "sl4", "Satellite 4"),
	mouseoverCSS("SL5", "sl5", "Satellite 5"),
	mouseoverCSS("SL6", "sl6", "Satellite 6"),
	mouseoverCSS("SL7", "sl7", "Satellite 7"),
	mouseoverCSS("SL8", "sl8", "Satellite 8"),
	mouseoverCSS("SL9", "sl9", "Satellite 9"),
	mouseoverCSS("SL10", "sl10", "Satellite 10"),
	mouseoverCSS("SL11", "sl11", "Satellite 11"),
	mouseoverCSS("SL12", "sl12", "Satellite 12"),
];

export const BMSLNDans: Array<ClassInfo> = [
	mouseoverCSS("DAN_1", "◆1", "LN 1st Dan", "lightblue"),
	mouseoverCSS("DAN_2", "◆2", "LN 2nd Dan", "lightblue"),
	mouseoverCSS("DAN_3", "◆3", "LN 3rd Dan", "lightblue"),
	mouseoverCSS("DAN_4", "◆4", "LN 4th Dan", "lightblue"),
	mouseoverCSS("DAN_5", "◆5", "LN 5th Dan", "lightblue"),
	mouseoverCSS("DAN_6", "◆6", "LN 6th Dan", "lightblue"),
	mouseoverCSS("DAN_7", "◆7", "LN 7th Dan", "lightblue"),
	mouseoverCSS("DAN_8", "◆8", "LN 8th Dan", "lightblue"),
	mouseoverCSS("DAN_9", "◆9", "LN 9th Dan", "lightred"),
	mouseoverCSS("DAN_10", "◆10", "LN 10th Dan", "lightred"),
	mouseoverCSS("KAIDEN", "◆◆", "LN Kaiden", "teal"),
	mouseoverCSS("OVERJOY", "◆(^^)", "LN Overjoy", "purple"),
	mouseoverCSS("UDON", "◆うどん", "LN Udon", "gold"),
];

export const BMSScratchDans: Array<ClassInfo> = [
	mouseoverCSS("KYU_7", "七級", "Scratch 7th Kyu", "green"),
	mouseoverCSS("KYU_6", "六級", "Scratch 6th Kyu", "green"),
	mouseoverCSS("KYU_5", "五級", "Scratch 5th Kyu", "green"),
	mouseoverCSS("KYU_4", "四級", "Scratch 4th Kyu", "green"),
	mouseoverCSS("KYU_3", "三級", "Scratch 3rd Kyu", "green"),
	mouseoverCSS("KYU_2", "二級", "Scratch 2nd Kyu", "green"),
	mouseoverCSS("KYU_1", "一級", "Scratch 1st Kyu", "green"),
	mouseoverVariant("DAN_1", "初段", "Scratch 1st Dan", "info"),
	mouseoverVariant("DAN_2", "二段", "Scratch 2nd Dan", "info"),
	mouseoverVariant("DAN_3", "三段", "Scratch 3rd Dan", "info"),
	mouseoverVariant("DAN_4", "四段", "Scratch 4th Dan", "info"),
	mouseoverVariant("DAN_5", "五段", "Scratch 5th Dan", "info"),
	mouseoverVariant("DAN_6", "六段", "Scratch 6th Dan", "info"),
	mouseoverVariant("DAN_7", "七段", "Scratch 7th Dan", "info"),
	mouseoverVariant("DAN_8", "八段", "Scratch 8th Dan", "info"),
	mouseoverVariant("DAN_9", "九段", "Scratch 9th Dan", "danger"),
	mouseoverVariant("DAN_10", "十段", "Scratch 10th Dan", "danger"),
	mouseoverVariant("KAIDEN", "皆伝", "Scratch Kaiden", "warning"),
];

export const SDVXDans: Array<ClassInfo> = [
	mouseoverCSS("DAN_1", "LV.01", "1st Dan", COLOUR_SET.red),
	mouseoverCSS("DAN_2", "LV.02", "2nd Dan", COLOUR_SET.paleBlue),
	mouseoverCSS("DAN_3", "LV.03", "3rd Dan", "gold", "black"),
	mouseoverCSS("DAN_4", "LV.04", "4th Dan", "gray"),
	mouseoverCSS("DAN_5", "LV.05", "5th Dan", COLOUR_SET.teal, "black"),
	mouseoverCSS("DAN_6", "LV.06", "6th Dan", "blue"),
	mouseoverCSS("DAN_7", "LV.07", "7th Dan", COLOUR_SET.vibrantPink, "black"),
	mouseoverCSS("DAN_8", "LV.08", "8th Dan", "pink", "black"),
	mouseoverCSS("DAN_9", "LV.09", "9th Dan", "white", "black"),
	mouseoverVariant("DAN_10", "LV.10", "10th Dan", "warning"),
	mouseoverVariant("DAN_11", "LV.11", "11th Dan", "danger"),
	mouseoverCSS("INF", "LV.INF", "Inf. Dan", "purple", "gold"),
];

export const SDVXVFClasses: Array<ClassInfo> = [
	mouseoverCSS("SIENNA_I", "Sienna I", "0 - 2.499VF", COLOUR_SET.red),
	mouseoverCSS("SIENNA_II", "Sienna II", "2.5 - 4.999VF", COLOUR_SET.red),
	mouseoverCSS("SIENNA_III", "Sienna III", "5.0 - 7.499VF", COLOUR_SET.red),
	mouseoverCSS("SIENNA_IV", "Sienna IV", "7.5 - 9.999VF", COLOUR_SET.red),
	mouseoverCSS("COBALT_I", "Cobalt I", "10 - 10.499VF", COLOUR_SET.paleBlue),
	mouseoverCSS("COBALT_II", "Cobalt II", "10.5 - 10.999VF", COLOUR_SET.paleBlue),
	mouseoverCSS("COBALT_III", "Cobalt III", "11 - 11.499VF", COLOUR_SET.paleBlue),
	mouseoverCSS("COBALT_IV", "Cobalt IV", "11.5 - 11.999VF", COLOUR_SET.paleBlue),
	mouseoverCSS("DANDELION_I", "Dandelion I", "12 - 12.499VF", COLOUR_SET.gold, "black"),
	mouseoverCSS("DANDELION_II", "Dandelion II", "12.5 - 12.999VF", COLOUR_SET.gold, "black"),
	mouseoverCSS("DANDELION_III", "Dandelion III", "13 - 13.499VF", COLOUR_SET.gold, "black"),
	mouseoverCSS("DANDELION_IV", "Dandelion IV", "13.5 - 13.999VF", COLOUR_SET.gold, "black"),
	mouseoverCSS("CYAN_I", "Cyan I", "14 - 14.249VF", COLOUR_SET.teal, "black"),
	mouseoverCSS("CYAN_II", "Cyan II", "14.25 - 14.499VF", COLOUR_SET.teal, "black"),
	mouseoverCSS("CYAN_III", "Cyan III", "14.5 - 14.749VF", COLOUR_SET.teal, "black"),
	mouseoverCSS("CYAN_IV", "Cyan IV", "14.75 - 14.999VF", COLOUR_SET.teal, "black"),
	mouseoverCSS("SCARLET_I", "Scarlet I", "15 - 15.249VF", COLOUR_SET.vibrantPink, "black"),
	mouseoverCSS("SCARLET_II", "Scarlet II", "15.25 - 15.499VF", COLOUR_SET.vibrantPink, "black"),
	mouseoverCSS("SCARLET_III", "Scarlet III", "15.5 - 15.749VF", COLOUR_SET.vibrantPink, "black"),
	mouseoverCSS("SCARLET_IV", "Scarlet IV", "15.75 - 15.999VF", COLOUR_SET.vibrantPink, "black"),
	mouseoverCSS("CORAL_I", "Coral I", "16 - 16.249VF", COLOUR_SET.pink, "black"),
	mouseoverCSS("CORAL_II", "Coral II", "16.25 - 16.499VF", COLOUR_SET.pink, "black"),
	mouseoverCSS("CORAL_III", "Coral III", "16.5 - 16.749VF", COLOUR_SET.pink, "black"),
	mouseoverCSS("CORAL_IV", "Coral IV", "16.75 - 16.999VF", COLOUR_SET.pink, "black"),
	mouseoverCSS("ARGENTO_I", "Argento I", "17 - 17.249VF", COLOUR_SET.white, "black"),
	mouseoverCSS("ARGENTO_II", "Argento II", "17.25 - 17.499VF", COLOUR_SET.white, "black"),
	mouseoverCSS("ARGENTO_III", "Argento III", "17.5 - 17.749VF", COLOUR_SET.white, "black"),
	mouseoverCSS("ARGENTO_IV", "Argento IV", "17.75 - 17.999VF", COLOUR_SET.white, "black"),
	mouseoverVariant("ELDORA_I", "Eldora I", "18 - 18.249VF", "warning"),
	mouseoverVariant("ELDORA_II", "Eldora II", "18.25 - 18.499VF", "warning"),
	mouseoverVariant("ELDORA_III", "Eldora III", "18.5 - 18.749VF", "warning"),
	mouseoverVariant("ELDORA_IV", "Eldora IV", "18.75 - 18.999VF", "warning"),
	mouseoverCSS("CRIMSON_I", "Crimson I", "19 - 19.249VF", COLOUR_SET.vibrantRed),
	mouseoverCSS("CRIMSON_II", "Crimson II", "19.25 - 19.499VF", COLOUR_SET.vibrantRed),
	mouseoverCSS("CRIMSON_III", "Crimson III", "19.5 - 19.749VF", COLOUR_SET.vibrantRed),
	mouseoverCSS("CRIMSON_IV", "Crimson IV", "19.75 - 19.999VF", COLOUR_SET.vibrantRed),
	mouseoverCSS("IMPERIAL_I", "Imperial I", "20 - 20.999VF", COLOUR_SET.vibrantPurple),
	mouseoverCSS("IMPERIAL_II", "Imperial II", "21 - 21.999VF", COLOUR_SET.vibrantPurple),
	mouseoverCSS("IMPERIAL_III", "Imperial III", "22 - 22.999VF", COLOUR_SET.vibrantPurple),
	mouseoverCSS("IMPERIAL_IV", "Imperial IV", ">23VF", COLOUR_SET.vibrantPurple),
];

export const CHUNITHMColours = [
	mouseoverVariant("BLUE", "青", "Blue", "info"),
	mouseoverCSS("GREEN", "緑", "Green", "green"),
	mouseoverCSS("ORANGE", "橙", "Orange", "orange"),
	mouseoverVariant("RED", "赤", "Red", "danger"),
	mouseoverCSS("PURPLE", "紫", "Purple", "purple"),
	mouseoverCSS("COPPER", "銅", "Copper", "bronze"),
	mouseoverVariant("SILVER", "銀", "Silver", "secondary"),
	mouseoverVariant("GOLD", "金", "Gold", "warning"),
	mouseoverCSS("PLATINUM", "鉑", "Platinum", "silver", "black"),
	mouseoverVariant("RAINBOW", "虹", "Rainbow", "success"),
];

export const WaccaStageUps = [
	noMouseoverCSS("I", "I"),
	noMouseoverCSS("II", "II"),
	noMouseoverCSS("III", "III"),
	noMouseoverCSS("IV", "IV"),
	noMouseoverCSS("V", "V"),
	noMouseoverCSS("VI", "VI"),
	noMouseoverCSS("VII", "VII"),
	noMouseoverCSS("VIII", "VIII"),
	noMouseoverCSS("IX", "IX"),
	noMouseoverCSS("X", "X"),
	noMouseoverCSS("XI", "XI"),
	noMouseoverCSS("XII", "XII"),
	noMouseoverCSS("XIII", "XIII"),
	noMouseoverCSS("XIV", "XIV"),
];

export const WaccaColours = [
	noMouseoverVariant("ASH", "Ash", "secondary"),
	noMouseoverCSS("NAVY", "Navy", "darkblue"),
	noMouseoverCSS("YELLOW", "Yellow", "orange"),
	noMouseoverVariant("RED", "Red", "danger"),
	noMouseoverCSS("PURPLE", "Purple", "purple"),
	noMouseoverVariant("BLUE", "Blue", "info"),
	noMouseoverCSS("SILVER", "Silver", "silver", "black"),
	noMouseoverVariant("GOLD", "Gold", "warning"),
	noMouseoverVariant("RAINBOW", "Rainbow", "success"),
];

// what the hell are these names?
export const PopnClasses = [
	mouseoverCSS("KITTY", "にゃんこ", "Kitty", "brown"),
	mouseoverCSS("STUDENT", "小学生", "Grade School Student", "green"),
	mouseoverCSS("DELINQUENT", "番長", "Delinquent", "lime", "black"),
	mouseoverCSS("DETECTIVE", "刑事", "Detective", "purple"),
	mouseoverVariant("IDOL", "アイドル", "Idol", "danger"),
	mouseoverCSS("GENERAL", "将軍", "General", "darkgoldenrod"),
	mouseoverVariant("HERMIT", "仙人", "Hermit", "success"),
	mouseoverVariant("GOD", "神", "God", "warning"),
];

export const PMSDans = [
	mouseoverVariant("INSANE_1", "●1", "Insane 1st Dan", "info"),
	mouseoverVariant("INSANE_2", "●2", "Insane 2nd Dan", "info"),
	mouseoverVariant("INSANE_3", "●3", "Insane 3rd Dan", "info"),
	mouseoverVariant("INSANE_4", "●4", "Insane 4th Dan", "info"),
	mouseoverVariant("INSANE_5", "●5", "Insane 5th Dan", "info"),
	mouseoverVariant("INSANE_6", "●6", "Insane 6th Dan", "info"),
	mouseoverVariant("INSANE_7", "●7", "Insane 7th Dan", "info"),
	mouseoverVariant("INSANE_8", "●8", "Insane 8th Dan", "info"),
	mouseoverCSS("INSANE_9", "●9", "Insane 9th Dan", "red"),
	mouseoverCSS("INSANE_10", "●10", "Insane 10th Dan", "red"),
	mouseoverCSS("INSANE_KAIDEN", "●●", "Insane Kaiden", "teal"),
	noMouseoverCSS("OVERJOY", "●OJ", "Overjoy", "purple"),
	mouseoverVariant("UNDEFINED", "●UNDF", "Undefined (Post-Overjoy)", "warning"),
];

export const JubeatColours = [
	noMouseoverVariant("BLACK", "Black", "secondary"),
	noMouseoverCSS("YELLOW_GREEN", "Yellow-Green", "yellowgreen", "black"),
	noMouseoverCSS("GREEN", "Green", "green"),
	noMouseoverCSS("LIGHT_BLUE", "Light Blue", "cyan", "black"),
	noMouseoverVariant("BLUE", "Blue", "info"),
	noMouseoverCSS("VIOLET", "Violet", "violet"),
	noMouseoverCSS("PURPLE", "Purple", "purple"),
	noMouseoverCSS("PINK", "Pink", "pink", "black"),
	noMouseoverCSS("ORANGE", "Orange", "orange"),
	noMouseoverVariant("GOLD", "Gold", "warning"),
];

export const MaimaiDXDans = [
	mouseoverVariant("DAN_1", "初段", "1st Dan", "warning"),
	mouseoverVariant("DAN_2", "二段", "2nd Dan", "warning"),
	mouseoverVariant("DAN_3", "三段", "3rd Dan", "warning"),
	mouseoverVariant("DAN_4", "四段", "4th Dan", "warning"),
	mouseoverVariant("DAN_5", "五段", "5th Dan", "warning"),
	mouseoverVariant("DAN_6", "六段", "6th Dan", "warning"),
	mouseoverVariant("DAN_7", "七段", "7th Dan", "warning"),
	mouseoverVariant("DAN_8", "八段", "8th Dan", "warning"),
	mouseoverVariant("DAN_9", "九段", "9th Dan", "warning"),
	mouseoverVariant("DAN_10", "十段", "10th Dan", "warning"),

	mouseoverCSS("SHINDAN_1", "真初段", "Shinshodan", "purple"),
	mouseoverCSS("SHINDAN_2", "真二段", "2nd Shindan", "purple"),
	mouseoverCSS("SHINDAN_3", "真三段", "3rd Shindan", "purple"),
	mouseoverCSS("SHINDAN_4", "真四段", "4th Shindan", "purple"),
	mouseoverCSS("SHINDAN_5", "真五段", "5th Shindan", "purple"),
	mouseoverCSS("SHINDAN_6", "真六段", "6th Shindan", "purple"),
	mouseoverCSS("SHINDAN_7", "真七段", "7th Shindan", "purple"),
	mouseoverCSS("SHINDAN_8", "真八段", "8th Shindan", "purple"),
	mouseoverCSS("SHINDAN_9", "真九段", "9th Shindan", "purple"),
	mouseoverCSS("SHINDAN_10", "真十段", "10th Shindan", "purple"),

	mouseoverCSS("SHINKAIDEN", "真皆伝", "Shinkaiden", "purple"),
];

export const MaimaiDXColours = [
	noMouseoverCSS("WHITE", "White", "white", "black"),
	noMouseoverCSS("BLUE", "Blue", "cyan", "black"),
	noMouseoverCSS("GREEN", "Green", "green"),
	noMouseoverCSS("YELLOW", "Yellow", "yellow", "black"),
	noMouseoverCSS("RED", "Red", "red"),
	noMouseoverCSS("PURPLE", "Purple", "purple"),
	noMouseoverCSS("BRONZE", "Bronze", "brown"),
	noMouseoverCSS("SILVER", "Silver", "gray"),
	noMouseoverVariant("GOLD", "Gold", "warning"),
	noMouseoverCSS("PLATINUM", "Platinum", "lightgoldenrodyellow", "black"),

	// come up with color for dx's rainbow
	noMouseoverCSS("RAINBOW", "Rainbow", "todo"),
];
