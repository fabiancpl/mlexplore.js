var featureDistribution = ( function() {

  var data, features, roles;

  function init() {

    var featDistSelections = d3.select( '#feature-distribution' );
    featDistSelections.html( '' );

    features.filter( f => f.name !== roles.color ).map( f => {

      var featDistSelection = featDistSelections.append( 'div' )
        .attr( 'id', f.name + '-distribution' );

      vegaEmbed( ( '#' + f.name + '-distribution' ), buildSpec( f, +featDistSelection.node().getBoundingClientRect().width - 150 ), { 'actions' : false } );

    } );

  }

  function buildSpec( f, width ) {
    
    var sequentialSpec = {
      '$schema': 'https://vega.github.io/schema/vega-lite/v3.json',
      'width': width,
      'data': { 'values': data },
      'mark': 'tick',
      'encoding': {
        'x': { 'field': f.name, 'type': 'quantitative', "scale": { "domain": [ d3.min( data, d => d[ f.name ] ), d3.max( data, d => d[ f.name ] ) ] } },
        'y': { 'field': roles.color, 'type': 'nominal' },
        'color': { 'field': roles.color, 'type': 'nominal', 'scale': { 'scheme': 'category10' } }
      }
    };

    var booleanSpec = {
      '$schema': 'https://vega.github.io/schema/vega-lite/v3.json',
      'width': width,
      'data': { 'values': data },
      'mark': 'bar',
      'encoding': {
        "x": {
          "aggregate": "sum", "field": f.name, "type": "quantitative",
          "axis": {"title": f.name } 
        },
        'y': { 'field': roles.color, 'type': 'nominal' },
        'color': { 'field': roles.color, 'type': 'nominal' }
      }
    };

    return ( f.type === 'boolean' ) ? booleanSpec : sequentialSpec;

  }

  return {
    init: init,
    update: init,
    set data( d ) {
      data = d;
    },
    set features( f ) {
      features = f;
    },
    set roles( r ) {
      roles = r;
    }
  }
} )();