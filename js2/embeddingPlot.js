var embeddingPlot = ( function() {

  var data, config, color,
    onHighlighting, onCleaning;

  var margin = { top: 10, right: 10, bottom: 10, left: 10 },
    width, height, iWidth, iHeight,
    xScale = d3.scaleLinear(),
    yScale = d3.scaleLinear(),
    zScale;

  var svg, g,
    points, brush,
    tooltip;

  function draw() {
    
    // Clean the component
    d3.select( '#embedding' ).html( '' );
    d3.selectAll( '.tooltip' ).remove();

    // Create the tooltip instance
    tooltip = d3.select( 'body' ).append( 'div' )
      .attr( 'class', 'tooltip' )
      .style( 'opacity', 0 );

    // Select de DIV element
    width = d3.select( '#embedding' ).node().getBoundingClientRect().width - 20,
    height = width * 2 / 3,
    iWidth = width - margin.left - margin.right,
    iHeight = height - margin.top - margin.bottom;

    // Create the SVG element
    svg = d3.select( '#embedding' ).append( 'svg' )
      .attr( 'width', width )
      .attr( 'height', height );

    // Create the brush element and set the functions for brushing and updating
    brush = d3.brush()
      .on( 'brush', highlightBrushedCircles )
      .on( 'end', getBrushedElements );

    var brushg = svg.append( 'g' )
      .call( brush );

    g = svg.append( 'g' )
      .attr( 'transform', 'translate(' + margin.left + ',' + margin.top + ')');

    xScale
      .range( [ 0, iWidth ] )
      .domain( [ d3.min( data, d => d.__x ), d3.max( data, d => d.__x ) ] );

    yScale
      .range( [ iHeight, 0 ] )
      .domain( [ d3.min( data, d => d.__y ), d3.max( data, d => d.__y ) ] );   

    if( color !== undefined )
      zScale = config.features.find( f => f.name === color ).scale;
      /*zScale
        .domain( d3.map( data, f => f[ color ] ) );*/

    points = g.selectAll( '.embedding-circle' )
      .data( data )
      .enter()
      .append( 'circle' )
        .attr( 'class', 'embedding-circle' )
        .attr( 'id', d => d.__seqId )
        .attr( 'cx', d => xScale( d.__x ) )
        .attr( 'cy', d => yScale( d.__y ) )
        .attr( 'r', 3 )
        .attr( 'fill', ( d, i ) => ( color !== undefined && data !== undefined ) ? zScale( data[ i ][ color ] ) : 'steelblue' )
        .on( 'click', ( d, i ) => onItemClick( data[ i ] ) )
        .on( 'mouseover', ( d, i ) => {

          tooltip
            .html( drawTooltip( data[ i ] ) )
            .style( 'opacity', 1 )
            .style( 'left', ( d3.event.pageX + 15 ) + 'px' )
            .style( 'top', ( d3.event.pageY ) + 'px' );

        } ).on( 'mouseout', d => {

          tooltip
            .style( 'opacity', 0 )
            .style( 'left', '-200px' )
            .style( 'top', '-200px' );

        } );

  }

  // Update the style of brushed points
  function highlightBrushedCircles() {

    if( d3.event.selection != null ) {

      // Revert circles to initial style
      points
        .classed( 'brushed', false )
        .classed( 'non_brushed', true );
      
      // Get the brushed coordinates
      var brush_coords = d3.brushSelection( this );
      
      // Style brushed circles
      points.filter( function(){
        var cx = d3.select( this ).attr( 'cx' ),
          cy = d3.select( this ).attr( 'cy' );
        return isBrushed( brush_coords, cx, cy );
      } ).classed( 'brushed', true ).classed( 'non_brushed', false );

    }

  }

  function cleanHighlight() {
    if( points !== undefined ) {
      points
        .classed( 'non_brushed', false )
        .classed( 'brushed', true );
      onCleaning();
    }
  }

  function isBrushed( brush_coords, cx, cy ) {
    var x0 = brush_coords[ 0 ][ 0 ],
      x1 = brush_coords[ 1 ][ 0 ],
      y0 = brush_coords[ 0 ][ 1 ],
      y1 = brush_coords[ 1 ][ 1 ];
    return ( x0 - 10 ) <= cx && cx <= ( x1 - 10 ) && ( y0 - 10 ) <= cy && cy <= ( y1 - 10 );
  }

  // Get highlighted points
  function getBrushedElements() {
    
    // If not selection, return null
    if ( !d3.event.selection ) return;

    // Select all bruseh points
    var d_brushed = g.selectAll( ".brushed" ).data();

    if( d_brushed.length ) {
      // Send points to main script
      onHighlighting( d_brushed );
    } else {
      cleanHighlight(); 
    }

  }

  function changeColor() {

    if( points !== undefined && color !== undefined ) {
      zScale = config.features.find( f => f.name === color ).scale;
      
      points
        .attr( 'fill', ( d, i ) => zScale( data[ i ][ color ] ) );

    } else {
      points
        .attr( 'fill', 'steelblue' );
    }

  }

  function onItemClick( item ) {
    console.log( 'Item clicked' );
    console.log( item );

    points
      .classed( 'non_brushed', true );

    points.filter( function() {
      return d3.select( this ).attr( 'id' ) === item.__seqId.toString()
    } ).classed( 'non_brushed', false )
      .classed( 'brushed', true );

  }

  // Draw tooltip using data element attributes
  function drawTooltip( d ) {
    return [ color ].concat( config.roles.embed )
      .map( f => '<b>' + f + ':</b> ' + d[ f ] )
      .join( '<br />' );
  }

  return {
    draw: draw,
    changeColor: changeColor,
    onItemClick: onItemClick,
    set data( d ) {
      data = d;
    },
    set config( c ) {
      config = c;
    },
    set color( c ) {
      color = c;
    },
    set onHighlighting( f ) {
      onHighlighting = f;
    },
    set onCleaning( f ) {
      onCleaning = f;
    }
  }
} )();