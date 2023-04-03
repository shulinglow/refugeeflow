const width = 960;
const height = 600;

const svg = d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height)


d3.select("#map-container").style("background-color", "#537791");


const projection = d3.geoMercator()
    .scale(150)
    .translate([width / 2, height / 2]);

const path = d3.geoPath()
    .projection(projection);

const url = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson";

const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

d3.csv("./data/population_new.csv").then(data => {
    const startYear = 2016; // Replace with the starting year in your dataset
    const endYear = 2022; // Replace with the ending year in your dataset

    d3.json(url).then(world => {
        svg.selectAll("path")
            .data(world.features)
            .enter().append("path")
            .attr("d", path)
            .attr("fill", "#CCCCCC")
            .attr("stroke", "#000000")
            .attr("stroke-opacity", 1)
            .attr("stroke-width", 0.5)
            .on("mouseover", (event, d) => {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`Country: ${d.properties.NAME}<br>Refugee Count: ${getRefugeeCountForCountry(d.properties.NAME, data)}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", (event, d) => {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        function updateYear(year) {
            const yearData = data.filter(d => d.year === year);

            const aggregatedData = {};

            // Update the year text
            const yearText = svg.append("text")
                .attr("id", "yearText") // Add this line
                .attr("class", "yearText")
                .attr("x", width - 950)
                .attr("y", height - 20)
                .attr("font-size", "24px")
                .attr("fill", "black")
                .text("");
            d3.select("#yearText").text(year);

            yearData.forEach(d => {
                if (!aggregatedData[d.Asylum]) {
                    aggregatedData[d.Asylum] = +d.Refugee;
                } else {
                    aggregatedData[d.Asylum] += +d.Refugee;
                }
            });

            const refugeeExtent = d3.extent(Object.values(aggregatedData));

            const colorScale = d3.scaleSequential()
                .domain(refugeeExtent)
                .interpolator(t => d3.interpolateOranges(t));



            svg.selectAll("path")
                .transition()
                .duration(1000)
                .attr("fill", d => {
                    const countryName = d.properties.NAME;
                    const countryData = aggregatedData[countryName];
                    return countryData ? colorScale(countryData) : "#CCCCCC";
                });
        }

        function getRefugeeCountForCountry(countryName, data) {
            const countryData = data.filter(d => d.Asylum === countryName);
            let totalRefugees = 0;
            countryData.forEach(d => {
                totalRefugees += +d.Refugee;
            });
            return totalRefugees;
        }

        const delay = 2000; // Time in milliseconds between each year's animation

        for (let year = startYear; year <= endYear; year++) {
            setTimeout(() => {
                updateYear(year.toString());
            }, (year - startYear) * delay);
        }

        function getRefugeeCountForCountry(countryName, data) {
            const countryData = data.filter(d => d.Asylum === countryName);
            let totalRefugees = 0;
            countryData.forEach(d => {
                totalRefugees += +d.Refugee;
            });
            return totalRefugees;
        }
    });
});

