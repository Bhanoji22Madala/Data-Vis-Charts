import * as d3 from 'd3';
import '../css/style.css';
async function draw() {
  // -------- Data --------
  const dataset = await d3.json('./pie.json');
  const total   = d3.sum(dataset, d => d.value);

  // -------- Dimensions --------
  const dims = { width: 1000, height: 1000, m: 10 };
  const labelOffset = 60;                    // space we need for label ring

  dims.w = dims.width  - dims.m * 2;
  dims.h = dims.height - dims.m * 2;

  // leave room for labels → shrink pie radius by labelOffset
  const radius = (Math.min(dims.w, dims.h) / 2) - labelOffset;

  // -------- Canvas --------
  const svg = d3.select('#chart')
    .append('svg')
    .attr('width',  dims.width)
    .attr('height', dims.height);

  const g = svg.append('g')
    .attr('transform', `translate(${dims.m},${dims.m})`);

  // -------- Pie generator & arcs --------
  const pieGen = d3.pie()
    .value(d => d.value)
    .sort(null);

  const slices = pieGen(dataset);

  const arc = d3.arc()
    .outerRadius(radius)
    .innerRadius(0);

  // label ring sits labelOffset px beyond the pie edge
  const arcLabel = d3.arc()
    .outerRadius(radius + labelOffset)
    .innerRadius(radius + labelOffset);

  // -------- Colour palette --------
  const palette = [
    '#01c5c4','#02b9b9','#03abab','#049d9d','#058f8f',
    '#067f7f','#076f6f','#085f5f','#094f4f'
  ];
  const color = d3.scaleOrdinal()
    .domain(dataset.map(d => d.name))
    .range(palette);

  // -------- Groups --------
  const pieGroup = g.append('g')
    .attr('transform', `translate(${dims.w / 2},${dims.h / 2})`);

  // -------- Slices --------
  pieGroup.selectAll('path.slice')
    .data(slices)
    .join('path')
      .attr('class', 'slice')
      .attr('d', arc)
      .attr('fill', d => color(d.data.name))
      .attr('stroke', '#ffffff')   // thin seam on white canvas
      .attr('stroke-width', 1)
      .on('mouseenter', (event, d) => {
        d3.select(event.currentTarget)
          .transition().duration(150)
          .attr('fill', d3.color(color(d.data.name)).brighter(0.8));

        const pct = (d.data.value / total) * 100;
        const tooltip = d3.select('#tooltip')
          .style('display', 'block')
          .style('left', `${event.pageX + 14}px`)
          .style('top',  `${event.pageY - 28}px`);

        tooltip.select('.fuel').text(d.data.name);
        tooltip.select('.value').text(`${d3.format(',')(Math.round(d.data.value))} TWh`);
        tooltip.select('.pct').text(`${pct.toFixed(1)} %`);
      })
      .on('mouseleave', (event, d) => {
        d3.select(event.currentTarget)
          .transition().duration(150)
          .attr('fill', color(d.data.name));

        d3.select('#tooltip').style('display', 'none');
      });

  // -------- Leader lines & outside labels --------
  const labelGroup = pieGroup.append('g').classed('labels', true);
  const lineGroup  = pieGroup.append('g');

  // labels
  labelGroup.selectAll('text')
    .data(slices)
    .join('text')
      .attr('transform', d => `translate(${arcLabel.centroid(d)})`)
      .call(txt => txt.append('tspan')
        .text(d => d.data.name))
      .call(txt => txt.append('tspan')
        .attr('y', 12)
        .attr('x', 0)
        .text(d => d3.format(',')(Math.round(d.data.value))));

  // straight leader lines
  lineGroup.selectAll('line.callout')
    .data(slices)
    .join('line')
      .attr('class', 'callout')
      .attr('x1', d => arc.centroid(d)[0])
      .attr('y1', d => arc.centroid(d)[1])
      .attr('x2', d => arcLabel.centroid(d)[0])
      .attr('y2', d => arcLabel.centroid(d)[1]);
}

draw();
