// Nishant Velagapudi
// Info 474
// Assignment 2 - Data Exploration Tool

// I modelled my code after what we saw in Module 8, exercise 3 in class.

$(document).ready(function() {
	// load data
	d3.csv('data/TruncatedData2.csv',function(error, allData){
		var xScale, yScale, currentData, cities;
		
		//currentData contains what is to be displayed, allData contains unfiltered set
		currentData = allData
		var DRGuniques = []

		//put unique DRG codes into array
		for(var i = 0; i < currentData.length; i++){
			if(jQuery.inArray(currentData[i]['DRGDefinition'], DRGuniques) == -1){
				DRGuniques.push(currentData[i]['DRGDefinition'])
			}
		}

		//populate DRG dropdown with unique DRGs
		//code taken from http://stackoverflow.com/questions/9895082/javascript-populate-drop-down-list-with-array

		var select = $("#DRGdef");

		for(var j = 0; j < DRGuniques.length; j++){
			var opt = DRGuniques[j];
		    var el = document.createElement("option");
		    el.textContent = opt;
		    el.value = opt;
		    select.append(el);
		}

		//Globals DRG and City 
		var DRG = "All";
		var money = "AvgCoveredCharges";

		d3.csv('data/cities.csv', function(data){
			cities = data.map(function(d) {
				return[d.City]
			});

		});

		var margin = {
			left:80,
			bottom:80,
			top:50,
			right:50,
		};

		var height = 600 - margin.bottom - margin.top;
		var width = 800 - margin.left - margin.right;

		var svg = d3.select('#vis')
			.append('svg')
			.attr('height', 600)
			.attr('width', 800);

		var Rects = svg.append('g')
			.attr('transform', 'translate(' +  margin.left + ',' + margin.top + ')')
			.attr('height', height)
			.attr('width', width);

		//Axis labels - create g's for axes
		var xAxisLabel = svg.append('g')
										.attr('transform', 'translate(' + margin.left + ',' + (height + margin.top) + ')')
										.attr('class', 'axis');
		var yAxisLabel = svg.append('g')
										.attr('class', 'axis')
										.attr('transform', 'translate(' + (margin.left+10) + ',' + (margin.top) + ')');

		// Place axis text - to fill in depending on filtered data
		var xAxisText = svg.append('text')
										.attr('transform', 'translate(' + (margin.left + width/2) + ',' + (height + margin.top + 80) + ')')
										.attr('class', 'title');
		var yAxisText = svg.append('text')
										.attr('transform', 'translate(' + (margin.left - 40) + ',' + (margin.top + height/2) + ') rotate(-90)')
										.attr('class', 'title');

		// Scale function:
		//customized to take in data, parameters for type of axis desired (categorical)
		// or numeric, which column in the data, and whether or not a log scale
		var setScales = function(data, type, value, log) {
			if(type == 'cat'){
				var domain = data.map(function(d) {return d[value]});
				return d3.scale.ordinal().rangeBands([0,width],.2).domain(domain)
			}
			else
			{
				var min = d3.min(data, function(d){return +d[value]})
				var max = d3.max(data, function(d){return +d[value]})
				if(log == 1){
					return d3.scale.log().range([height,0]).domain([min, max])
				} else {
					return d3.scale.linear().range([height,0]).domain([min, max])
				}
			}
		}

		//set axes from scales
		var setAxes = function(xScale, yScale){
			var xAxis = d3.svg.axis().scale(xScale).orient('bottom');
			var yAxis = d3.svg.axis().scale(yScale).orient('left');

			xAxisLabel.transition().duration(1500).call(xAxis)
											.selectAll("text")
												.attr("transform", function(d) {
							               			return "translate(-18,30) rotate(-65)" 
							               		});
			yAxisLabel.transition().duration(1500).call(yAxis)

			//update axis title based on user selection of payment to view
			var label = "Average Covered Charges"
			if(money == "AvgTotPayments"){
				label = "Average Total Payments"
			} else if (money == "AvgMedicarePayment"){
				label = "Average Medicare Payment"
			}

			xAxisText.text('Provider City')
			yAxisText.text(label + " (In $s)")

		}


		//draw graphs
		var draw = function(data, xval, yval){
			xScale = setScales(data, 'cat', xval, 0)
			yScale = setScales(data, 'reg', yval, 0)

			//.attr('x', function(d){return xScale(d.AvgCoveredCharges)})
			// Set axes
			setAxes(xScale,yScale)

			//binding
			var bars = Rects.selectAll('rect').data(data);

			//visualization
			bars.enter().append('rect')
				.attr('x', function(d) {return xScale(d[xval])})
				.attr('y', height)
				.attr('height', 0)
				.attr('width', xScale.rangeBand());

			bars.exit().remove();

			bars.transition()
				.duration(1500)
				.delay(500)
				.attr('x', function(d) {return xScale(d[xval])})
				.attr('y', function(d) { return yScale(d[yval])})
				.attr('height', function(d) {return height-yScale(d[yval])})
				.attr('width', xScale.rangeBand());
		}

		//filter data if user changes DRG to view
		var filterData = function() {
			if(DRG == "All"){
				currentData = allData
			} else {
				currentData = allData.filter(function(d) {
					return d.DRGDefinition == DRG
				})
			}
		}

		//onchange event
		$("#DRGdef").on('change', function DRGfunction() {
			// Get DRG value
			DRG = $(this).val();

			//Filter data, render chart
			$("#title").text("Cost of DRG Code: " + DRG)
			filterData();
			draw(currentData, 'ProviderCity', money);
		});

		//second onchange event
		$("#moneyValue").on('change', function MoneyFunction() {
			// Get value
			money = $(this).val();

			draw(currentData, 'ProviderCity', money);
		});

		draw(currentData, 'ProviderCity', money)
	});
});