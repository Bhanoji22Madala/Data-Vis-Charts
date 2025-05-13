// js/script.js
import * as d3 from 'd3';
import '../css/style.css';
(async () => {
  // 1) load data
  const data = await d3.json('./histogram.json');

  // 2) margins and chart size
  const margin = { top: 40, right: 20, bottom: 120, left: 80 };
  const outerWidth  = 1000;
  const outerHeight = 500;
  const width  = outerWidth  - margin.left - margin.right;
  const height = outerHeight - margin.top  - margin.bottom;

  // 3) build SVG
  const svg = d3.select('#chart')
    .append('svg')
      .attr('width',  outerWidth)
      .attr('height', outerHeight)
    .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

  // 4) axis groups
  const xAxisG = svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .attr('class','axis');
  const yAxisG = svg.append('g').attr('class','axis');

  // 5) render fn
  function render(metric) {
    // compute scales
    const vals = data.map(d => d.currently[metric]);
    const x = d3.scaleBand()
      .domain(data.map(d => d.country))
      .range([0, width])
      .padding(0.2);
    const y = d3.scaleLinear()
      .domain([0, d3.max(vals)])
      .nice()
      .range([height, 0]);

    // update axes
    xAxisG.call(d3.axisBottom(x))
      .selectAll('text')
        .attr('text-anchor','end')
        .attr('transform','rotate(-40)')
        .attr('dx','-0.6em')
        .attr('dy','0.3em');
    yAxisG.call(
      d3.axisLeft(y)
        .ticks(6)
        .tickFormat(d => d3.format('~s')(d) + ' TWh')
    );

    // bars
    const bars = svg.selectAll('.bar')
      .data(data, d => d.country);
    bars.exit().remove();
    bars.enter()
      .append('rect')
      .attr('class','bar')
    .merge(bars)
      .attr('x',      d => x(d.country))
      .attr('width',  x.bandwidth())
      .attr('y',      d => y(d.currently[metric]))
      .attr('height', d => height - y(d.currently[metric]));

    // labels
    const labels = svg.selectAll('.bar-label')
      .data(data, d => d.country);
    labels.exit().remove();
    labels.enter()
      .append('text')
      .attr('class','bar-label')
    .merge(labels)
      .attr('x',           d => x(d.country) + x.bandwidth()/2)
      .attr('y',           d => y(d.currently[metric]) - 8)
      .attr('text-anchor','middle')
      .text(d => d3.format('~s')(d.currently[metric]));

    // **mean-line**: remove any old, then draw a fresh one on top
    svg.selectAll('.mean-line').remove();
    const meanVal = d3.mean(vals);
    svg.append('line')
      .attr('class','mean-line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', y(meanVal))
      .attr('y2', y(meanVal))
      // hard-code the style here:
      .attr('stroke',      '#ff6b6b')
      .attr('stroke-width','2px')
      .attr('stroke-dasharray','4,4')
      .raise();
  }

  // 6) initial draw & dropdown
  render('Other renewables');
  d3.select('#metric').on('change', function() {
    render(this.value);
  });
})();
