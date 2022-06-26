// Classes refer to things like dans.
// Not the JS construct.

import { IDStrings, integer } from "./types";

export interface ClassInfo {
	display: string;
	id: string;
	mouseover?: string;
	css?: {
		backgroundColor: string;
		color: string;
	};
	variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "info";
}

function mouseoverCSS(id: string, d: string, m: string, bg = "black", color = "white") {
	return { id, display: d, mouseover: m, css: { backgroundColor: bg, color } };
}

function mouseoverVariant(
	id: string,
	d: string,
	m: string,
	variant: "primary" | "secondary" | "success" | "warning" | "danger" | "info"
) {
	return { id, display: d, mouseover: m, variant };
}

function noMouseoverVariant(
	id: string,
	d: string,
	variant: "primary" | "secondary" | "success" | "warning" | "danger" | "info"
) {
	return { id, display: d, variant };
}

function noMouseoverCSS(id: string, d: string, bg = "#131313", color = "white") {
	return { id, display: d, css: { backgroundColor: bg, color } };
}

export const IIDXDans: ClassInfo[] = [
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

export const GitadoraColours: ClassInfo[] = [
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
	// @todo #11 Come up with CSS for Gitadora's rainbow icon.
	mouseoverCSS("RAINBOW", "虹", "Rainbow", "todo"),
];

export const BMSGenocideDans: ClassInfo[] = [
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

export const BMSStSlDans: ClassInfo[] = [
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

export const BMSLNDans: ClassInfo[] = [
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

export const SDVXDans: ClassInfo[] = [
	mouseoverCSS("DAN_1", "LV.01", "1st Dan"),
	mouseoverCSS("DAN_2", "LV.02", "2nd Dan"),
	mouseoverCSS("DAN_3", "LV.03", "3rd Dan"),
	mouseoverCSS("DAN_4", "LV.04", "4th Dan"),
	mouseoverCSS("DAN_5", "LV.05", "5th Dan"),
	mouseoverCSS("DAN_6", "LV.06", "6th Dan"),
	mouseoverCSS("DAN_7", "LV.07", "7th Dan"),
	mouseoverCSS("DAN_8", "LV.08", "8th Dan"),
	mouseoverCSS("DAN_9", "LV.09", "9th Dan"),
	mouseoverVariant("DAN_10", "LV.10", "10th Dan", "warning"),
	mouseoverVariant("DAN_11", "LV.11", "11th Dan", "danger"),
	mouseoverCSS("INF", "LV.INF", "Inf. Dan", "purple", "gold"),
];

export const SDVXVFClasses: ClassInfo[] = [
	noMouseoverCSS("SIENNA_I", "Sienna I"),
	noMouseoverCSS("SIENNA_II", "Sienna II"),
	noMouseoverCSS("SIENNA_III", "Sienna III"),
	noMouseoverCSS("SIENNA_IV", "Sienna IV"),
	noMouseoverCSS("COBALT_I", "Cobalt I"),
	noMouseoverCSS("COBALT_II", "Cobalt II"),
	noMouseoverCSS("COBALT_III", "Cobalt III"),
	noMouseoverCSS("COBALT_IV", "Cobalt IV"),
	noMouseoverCSS("DANDELION_I", "Dandelion I"),
	noMouseoverCSS("DANDELION_II", "Dandelion II"),
	noMouseoverCSS("DANDELION_III", "Dandelion III"),
	noMouseoverCSS("DANDELION_IV", "Dandelion IV"),
	noMouseoverCSS("CYAN_I", "Cyan I"),
	noMouseoverCSS("CYAN_II", "Cyan II"),
	noMouseoverCSS("CYAN_III", "Cyan III"),
	noMouseoverCSS("CYAN_IV", "Cyan IV"),
	noMouseoverCSS("SCARLET_I", "Scarlet I"),
	noMouseoverCSS("SCARLET_II", "Scarlet II"),
	noMouseoverCSS("SCARLET_III", "Scarlet III"),
	noMouseoverCSS("SCARLET_IV", "Scarlet IV"),
	noMouseoverCSS("CORAL_I", "Coral I"),
	noMouseoverCSS("CORAL_II", "Coral II"),
	noMouseoverCSS("CORAL_III", "Coral III"),
	noMouseoverCSS("CORAL_IV", "Coral IV"),
	noMouseoverCSS("ARGENTO_I", "Argento I"),
	noMouseoverCSS("ARGENTO_II", "Argento II"),
	noMouseoverCSS("ARGENTO_III", "Argento III"),
	noMouseoverCSS("ARGENTO_IV", "Argento IV"),
	noMouseoverCSS("ELDORA_I", "Eldora I"),
	noMouseoverCSS("ELDORA_II", "Eldora II"),
	noMouseoverCSS("ELDORA_III", "Eldora III"),
	noMouseoverCSS("ELDORA_IV", "Eldora IV"),
	noMouseoverCSS("CRIMSON_I", "Crimson I"),
	noMouseoverCSS("CRIMSON_II", "Crimson II"),
	noMouseoverCSS("CRIMSON_III", "Crimson III"),
	noMouseoverCSS("CRIMSON_IV", "Crimson IV"),
	noMouseoverCSS("IMPERIAL_I", "Imperial I"),
	noMouseoverCSS("IMPERIAL_II", "Imperial II"),
	noMouseoverCSS("IMPERIAL_III", "Imperial III"),
	noMouseoverCSS("IMPERIAL_IV", "Imperial IV"),
];

export const DDRDans = [
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
	mouseoverVariant("KAIDEN", "皆伝", "Kaiden", "warning"),
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

// todo: #6 Add colours to the wacca stage ups.
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

export interface GameClassSets {
	"iidx:SP": "dan";
	"iidx:DP": "dan";
	"popn:9B": "class";
	"sdvx:Single": "dan" | "vfClass";
	"usc:Keyboard": never;
	"usc:Controller": never;
	"ddr:SP": "dan";
	"ddr:DP": "dan";
	"maimai:Single": never;
	"jubeat:Single": "colour";
	"museca:Single": never;
	"bms:7K": "genocideDan" | "stslDan" | "lnDan";
	"bms:14K": "genocideDan";
	"chunithm:Single": "colour";
	"gitadora:Gita": "colour";
	"gitadora:Dora": "colour";
	"wacca:Single": "stageUp" | "colour";
	"pms:Controller": "dan";
	"pms:Keyboard": "dan";
	"itg:Stamina": never;
}

export type AllClassSets = GameClassSets[IDStrings];

export type GameClasses<I extends IDStrings> = {
	[K in GameClassSets[I]]: integer;
};
