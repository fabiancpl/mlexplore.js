var featureSelection = ( function() {

  var features, roles,
    onCheck, onColorChange, addColorFeature,
    selectOptions;

  function init() {

    var featButtons = d3.select( '#feature-selection #feature-container' )
      .selectAll( 'button' )
      .data( features.filter( f => f.name !== '__cluster' || f.name !== '__x' || f.name !== '__y' ) )
      .enter()
        .append( 'button' )
          .attr( 'id', f => f.name + '-feature' )
          .attr( 'class', f => 'btn btn-' + ( ( f.type === 'categorical' ) ? 'light' : 'secondary' ) );

    // Create checks for enable / disable features  
    featButtons
      .append( 'input' )
        .attr( 'id', d => d.name + '-chk' )
        .attr( 'type', 'checkbox' )
        .attr( 'class', 'custom-control-input' )
        .property( 'checked', f => ( roles.embed.indexOf( f.name ) !== -1 ) ? true : false )
        .property( 'disabled', f => ( f.type === 'categorical' ) ? true : false )
        .on( 'change', f => onCheck( f ) );

    // Add feature name to element
    featButtons
      .append( 'span' )
      .text( f => f.name );

    // Add feature type icon to element
    featButtons
      .append( 'i' )
      .attr( 'id', f => f.name + '-type' )
      .attr( 'class', 'text-warning' )
      .html( d => ( ( d.type === 'categorical' ) ? '<b>A</b>' : ( d.type === 'boolean' ) ? '<b>B</b>' : '<b>#</b>' ) );

    // Set event for handling combobox change
    var colorSelection = d3.select( '#color-selection' )
      .on( 'change', _ => onColorChange( colorSelection.property( 'value' ) ) );
    
    selectOptions = [ { 'name': '' } ].concat( features );
    colorSelection.selectAll( 'option' )
        .data( selectOptions )
        .enter()
        .append( 'option' )
          .attr( 'value', f => f.name )
          .property( 'selected', f => ( f.name === roles.color ) ? true : false )
          .html( f => f.name );

    // Control to hide features by user filter
    d3.select( '#feature-filter' )
      .on( 'input', function() {
        
        featButtons.classed( 'feature-hide', true );
        
        if( this.value !== '' ) {
          features.map( f => {
            if( f.name.toLowerCase().includes( this.value.toLowerCase() ) ) {
              d3.select( '#' + f.name + '-feature' )
                .classed( 'feature-hide', false );            
            }

          } );
        } else {
          featButtons.classed( 'feature-hide', false );
        }

      } );

  }

  // Clean panel
  function clean() {

    d3.select( '#feature-selection #feature-container' ).html( '' );
    d3.select( '#color-selection' ).html( '' );

  }

  function addClusterFeature() {

    var colorSelection = d3.select( '#color-selection' ).html( '' );

    selectOptions = [ { 'name': '' } ].concat( features ).concat( [ { 'name': '__cluster' } ] );
    colorSelection.selectAll( 'option' )
        .data( selectOptions )
        .enter()
        .append( 'option' )
          .attr( 'value', f => f.name )
          .property( 'selected', f => ( f.name === roles.color ) ? true : false )
          .html( f => f.name );

    onColorChange( '__cluster' );

  }

  return {
    init: init,
    clean: clean,
    addClusterFeature: addClusterFeature, 
    set features( f ) {
      features = f.filter( f => ![ '__seqId', '__x', '__y', '__cluster' ].includes( f.name ) );
    },
    set roles( r ) {
      roles = r;
    },
    set onCheck( f ) {
      onCheck = f;
    },
    set onColorChange( f ) {
      onColorChange = f;
    }
  }
} )();