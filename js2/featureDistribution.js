var featureDistribution = ( function() {

  var data, features, roles,
    yScale, colorScale, mark;

  function init() {

    var featDistSelections = d3.select( '#feature-distribution' );
    featDistSelections.html( '' );

    yScale = {};
    colorScale = {};
    mark = 'tick';

    if( roles.color !== undefined ) {

      var colorFeature = features.find( f => f.name === roles.color );

      if( colorFeature.type === 'categorical' ) {

        yScale = { 'field': roles.color, 'type': 'nominal' };
        colorScale = { 'field': roles.color, 'type': 'nominal', 'scale': { 'domain': colorFeature.scale.domain(), 'range': colorFeature.scale.range() } };

      } else {

        yScale = { 'field': roles.color, 'type': 'quantitative' };
        colorScale = { 'field': roles.color, 'type': 'quantitative', 'scale': { 'scheme': 'blues' } };
        mark = 'circle';
        
      }

    }

    features.filter( f => ( f.name !== roles.color ) && ( roles.embed.includes( f.name ) ) ).map( f => {

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
      'mark': mark,
      'encoding': {
        'x': { 'field': f.name, 'type': 'quantitative', "scale": { "domain": [ d3.min( data, d => d[ f.name ] ), d3.max( data, d => d[ f.name ] ) ] } },
        'y': yScale,
        'color': colorScale
      }
    };

    /*var booleanSpec = {
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
    };*/

    //return ( f.type === 'boolean' ) ? booleanSpec : sequentialSpec;
    return sequentialSpec;

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