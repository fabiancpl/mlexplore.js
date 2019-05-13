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
        colorScale = {
          'condition': { 
            "selection": "brush", 
            'field': roles.color, 
            'type': 'nominal', 'scale': { 'domain': colorFeature.scale.domain(), 'range': colorFeature.scale.range() },
            'legend': false
          },
          "value": "silver" 
        };

      } else {

        mark = 'circle';

        yScale = { 'field': roles.color, 'type': 'quantitative' };
        colorScale = {
          'condition': { 
            "selection": "brush", 
            'field': roles.color, 
            'type': 'quantitative', 
            'scale': { 'scheme': 'blues' },
            'legend': false
          },
          "value": "silver" 
        };
        
      }

    }

    var vconcats = [];
    features.filter( f => ( f.name !== roles.color ) && ( roles.embed.includes( f.name ) ) ).map( f => {
      vconcats.push( buildSpec( f ) );
    } );

    var spec = {
      '$schema': 'https://vega.github.io/schema/vega-lite/v3.json',
      'width': +featDistSelections.node().getBoundingClientRect().width,
      'data': { 'values': data.filter( d => d.__highlighted ) },
      'vconcat': vconcats
    };

    vegaEmbed( ( '#feature-distribution' ), spec, { 'actions' : false } ).then( ( { spec, view } ) => {
      view.addEventListener( 'click', function ( event, item ) {

      } )
    } );

  }

  function buildSpec( f ) {

    var sequentialSpec = {
      
      'selection': {
        'brush': {
          'type': 'interval',
        }
      },
      'mark': {
        'type': mark,
        'opacity': 1,
        //'stroke': ( mark === 'circle' ) ? 'gray' : undefined
      },
      'encoding': {
        'x': { 'field': f.name, 'type': 'quantitative', "scale": { "domain": [ d3.min( data, d => d[ f.name ] ), d3.max( data, d => d[ f.name ] ) ] } },
        'y': ( yScale !== undefined ) ? yScale : undefined,
        'color': ( colorScale !== undefined ) ? colorScale : undefined
      }
    };

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