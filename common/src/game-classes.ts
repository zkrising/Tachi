// Classes refer to things like dans.
// Not the JS construct.

import { IDStrings, integer } from "./types";

export interface ClassInfo {
	display: string;
	mouseover: string | null;
}

function c(d: string, m: string) {
	return { display: d, mouseover: m };
}

function n(d: string) {
	return { display: d, mouseover: null };
}

export const IIDXDans: ClassInfo[] = [
	c("七級", "7th Kyu"),
	c("六級", "6th Kyu"),
	c("五級", "5th Kyu"),
	c("四級", "4th Kyu"),
	c("三級", "3rd Kyu"),
	c("二級", "2nd Kyu"),
	c("一級", "1st Kyu"),
	c("初段", "1st Dan"),
	c("二段", "2nd Dan"),
	c("三段", "3rd Dan"),
	c("四段", "4th Dan"),
	c("五段", "5th Dan"),
	c("六段", "6th Dan"),
	c("七段", "7th Dan"),
	c("八段", "8th Dan"),
	c("九段", "9th Dan"),
	c("十段", "10th Dan"),
	c("中伝", "Chuuden"),
	c("皆伝", "Kaiden"),
];

export const GitadoraColours: ClassInfo[] = [
	c("白", "White"),
	c("橙", "Orange"),
	c("橙グラ", "Orange Gradient"),
	c("黄", "Yellow"),
	c("黄グラ", "Yellow Gradient"),
	c("緑", "Green"),
	c("緑グラ", "Green Gradient"),
	c("青", "Blue"),
	c("青グラ", "Blue Gradient"),
	c("紫", "Purple"),
	c("紫グラ", "Purple Gradient"),
	c("赤", "Red"),
	c("赤グラ", "Red Gradient"),
	c("銅", "Bronze"),
	c("銀", "Silver"),
	c("金", "Gold"),
	c("虹", "Rainbow"),
];

export const BMSGenocideDans: ClassInfo[] = [
	c("☆1", "Normal 1st Dan"),
	c("☆2", "Normal 2nd Dan"),
	c("☆3", "Normal 3rd Dan"),
	c("☆4", "Normal 4th Dan"),
	c("☆5", "Normal 5th Dan"),
	c("☆6", "Normal 6th Dan"),
	c("☆7", "Normal 7th Dan"),
	c("☆8", "Normal 8th Dan"),
	c("☆9", "Normal 9th Dan"),
	c("☆10", "Normal 10th Dan"),
	c("★1", "Insane 1st Dan"),
	c("★2", "Insane 2nd Dan"),
	c("★3", "Insane 3rd Dan"),
	c("★4", "Insane 4th Dan"),
	c("★5", "Insane 5th Dan"),
	c("★6", "Insane 6th Dan"),
	c("★7", "Insane 7th Dan"),
	c("★8", "Insane 8th Dan"),
	c("★9", "Insane 9th Dan"),
	c("★10", "Insane 10th Dan"),
	c("★★", "Insane Kaiden"),
	c("(^^)", "Overjoy"),
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
	c("LV.10", "10th Dan"),
	c("LV.11", "11th Dan"),
	c("LV.INF", "Inf. Dan"),
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

export interface GameClassSets {
	"iidx:SP": "dan";
	"iidx:DP": "dan";
	"popn:9B": never;
	"sdvx:Single": "dan" | "vfClass";
	"usc:Single": never;
	"ddr:SP": "dan";
	"ddr:DP": "dan";
	"maimai:Single": never;
	"jubeat:Single": "colour";
	"museca:Single": never;
	"bms:7K": "genocideDan" | "stslDan";
	"bms:14K": "genocideDan";
	"chunithm:Single": never;
	"gitadora:Gita": "colour";
	"gitadora:Dora": "colour";
}

export type AllClassSets = GameClassSets[IDStrings];

export type GameClasses<I extends IDStrings> = {
	[K in GameClassSets[I]]: integer;
};
