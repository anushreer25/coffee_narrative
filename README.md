# Coffee Narrative

An interactive, three-scene data story about coffee quality, built with D3.js. It uses professional cupping scores to ask which countries and which species of coffee rate highest, and how much we should trust those comparisons.

## The scenes

1. **Overview.** Top 10 coffee-producing countries by average quality score. Only countries with 10 or more reviews are included, to avoid small-sample bias. Ethiopia comes out on top (average 85.5 across 44 reviews).
2. **Arabica vs. Robusta.** Average quality score by species. Robusta has only 28 reviews compared to 1,309 for Arabica, so the chart is annotated with a small-sample warning.
3. **Explore by country.** A world map colored by average score. Click a country (or use the dropdown) to see its cupping profile across aroma, flavor, aftertaste, acidity, body, balance and cupper points.

## Data

`coffee.csv` has 1,339 coffee reviews with country of origin, species, altitude, processing method, and scores for each cupping attribute plus a total score (`Total.Cup.Points`). After dropping rows with no country or a score of 0, 1,337 reviews from 36 countries remain.

The columns match the Coffee Quality Institute ratings dataset. _Add the exact source and link here._

## Tech

- [D3.js v7](https://d3js.org/) for charts and scales
- [d3-svg-annotation](https://d3-annotation.susielu.com/) for callouts
- [TopoJSON](https://github.com/topojson/topojson) and [world-atlas](https://github.com/topojson/world-atlas) for the map
- Plain HTML, CSS and JavaScript, no build step

## Run it locally

The page loads `coffee.csv` with `d3.csv`, so it needs to be served over HTTP (opening `index.html` directly won't work in most browsers).

```bash
git clone https://github.com/anushreer25/coffee_narrative.git
cd coffee_narrative
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Files

| File | What it does |
| --- | --- |
| `index.html` | Page layout and styling |
| `main.js` | Data loading and all three scenes |
| `coffee.csv` | Coffee review data |
| `exploratory.ipynb` | Pandas notebook used to explore the data before building the charts |
