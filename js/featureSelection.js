/* global d3, $ */
// TODO: Build groups from config
// TODO: Sparklines??
// TODO: Feature type change

// Define the div for the tooltip
var featureGlyph = d3.select( 'body' )
  .append( 'div' )
    .attr( 'class', 'feature-glyph' )
    .style( 'opacity', 0 );


function cleanFeatureSelection() {

  d3.select( '#feature-selection #no-group' ).selectAll( 'button' ).remove();

}

// Initialize the panel for performing feature selection
function initFeatureSelection() {

  var features = [];
  config.features.forEach( f => {
    if( ![ '__seqId', 'x', 'y', 'cluster' ].includes( f.name ) ) features.push( f );
  } );

  // Show the feature selection panel
  //d3.select( '#feature-selection' )
  //  .attr( 'class', null );

  // Instantiate all features as no group
  var featButtons = d3.select( '#feature-selection #no-group' )
    .selectAll( 'button' )
    .data( features )
    .enter()
      .append( 'button' )
        .attr( 'id', d => d.name )
        .attr( 'class', d => 'btn ' + ( ( !d.project ) ? 'btn-light' : 'btn-secondary' ) )
        .property( 'disabled', d => !d.project )
        .attr( 'draggable', true )
        .attr( 'ondragstart', 'drag(event)' );

  // Create checks for enable / disable features
  featButtons
    .append( 'input' )
      .attr( 'id', d => d.name + '-chk' )
      .attr( 'type', 'checkbox' )
      .attr( 'class', 'custom-control-input' )
      .property( 'checked', d => d.project )
      .on( 'change', ( feature ) => {

        // Verify new checkbox status and update project attribute
        chk = d3.select( '#' + feature.name + '-chk' ).property( 'checked' );
        feature.project = chk;

        // Update feature visualization
        d3.select( '#' + feature.name )
          .attr( 'class', d => 'btn ' + ( ( chk === false ) ? 'btn-light' : 'btn-secondary' ) )
          .property( 'disabled', !chk );

        // Update Encode Color panel
        updateEncodeColor();

        // Update Navio
        updateNavio();

        // Update the projection
        updateProjection();

      } );

  // Add feature name to element
  featButtons
    .append( 'span' )
    .text( d => d.name );

  // Add feature type icon to element
  featButtons
    .append( 'i' )
    .attr( 'id', d => d.name + '-type' )
    .attr( 'class', 'text-warning' )
    .html( d => ( ( d.type === 'categorical' ) ? '<b>A</b>' : '<b>#</b>' ) );

}

function createFeatureGroup() {

  if( $( '#group-name' ).val() !== '' ) {
    console.log( 'New feature group: ' + $( '#group-name' ).val() );

    var groupName = $( '#group-name' ).val();
    var groupId = groupName.toLowerCase().replace( ' ', '-' );

    // Create DOM element
    var featureGroup = d3.select( '#feature-selection' ).append( 'div' )
      .attr( 'id', groupId )
      .attr( 'class', 'feature-group' )
      .attr( 'ondrop', 'drop(event)' )
      .attr( 'ondragover', 'allowDrop(event)' );

    featureGroup.append( 'div' )
      .attr( 'class', 'header' )
      .append( 'input' )
        .attr( 'id', d => groupId + '-chk' )
        .attr( 'type', 'checkbox' )
        .attr( 'class', 'custom-control-input' )
        .property( 'checked', true )
        .on( 'change', function() {

          // Verify new checkbox status
          chk = d3.select( '#' + this.id ).property( 'checked' );

          group = config.featureGroups.find( x => x.groupId === this.id.replace( '-chk', '' ) );

          group.features.forEach( feature => {
            config.features.find( x => x.name === feature ).project = chk;

            // Update feature visualization
            d3.select( '#' + feature )
              .attr( 'class', d => 'btn ' + ( ( chk === false ) ? 'btn-light' : 'btn-secondary' ) )
              .property( 'disabled', !chk );

            d3.select( '#' + feature + '-chk' )
              .property( 'checked', chk );

          } );

          //TODO: Update Navio

          // Update the projection
          updateProjection();


        } );

      featureGroup.select( '.header' )
        .append( 'i' )
          .attr( 'id', groupId + '-del' )
          .attr( 'class', 'fas fa-times' )
          .on( 'click', function() {

            var groupId = this.id.replace( '-del', '' );

            // Move features to no-group panel
            config.featureGroups.find( x => x.groupId === groupId ).features.forEach( feature => {
              document.getElementById( 'no-group' ).appendChild(
                document.getElementById( feature )
              );
            } );

            // Delete element from config and DOM
            config.featureGroups = config.featureGroups.filter( x => x.groupId !== groupId );
            d3.select( '#' + groupId ).remove();

          } );

      featureGroup.select( '.header' )
        .append( 'span' )
          .html( groupName );

      if( config.featureGroups === undefined ) config.featureGroups = [];
      config.featureGroups.push( { 'groupId' : groupId, 'groupName' : groupName, 'features' : [] } );


    $( '#newFeatureGroup' ).modal( 'hide' );
  }

}

function buildFeatureGlyph( feature ) {

  featureGlyph
    .html( '' )
    .style( 'left', ( d3.event.pageX + 20 ) + 'px' )
    .style( 'top', ( d3.event.pageY + 20 ) + 'px' );

  var nestedFeature = d3.nest()
    .key( ( d ) => d[ feature.name ] )
    .rollup( ( v ) => v.length )
    .entries( data );

  console.log( nestedFeature );

  var svgGlyph = featureGlyph.append( 'svg' )
    .attr( 'width', 140 )
    .attr( 'height', 140 );

  var g = svgGlyph.append( 'g' )
    .attr( 'transform', 'translate(5,5)' );

  var xScale = d3.scaleBand().rangeRound( [ 0, 130 ] ).padding( 0.1 ),
    yScale = d3.scaleLinear().rangeRound( [ 130, 0 ] )
    colorScale = d3.scaleOrdinal( d3.schemeCategory10 );

  xScale.domain( nestedFeature.map( ( d ) => d.key ) );
  yScale.domain( [ 0, d3.max( nestedFeature, ( d ) => d.value ) ] );

  /*g.append( 'g' )
    .attr( 'class', 'axis axis-x' )
    .attr( 'transform', 'translate(0,' + 130 + ')' )
    .call( d3.axisBottom( xScale ) );

  g.append( 'g' )
    .attr( 'class', 'axis axis-y' )
    .call( d3.axisLeft( yScale ) );*/

  g.selectAll( '.bar' )
    .data( nestedFeature )
    .enter()
    .append( 'rect' )
    .attr( 'class', 'bar' )
    .attr( 'x', ( d ) => xScale( d.key ) )
    .attr( 'y', ( d ) => yScale( d.value ) )
    .attr( 'width', xScale.bandwidth() )
    .attr( 'height', ( d ) => 130 - yScale( d.value ) )
    .style( 'fill', d => colorScale( d.key) );

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
  if( event.target.tagName === 'DIV' ) {
    event.target.appendChild( document.getElementById( elementId ) );

    // Move features between groups in the config object
    config.featureGroups.forEach( group => {
      if( group.groupId === event.target.id ) {
        if( !group.features.includes( elementId ) )
          group.features.push( elementId );
      } else {
        if( group.features.includes( elementId ) ) {
          var index = group.features.indexOf( elementId );
          if (index > -1) group.features.splice( index, 1 );
        }
      }
    } );
  }

}