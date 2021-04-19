d3.csv("dashboard_data/dishwasher_test_results.csv").then(data=>{
    console.log(data);


    var mainsmax=d3.max(data, d=>+d.mains);
    var mainsavg=d3.mean(data, d=>+d.mains);

    var micmax=d3.max(data,d=>+d.microwave);
    var micavg=d3.mean(data,d=>+d.microwave);

    var dishmax=d3.max(data, d=>+d.dishwasher);
    var dishavg=d3.mean(data, d=>+d.dishwasher);
    console.log(dishmax);
    console.log(dishavg);
    
    var format=d3.format(",.2f");
    var peakformat=d3.format(",.0f");

    d3.select("#dishavg")
        .text(format(dishavg));

    d3.select("#dishmax")
        .text(peakformat(dishmax));

    d3.select("#mainsavg")
        .text(format(mainsavg));
    
    d3.select("#mainsmax")
        .text(peakformat(mainsmax));
    
    d3.select("#micmax")
        .text(peakformat(micmax));
    
    d3.select("#micavg")
        .text(format(micavg));

    // line chart
    var margin ={ top: 10, left: 40, bottom: 20, right: 10};
    var width=parseInt(d3.select("#linechart").style("width"))-margin.left-margin.right;
    var height=parseInt(d3.select("#linechart").style("height"))-margin.top-margin.bottom;

    var svg=d3.select("#linechart")
            .attr('width',width+margin.left+margin.right)
            .attr('height',height+margin.top+margin.bottom)
            .append('g')
            .attr('transform','translate('+margin.left+', '+margin.top+')');

    var xScale = d3.scaleLinear();
    var yScale = d3.scaleLinear();

    var xAxis=d3.axisBottom()
            .scale(xScale);
    
    var yAxis=d3.axisLeft()
            .scale(yScale);

    // axes range
    xScale.range([0,width]).nice();
    yScale.range([height,0]).nice();
    
    // domain
    xScale.domain(d3.extent(data, d=>+d.time));
    yScale.domain([0,d3.max(data, d=>+d.mains)]);

    // creating axes
    svg.append('g')
        .attr('class','xaxis')
        .attr('transform','translate(0,'+height+')')
        .style('color','gainsboro')
        .call(xAxis);

    svg.append('g')
        .attr('class','yaxis')
        .style('color','gainsboro')
        .call(yAxis);

    // Map columns
    var slices = data.columns.slice(1).map(function(id){
        return {
            id:id,
            values: data.map(function(d){
                return {
                    time: +d.time,
                    hz: +d[id]
                }
            })
        }
    })

    console.log(slices)

    var line=d3.line()
        .x(d=>xScale(d.time))
        .y(d=>yScale(+d.hz));

    var lines=svg.selectAll("lines")
        .data(slices)
        .enter()
        .append("g")
        .attr('clsss','line');

    lines
        .append('path')
        .attr('class',function(d){return(d.id)})
        .attr('d',d=>line(d.values));

    /*************** PIE CHART ***************/
    //Create the values for the pie chart
    var micpie=d3.sum(data,d=>d.microwave);
    var dishpie=d3.sum(data,d=>d.dishwasher);
    var mainspie=d3.sum(data,d=>d.mains);
    var restpie=mainspie-(micpie+dishpie);
    var ck=micpie+dishpie+restpie;
    console.log(micpie, dishpie, restpie, mainspie,ck);

    var piedata=[
        {"label":"microwave","value":micpie},
        {"label":"dishwasher","value":dishpie},
        {"label":"rest","value":restpie}
    ];

    console.log(piedata);

    var radius=d3.min([height,width])/2.5;

    var svgpie=d3.select("#piechart")
    .attr('width',width)
    .attr('height',height)
    .append('g')
    .attr('transform','translate('+width/2+","+height/2+")");

    // set the color scale
    var color = d3.scaleOrdinal()
    .domain(['microwave','dishwasher','rest'])
    .range(["#CD5C5C", "#00BFFF", "dimgray"]);

    var pie=d3.pie()
        .value(function(d){return d.value;})

    var arc=d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    var outerarc=d3.arc()
        .innerRadius(0)
        .outerRadius(radius*2.25);

    console.log(pie(piedata));

    var arcs=svgpie.selectAll('pie')
        .data(pie(piedata))
        .enter()
        .append('g')
        .attr('class','slice')

    arcs.append('path')
        .attr('d',arc)
        .attr('fill',function(d){return color(d.data.label)})
        .attr('stroke','white')
        .style('stroke-width','2px')
        .style('opacity',1)
    
    arcs.append('text')
        .attr('transform',function(d){
            d.innerRadius=0;
            d.outerRadius=radius;
            return "translate("+outerarc.centroid(d)+")";
        })
        .attr('text-anchor','middle')
        .text(function(d,i) {return piedata[i].label})
        .attr('stroke','gainsboro')
        .attr('fill','gainsboro')
        .attr('font-size','15px')


})