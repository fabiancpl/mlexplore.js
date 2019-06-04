/* global d3, vegaEmbed */

var featureDistribution = ( function() {

  var data, features, roles,
    yScale, colorScale, mark;
  var featDistSelections;

  function init() {

    featDistSelections = d3.select( '#feature-distribution' );
    featDistSelections.html( '' );

    yScale = {};
    colorScale = {};
    mark = 'tick';

    if( roles.color !== undefined ) {

      var colorFeature = features.find( f => f.name === roles.color );

      if( colorFeature.type === 'categorical' ) {

        yScale = {
          'field': roles.color,
          'type': 'nominal',
          'scale': { 'domain': colorFeature.scale.domain() }
        };

        colorScale = {
          'condition': {
            'test': { 'field': '__highlighted', 'equal': true },
            'field': roles.color,
            'type': 'nominal',
            'scale': { 'domain': colorFeature.scale.domain(), 'range': colorFeature.scale.range() },
            'legend': false
          },
          'value': 'silver'
        };

      } else {

        mark = 'circle';
        console.log( colorFeature.scale.domain() );
        yScale = {
          'field': roles.color,
          'type': 'quantitative',
          'scale': { 'domain': colorFeature.scale.domain() }
        };

        colorScale = {
          'condition': {
            'test': { 'field': '__highlighted', 'equal': true },
            'field': roles.color,
            'type': 'quantitative',
            'scale': { 'scheme': 'blues' },
            'legend': false
          },
          'value': 'silver'
        };

      }

    } else {

      colorScale = {
        'condition': {
          'test': { 'field': '__highlighted', 'equal': true },
          'value': 'steelblue',
          'legend': false
        },
        'value': 'silver'
      };

    }

    var vconcats = [];
    features.filter( f => ( f.name !== roles.color ) && ( roles.embed.includes( f.name ) ) ).map( f => {
      vconcats.push( buildSpec( f ) );
    } );

    var spec = {
      '$schema': 'https://vega.github.io/schema/vega-lite/v3.json',
      // 'width': +featDistSelections.node().parentNode.getBoundingClientRect().width,
      'data': { 'values': data/*.filter( d => d.__highlighted )*/ },
      'columns': 2,
      'vconcat': vconcats
    };

    vegaEmbed( ( '#feature-distribution' ), spec, { 'actions' : false } ).then( ( { spec, view } ) => {
      view.addEventListener( 'click', function ( event, item ) {

      } );
    } );

  }

  function buildSpec( f ) {

    var sequentialSpec = {
      'layer': [

        {
          'mark': {
            'type': mark,
            'opacity': 1
          },
          'width': +featDistSelections.node().parentNode.getBoundingClientRect().width/3,
          'encoding': {
            'x': { 'field': f.name, 'type': 'quantitative', 'scale': { 'domain': [ d3.min( data, d => d[ f.name ] ), d3.max( data, d => d[ f.name ] ) ] } },
            'y': ( yScale !== undefined ) ? yScale : undefined,
            'color': ( colorScale !== undefined ) ? colorScale : undefined
          }
        }
      ]
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
  };
} )();