let promise = [
	d3.json("data/ifsc_rank_data_12.4_f.json")
]

let pipeChart, brushChart
Promise.all(promise)
		.then( function(data){
			pipeChart = new rankViz(data,"pipe")
		})
		.catch( function (err){console.log(err)} );

function changeFilters(){
	let gender = $("#womenButton").is(":checked")
	let sport = $("#leadButton").is(":checked") ? 'LEAD': $("#boulderButton").is(":checked") ? "BOULDER" : $("#speedButton").is(":checked") ? "SPEED" : null;

	// console.log(gender,sport)
	pipeChart.wrangleData(gender,sport)
}

