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


    // // Set features by type
    // features.map( f => {
    //   if( f.type === 'sequential' ){
    //     nav.addSequentialAttrib( f.name );
    //   } else if( f.type === 'boolean' ){
    //     nav.addBooleanAttrib( f.name );
    //   } else {
    //     nav.addCategoricalAttrib( f.name );
    //   }
    // } );

    nav.addCategoricalAttrib('__cluster', d3.scaleOrdinal(d3.schemeCategory10));
    nav.addDivergingAttrib('__x',
      d3.scaleDiverging(d3.interpolatePRGn)
        .domain([-200, 0, 200]));
    nav.addDivergingAttrib('__y',
      d3.scaleDiverging(d3.interpolatePRGn)
        .domain([-200, 0, 200]));

    // Set data to Navio
    nav.data( data );

    // Detect features types with navio and redraw
    nav.addAllAttribs(features.map(f => f.name));


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