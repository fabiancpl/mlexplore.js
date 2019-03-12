/* global navio, d3, config */

var nv,
  nv_height = 500;

// Update Navio Panel
function updateNavio( on_start = false ) {

  // Re-start the data to visualize
  //visibleData = data;

  // Clean the Navio element
  d3.select( '#navio' ).html( '' );

  // Create Navio instance
  nv = navio( d3.select( '#navio' ), nv_height );
  nv.attribWidth=8;
  nv.attribFontSize=8;

  var features;
  if( on_start ) {
    features = config.features.filter( f => ![ 'x', 'y', 'cluster' ].includes( f.name ) );
  } else {
    features = config.features;
  }

  // Set features by type
  features.forEach( f => {
    //if( f.project === true || f.name === colorFeature ) {
      if( f.type === 'sequential' ){
        nv.addSequentialAttrib( f.name );
      } else {
        nv.addCategoricalAttrib( f.name );
      }
    //}

  } );

  // Set the dataset to Navio
  nv.data( data );

  // Create the callback for update the data visible
  nv.updateCallback( () => {
    visibleData = nv.getVisible();

    // Update the projection
    updateProjection();

    // Update the detail table
    updateTable();
  } );

}