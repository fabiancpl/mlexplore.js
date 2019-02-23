
// Update the Encode Color panel with available features
function updateEncodeColor() {

  // Show panel if it is not visible
  d3.select( '#encode-color' )
    .attr( 'class', null );

  // Get features available for colored
  colorFeatures = config.features.filter( d => !d.project );
  
  if( colorFeatures !== undefined ) {

    // Clean the combobox
    d3.select( '#encode-color-combo' )
      .property( 'disabled', false )
      .html( '' );

    // Set the feature used to encode color
    if( colorFeature === undefined ) colorFeature = colorFeatures[ 0 ].name;

    // Set event for handling combobox change
    d3.select( '#encode-color-combo' )
      .on( 'change', _ => {
        
        // Set feature to encode color
        colorFeature = d3.select( '#encode-color-combo' ).property( 'value' );
        
        // Call for redrawing Navio and projection with run model
        updateNavio();
        updateProjection( run_model = false );
      } );

    var options = d3.select( '#encode-color-combo' )
      .selectAll( 'option' )
        .data( colorFeatures )
        .enter()
        .append( 'option' )
          .attr( 'value', d => d.name )
          .property( 'selected', d => ( d.name === colorFeature ) ? true : false )
          .html( d => d.name );

  } else {

    d3.select( '#encode-color-combo' )
      .property( 'disabled', true );

  }

}