function updateTicks() {

  var features = getProjectionFeatures();
  var ticksGroup = d3.select( '#ticks-group' );

  ticksGroup.html( '' );

  features.forEach( feature => {

    var featureTicks = ticksGroup.append( 'div' )
      .attr( 'id', d => ( 'ticks-' + feature ) );

    var spec = {
      "$schema": "https://vega.github.io/schema/vega-lite/v3.json",
      "description": "Shows the relationship between horsepower and the numbver of cylinders using tick marks.",
      "width": +featureTicks.node().getBoundingClientRect().width - 100,
      "data": { "values": visibleData },
      "mark": "tick",
      "encoding": {
        "x": { "field": feature, "type": "quantitative" },
        "y": { "field": colorFeature, "type": "nominal" },
        "color": { "field": colorFeature, "type": "nominal" }
      }
    };

  vegaEmbed( ( '#ticks-' + feature ), spec, { 'actions' : false } ); 

  } ); 

}