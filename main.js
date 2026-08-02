console.log("D3 loaded:", d3);

d3.csv("coffee.csv").then(function(data) {
  console.log("Data loaded:", data);
  console.log("Number of rows:", data.length);
  console.log("First row:", data[0]);
});
