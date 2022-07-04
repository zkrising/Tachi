export enum SubscribeFailReasons {
	ALREADY_SUBSCRIBED = 0,
	ALREADY_ACHIEVED = 1,
}

export enum SetRivalsFailReasons {
	TOO_MANY = 0,
	RIVALED_SELF = 1,
	RIVALS_HAVENT_PLAYED_GPT = 2,
}
