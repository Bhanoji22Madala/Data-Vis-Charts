import * as d3 from 'd3';
import '../css/style.css';

async function draw() {
  // -------- Data & Keys --------
  const dataset = await d3.json('./stacked.json');
  const keys = ['Fossil', 'Renewables', 'Nuclear'];

  // -------- Margins & Dimensions --------
  const margin = { top: 30, right: 30, bottom: 80, left: 60 };
  const svgWidth  = 1200;
  const svgHeight = 600;
  const width  = svgWidth  - margin.left - margin.right;
  const height = svgHeight - margin.top  - margin.bottom;

  // -------- SVG Container --------
  const svg = d3.select('#chart')
    .append('svg')
      .attr('width',  svgWidth)
      .attr('height', svgHeight);

  // shift by margins
  const ctr = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

  // -------- Stack Generator --------
  const stack = d3.stack().keys(keys);
  const series = stack(dataset);

  // -------- Scales --------
  const yMax = d3.max(series, layer => d3.max(layer, d => d[1]));
  const yScale = d3.scaleLinear()
    .domain([0, yMax]).nice()
    .range([height, 0]);

  const xScale = d3.scaleBand()
    .domain(dataset.map(d => d.name))
    .range([0, width])
    .padding(0.1);

  const color = d3.scaleOrdinal()
    .domain(keys)
    .range(['#f39233', '#01c5c4', '#b8de6f']); // fossil, renewables, nuclear

  // -------- Draw Bars --------
  ctr.selectAll('g.layer')
    .data(series)
    .join('g')
      .attr('class', d => `layer layer-${d.key.toLowerCase()}`)
      .attr('fill', d => color(d.key))
    .selectAll('rect')
    .data(d => d)
    .join('rect')
      .attr('x',      d => xScale(d.data.name))
      .attr('y',      d => yScale(d[1]))
      .attr('height', d => yScale(d[0]) - yScale(d[1]))
      .attr('width',  xScale.bandwidth());

  // -------- X Axis & Rotated Labels --------
  const xAxis = d3.axisBottom(xScale).tickSizeOuter(0);
  const xAxisGroup = ctr.append('g')
      .attr('transform', `translate(0,${height})`)
      .classed('axis', true)
      .call(xAxis);

  xAxisGroup.selectAll('text')
    .attr('transform', 'rotate(-45)')
    .style('text-anchor', 'end')
    .attr('dx', '-0.6em')
    .attr('dy', '0.25em');

  // -------- Y Axis --------
  ctr.append('g')
    .classed('axis', true)
    .call(d3.axisLeft(yScale).ticks(null, 's'));

  // -------- Legend --------
  const legend = svg.append('g')
    .attr('transform', `translate(${margin.left + width -500},${margin.top + 50})`);

  legend.selectAll('g.legend-item')
    .data(keys)
    .join('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 20})`)
    .call(g => {
      g.append('rect')
        .attr('width', 14)
        .attr('height', 14)
        .attr('fill', d => color(d))
        .attr('stroke', '#555')
        .attr('stroke-width', 1);

      g.append('text')
        .attr('x', 20)
        .attr('y', 12)
        .attr('fill', '#303030')
        .style('font-size', '12px')
        .style('font-family', 'system-ui, sans-serif')
        .text(d => d);
    });
}

draw();
