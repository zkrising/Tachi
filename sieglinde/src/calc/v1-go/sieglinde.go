package main

import (
	"encoding/json"
	"fmt"
	"math"
	"os"
	"path"
	"path/filepath"
	"strings"
)

func main() {
	fmt.Println("THIS CODE DOES NOT WORK! It will never converge properly, due to an uninvestigated bug with the `alpha` variable. Feel free to fix it, but the performance of this implementation is no faster than the TypeScript Implementation.")

	pwd, err := os.Getwd()

	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	files, err := os.ReadDir(path.Join(pwd, "../../cache/"))

	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	var ecScores []ScoreData
	var hcScores []ScoreData

	for _, file := range files {
		var basename = file.Name()

		var name = strings.TrimSuffix(basename, filepath.Ext(basename))
		data, err := fetchData(name)

		if err != nil {
			fmt.Printf("Failed to get data for %s. %s\n", file.Name(), err)
			os.Exit(1)
		}

		for _, d := range data {
			ecScores = append(ecScores, ScoreData{
				User:  d.Name,
				MD5:   basename,
				Clear: d.Clear > 1,
			})

			hcScores = append(ecScores, ScoreData{
				User:  d.Name,
				MD5:   basename,
				Clear: d.Clear > 3,
			})
		}
	}

	var ecResults = CalculateSieglinde(ecScores)
	var hcResults = CalculateSieglinde(hcScores)

	type Data struct {
		md5 string
		ec  float64
		hc  float64
	}

	var data []Data
	for md5, ec := range ecResults {
		hc := hcResults[md5]

		data = append(data, Data{
			md5,
			ec,
			hc,
		})
	}

	jsonData, err := json.Marshal(data)

	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	os.WriteFile("out.json", jsonData, 0744)

	fmt.Println("Done.")
}

type ScoreStruct struct {
	Name  string `json:"name"`
	Clear int    `json:"clear"`
}

func fetchData(md5 string) ([]ScoreStruct, error) {
	pwd, err := os.Getwd()

	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	bytes, err := os.ReadFile(path.Join(pwd, "../../cache/"+md5+".json"))

	if err != nil {
		return nil, err
	}

	var data []ScoreStruct
	err = json.Unmarshal(bytes, &data)

	if err != nil {
		return nil, err
	}

	return data, err
}

type ScoreData struct {
	User  string
	MD5   string
	Clear bool
}

func CalculateSieglinde(scoreData []ScoreData) map[string]float64 {
	hasClearedAnyChart := make(map[string]bool)
	hasFailedAnyChart := make(map[string]bool)

	for _, score := range scoreData {
		if score.Clear {
			hasClearedAnyChart[score.User] = true
		} else {
			hasFailedAnyChart[score.User] = true
		}
	}

	var filteredScores []ScoreData
	ignoredUsers := 0

	userSkillMap := make(map[string]float64)
	songDiffMap := make(map[string]float64)
	songPlaycountMap := make(map[string]int)
	userPlaycountMap := make(map[string]int)

	for _, score := range scoreData {
		// skip all users who have only ever cleared (or failed) charts.
		// this is because they're either cheaters, or skewing averages.
		if !(hasClearedAnyChart[score.User] && hasFailedAnyChart[score.User]) {
			ignoredUsers++
			continue
		}

		userSkillMap[score.User] = 0
		songDiffMap[score.MD5] = 0

		filteredScores = append(filteredScores, score)

		songPlaycountMap[score.MD5]++
		userPlaycountMap[score.User]++
	}

	fmt.Printf("Ignored %d users, as they had 100%% or 0%% clear rates.\n", ignoredUsers)

	fmt.Printf("Got %d scores, %d songs and %d users.\n", len(filteredScores), len(songDiffMap), len(userSkillMap))

	const limit = 0.001
	alpha := 1.0
	maxDelta := 0.0
	mdl := 0.0
	t := 0.0

	for {
		fmt.Printf("Executing one step... (alpha = %f)\n", alpha)

		var magicNumberIDK float64

		if t < 20 {
			magicNumberIDK = 0.5
		} else {
			magicNumberIDK = alpha / 16
		}

		maxDelta = calculateStep(filteredScores, userSkillMap, songDiffMap, userPlaycountMap, songPlaycountMap, magicNumberIDK) / math.Sqrt(alpha)

		var isMdlPositive = mdl > 0
		var isMdPositive = maxDelta > 0

		if isMdlPositive == isMdPositive {
			if alpha > 5 {
				alpha = alpha * 1.005
			} else {
				alpha = alpha * 1.02
			}
		} else {
			alpha = 1
		}

		mdl = maxDelta

		maxDelta = math.Abs(maxDelta)

		if alpha*maxDelta > 1 {
			alpha = 1 / maxDelta
		}

		t++

		fmt.Printf("Convergence (md = %f)\n", maxDelta)

		if maxDelta <= limit {
			break
		}
	}

	return songDiffMap
}

func calculateStep(
	scoreData []ScoreData,
	userSkillMap map[string]float64,
	songDiffMap map[string]float64,
	userPlaycountMap map[string]int,
	songPlaycountMap map[string]int,
	alpha float64,
) float64 {
	maxDelta := 0.0

	deltaUserSkillMap := make(map[string]float64)
	deltaSongDiffMap := make(map[string]float64)

	fmt.Printf("Iterating over %d scores...\n", len(scoreData))
	for _, score := range scoreData {
		var curDiff = songDiffMap[score.MD5]
		var curSkill = userSkillMap[score.User]

		var potent = curSkill - curDiff

		// what the hell does this all mean?
		var scoreNum float64

		if score.Clear {
			scoreNum = 1
		} else {
			scoreNum = -1
		}

		var diff = (sigmoid(potent) - scoreNum) * dSigmoid(potent)

		deltaSongDiffMap[score.MD5] = deltaSongDiffMap[score.MD5] + diff/float64(songPlaycountMap[score.MD5])
		deltaUserSkillMap[score.User] = deltaUserSkillMap[score.User] - diff/float64(userPlaycountMap[score.User])
	}
	fmt.Println("Done.")

	for md5, delta := range deltaSongDiffMap {
		var newDiff = songDiffMap[md5] + delta*alpha

		songDiffMap[md5] = newDiff

		if maxDelta == 0 ||
			(maxDelta > 0 && delta > maxDelta) ||
			(maxDelta < 0 && delta < maxDelta) {
			maxDelta = delta
		}
	}

	for user, delta := range deltaUserSkillMap {
		var newDiff = userSkillMap[user] + delta*alpha

		userSkillMap[user] = newDiff

		if maxDelta == 0 ||
			(maxDelta > 0 && delta > maxDelta) ||
			(maxDelta < 0 && delta < maxDelta) {
			maxDelta = delta
		}
	}

	return maxDelta
}

func sigmoid(x float64) float64 {
	return math.Atan(x*math.Pi/2) / (math.Pi / 2)
}

func dSigmoid(x float64) float64 {
	var y = math.Pi * x

	return 4 / (4 + y*y)
}
