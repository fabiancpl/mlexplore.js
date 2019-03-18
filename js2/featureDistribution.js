var featureDistribution = ( function() {

  var data, features, color;

  function init() {
    
    color = features.filter( f => f.role === 'color' );
    color = ( color.length > 0 ) ? color[ 0 ].name : undefined;

    // Update features object filtering features by role
    features = features.filter( f => f.role === 'embed' );

    var featDistSelections = d3.select( '#feature-distribution' );
    featDistSelections.html( '' );

    features.forEach( feature => {

      var featDistSelection = featDistSelections.append( 'div' )
        .attr( 'id', d => ( 'ticks-' + feature.name ) );

      vegaEmbed( ( '#ticks-' + feature.name ), buildSpec( feature, +featDistSelection.node().getBoundingClientRect().width - 150 ), { 'actions' : false } );

    } );

  }

  function buildSpec( f, width ) {

    var sequentialSpec = {
      '$schema': 'https://vega.github.io/schema/vega-lite/v3.json',
      'width': width,
      'data': { 'values': data },
      'mark': 'tick',
      'encoding': {
        'x': { 'field': f.name, 'type': 'quantitative' },
        'y': { 'field': color, 'type': 'nominal' },
        'color': { 'field': color, 'type': 'nominal' }
      }
    };

    var binarySpec = {
      '$schema': 'https://vega.github.io/schema/vega-lite/v3.json',
      'width': width,
      'data': { 'values': data },
      'mark': 'bar',
      'encoding': {
        "x": {
          "aggregate": "sum", "field": f.name, "type": "quantitative",
          "axis": {"title": f.name } 
        },
        'y': { 'field': color, 'type': 'nominal' },
        'color': { 'field': color, 'type': 'nominal' }
      }
    };

    return ( f.type === 'binary' ) ? binarySpec : sequentialSpec;

  }

  return {
    init: init,
    update: init,
    set data( d ) {
      data = d;
    },
    set features( f ) {
      features = f;
    }
  }
} )();