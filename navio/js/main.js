
const proj_width = 500,
  proj_height = 400,
  proj_padding = 20
  proj_r = 3;

var proj_svg, proj_g, 
  proj_xScale, proj_yScale, 
  proj_colorScale;

var data,
  config,
  visibleData,
  features,
  proj_features;

var nv,
  nv_height = 500;

function initNavio() {

  nv = navio( d3.select( '#navio' ), nv_height );

  config.features.forEach( ( f ) => {
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
  console.log( event.target.tagName );
  if( event.target.tagName === 'DIV' )
    event.target.appendChild( document.getElementById( elementId ) );
}

// Define the div for the tooltip
var featureGlyph = d3.select( 'body' )
  .append( 'div' ) 
    .attr( 'class', 'feature-glyph' )       
    .style( 'opacity', 0 );

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

function initFeatureSelection() {

  var featButtons = d3.select( '#feature-selection #no-group' )
    .selectAll( 'button' )
    .data( config.features )
    .enter()
      .append( 'button' )
        .attr( 'id', d => d.name )
        .attr( 'class', d => 'btn ' + ( ( !d.project ) ? 'btn-light' : 'btn-secondary' ) )
        .property( 'disabled', d => !d.project )
        .attr( 'draggable', true )
        .attr( 'ondragstart', 'drag(event)' )
        .on( 'mouseover', ( feature ) => {

          featureGlyph.transition()    
            .duration( 500 )    
            .style( 'opacity', 1 );

          buildFeatureGlyph( feature );          
              
        } )          
        .on( 'mouseout', () => {   
          featureGlyph.transition()    
            .duration( 500 )    
            .style( 'opacity', 0 ); 
        } );

  featButtons
    .append( 'input' )
      .attr( 'id', d => d.name + '-chk' )
      .attr( 'type', 'checkbox' )
      .attr( 'class', 'custom-control-input' )
      .property( 'checked', d => d.project )
      .on( 'change', ( feature ) => {
        
        // Verify new checkbox status and update visible attribute
        chk = d3.select( '#' + feature.name + '-chk' ).property( 'checked' );
        feature.visible = chk;

        // Update feature visualization
        d3.select( '#' + feature.name )
          .attr( 'class', d => 'btn ' + ( ( chk === false ) ? 'btn-light' : 'btn-secondary' ) )
          .property( 'disabled', !chk );

        //TODO: Update Navio

        // Update the projection
        updateProjection( visibleData );
        

      } );

  featButtons
    .append( 'span' )
    .text( d => d.name );

  featButtons
    .append( 'i' )
    .attr( 'id', d => d.name + '-type' )
    .attr( 'class', 'text-warning' )
    .html( d => ( ( d.type === 'categorical' ) ? '<b>A</b>' : '<b>#</b>' ) );
    /*.on( 'click', ( feature ) => {
      
      // TODO: Change type in original dataset

      // Modifying feature property
      if( feature.type === 'categorical' ) {
        feature.type = 'sequential';
      } else {
        feature.type = 'categorical';
      }

      // Modifying feature visual aspect in list
      d3.select( '#' + feature.name + '-type' )
        .html( d => ( ( d.type === 'categorical' ) ? '<b>A</b>' : '<b>#</b>' ) );
    } );*/

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
      .html( groupName );

    $( '#newFeatureGroup' ).modal( 'hide' );
  }

}

function loadData( url ) {

  d3.csv( url ).then( ( data ) => {

    console.log( 'Dataset loaded!' );

    this.data = data;
    visibleData = data;    

    // Get features from data and identify type
    if( config === undefined ) {
      config = {};
      config.features = [];
      keys = Object.keys( data[ 0 ] );
      keys.forEach( ( k ) => {
        config.features.push( { 'name' : k, 'type' : 'categorical', 'project' : true } );
      } );
    }
    
    // Create feature selection elements
    initFeatureSelection();

    // Initialize and put data in Navio
    initNavio();
    nv.data( this.data );

    nv.updateCallback( () => {
      visibleData = nv.getVisible();

      // Update the projection
      updateProjection( visibleData );
    } );

    // Update the projection
    updateProjection( visibleData );

  } );

}

function loadConfig( url, filename ) {

  var configname = filename.split( '.' );
  configname[ configname.length - 1 ] = '.json';
  configname = configname.join( '' );

  d3.json( './config/' + configname ).then( ( config ) => {

    console.log( 'Configuration founded!' );

    this.config = config;
    loadData( url ); 

  } ).catch( ( error ) => {
    console.log( 'Configuration not found!' );
    console.log( error );
    loadData( url );
  } );

}

function initProjection() {

  d3.select( '#projection' ).html( '' );

  // Define projection scales
  proj_xScale = d3.scaleLinear()
    .range( [ proj_padding, proj_width - proj_padding ] );
    
  proj_yScale = d3.scaleLinear()
    .range( [ proj_height - proj_padding, proj_padding ] );

  // Define color scale
  proj_colorScale = d3.scaleOrdinal( d3.schemeCategory10 )
    .domain( d3.map( data, d => d.class ) );

  // Create SVG
  proj_svg = d3.select( '#projection' )
    .append( 'svg' )
      .attr( 'width', proj_width )
      .attr( 'height', proj_height )

  proj_g = proj_svg.append( 'g' );

}

function drawProjection() {

  proj_xScale
    .domain( [ d3.min( data, d => d.x ), d3.max( data, d => d.x ) ] );
    
  proj_yScale
    .domain( [ d3.min( data, d => d.y ), d3.max( data, d => d.y ) ] );

  proj_svg.append( 'text' )
    .attr( 'x', proj_padding )
    .attr( 'y', proj_padding )
    .text( 'Iterations: ' + ITERATIONS + '\nPerplexity: ' + PERPLEXITY );

  proj_g.selectAll( 'circle' )
    .data( data )
    .enter()
      .append( 'circle' )
      .attr( 'cx', d => proj_xScale( d.x ) )
      .attr( 'cy', d => proj_yScale( d.y ) )
      .attr( 'r', proj_r )
      .attr( 'fill', d => proj_colorScale( d.class ) );

}

function updateProjection() {

  // Initialize projection panel
  initProjection();

  projection = project( visibleData );
  
  projection.forEach( ( d, i ) => {
    data[ i ][ 'x' ] = d[ 0 ];
    data[ i ][ 'y' ] = d[ 1 ];
  } );

  drawProjection();

}

// Event handler to load data by user
d3.select( '#file-input' )
  .on( 'change', function() {

    var file = d3.event.target.files[ 0 ];
    if ( !file ) return;
    d3.select( '#file-name' ).html( file.name );
    
    var reader = new FileReader();
    reader.onloadend = function( evt ) {
      var dataUrl = evt.target.result;
      loadConfig( dataUrl, file.name );
    };
    reader.readAsDataURL( file );

  } );