import * as d3 from 'd3';
import '../css/style.css';
async function draw() {
  // ---- Data -----------------------------------------------------------
  const dataset = await d3.json('./scatter.json');

  const xAccessor = d => d.gas;   // TWh
  const yAccessor = d => d.solar; // TWh

  // ---- Dimensions -----------------------------------------------------
  const dimensions = {
    width: 800,
    height: 800,
    margin: { top: 60, right: 60, bottom: 70, left: 90 }
  };
  dimensions.ctrWidth  = dimensions.width  - dimensions.margin.left - dimensions.margin.right;
  dimensions.ctrHeight = dimensions.height - dimensions.margin.top  - dimensions.margin.bottom;

  // ---- Canvas ---------------------------------------------------------
  const svg = d3.select('#chart')
    .append('svg')
    .attr('width',  dimensions.width)
    .attr('height', dimensions.height);

  const ctr = svg.append('g')
    .attr('transform', `translate(${dimensions.margin.left},${dimensions.margin.top})`);

  const tooltip = d3.select('#tooltip');

  // ---- Scales ---------------------------------------------------------
  const xScale = d3.scaleLinear()
    .domain([0, d3.max(dataset, xAccessor)]).nice()
    .rangeRound([0, dimensions.ctrWidth])
    .clamp(true);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(dataset, yAccessor)]).nice()
    .rangeRound([dimensions.ctrHeight, 0])
    .clamp(true);

  // ---- Dots -----------------------------------------------------------
  ctr.selectAll('circle')
    .data(dataset)
    .join('circle')
    .classed('dot', true)
    .attr('cx', d => xScale(xAccessor(d)))
    .attr('cy', d => yScale(yAccessor(d)))
    .attr('r', 6);

  // ---- Axes -----------------------------------------------------------
  const xAxis = d3.axisBottom(xScale)
    .ticks(6)
    .tickFormat(d3.format('~s'));

  const xAxisGroup = ctr.append('g')
    .attr('transform', `translate(0,${dimensions.ctrHeight})`)
    .classed('axis', true)
    .call(xAxis);

  xAxisGroup.append('text')
    .attr('x', dimensions.ctrWidth / 2)
    .attr('y', dimensions.margin.bottom - 18)
    .attr('fill', '#d9d9d9')
    .style('text-anchor', 'middle')
    .text('Gas consumption (TWh)');

  const yAxis = d3.axisLeft(yScale)
    .ticks(6)
    .tickFormat(d3.format('~s'));

  const yAxisGroup = ctr.append('g')
    .classed('axis', true)
    .call(yAxis);

  yAxisGroup.append('text')
    .attr('x', -dimensions.ctrHeight / 2)
    .attr('y', -dimensions.margin.left + 20)
    .attr('fill', '#d9d9d9')
    .style('text-anchor', 'middle')
    .attr('transform', 'rotate(-90)')
    .text('Solar consumption (TWh)');

  // ---- Voronoi hover net ---------------------------------------------
  const delaunay = d3.Delaunay.from(
    dataset,
    d => xScale(xAccessor(d)),
    d => yScale(yAccessor(d))
  );
  const voronoi = delaunay.voronoi([0, 0, dimensions.ctrWidth, dimensions.ctrHeight]);

  ctr.append('g')
    .selectAll('path')
    .data(dataset)
    .join('path')
    .attr('fill', 'transparent')
    .attr('d', (_, i) => voronoi.renderCell(i))
    .on('mouseenter', (event, datum) => {
      // highlight circle
      ctr.append('circle')
        .classed('dot-hovered', true)
        .attr('cx', xScale(xAccessor(datum)))
        .attr('cy', yScale(yAccessor(datum)))
        .attr('r', 10)
        .style('pointer-events', 'none');

      // position + populate tooltip
      tooltip
        .style('display', 'block')
        .style('left', `${xScale(xAccessor(datum)) + dimensions.margin.left + 15}px`)
        .style('top',  `${yScale(yAccessor(datum)) + dimensions.margin.top  - 30}px`);

      tooltip.select('.country').text(datum.country);
      tooltip.select('.metric-gas span')
        .text(d3.format(',.2f')(xAccessor(datum)));
      tooltip.select('.metric-solar span')
        .text(d3.format(',.2f')(yAccessor(datum)));
    })
    .on('mouseleave', () => {
      ctr.select('.dot-hovered').remove();
      tooltip.style('display', 'none');
    });
}

draw();
