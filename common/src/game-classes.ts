// Classes refer to things like dans.
// Not the JS construct.

import { IDStrings, integer } from "./types";

export interface ClassInfo {
	display: string;
	mouseover?: string;
	css?: {
		backgroundColor: string;
		color: string;
	};
	variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "info";
}

function mouseoverCSS(d: string, m: string, bg = "black", color = "white") {
	return { display: d, mouseover: m, css: { backgroundColor: bg, color } };
}

function mouseoverVariant(
	d: string,
	m: string,
	variant: "primary" | "secondary" | "success" | "warning" | "danger" | "info"
) {
	return { display: d, mouseover: m, variant };
}

function noMouseoverVariant(
	d: string,
	variant: "primary" | "secondary" | "success" | "warning" | "danger" | "info"
) {
	return { display: d, variant };
}

function noMouseoverCSS(d: string, bg = "#131313", color = "white") {
	return { display: d, css: { backgroundColor: bg, color } };
}

export const IIDXDans: ClassInfo[] = [
	mouseoverCSS("七級", "7th Kyu", "green"),
	mouseoverCSS("六級", "6th Kyu", "green"),
	mouseoverCSS("五級", "5th Kyu", "green"),
	mouseoverCSS("四級", "4th Kyu", "green"),
	mouseoverCSS("三級", "3rd Kyu", "green"),
	mouseoverCSS("二級", "2nd Kyu", "green"),
	mouseoverCSS("一級", "1st Kyu", "green"),
	mouseoverVariant("初段", "1st Dan", "info"),
	mouseoverVariant("二段", "2nd Dan", "info"),
	mouseoverVariant("三段", "3rd Dan", "info"),
	mouseoverVariant("四段", "4th Dan", "info"),
	mouseoverVariant("五段", "5th Dan", "info"),
	mouseoverVariant("六段", "6th Dan", "info"),
	mouseoverVariant("七段", "7th Dan", "info"),
	mouseoverVariant("八段", "8th Dan", "info"),
	mouseoverVariant("九段", "9th Dan", "danger"),
	mouseoverVariant("十段", "10th Dan", "danger"),
	mouseoverCSS("中伝", "Chuuden", "silver", "black"),
	mouseoverVariant("皆伝", "Kaiden", "warning"),
];

export const GitadoraColours: ClassInfo[] = [
	mouseoverCSS("白", "White", "white", "black"),
	mouseoverCSS("橙", "Orange", "orange"),
	mouseoverCSS("橙グラ", "Orange Gradient", "orange"),
	mouseoverVariant("黄", "Yellow", "warning"),
	mouseoverVariant("黄グラ", "Yellow Gradient", "warning"),
	mouseoverCSS("緑", "Green", "green"),
	mouseoverCSS("緑グラ", "Green Gradient", "green"),
	mouseoverVariant("青", "Blue", "info"),
	mouseoverVariant("青グラ", "Blue Gradient", "info"),
	mouseoverCSS("紫", "Purple", "purple"),
	mouseoverCSS("紫グラ", "Purple Gradient", "purple"),
	mouseoverVariant("赤", "Red", "danger"),
	mouseoverVariant("赤グラ", "Red Gradient", "danger"),
	mouseoverCSS("銅", "Bronze", "bronze"),
	mouseoverCSS("銀", "Silver", "silver", "black"),
	mouseoverCSS("金", "Gold", "gold"),
	mouseoverCSS("虹", "Rainbow", "todo"),
];

export const BMSGenocideDans: ClassInfo[] = [
	mouseoverCSS("☆1", "Normal 1st Dan", "lightblue"),
	mouseoverCSS("☆2", "Normal 2nd Dan", "lightblue"),
	mouseoverCSS("☆3", "Normal 3rd Dan", "lightblue"),
	mouseoverCSS("☆4", "Normal 4th Dan", "lightblue"),
	mouseoverCSS("☆5", "Normal 5th Dan", "lightblue"),
	mouseoverCSS("☆6", "Normal 6th Dan", "lightblue"),
	mouseoverCSS("☆7", "Normal 7th Dan", "lightblue"),
	mouseoverCSS("☆8", "Normal 8th Dan", "lightblue"),
	mouseoverCSS("☆9", "Normal 9th Dan", "lightred"),
	mouseoverCSS("☆10", "Normal 10th Dan", "lightred"),
	mouseoverVariant("★1", "Insane 1st Dan", "info"),
	mouseoverVariant("★2", "Insane 2nd Dan", "info"),
	mouseoverVariant("★3", "Insane 3rd Dan", "info"),
	mouseoverVariant("★4", "Insane 4th Dan", "info"),
	mouseoverVariant("★5", "Insane 5th Dan", "info"),
	mouseoverVariant("★6", "Insane 6th Dan", "info"),
	mouseoverVariant("★7", "Insane 7th Dan", "info"),
	mouseoverVariant("★8", "Insane 8th Dan", "info"),
	mouseoverCSS("★9", "Insane 9th Dan", "red"),
	mouseoverCSS("★10", "Insane 10th Dan", "red"),
	mouseoverCSS("★★", "Insane Kaiden", "teal"),
	mouseoverCSS("(^^)", "Overjoy", "purple"),
];

export const BMSStSlDans: ClassInfo[] = [
	mouseoverCSS("sl0", "Satellite 0"),
	mouseoverCSS("sl1", "Satellite 1"),
	mouseoverCSS("sl2", "Satellite 2"),
	mouseoverCSS("sl3", "Satellite 3"),
	mouseoverCSS("sl4", "Satellite 4"),
	mouseoverCSS("sl5", "Satellite 5"),
	mouseoverCSS("sl6", "Satellite 6"),
	mouseoverCSS("sl7", "Satellite 7"),
	mouseoverCSS("sl8", "Satellite 8"),
	mouseoverCSS("sl9", "Satellite 9"),
	mouseoverCSS("sl10", "Satellite 10"),
	mouseoverCSS("sl11", "Satellite 11"),
	mouseoverCSS("sl12", "Satellite 12"),
	mouseoverCSS("st0", "Stella 0"),
	mouseoverCSS("st1", "Stella 1"),
	mouseoverCSS("st2", "Stella 2"),
	mouseoverCSS("st3", "Stella 3"),
	mouseoverCSS("st4", "Stella 4"),
	mouseoverCSS("st5", "Stella 5"),
	mouseoverCSS("st6", "Stella 6"),
	mouseoverCSS("st7", "Stella 7"),
	mouseoverCSS("st8", "Stella 8"),
	mouseoverCSS("st9", "Stella 9"),
	mouseoverCSS("st10", "Stella 10"),
	mouseoverCSS("st11", "Stella 11"),
];

export const SDVXDans: ClassInfo[] = [
	mouseoverCSS("LV.01", "1st Dan"),
	mouseoverCSS("LV.02", "2nd Dan"),
	mouseoverCSS("LV.03", "3rd Dan"),
	mouseoverCSS("LV.04", "4th Dan"),
	mouseoverCSS("LV.05", "5th Dan"),
	mouseoverCSS("LV.06", "6th Dan"),
	mouseoverCSS("LV.07", "7th Dan"),
	mouseoverCSS("LV.08", "8th Dan"),
	mouseoverCSS("LV.09", "9th Dan"),
	mouseoverVariant("LV.10", "10th Dan", "warning"),
	mouseoverVariant("LV.11", "11th Dan", "danger"),
	mouseoverCSS("LV.INF", "Inf. Dan", "purple", "gold"),
];

export const SDVXVFClasses: ClassInfo[] = [
	noMouseoverCSS("Sienna I"),
	noMouseoverCSS("Sienna II"),
	noMouseoverCSS("Sienna III"),
	noMouseoverCSS("Sienna IV"),
	noMouseoverCSS("Cobalt I"),
	noMouseoverCSS("Cobalt II"),
	noMouseoverCSS("Cobalt III"),
	noMouseoverCSS("Cobalt IV"),
	noMouseoverCSS("Dandelion I"),
	noMouseoverCSS("Dandelion II"),
	noMouseoverCSS("Dandelion III"),
	noMouseoverCSS("Dandelion IV"),
	noMouseoverCSS("Cyan I"),
	noMouseoverCSS("Cyan II"),
	noMouseoverCSS("Cyan III"),
	noMouseoverCSS("Cyan IV"),
	noMouseoverCSS("Scarlet I"),
	noMouseoverCSS("Scarlet II"),
	noMouseoverCSS("Scarlet III"),
	noMouseoverCSS("Scarlet IV"),
	noMouseoverCSS("Coral I"),
	noMouseoverCSS("Coral II"),
	noMouseoverCSS("Coral III"),
	noMouseoverCSS("Coral IV"),
	noMouseoverCSS("Argento I"),
	noMouseoverCSS("Argento II"),
	noMouseoverCSS("Argento III"),
	noMouseoverCSS("Argento IV"),
	noMouseoverCSS("Eldora I"),
	noMouseoverCSS("Eldora II"),
	noMouseoverCSS("Eldora III"),
	noMouseoverCSS("Eldora IV"),
	noMouseoverCSS("Crimson I"),
	noMouseoverCSS("Crimson II"),
	noMouseoverCSS("Crimson III"),
	noMouseoverCSS("Crimson IV"),
	noMouseoverCSS("Imperial I"),
	noMouseoverCSS("Imperial II"),
	noMouseoverCSS("Imperial III"),
	noMouseoverCSS("Imperial IV"),
];

export const DDRDans = [
	mouseoverVariant("初段", "1st Dan", "info"),
	mouseoverVariant("二段", "2nd Dan", "info"),
	mouseoverVariant("三段", "3rd Dan", "info"),
	mouseoverVariant("四段", "4th Dan", "info"),
	mouseoverVariant("五段", "5th Dan", "info"),
	mouseoverVariant("六段", "6th Dan", "info"),
	mouseoverVariant("七段", "7th Dan", "info"),
	mouseoverVariant("八段", "8th Dan", "info"),
	mouseoverVariant("九段", "9th Dan", "danger"),
	mouseoverVariant("十段", "10th Dan", "danger"),
	mouseoverVariant("皆伝", "Kaiden", "warning"),
];

export const CHUNITHMColours = [
	mouseoverVariant("青", "Blue", "info"),
	mouseoverCSS("緑", "Green", "green"),
	mouseoverCSS("橙", "Orange", "orange"),
	mouseoverVariant("赤", "Red", "danger"),
	mouseoverCSS("紫", "Purple", "purple"),
	mouseoverCSS("銅", "Copper", "bronze"),
	mouseoverVariant("銀", "Silver", "secondary"),
	mouseoverVariant("金", "Gold", "warning"),
	mouseoverCSS("鉑", "Platinum", "silver", "black"),
	mouseoverVariant("虹", "Rainbow", "success"),
];

// todo: #6 Add colours to the wacca stage ups.
export const WaccaStageUps = [
	noMouseoverCSS("I"),
	noMouseoverCSS("II"),
	noMouseoverCSS("III"),
	noMouseoverCSS("IV"),
	noMouseoverCSS("V"),
	noMouseoverCSS("VI"),
	noMouseoverCSS("VII"),
	noMouseoverCSS("VIII"),
	noMouseoverCSS("IX"),
	noMouseoverCSS("X"),
	noMouseoverCSS("XI"),
	noMouseoverCSS("XII"),
	noMouseoverCSS("XIII"),
	noMouseoverCSS("XIV"),
];

export const WaccaColours = [
	noMouseoverVariant("Ash", "secondary"),
	noMouseoverCSS("Navy", "darkblue"),
	noMouseoverCSS("Yellow", "orange"),
	noMouseoverVariant("Red", "danger"),
	noMouseoverCSS("Purple", "purple"),
	noMouseoverVariant("Blue", "info"),
	noMouseoverCSS("Silver", "silver", "black"),
	noMouseoverVariant("Gold", "warning"),
	noMouseoverVariant("Rainbow", "success"),
];

export const PopnClasses = [
	mouseoverCSS("にゃんこ", "Kitty", "brown"),
	mouseoverCSS("小学生", "Grade School Student", "green"),
	mouseoverCSS("番長", "Delinquent", "lime", "black"),
	mouseoverCSS("刑事", "Detective", "purple"),
	mouseoverVariant("アイドル", "Idol", "danger"),
	mouseoverCSS("将軍", "General", "darkgoldenrod"),
	mouseoverVariant("仙人", "Hermit", "success"),
	mouseoverVariant("神", "God", "warning"),
];

export const PMSDans = [
	mouseoverVariant("●1", "Insane 1st Dan", "info"),
	mouseoverVariant("●2", "Insane 2nd Dan", "info"),
	mouseoverVariant("●3", "Insane 3rd Dan", "info"),
	mouseoverVariant("●4", "Insane 4th Dan", "info"),
	mouseoverVariant("●5", "Insane 5th Dan", "info"),
	mouseoverVariant("●6", "Insane 6th Dan", "info"),
	mouseoverVariant("●7", "Insane 7th Dan", "info"),
	mouseoverVariant("●8", "Insane 8th Dan", "info"),
	mouseoverCSS("●9", "Insane 9th Dan", "red"),
	mouseoverCSS("●10", "Insane 10th Dan", "red"),
	mouseoverCSS("●●", "Insane Kaiden", "teal"),
	noMouseoverCSS("●OJ", "Overjoy", "purple"),
	mouseoverVariant("●UNDF", "Undefined (Post-Overjoy)", "warning"),
];

export const JubeatColours = [
	noMouseoverVariant("Black", "secondary"),
	noMouseoverCSS("Yellow-Green", "yellowgreen", "black"),
	noMouseoverCSS("Green", "green"),
	noMouseoverCSS("Light Blue", "cyan", "black"),
	noMouseoverVariant("Blue", "info"),
	noMouseoverCSS("Violet", "violet"),
	noMouseoverCSS("Purple", "purple"),
	noMouseoverCSS("Pink", "pink", "black"),
	noMouseoverCSS("Orange", "orange"),
	noMouseoverVariant("Gold", "warning"),
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
	"bms:7K": "genocideDan" | "stslDan";
	"bms:14K": "genocideDan";
	"chunithm:Single": "colour";
	"gitadora:Gita": "colour";
	"gitadora:Dora": "colour";
	"wacca:Single": "stageUp" | "colour";
	"pms:Controller": "dan";
	"pms:Keyboard": "dan";
}

export type AllClassSets = GameClassSets[IDStrings];

export type GameClasses<I extends IDStrings> = {
	[K in GameClassSets[I]]: integer;
};
