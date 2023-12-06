class rankViz{
// 	set up the page constraints
	constructor(data,parentElement){
		this.data = data[0]
		this.parentElement = parentElement

		this.data.forEach((d,i)=>{
			d.startDate = new Date(d.startDate)
			d.endDate = new Date(d.endDate)
			d.name = d.firstName.concat(" ", d.lastName)
			d.label = d.Event.split(" - ")[1]
		})

		this.initVis()
	}

	initVis(){
		let vis = this;

		// SET UP SVG _________________________
		vis.margin = {top: 50, right: 100, bottom: 20, left: 50};
		vis.fullWidth= window.innerWidth;
		vis.fullHeight = 600;
		vis.width = vis.fullWidth - vis.margin.left - vis.margin.right;
		vis.height = vis.fullHeight - vis.margin.top - vis.margin.bottom;

		vis.minComp = 2


		// draw vis svg area
		vis.svg = d3.select("#" + vis.parentElement).append("svg")
				.attr("width", vis.width+vis.margin.left+vis.margin.right)
				.attr("height", vis.fullHeight)
				.attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);



	// 	set up scales
		vis.xScale = d3.scaleTime()
				.domain(d3.extent(vis.data,d=>d.startDate))
				.range([0, vis.width])

		vis.tickWidth=100
		vis.tickHeight=150
		vis.yScale = d3.scaleLinear()
				.range([vis.margin.top+vis.margin.bottom,vis.height])
				.domain([1,10])

		//
		// vis.xScaleOrdinal = d3.scaleOrdinal()
		// 		.range([0,vis.width])
		// 		.domain()

		vis.xAxis = d3.axisBottom(vis.xScale)//.ticks(1)//.ticks(vis.width/vis.tickWidth)
		vis.yAxis = d3.axisLeft(vis.yScale)


		vis.strokeScale = d3.scaleLog()
				.range([3,0.1])
				.domain([1,d3.max(vis.data,d=>d.rank)])



		vis.lineGenerator = d3.line()
				.x(function(d) { return vis.xScale(d.endDate); })
				.y(function(d) { return vis.yScale(d.rank); });

		vis.lineBrush = d3.line()
				.curve(d3.curveBumpX)
				// .curve(d3.curveCardinal)
				// .curve(d3.curveCatmullRomOpen.alpha(0.5)) //Slight rounding without too much deviation
				.x(function(d) {return vis.xScale(d.endDate); })
				.y(function(d) {return vis.yScale(d.rank); });

		vis.wrangleData(true, "LEAD")

	}

	wrangleData(gender,sport){
		let vis = this;

		// filterData
		// - subsets the data to make creating the visualization easier
		// - sorts the data by date
		// - removes entries with less than the minComp value (set in initVis)
		// - groups the data into the format needed for plotting
		// - assigns random numbers to each element to randomize the assignment of colors
		vis.displayData = vis.filterData(vis.data,gender,sport )

		// change the color scheme to match the gender
		vis.colorScale = gender ? d3.scaleSequential(d3.interpolateWarm) : d3.scaleSequential(d3.interpolateCool)
		vis.colorScale.domain([1,vis.displayData.length])


		vis.updateVis()

	}

	updateVis(){
		let vis = this;

		vis.xAxisGroup = vis.svg.append("g")
				.call(vis.xAxis)
				.attr("class","xAxis")
				.attr("transform", "translate("+vis.margin.left+"," + (vis.height)+ ")")
				.attr('font-size','1rem')

		vis.xAxisGroup.selectAll(".tick")
				.attr("rotate","45")

		vis.svg.append("g")
				.call(vis.yAxis)
				.attr("transform", "translate("+vis.margin.left+",0)")
				.attr('font-size','1rem')

		vis.svg.append("defs").append("clipPath")
				.attr("id", "clipContext")
				.append("rect")
				.attr("width", vis.width+vis.margin.left)
				.attr("height", vis.height);


		vis.pipes = vis.svg.selectAll(".line")
				.data(vis.displayData)
				.join("path")
				.attr("class", "line")
				.attr("d", d => { return vis.lineBrush(d[1])})
				.attr("transform", "translate("+vis.margin.left+",0)")
				.style("stroke-width", d=>{return vis.strokeScale(vis.getMaxRank(d[1]))})
				// .attr('stroke',"black")
				.attr('stroke',d=>{return vis.colorScale(d.num)})
				.style('fill','none')
				.attr("clip-path", "url(#clipContext)")
				// .transition().duration(750).delay(500)
				.style("opacity", 0.5)

	}

	// --------------------------------------------------------------------------
	// HELPER FUNCTIONS
	// --------------------------------------------------------------------------
	filterData(data,selectedGender,selectedCat){
		let vis = this;
		let gender = selectedGender === true ? 'Women' : 'Men'
	  let temp = data.filter((result) => result.gender===gender && result.category === selectedCat).sort((a,b)=>{return a.Year - b.Year || a.endDate - b.endDate})
		temp = d3.groups(temp, d=>d.name)
		temp = temp.filter(d=>d[1].length>vis.minComp)
		return vis.genRandomNum(temp)
		// temp.forEach((d,i)=>{
		// 	d.num = i
		// })
	}

	getMaxRank(data){
		let vis = this;
		let temp = data.sort((a,b)=>  a.rank - b.rank)
		return temp[1].rank
	}

	genRandomNum(data){
		let vis = this;
		let nums = vis.shuffle(Array.from(Array(data.length).keys()))

		data.forEach((d,i)=>{
			d.num= nums[i]
		 })

		return data
	}

	shuffle(array) {
		let currentIndex = array.length,  randomIndex;

		// While there remain elements to shuffle.
		while (currentIndex > 0) {

			// Pick a remaining element.
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex--;

			// And swap it with the current element.
			[array[currentIndex], array[randomIndex]] = [
				array[randomIndex], array[currentIndex]];
		}

		return array;
	}


}