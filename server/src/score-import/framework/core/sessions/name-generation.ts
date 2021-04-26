import { GetRandomAdjective, GetRandomNoun } from "../../../../data/words";

export function GenerateRandomSessionName() {
    let adj1 = GetRandomAdjective();
    let adj2 = GetRandomAdjective();
    let noun = GetRandomNoun();

    return `${adj1} ${adj2} ${noun}`;
}
