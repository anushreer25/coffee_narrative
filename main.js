console.log("D3 loaded:", d3);

const COLORS = {
  neutral: "#a97155",     //  regular bars
  highlight: "#c0392b",   // red for highligt
  accent: "#6f4e37"       // scene 3 bars
};

const COUNTRY_NAME_MAP = {
  "Cote d?Ivoire": "Côte d'Ivoire",
  "Tanzania, United Republic Of": "Tanzania",
  "United States": "United States of America",
  "United States (Hawaii)": "United States of America",
  "United States (Puerto Rico)": "Puerto Rico"
  // MATCH NAMES HERE
};

function toAtlasName(datasetName) {
  return COUNTRY_NAME_MAP[datasetName] || datasetName;
}

let allData = [];

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
  allData = data.filter(d => d.country && d.totalScore > 0);
  console.log("Cleaned data:", allData);
  console.log("Number of valid rows:", allData.length);
  showScene(1); // start on scene 1
});

function showScene(sceneNumber) {
  d3.select("#chart").html("");
  d3.select("#controls").html("");
  d3.select("#map").html("");
  d3.select("#profilePanel").html("");
  d3.select("#blurb").html("");
  d3.select("#scene3Container").style("display", "none");
  d3.select("#scene12Container").style("display", "flex");
  d3.select("#chart").style("display", "block");

  if (sceneNumber === 1) drawScene1(allData);
  if (sceneNumber === 2) drawScene2(allData);
  if (sceneNumber === 3) {
    d3.select("#scene12Container").style("display", "none");
    d3.select("#scene3Container").style("display", "flex");
    drawScene3(allData);
  }
}

function drawScene1(data) {
  const svg = d3.select("#chart");
  const margin = { top: 130, right: 20, bottom: 100, left: 60 };  // was 90
  const width = 800 - margin.left - margin.right;
  const height = 650 - margin.top - margin.bottom;

  // 
  svg.append("text")
    .attr("x", width / 2 + margin.left)
    .attr("y", 25)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .text("Top 10 Coffee-Producing Countries by Average Quality Score");


  svg.append("text")
  .attr("id", "subtitle")
  .attr("x", width / 2 + margin.left)
  .attr("y", 45)
  .attr("text-anchor", "middle")
  .style("font-size", "13px")
  .style("font-style", "italic")
  .style("fill", "#666")
  .text("Only countries with 10+ reviews are included, to avoid small-sample bias.");

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const grouped = d3.rollup(
    data,
    v => ({ avg: d3.mean(v, d => d.totalScore), count: v.length }),
    d => d.country
  );

  const countryAverages = Array.from(grouped, ([country, stats]) => ({
      country,
      avg: stats.avg,
      count: stats.count
    }))
    .filter(d => d.count >= 10)   // min sample size 10
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

  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -45)
    .attr("text-anchor", "middle")
    .style("font-size", "13px")
    .text("Average Quality Score");

  
  g.append("text")
    .attr("x", width / 2)
    .attr("y", height + 95)
    .attr("text-anchor", "middle")
    .style("font-size", "13px")
    .text("Country of Origin");

  const topCountry = countryAverages[0];

  g.selectAll(".bar")
    .data(countryAverages)
    .join("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.country))
    .attr("y", d => y(d.avg))
    .attr("width", x.bandwidth())
    .attr("height", d => height - y(d.avg))
    .attr("fill", d => d.country === topCountry.country ? COLORS.highlight : COLORS.neutral);

  // d3 annotation
  const annotations = [
    {
      note: {
        title: "Highest rated",
        label: topCountry.country,
      },
      x: x(topCountry.country) + x.bandwidth() / 2,
      y: y(topCountry.avg),
      dy: -20,   // was -30
      dx: 40,
      color: COLORS.highlight
    }
  ];

  const makeAnnotations = d3.annotation()
    .type(d3.annotationCalloutCircle)
    .annotations(annotations);

  g.append("g")
    .attr("class", "annotation-group")
    .call(makeAnnotations);


  d3.select("#blurb")
    .append("div")
    .html("As a working professional pursuing a master's degree, coffee has become a daily necessity rather than just the casual drink it was in high school. Reflecting over the past decade, I realize my taste in coffee has slowly shifted. I now favor higher quality espresso from local coffee shops, and find it difficult to enjoy value coffee from chains such as Dunkin or Starbucks. This led to a curiosity about coffee quality, and how its geographical origin may affect its taste. This narrative visualization explores whether a coffee's geographic origin relates to its quality, and how much of that relationship holds up once the data is examined carefully.");
}

function drawScene2(data) {
  const svg = d3.select("#chart");
  const margin = { top: 140, right: 20, bottom: 100, left: 60 };  // was 90
  const width = 800 - margin.left - margin.right;
  const height = 650 - margin.top - margin.bottom;

  svg.append("text")
    .attr("x", width / 2 + margin.left)
    .attr("y", 25)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .text("Arabica vs. Robusta: Average Quality Score");

  svg.append("text")
  .attr("id", "subtitle")
  .attr("x", width / 2 + margin.left)
  .attr("y", 45)
  .attr("text-anchor", "middle")
  .style("font-size", "13px")
  .style("font-style", "italic")
  .style("fill", "#666")
  .text("Robusta is rarely reviewed in this dataset, so treat this comparison with caution.");

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const grouped = d3.rollup(
    data,
    v => ({ avg: d3.mean(v, d => d.totalScore), count: v.length }),
    d => d.species
  );

  const speciesStats = Array.from(grouped, ([species, stats]) => ({
    species,
    avg: stats.avg,
    count: stats.count
  })).filter(d => d.species); // drop any blankspecies

  const x = d3.scaleBand()
    .domain(speciesStats.map(d => d.species))
    .range([0, width])
    .padding(0.4);

  const y = d3.scaleLinear()
    .domain([75, d3.max(speciesStats, d => d.avg) + 2])
    .range([height, 0]);

  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  g.append("g").call(d3.axisLeft(y));

  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -45)
    .attr("text-anchor", "middle")
    .style("font-size", "13px")
    .text("Average Quality Score");

  g.append("text")
    .attr("x", width / 2)
    .attr("y", height + 40)
    .attr("text-anchor", "middle")
    .style("font-size", "13px")
    .text("Coffee Species");

  g.selectAll(".bar")
    .data(speciesStats)
    .join("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.species))
    .attr("y", d => y(d.avg))
    .attr("width", x.bandwidth())
    .attr("height", d => height - y(d.avg))
    .attr("fill", d => d.species === "Robusta" ? COLORS.highlight : COLORS.neutral);

  //
  g.selectAll(".countLabel")
    .data(speciesStats)
    .join("text")
    .attr("class", "countLabel")
    .attr("x", d => x(d.species) + x.bandwidth() / 2)
    .attr("y", d => y(d.avg) - 10)
    .attr("text-anchor", "middle")
    .style("font-size", "13px")
    .text(d => `avg: ${d.avg.toFixed(2)}`);

  const robusta = speciesStats.find(d => d.species === "Robusta");
  const annotations = [
    {
      note: {
        title: "Small sample size",
        label: `Only ${robusta.count} Robusta reviews vs. ${speciesStats.find(d => d.species === "Arabica").count} Arabica`,
      },
      x: x("Robusta") + x.bandwidth() / 2,
      y: y(robusta.avg),
      dy: -30,   // was -70
      dx: 60,
      color: COLORS.highlight
    }
  ];

  const makeAnnotations = d3.annotation()
    .type(d3.annotationCalloutCircle)
    .annotations(annotations);

  g.append("g")
    .attr("class", "annotation-group")
    .call(makeAnnotations);

   d3.select("#blurb")
    .append("p")
    .html("<strong>Arabica</strong> and <strong>Robusta</strong> are the two main species of coffee grown commercially. Arabica is generally grown at higher altitudes, has a smoother, more complex flavor, and dominates specialty coffee production and reviews. Robusta is hardier, easier to grow, and produces a stronger, more bitter flavor, often used in instant coffee and espresso blends.");
}
/*
function drawScene3(data) {
  const svg = d3.select("#chart");
  const margin = { top: 90, right: 20, bottom: 60, left: 60 };
  const width = 800 - margin.left - margin.right;
  const height = 650 - margin.top - margin.bottom;

  const grouped = d3.rollup(data, v => v.length, d => d.country);
  const countries = Array.from(grouped, ([country, count]) => ({ country, count }))
    .filter(d => d.count >= 10)
    .sort((a, b) => b.country.localeCompare(a.country))
    .map(d => d.country)
    .sort();

  const controls = d3.select("#controls");
  controls.html(""); // clear old dropdown if re-entering scene
  controls.append("label").text("Select a country: ").style("font-weight", "bold");
  const select = controls.append("select")
    .attr("id", "countrySelect")
    .on("change", function() {
      const selectedCountry = this.value; // parameter updated by trigger
      renderCountryChart(selectedCountry);
    });

  select.selectAll("option")
    .data(countries)
    .join("option")
    .attr("value", d => d)
    .text(d => d);

  
  svg.append("text")
  .attr("id", "subtitle")
  .attr("x", width / 2 + margin.left)
  .attr("y", 45)
  .attr("text-anchor", "middle")
  .style("font-size", "13px")
  .style("font-style", "italic")
  .style("fill", "#666")
  .text("Select a country to see its average cupping profile across six tasted attributes.");

  const g = svg.append("g")
    .attr("class", "chartGroup")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  function renderCountryChart(country) {
    g.selectAll("*").remove(); // clear previous bars
    d3.select("#sceneTitle").text(`Cupping Profile: ${country}`);

    const countryData = data.filter(d => d.country === country);
    const attributes = ["aroma", "flavor", "aftertaste", "acidity", "body", "balance"];
    const attrLabels = { aroma: "Aroma", flavor: "Flavor", aftertaste: "Aftertaste", acidity: "Acidity", body: "Body", balance: "Balance" };

    const attrAverages = attributes.map(attr => ({
      attribute: attrLabels[attr],
      value: d3.mean(countryData, d => d[attr])
    }));

    const x = d3.scaleBand()
      .domain(attrAverages.map(d => d.attribute))
      .range([0, width])
      .padding(0.3);

     
*/
let worldData = null;

function drawScene3(data) {
  const grouped = d3.rollup(
    data,
    v => ({ avg: d3.mean(v, d => d.totalScore), count: v.length }),
    d => d.country
  );
  const countryStats = Array.from(grouped, ([country, stats]) => ({ country, ...stats }))
    .filter(d => d.count >= 10);
  const countries = countryStats.map(d => d.country).sort();

  const controls = d3.select("#controls");
  controls.html("");
  controls.append("label").text("Select a country: ").style("font-weight", "bold");
  const select = controls.append("select")
    .attr("id", "countrySelect")
    .on("change", function() {
      renderProfile(this.value);
      highlightMapCountry(this.value);
    });
  select.selectAll("option").data(countries).join("option").attr("value", d => d).text(d => d);

  const mapWidth = 550, mapHeight = 450;
  const mapSvg = d3.select("#map").attr("width", mapWidth).attr("height", mapHeight).html("");

  mapSvg.append("text")
    .attr("x", mapWidth / 2).attr("y", 25).attr("text-anchor", "middle")
    .style("font-size", "16px").style("font-weight", "bold")
    .text("Coffee-Producing Countries (click to explore)");

  const colorScale = d3.scaleLinear()
    .domain(d3.extent(countryStats, d => d.avg))
    .range([COLORS.neutral, COLORS.highlight]);

  let pathGenerator = null;
  let countriesGeoFeatures = null;

  function renderProfile(country) {
    d3.select("#countrySelect").property("value", country);
    const countryData = data.filter(d => d.country === country);
    const stat = countryStats.find(c => c.country === country);

    const attributes = ["aroma", "flavor", "aftertaste", "acidity", "body", "balance"];
    const attrLabels = { aroma: "Aroma", flavor: "Flavor", aftertaste: "Aftertaste", acidity: "Acidity", body: "Body", balance: "Balance" };
    const attrAverages = attributes.map(attr => ({
      attribute: attrLabels[attr],
      value: d3.mean(countryData, d => d[attr])
    }));
    const strongest = attrAverages.reduce((a, b) => (b.value > a.value ? b : a));

    const panel = d3.select("#profilePanel");
    panel.html("");
    panel.append("h2").text(country).style("margin", "0 0 4px 0").style("font-family", "Georgia, serif");
    panel.append("p")
      .style("font-size", "13px").style("font-style", "italic").style("color", "#666").style("margin-top", "0")
      .text(`Avg score: ${stat.avg.toFixed(2)} (${stat.count} reviews)`);

    const list = panel.append("ul").style("list-style", "none").style("padding", "0").style("margin", "10px 0");
    list.selectAll("li")
      .data(attrAverages)
      .join("li")
      .style("padding", "6px 0").style("border-bottom", "1px solid #eee").style("font-size", "15px")
      .style("font-weight", d => d.attribute === strongest.attribute ? "bold" : "normal")
      .style("color", d => d.attribute === strongest.attribute ? COLORS.highlight : "#2e2e2e")
      .html(d => `${d.attribute === strongest.attribute ? "★ " : ""}${d.attribute}<span style="float:right">${d.value.toFixed(2)}</span>`);

    panel.append("p")
      .style("font-size", "12px").style("color", COLORS.highlight).style("margin-top", "10px")
      .text(`Standout attribute: ${strongest.attribute}`);

    drawMapAnnotation(country, stat);
  }

  function drawMapAnnotation(country, stat) {
    mapSvg.select(".map-annotation-group").remove();
    if (!pathGenerator || !countriesGeoFeatures) return;

    const feature = countriesGeoFeatures.find(f => f.properties.name === toAtlasName(country));
    if (!feature) return;

    const centroid = pathGenerator.centroid(feature);

    const annotations = [{
      note: {
        title: country,
        label: `Avg: ${stat.avg.toFixed(2)}`
      },
      x: centroid[0],
      y: centroid[1] + 40,
      dy: -50,
      dx: 30,
      color: COLORS.highlight
    }];

    const makeAnnotations = d3.annotation().type(d3.annotationCalloutCircle).annotations(annotations);
    mapSvg.append("g").attr("class", "map-annotation-group").call(makeAnnotations);
  }

  function highlightMapCountry(country) {
    d3.select("#map").selectAll("path.country")
      .attr("stroke", d => toAtlasName(country) === d.properties.name ? "black" : "#fff")
      .attr("stroke-width", d => toAtlasName(country) === d.properties.name ? 2 : 0.5);
  }

  function drawMap(world) {
    const countriesGeo = topojson.feature(world, world.objects.countries);
    countriesGeoFeatures = countriesGeo.features;
    const projection = d3.geoNaturalEarth1().fitSize([mapWidth, mapHeight - 40], countriesGeo);
    pathGenerator = d3.geoPath().projection(projection);

    const mapG = mapSvg.append("g").attr("class", "mapG").attr("transform", "translate(0,40)");

    mapG.selectAll("path")
      .data(countriesGeo.features)
      .join("path")
      .attr("d", pathGenerator)
      .attr("class", "country")
      .attr("fill", d => {
        const match = countryStats.find(c => toAtlasName(c.country) === d.properties.name);
        return match ? colorScale(match.avg) : "#e0e0e0";
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 0.5)
      .style("cursor", d => {
        const match = countryStats.find(c => toAtlasName(c.country) === d.properties.name);
        return match ? "pointer" : "default";
      })
      .on("click", function(event, d) {
        const match = countryStats.find(c => toAtlasName(c.country) === d.properties.name);
        if (match) {
          renderProfile(match.country);
          highlightMapCountry(match.country);
        }
      })
      .append("title")
      .text(d => {
        const match = countryStats.find(c => toAtlasName(c.country) === d.properties.name);
        return match ? `${match.country}: ${match.avg.toFixed(2)}` : d.properties.name;
      });

    renderProfile(countries[0]);
    highlightMapCountry(countries[0]);
  }

  if (worldData) {
    drawMap(worldData);
  } else {
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(world => {
      worldData = world;
      drawMap(world);
    });
  }
}