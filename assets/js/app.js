//starting point for svg dimensions
let svgWidth = 960;
let svgHeight = 500;

let axisDelay = 2500;
let circleDely = 2500;

//set the margin
let margin = { top: 20, right: 40, bottom: 90, left: 110 };

//calculate chart Dimension by adjusting the margin
let chartWidth = svgWidth - margin.left - margin.right;
let chartHeight = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
let svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
let chartGroup = svg
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

/********************************************/
//import csv file with d3, and convert table data in to numbers
d3.csv("assets/data/data.csv", rowConverter)
  .then(createChart)
  .catch(function (error) {
    console.log("*********unexpected error occured*********");
    console.log(error);
  });

/******************************************** */
//function to convert data into numbers
function rowConverter(row) {
  row.poverty = +row.poverty;
  row.age = +row.age;
  row.income = +row.income;
  row.healthcare = +row.healthcare;
  row.obesity = +row.obesity;
  row.smokes = +row.smokes;
  return row;
}
/********************************************/
//function to create table
function createChart(stateData) {
  console.table(stateData, [
    "state",
    "poverty",
    "age",
    "income",
    "healthcare",
    "obesity",
    "smokes",
  ]);

  //we store the current chartinformation into activeInfo Object
  let activeInfo = {
    data: stateData,
    currentX: "poverty",
    currentY: "healthcare",
  };

  console.log(activeInfo);

  /*********************************************/
  //create the x & y scale
  activeInfo.xScale = d3
    .scaleLinear()
    .domain(getXDomain(activeInfo))
    .range([0, chartWidth]);

  activeInfo.yScale = d3
    .scaleLinear()
    .domain(getYDomain(activeInfo))
    .range([chartHeight, 0]);

  activeInfo.xAxis = d3.axisBottom(activeInfo.xScale);
  activeInfo.yAxis = d3.axisLeft(activeInfo.yScale);

  /*********************************************/
  //calling the axis, circle, tooltip, and lables functions
  createAxis(activeInfo);

  createCircles(activeInfo);

  createToolTip(activeInfo);

  createLables();

  d3.selectAll(".aText").on("click", function (event) {
    console.log(event);
    console.log(activeInfo)
    handleClick(d3.select(this), activeInfo);
  });
}

/********************************************/
//function to hadle the data change clicks
function handleClick(label, activeInfo) {
  let axis = label.attr("data-axis");
  let name = label.attr("data-name");

  if (label.classed("active")) {
    return;
  }
  updateLabel(label, axis);

  if (axis === "x") {
    activeInfo.currentX = name;
    activeInfo.xScale.domain(getXDomain(activeInfo));
    renderXAxes(activeInfo);
    renderHorizontal(activeInfo);
  } //add logic to handle y axis click


  // if (axis === "y") {
  //   activeInfo.currentY = name;
  //   activeInfo.yScale.domain(getYDomain(activeInfo));
  //   renderYAxes(activeInfo);
  //   renderHorizontal(activeInfo);
  // }

  else {
    activeInfo.currentY = name;
    activeInfo.yScale.domain(getYDomain(activeInfo));
    renderYAxes(activeInfo);
    renderVertical(activeInfo);
  }
}

/********************************************/
//function appends text to x & y label
function createLables() {
  let xlabelsGroup = chartGroup
    .append("g")
    .attr("class", "xText")
    .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);

  xlabelsGroup
    .append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("data-name", "poverty")
    .attr("data-axis", "x")
    .attr("class", "aText active x")
    .text("In Poverty (%)");

  xlabelsGroup
    .append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("data-name", "age")
    .attr("data-axis", "x")
    .attr("class", "aText inactive x")
    .text("Age (Median)");

  xlabelsGroup
    .append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("data-name", "income")
    .attr("data-axis", "x")
    .attr("class", "aText inactive x")
    .text("Household Income (Median)");

  let ylabelsGroup = chartGroup
    .append("g")
    .attr("class", "yText")
    .attr("transform", `translate(-60 , ${chartHeight / 2}) rotate(-90)`);

  ylabelsGroup
    .append("text")
    .attr("y", 0)
    .attr("x", 0)
    .attr("dy", "1em")
    .attr("data-name", "healthcare")
    .attr("data-axis", "y")
    .attr("class", "aText active y")
    .text("Lacks Healthcare (%)");

  ylabelsGroup
    .append("text")
    .attr("y", -20)
    .attr("x", 0)
    .attr("dy", "1em")
    .attr("data-name", "smokes")
    .attr("data-axis", "y")
    .attr("class", "aText inactive y")
    .text("Smokes (%)");

  ylabelsGroup
    .append("text")
    .attr("y", -40)
    .attr("x", 0)
    .attr("dy", "1em")
    .attr("data-name", "obesity")
    .attr("data-axis", "y")
    .attr("class", "aText inactive y")
    .text("Obesity (%)");
}
/********************************************/
//function creates chart circles & state abbr on circles 
function createCircles(activeInfo) {
  let currentX = activeInfo.currentX;
  let currentY = activeInfo.currentY;
  let xScale = activeInfo.xScale;
  let yScale = activeInfo.yScale;

  let circlesGroup = chartGroup
    .selectAll("circle")
    .data(activeInfo.data)
    .enter()
    .append("circle")
    .attr("cx", (d) => xScale(d[currentX]))
    .attr("cy", (d) => yScale(d[currentY]))
    .attr("r", 12)
    .attr("class", "stateCircle")


  let circleLables = chartGroup
    .selectAll(null)
    .data(activeInfo.data)
    .enter()
    .append("text")
    .attr("x", (d) => xScale(d[currentX]))
    .attr("y", (d) => yScale(d[currentY]))
    .text(function (d) {
      return d.abbr;
    })
    .attr("class", "stateText")
    .attr("font-size", "10px");
}
/********************************************/
//function creates the x axis & y axis
function createAxis(activeInfo) {
  chartGroup.append("g").call(activeInfo.yAxis).attr("class", "y-axis")
    .attr("transform", `translate(0, 0)`);

  chartGroup
    .append("g")
    .call(activeInfo.xAxis)
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${chartHeight})`);
}
/********************************************/
//function adjust the x axis to the currnet activeInfo
function renderXAxes(activeInfo) {
  chartGroup
    .select(".x-axis")
    .transition()
    .duration(axisDelay)
    .call(activeInfo.xAxis);
}
/********************************************/
//function adjust the y axis to the currnet activeInfo
function renderYAxes(activeInfo) {
  chartGroup
    .select(".y-axis")
    .transition()
    .duration(axisDelay)
    .call(activeInfo.yAxis);
}

/********************************************/
//function get min and max for x axis
function getXDomain(activeInfo) {
  let min = d3.min(activeInfo.data, (d) => d[activeInfo.currentX]);
  let max = d3.max(activeInfo.data, (d) => d[activeInfo.currentX]);
  return [min * 0.8, max * 1.2];
}
/********************************************/
//function get min and max for y axis
function getYDomain(activeInfo) {
  let min = 0; //d3.min(activeInfo.data, d => d[activeInfo.currentY])
  let max = d3.max(activeInfo.data, (d) => d[activeInfo.currentY]);
  return [min, max];
}
/********************************************/
//function moves the circles and abbr to the current activeInfo locations on x axis
function renderHorizontal(activeInfo) {
  d3.selectAll("circle").each(adjustCircles);

  function adjustCircles() {
    d3.select(this)
      .transition()
      .attr("cx", (d) => activeInfo.xScale(d[activeInfo.currentX]))
      .duration(circleDely);
  }

  d3.selectAll(".stateText").each(adjustStates);

  function adjustStates() {
    d3.select(this)
      .transition()
      .attr("x", (d) => activeInfo.xScale(d[activeInfo.currentX]))
      .duration(circleDely);
  }
}

/********************************************/
//function moves the circles and abbr to the current activeInfo locations on y axis
function renderVertical(activeInfo) {

  d3.selectAll("circle").each(function () {
    d3.select(this)
      .transition()
      .attr("cy", (d) => activeInfo.yScale(d[activeInfo.currentY]))
      .duration(circleDely);
  });

  d3.selectAll(".stateText").each(function () {
    d3.select(this)
      .transition()
      .attr("y", (d) => activeInfo.yScale(d[activeInfo.currentY]))
      .duration(circleDely);
  });
}

/********************************************/
//function updated the labels to show active data, and changes previous choice to inactive
function updateLabel(label, axis) {
  d3.selectAll(".aText")
    .filter("." + axis)
    .filter(".active")
    .classed("active", false)
    .classed("inactive", true);

  label.classed("inactive", false).classed("active", true);
}

/********************************************/
//tooltip function, displays data when hovering over data
function createToolTip(activeInfo) {
  let xlabel = "Poverty: ";

  if (activeInfo.currentX === "poverty") {
    xlabel = "Poverty: ";
  }
  else {
    xlabel = "Age: ";
  }
  console.log(activeInfo)
  let toolTip = d3
    .tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function (event, d) {
      let html =
        d.state +
        "<br> " +
        xlabel +
        d[activeInfo.currentX] +
        "%" +
        "<br> Healthcare: " +
        d[activeInfo.currentY] +
        "%";
      return html;
    });

  chartGroup.call(toolTip);

  let circles = d3.selectAll("circle");

  let text = d3.selectAll(".stateText");

  circles.on("mouseover", toolTip.show);

  circles.on("mouseout", toolTip.hide);

  text.on("mouseover", toolTip.show);

  text.on("mouseout", toolTip.hide);
}

/********************************************/
