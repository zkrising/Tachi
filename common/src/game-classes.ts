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

function c(d: string, m: string, bg = "black", color = "white") {
	return { display: d, mouseover: m, css: { backgroundColor: bg, color } };
}

function v(
	d: string,
	m: string,
	variant: "primary" | "secondary" | "success" | "warning" | "danger" | "info"
) {
	return { display: d, mouseover: m, variant };
}

function n(d: string, bg = "#131313", color = "white") {
	return { display: d, css: { backgroundColor: bg, color } };
}

export const IIDXDans: ClassInfo[] = [
	c("七級", "7th Kyu", "green"),
	c("六級", "6th Kyu", "green"),
	c("五級", "5th Kyu", "green"),
	c("四級", "4th Kyu", "green"),
	c("三級", "3rd Kyu", "green"),
	c("二級", "2nd Kyu", "green"),
	c("一級", "1st Kyu", "green"),
	v("初段", "1st Dan", "info"),
	v("二段", "2nd Dan", "info"),
	v("三段", "3rd Dan", "info"),
	v("四段", "4th Dan", "info"),
	v("五段", "5th Dan", "info"),
	v("六段", "6th Dan", "info"),
	v("七段", "7th Dan", "info"),
	v("八段", "8th Dan", "info"),
	v("九段", "9th Dan", "danger"),
	v("十段", "10th Dan", "danger"),
	c("中伝", "Chuuden", "silver", "black"),
	v("皆伝", "Kaiden", "warning"),
];

export const GitadoraColours: ClassInfo[] = [
	c("白", "White", "white", "black"),
	c("橙", "Orange", "orange"),
	c("橙グラ", "Orange Gradient", "orange"),
	v("黄", "Yellow", "warning"),
	v("黄グラ", "Yellow Gradient", "warning"),
	c("緑", "Green", "green"),
	c("緑グラ", "Green Gradient", "green"),
	v("青", "Blue", "info"),
	v("青グラ", "Blue Gradient", "info"),
	c("紫", "Purple", "purple"),
	c("紫グラ", "Purple Gradient", "purple"),
	v("赤", "Red", "danger"),
	v("赤グラ", "Red Gradient", "danger"),
	c("銅", "Bronze", "bronze"),
	c("銀", "Silver", "silver", "black"),
	c("金", "Gold", "gold"),
	c("虹", "Rainbow", "todo"),
];

export const BMSGenocideDans: ClassInfo[] = [
	c("☆1", "Normal 1st Dan", "lightblue"),
	c("☆2", "Normal 2nd Dan", "lightblue"),
	c("☆3", "Normal 3rd Dan", "lightblue"),
	c("☆4", "Normal 4th Dan", "lightblue"),
	c("☆5", "Normal 5th Dan", "lightblue"),
	c("☆6", "Normal 6th Dan", "lightblue"),
	c("☆7", "Normal 7th Dan", "lightblue"),
	c("☆8", "Normal 8th Dan", "lightblue"),
	c("☆9", "Normal 9th Dan", "lightred"),
	c("☆10", "Normal 10th Dan", "lightred"),
	v("★1", "Insane 1st Dan", "info"),
	v("★2", "Insane 2nd Dan", "info"),
	v("★3", "Insane 3rd Dan", "info"),
	v("★4", "Insane 4th Dan", "info"),
	v("★5", "Insane 5th Dan", "info"),
	v("★6", "Insane 6th Dan", "info"),
	v("★7", "Insane 7th Dan", "info"),
	v("★8", "Insane 8th Dan", "info"),
	c("★9", "Insane 9th Dan", "red"),
	c("★10", "Insane 10th Dan", "red"),
	c("★★", "Insane Kaiden", "teal"),
	c("(^^)", "Overjoy", "purple"),
];

export const BMSStSlDans: ClassInfo[] = [
	c("sl0", "Satellite 0"),
	c("sl1", "Satellite 1"),
	c("sl2", "Satellite 2"),
	c("sl3", "Satellite 3"),
	c("sl4", "Satellite 4"),
	c("sl5", "Satellite 5"),
	c("sl6", "Satellite 6"),
	c("sl7", "Satellite 7"),
	c("sl8", "Satellite 8"),
	c("sl9", "Satellite 9"),
	c("sl10", "Satellite 10"),
	c("sl11", "Satellite 11"),
	c("sl12", "Satellite 12"),
	c("st0", "Stella 0"),
	c("st1", "Stella 1"),
	c("st2", "Stella 2"),
	c("st3", "Stella 3"),
	c("st4", "Stella 4"),
	c("st5", "Stella 5"),
	c("st6", "Stella 6"),
	c("st7", "Stella 7"),
	c("st8", "Stella 8"),
	c("st9", "Stella 9"),
	c("st10", "Stella 10"),
	c("st11", "Stella 11"),
];

export const SDVXDans: ClassInfo[] = [
	c("LV.01", "1st Dan"),
	c("LV.02", "2nd Dan"),
	c("LV.03", "3rd Dan"),
	c("LV.04", "4th Dan"),
	c("LV.05", "5th Dan"),
	c("LV.06", "6th Dan"),
	c("LV.07", "7th Dan"),
	c("LV.08", "8th Dan"),
	c("LV.09", "9th Dan"),
	v("LV.10", "10th Dan", "warning"),
	v("LV.11", "11th Dan", "danger"),
	c("LV.INF", "Inf. Dan", "purple", "gold"),
];

export const SDVXVFClasses: ClassInfo[] = [
	n("Sienna I"),
	n("Sienna II"),
	n("Sienna III"),
	n("Sienna IV"),
	n("Cobalt I"),
	n("Cobalt II"),
	n("Cobalt III"),
	n("Cobalt IV"),
	n("Dandelion I"),
	n("Dandelion II"),
	n("Dandelion III"),
	n("Dandelion IV"),
	n("Cyan I"),
	n("Cyan II"),
	n("Cyan III"),
	n("Cyan IV"),
	n("Scarlet I"),
	n("Scarlet II"),
	n("Scarlet III"),
	n("Scarlet IV"),
	n("Coral I"),
	n("Coral II"),
	n("Coral III"),
	n("Coral IV"),
	n("Argento I"),
	n("Argento II"),
	n("Argento III"),
	n("Argento IV"),
	n("Eldora I"),
	n("Eldora II"),
	n("Eldora III"),
	n("Eldora IV"),
	n("Crimson I"),
	n("Crimson II"),
	n("Crimson III"),
	n("Crimson IV"),
	n("Imperial I"),
	n("Imperial II"),
	n("Imperial III"),
	n("Imperial IV"),
];

export const DDRDans = [
	v("初段", "1st Dan", "info"),
	v("二段", "2nd Dan", "info"),
	v("三段", "3rd Dan", "info"),
	v("四段", "4th Dan", "info"),
	v("五段", "5th Dan", "info"),
	v("六段", "6th Dan", "info"),
	v("七段", "7th Dan", "info"),
	v("八段", "8th Dan", "info"),
	v("九段", "9th Dan", "danger"),
	v("十段", "10th Dan", "danger"),
	v("皆伝", "Kaiden", "warning"),
];

export const CHUNITHMColours = [
	v("青", "Blue", "info"),
	c("緑", "Green", "green"),
	c("橙", "Orange", "orange"),
	v("赤", "Red", "danger"),
	c("紫", "Purple", "purple"),
	c("銅", "Copper", "bronze"),
	v("銀", "Silver", "secondary"),
	v("金", "Gold", "warning"),
	c("鉑", "Platinum", "silver", "black"),
	v("虹", "Rainbow", "success"),
];

// todo: #6 Add colours to the wacca stage ups.
export const WaccaStageUps = [
	n("I"),
	n("II"),
	n("III"),
	n("IV"),
	n("V"),
	n("VI"),
	n("VII"),
	n("VIII"),
	n("IX"),
	n("X"),
	n("XI"),
	n("XII"),
	n("XIII"),
	n("XIV"),
];

export interface GameClassSets {
	"iidx:SP": "dan";
	"iidx:DP": "dan";
	"popn:9B": never;
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
	"wacca:Single": "stageUp";
}

export type AllClassSets = GameClassSets[IDStrings];

export type GameClasses<I extends IDStrings> = {
	[K in GameClassSets[I]]: integer;
};
