const width = 960,
    height = 500;

const margin = { top: 60, right: 160, bottom: 88, left: 105 },
    innerWidth = width - margin.left - margin.right,
    innerHeight = height - margin.top - margin.bottom;
const xValue = (d) => d.date;
const yValue = (d) => d.cases;
const colorValue = (d) => d.case_type;
const svg = d3
    .select('div')
    .append('svg')
    .attr('width', width)
    .attr('height', height);
const graph = svg
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);
const xScale = d3.scaleTime().range([0, innerWidth]).nice();
const yScale = d3.scaleLinear().range([innerHeight, 0]).nice();
const xAxis = d3.axisBottom(xScale).tickSize(-innerHeight).tickPadding(15);
const yAxis = d3.axisLeft(yScale).tickSize(-innerWidth).tickPadding(10);
const xAxisG = graph
    .append('g')
    .attr('transform', `translate(${0}, ${innerHeight})`);
xAxisG
    .append('text')
    .attr('class', 'axis-label')
    .attr('y', 80)
    .attr('x', innerWidth / 2)
    .attr('fill', 'black')
    .text('Date');
const yAxisG = graph.append('g');
yAxisG
    .append('text')
    .attr('class', 'axis-label')
    .attr('y', -60)
    .attr('x', -innerHeight / 2)
    .attr('fill', 'black')
    .attr('transform', `rotate(-90)`)
    .attr('text-anchor', 'middle')
    .text('No. of Covid-19 Patient');

const lineGenerator = d3
    .line()
    .x((d) => xScale(xValue(d)))
    .y((d) => yScale(yValue(d)))
    .curve(d3.curveBasis);

const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
const colorLegend = (selection, props) => {
    const { colorScale, circleRadius, spacing, textOffset } = props;

    const groups = selection.selectAll('g').data(colorScale.domain());
    const groupsEnter = groups.enter().append('g').attr('class', 'tick');
    groupsEnter
        .merge(groups)
        .attr('transform', (d, i) => `translate(0, ${i * spacing})`);
    groups.exit().remove();

    groupsEnter
        .append('circle')
        .merge(groups.select('circle'))
        .attr('r', circleRadius)
        .attr('fill', colorScale);

    groupsEnter
        .append('text')
        .merge(groups.select('text'))
        .text((d) => d)
        .attr('dy', '0.32em')
        .attr('x', textOffset);
};

const render = (data) => {
    const caseGroup = d3.nest().key(colorValue).entries(data);
    console.log(caseGroup);
    xScale.domain(d3.extent(data, xValue));
    yScale.domain(d3.extent(data, yValue));
    xAxisG.call(xAxis);
    xAxisG.select('.domain').remove();
    yAxisG.call(yAxis);
    yAxisG.selectAll('.domain').remove();
    colorScale.domain(caseGroup.map((d) => d.key));
    graph
        .selectAll('.line-path')
        .data(caseGroup)
        .enter()
        .append('path')
        .attr('class', 'line-path')
        .attr('d', (d) => lineGenerator(d.values))
        .attr('stroke', (d) => colorScale(d.key));
    svg.append('g').attr('transform', `translate(810,60)`).call(colorLegend, {
        colorScale,
        circleRadius: 13,
        spacing: 340,
        textOffset: 15,
    });
};

const url = 'https://download.data.world/s/nwzr57ahdgjfrolgffoe5pcfpmw4lp';
d3.csv(url).then((data) => {
    data.forEach((d) => {
        d.cases = +d.cases;
        d.difference = +d.difference;
        d.date = new Date(d.date);
    });
    const sortedData = data.sort((a, b) => b.date - a.date);
    render(sortedData);
});
