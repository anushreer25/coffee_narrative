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
  const svg = d3.select("#chart");
  const margin = { top: 40, right: 20, bottom: 100, left: 60 };
  const width = 800 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  // Title
  svg.append("text")
    .attr("x", width / 2 + margin.left)
    .attr("y", 25)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .text("Top 10 Coffee-Producing Countries by Average Quality Score");

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Group and average
  const grouped = d3.rollup(
    data,
    v => d3.mean(v, d => d.totalScore),
    d => d.country
  );

  const countryAverages = Array.from(grouped, ([country, avg]) => ({ country, avg }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 10);

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

  const topCountry = countryAverages[0];

  g.selectAll(".bar")
    .data(countryAverages)
    .join("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.country))
    .attr("y", d => y(d.avg))
    .attr("width", x.bandwidth())
    .attr("height", d => height - y(d.avg))
    .attr("fill", d => d.country === topCountry.country ? "#c0392b" : "steelblue");

  // Annotation using d3-annotation
  const annotations = [
    {
      note: {
        title: "Highest rated",
        label: topCountry.country,
      },
      x: x(topCountry.country) + x.bandwidth() / 2,
      y: y(topCountry.avg),
      dy: -60,
      dx: 30,
      color: "#c0392b"
    }
  ];

  const makeAnnotations = d3.annotation()
    .type(d3.annotationCalloutCircle)
    .annotations(annotations);

  g.append("g")
    .attr("class", "annotation-group")
    .call(makeAnnotations);
}
