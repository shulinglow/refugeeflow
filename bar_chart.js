const margin = { top: 50, right: 20, bottom: 80, left: 150 };
const width = 1300 - margin.left - margin.right;
const height = 800 - margin.top - margin.bottom;

const categories = [
    { name: "Asia", color: d3.schemeCategory10[0] },
    { name: "Europe", color: d3.schemeCategory10[1] },
    { name: "North America", color: d3.schemeCategory10[2] },
    { name: "Oceania", color: d3.schemeCategory10[3] },
    { name: "South America", color: d3.schemeCategory10[4] }
  ];

  
const x = d3.scaleLog()
  .base(10)
  .range([0, width]);

const y = d3.scaleBand()
  .range([0, height])
  .padding(0.1);

const svg = d3.select("body")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

    const yearText = svg.append("text")
  .attr("class", "year")
  .attr("x", width - 20)
  .attr("y", height + margin.bottom / 2)
  .attr("text-anchor", "end")
  .style("font-family", "Arial") // Add this line to change the font-family
  .style("font-size", "24px") // Modify this line to change the font-size

  const legend = svg.append("g")
  .attr("class", "legend")
  .attr("transform", `translate(${width-100},${height - (categories.length * 20)})`); // Move the legend to the bottom right

  legend.selectAll(".legend-item")
  .data(categories)
  .enter()
  .append("g")
    .attr("class", "legend-item")
    .each(function(d, i) {
      d3.select(this)
        .append("rect")
          .attr("x", 0)
          .attr("y", i * 20)
          .attr("width", 10)
          .attr("height", 10)
          .style("fill", d.color);

      d3.select(this)
        .append("text")
          .attr("x", 20)
          .attr("y", i * 20 + 9)
          .style("font-family", "Arial")
          .style("font-size", "12px")
          .text(d.name);
    });


d3.csv("country_refugee_barchartrace.csv")
  .then(data => {
    const years = Array.from(new Set(data.map(d => d.year)));
    const duration = 1500;

    let index = -1;
    const intervalId = setInterval(() => {
      index = (index + 1) % years.length;
      update(years[index]);
      if (index === years.length - 1) {
        clearInterval(intervalId);
      }
    }, duration);

    const color = d3.scaleOrdinal()
    .domain(["Asia", "Europe", "North America", "Oceania", "South America"])
    .range(d3.schemeCategory10);

  function update(year) {
    const yearData = data.filter(d => d.year === year);
    const topCountries = yearData.sort((a, b) => b.value - a.value).slice(0, 8);
    yearText.text(year);
    
    if (topCountries.length === 0) {
      console.error(`No data available for the year ${year}`);
      return;
    }
  
    x.domain([1, d3.max(data, d => +d.value)]);

    y.domain(topCountries.map(d => d.country));
  
    const bars = svg.selectAll(".bar")
      .data(topCountries, d => d.country);
  
    bars.enter()
    .append("rect")
    .attr("class", "bar")
    .attr("y", d => y(d.country))
    .attr("height", y.bandwidth())
    .style("opacity", 0.85) // Add this line to make the bars slightly transparent
    .merge(bars)
    .transition().duration(duration - 10)
    .attr("x", 0)
    .attr("width", d => x(d.value))
    .attr("y", d => y(d.country))
    .attr("height", y.bandwidth())
    .style("fill", d => color(d.category));
  
    bars.exit().remove();
  
    const labels = svg.selectAll(".label")
      .data(topCountries, d => d.country);
  
      labels.enter()
      .append("text")
        .attr("class", "label")
        .attr("y", d => y(d.country) + y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "end")
        .style("font-family", "Arial") // Add this line to change the font-family
        .style("font-size", "14px") // Add this line to change the font-size
      .merge(labels)
        .transition().duration(duration - 100)
        .attr("x", d => x(d.value) - 3)
        .attr("y", d => y(d.country) + y.bandwidth() / 2)
        .text(d => d.value);
  
    labels.exit().remove();
  
    svg.selectAll(".country-name")
      .data(topCountries, d => d.country)
      .join("text")
        .attr("class", "country-name")
        .attr("x", 5)
        .attr("y", d => y(d.country) + y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "start")
        .text(d => d.country)
        .style("font-family", "Arial") // Add this line to change the font-family
    .style("font-size", "14px") // Add this line to change the font-size
    .text(d => d.country);

    svg.append("text")
  .attr("class", "chart-title")
  .attr("x", width / 2)
  .attr("y", -margin.top / 2)
  .attr("text-anchor", "middle")
  .style("font-family", "Arial")
  .style("font-size", "20px")
  .style("font-weight", "bold")
  .text("Refugees from Ukraine to other countries");
        
  }
  
      
      
  })
  .catch(error => {
    console.error("Error loading or parsing CSV file:", error);
  });
