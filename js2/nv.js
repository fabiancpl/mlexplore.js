var nv = ( function() {

  var data, features
    height = 500;

  function init() {

    // Clean the Navio element
    d3.select( '#navio' ).html( '' );

    // Create Navio instance
    nav = navio( d3.select( '#navio' ), height );
    nav.attribWidth = 8;
    nav.attribFontSize = 8;

    //if( on_start ) {
      //features = config.features.filter( f => ![ 'x', 'y', 'cluster' ].includes( f.name ) );
    //} else {
      //features = config.features;
    //}

    // Set features by type
    features.map( f => {
      //if( f.project === true || f.name === colorFeature ) {
        if( f.type === 'sequential' ){
          nav.addSequentialAttrib( f.name );
        } else {
          nav.addCategoricalAttrib( f.name );
        }
      //}

    } );

    // Set the dataset to Navio
    nav.data( data );

    // Create the callback for update the data visible
    /*nv.updateCallback( () => {
      visibleData = nv.getVisible();

      // Update the projection
      updateProjection();

      // Update the detail table
      updateTable();
    } );*/

  }

  return {
    init: init,
    get data() {
      return data;
    },
    set data( d ) {
      data = d;
    },
    set features( f ) {
      features = f.filter( f => ![ '__seqId', 'x', 'y', 'cluster' ].includes( f.name ) );
    }
  }
} )();