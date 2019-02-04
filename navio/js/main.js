
var data,
  visibleData,
  features;
  //catFeatures,
  //seqFeatures;

var nv,
  nv_height = 500;

function initNavio() {

  nv = navio( d3.select( '#navio' ), nv_height );

  features.forEach( ( f ) => {
    if( f.type === 'sequential' ){
      nv.addSequentialAttrib( f.name );
    } else {
      nv.addCategoricalAttrib( f.name );
    }
    
  } );

}

function allowDrop( event ) {
  event.preventDefault();
}

function drag( event ) {
  event.dataTransfer.setData( 'text', event.target.id );
}

function drop( event ) {
  event.preventDefault();
  var elementId = event.dataTransfer.getData( 'text' );
  if( event.target.tagName !== 'BUTTON' )
    event.target.appendChild( document.getElementById( elementId ) );
}

function initFeatureSelection() {

  var featButtons = d3.select( '#feature-selection #no-group' )
    .selectAll( 'button' )
    .data( features )
    .enter()
      .append( 'button' )
        .attr( 'id', d => d.name )
        .attr( 'class', d => 'btn ' + ( ( d.type === 'categorical' ) ? 'btn-categorical' : 'btn-primary' ) )
        .attr( 'draggable', true )
        .attr( 'ondragstart', 'drag(event)' );
  
  featButtons
    .append( 'input' )
      .attr( 'id', d => d.name + '-chk' )
      .attr( 'type', 'checkbox' )
      .attr( 'class', 'custom-control-input' )
      .attr( 'checked', 'checked' )
      .on( 'change', ( feature ) => {
        
        // Verify new checkbox status and update visible attribute
        chk = d3.select( '#' + feature.name + '-chk' ).property( 'checked' );
        feature.visible = chk;

        // Update feature visualization
        d3.select( '#' + feature.name )
          .attr( 'class', d => 'btn ' + ( ( chk === false ) ? 'btn-secondary' : ( ( d.type === 'categorical' ) ? 'btn-categorical' : 'btn-primary' ) ) )
          .property( 'disabled', !chk );

        //TODO: Update Navio

      } );

  featButtons
    .append( 'span' )
    .text( d => d.name );

  featButtons
    .append( 'i' )
    .attr( 'class', 'fas fa-cog' );

}

function createFeatureGroup() {

  if( $('#group-name').val() !== '' ) {
    console.log( 'New feature group: ' + $('#group-name').val() );

    var groupName = $('#group-name').val();
    var groupId = groupName.toLowerCase().replace( ' ', '-' );

    // Create DOM element
    var featureGroup = d3.select( '#feature-selection' ).append( 'div' )
        .attr( 'id', groupId )
        .attr( 'class', 'feature-group' )
        .attr( 'ondrop', 'drop(event)' )
        .attr( 'ondragover', 'allowDrop(event)' );

    featureGroup.append( 'div' )
      .attr( 'class', 'header' )
      .html( groupName );

    $('#newFeatureGroup').modal( 'hide' );
  }

}

d3.csv( './data/animals.csv' ).then( function( data ) {

  this.data = data;
  visibleData = data;

  // Get features from data and identify type
  // TODO: Method for select feature type
  features = []
  keys = Object.keys( data[ 0 ] );
  keys.forEach( ( k ) => {
    type = 'categorical';
    if( k === 'legs' ) {
      type = 'sequential';
    }
    features.push( { 'name' : k, 'type' : type, 'visible' : true } );
  } )

  
  // Create feature selection elements
  initFeatureSelection();

  // Initialize and put data in Navio
  initNavio();
  nv.data( this.data );

  nv.updateCallback( () => visibleData = nv.getVisible() );

} );