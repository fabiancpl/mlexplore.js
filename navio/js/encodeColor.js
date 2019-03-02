
// Update the Encode Color panel with available features
function updateEncodeColor() {

  // Show panel if it is not visible
  d3.select( '#encode-color-panel' )
    .attr( 'class', null );

  // Get features available for colored
  var colorFeatures = getColoredFeatures();
  
  if( colorFeatures !== undefined ) {

    colorFeatures = [ '' ].concat( colorFeatures );   

    // Clean the combobox
    d3.select( '#encode-color-combo' )
      .property( 'disabled', false )
      .html( '' );

    // Set the feature used to encode color
    //if( colorFeature === undefined && colorFeatures.lenght > 0 ) colorFeature = colorFeatures[ 0 ].name;

    // Set event for handling combobox change
    d3.select( '#encode-color-combo' )
      .on( 'change', _ => {
        
        // Set feature to encode color
        colorFeature = d3.select( '#encode-color-combo' ).property( 'value' );
        
        // Update the color in config
        if( colorFeature !== undefined ) {
          config.features.filter( f => !f.project ).forEach( f => delete f.color );
          config.features.find( f => f.name === colorFeature ).color = true;
        }

        // Call for redrawing Navio and projection with run model
        updateNavio();
        updateProjection( run_model = false );
      } );
    
    var options = d3.select( '#encode-color-combo' )
      .selectAll( 'option' )
        .data( colorFeatures )
        .enter()
        .append( 'option' )
          .attr( 'value', d => d )
          .property( 'selected', d => ( d === colorFeature ) ? true : false )
          .html( d => d );

  } else {

    d3.select( '#encode-color-combo' )
      .property( 'disabled', true );

  }

}