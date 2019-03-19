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

    // Set features by type
    features.map( f => {
      if( f.type === 'sequential' ){
        nav.addSequentialAttrib( f.name );
      } else {
        nav.addCategoricalAttrib( f.name );
      }
    } );

    // Set data to Navio
    nav.data( data );
    nav.updateCallback( onFiltering );

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
    }
  }
} )();