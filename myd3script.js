// Defining margins for the svg canvas
      var margin = {top:30, right:50, bottom:30, left:80};
      // Defining the width and height attributes of the svg canvas
      var width = 960 - margin.left - margin.right;
      var height = 520 - margin.top - margin.bottom;
      // d3 format for modifying the date
      var formatDate = d3.time.format("%Y");
      var parseDate = d3.time.format("%Y").parse;
      // colors used for the bars
      var color = d3.scale.ordinal().range(["#FA6B5D", "#FFD747"]);
      // Defining the scales for creating the X and Y axes and determining the width of the bars
      myYearScale = d3.scale.ordinal().rangeRoundBands([0,width], 0.1);
      myStateScale = d3.scale.ordinal();
      myYScale= d3.scale.linear().range([height,0]);
      // Defining the scale for drawing the gridlines in the graph
      myHorizontalGridScale = d3.scale.linear().range([0,width]);
      // Defining the X and Y axes
      myXAxis = d3.svg.axis().scale(myYearScale).orient("bottom");
      myYAxis = d3.svg.axis().scale(myYScale).orient("left");
      // Creating the SVG
      mySVG = d3.select("#mortalityDiv").append("svg").attr("width", width+margin.left+margin.right).attr("height", height+margin.top+margin.bottom).append("g").attr("transform","translate("+margin.left+","+margin.top+")");
      // Defining the function for data to appear in the tooltips
      var tip = d3.tip().attr('class', 'd3-tip').offset([-10, 0]).html(function(d) { return "<strong> Country:</strong> <span style='color:orange'>" + d.name+ "</span>, <strong> Mortality Rate:</strong> <span style='color:orange'>" + d.value + "</span>" ; });
      // Using an external CSV file to obtain the data
      d3.csv("mortality.csv", function(error,data)
        {
          // Getting the names of the countries from the headers in the data CSV file
          var stateNames = d3.keys(data[0]).filter(function(key) { return key!="Year" && key!="Year1";});
          // Iterating through the dataset to return a set of country names and mortality rates for each year as a key-value pair
          data.forEach(function(d)
            {
              d.states = stateNames.map(function(name) { return {name:name, value: +d[name]};}) ;
              d.Year1 = +d.Year1;
            });
          
          // Defining the domains for the axes and gridlines
          var YScaleMax = d3.max(data, function(d) { return d3.max(d.states, function(d) { return d.value;}); });
          YScaleMax = YScaleMax+20;
          myYearScale.domain(data.map(function(d) { return d.Year;}));
          myStateScale.domain(stateNames).rangeRoundBands([0, myYearScale.rangeBand()]);
          myYScale.domain([0, YScaleMax]);
          myHorizontalGridScale.domain(d3.extent(data, function(d) { return d.Year1;}));
          // Drawing horizontal gridlines for the graph
          mySVG.selectAll("line.horizontalGrid").data(myYScale.ticks(20)).enter().append("line")
          .attr(
          {
              "class":"horizontalGrid",
              "x1" : "0",
              "x2" : width,
              "y1" : function(d){ return myYScale(d);},
              "y2" : function(d){ return myYScale(d);},
              "fill" : "none",
              "shape-rendering" : "crispEdges",
              "stroke" : "grey",
              "stroke-opacity" : "0.5",
              "stroke-width" : "1px"
          });
          // Drawing vertical grid lines for the graph
          mySVG.selectAll("line.verticalGrid").data(myHorizontalGridScale.ticks(20)).enter().append("line")
          .attr(
          {
              "class":"verticalGrid",
              "x1" : function(d){ return myHorizontalGridScale(d);},
              "x2" : function(d){ return myHorizontalGridScale(d);},
              "y1" : "0",
              "y2" : height,
              "fill" : "none",
              "shape-rendering" : "crispEdges",
              "stroke" : "grey",
              "stroke-opacity" : "0.4",
              "stroke-width" : "1px"
          });
          // Drawing the X axis and its label
          mySVG.append("g").attr("class","x-axis").attr("transform","translate(0,"+height+")").call(myXAxis);
          // Drawing the Y axis and its label
          mySVG.append("g").attr("class","y-axis").call(myYAxis).append("text").attr("transform","rotate(-90)").attr("y",6).attr("dy","0.71em").attr("class","whiteFont").style("text-anchor","end").text("Population");
          // Drawing the bars
          var Years = mySVG.selectAll(".year").data(data).enter().append("g").attr("class","g").attr("transform", function(d) { return "translate("+ myYearScale(d.Year)+",0)";});
          var myRectangle = Years.selectAll("rect").data(function(d) { return d.states;}).enter().append("rect").on('mouseover', tip.show).on('mouseout', tip.hide).attr("width", myStateScale.rangeBand()).attr("x", function(d) { return myStateScale(d.name);}).attr("y", function(d) { return height - .5; }).attr("height", 0).transition().duration(1000).attr("y", function(d) { return myYScale(d.value);}).attr("height", function(d) { return height - myYScale(d.value) -.5;}).ease("linear").style("fill", function(d) { return color(d.name);});
          // Creating a legend on the right side of the graph
          var legend = mySVG.selectAll(".legend").data(stateNames.slice().reverse()).enter().append("g").attr("class","legend").attr("transform", function(d,i) { return "translate(0, "+i*20+")"; });
          legend.append("rect").attr("x", width-18).attr("width",18).attr("height",18).style("fill",color);
          legend.append("text").attr("x", width-24).attr("y",9).attr("dy", "0.35em").attr("class","whiteFont").style("text-anchor","end").text(function(d) { return ("Mortality Rate in " +d);});
          // Add a title to the graph
          mySVG.append("text").attr("class","whiteFont").attr("x", (width / 2)).attr("y", 0 - (margin.top / 2)).attr("text-anchor", "middle").style("font-size", "14px").style("font-weight","bold").text("Mortality Rate in USA and India from 1990 to 2013");
          // Calling the tooltip function
          mySVG.call(tip);
        });