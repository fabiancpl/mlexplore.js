function updateTicks() {

  var features = getProjectionFeatures();
  var ticksGroup = d3.select( '#ticks-group' );

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
        "x": {"field": feature, "type": "ordinal"},
        "y": {"field": "class", "type": "ordinal"}
      }
    };

  vegaEmbed( ( '#ticks-' + feature ), spec, { 'actions' : false } ); 

  } ); 

}