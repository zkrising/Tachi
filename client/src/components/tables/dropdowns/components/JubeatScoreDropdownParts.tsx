import SelectNav from "components/util/SelectNav";
import React, { useEffect, useState } from "react";
import { Nav } from "react-bootstrap";
import { ChartDocument, PBScoreDocument, ScoreDocument } from "tachi-common";

export function JubeatGraphsComponent ({
	score,
	chart,
}: {
	score: ScoreDocument<"jubeat:Single"> | PBScoreDocument<"jubeat:Single">;
	chart: ChartDocument<"jubeat:Single">;
}) {
	const [graph, setGraph] = useState("DENSITY");

	if(score.scoreData.optional.musicBar)
	{

		/*
		var c = document.getElementById("mbar") as HTMLCanvasElement;
		var ctx = c?.getContext("2d");

		if( ctx != null)
		{
			var size = 10;
			var height = 130;
			var space= 5;
			
			var colors = new Array();
			colors[0] = new Array("#88866c", "#3a4231"); //base
			colors[1] = new Array("#8f938c", "#6a6e69"); //grey
			colors[2] = new Array("#84cbe2", "#007f87"); //blue
			colors[3] = new Array("#ffde00", "#7a7000"); //yellow
			
			for (let i = 0; i < chart.data.musicBar.length; i++) { //X
				let color = score.scoreData.optional.musicBar[i];
				ctx.fillStyle = colors[color][0];
				ctx.strokeStyle = colors[color][1];
				for (let j = 0; j < chart.data.musicBar[i]; j++) { //Y
					ctx.beginPath();
					ctx.rect(i*size+i*space, height - j*size*2 + j*space, size, size);
					ctx.fill();
					ctx.lineWidth = 2;
					ctx.stroke();
				}
			}
		}
		*/

		return (
			<>
				<div className="col-12 d-flex justify-content-center">
						<Nav variant="pills">
							<SelectNav id="DENSITY" value={graph} setValue={setGraph}>
								Play Bar
							</SelectNav>
						</Nav>
					</div>
				<div className="col-12">
					<p>
						Behold the music bar
					</p>
					<canvas id="mbar" width="400" height="200"/>
				</div>
			</>
		); 
	}
	else
	{
		return (<><p>No graph for you</p></>);
	}


}
