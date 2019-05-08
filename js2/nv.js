var nv = ( function() {

  var nav, height = 500,
    data, features,
    onFiltering;

  function init() {

    // Clean the Navio element
    d3.select( '#navio' ).html( '' );

    // Create Navio instance
    nav = navio( d3.select( '#navio' ), height );
    nav.attribWidth = 10;
    nav.attribFontSize = 8;

    nav.addCategoricalAttrib( '__cluster', d3.scaleOrdinal( d3.schemeCategory10 ).domain( [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ] ) );

    nav.addAttrib( '__x', d3.scaleSequential( d3.interpolateRdBu ).domain( [ -20, 20 ] ) );

    nav.addAttrib( '__y', d3.scaleSequential( d3.interpolateRdBu ).domain( [ -20, 20 ] ) );

    // Set features by type
    features.map( f => {
      if( f.type === 'sequential' ){
        nav.addSequentialAttrib( f.name, f.scale );
      } else if( f.type === 'diverging' ){
        nav.addAttrib( f.name, f.scale );
      } else if( f.type === 'boolean' ){
        nav.addAttrib( f.name, f.scale );
      } else {
        nav.addAttrib( f.name, f.scale );
      }
    } );

    // Set data to Navio
    nav.data( data );

    // Detect features types with navio and redraw
    //nav.addAllAttribs(features.map(f => f.name));


    nav.updateCallback( onFiltering );

  }

  function update() {
    nav.update();
  }

  return {
    init: init,
    set data( d ) {
      data = d;
    },
    set features( f ) {
      features = f.filter( f => ![ '__seqId', '__x', '__y', '__cluster' ].includes( f.name ) );
    },
    set onFiltering( f ) {
      onFiltering = f;
    },
    update : update
  };
} )();