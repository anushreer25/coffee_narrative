console.log("D3 loaded:", d3);

d3.csv("coffee.csv", d => {
  return {
    country: d["Country.of.Origin"],
    species: d["Species"],
    totalScore: +d["Total.Cup.Points"],
    aroma: +d["Aroma"],
    flavor: +d["Flavor"],
    aftertaste: +d["Aftertaste"],
    acidity: +d["Acidity"],
    body: +d["Body"],
    balance: +d["Balance"],
    cupperPoints: +d["Cupper.Points"],
    altitude: d["Altitude"]
  };
}).then(data => {
  data = data.filter(d => d.country && d.totalScore > 0);
  console.log("Cleaned data:", data);
  console.log("Number of valid rows:", data.length);

  drawScene1(data);
});

function drawScene1(data) {
  const grouped = d3.rollup(
    data,
    v => d3.mean(v, d => d.totalScore),
    d => d.country
  );

  const countryAverages = Array.from(grouped, ([country, avg]) => ({ country, avg }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 10);

  console.log("Top 10 countries by avg score:", countryAverages);

  const svg = d3.select("#chart");
  const margin = { top: 40, right: 20, bottom: 100, left: 60 };
  const width = 800 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand()
    .domain(countryAverages.map(d => d.country))
    .range([0, width])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([75, d3.max(countryAverages, d => d.avg)])
    .range([height, 0]);

  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-40)")
    .style("text-anchor", "end");

  g.append("g").call(d3.axisLeft(y));

  g.selectAll(".bar")
    .data(countryAverages)
    .join("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.country))
    .attr("y", d => y(d.avg))
    .attr("width", x.bandwidth())
    .attr("height", d => height - y(d.avg))
    .attr("fill", "steelblue");
}
