var embeddingPlot = ( function() {

  var data, embedding, color;

  var margin = { top: 10, right: 10, bottom: 10, left: 10 },
    width, height, iWidth, iHeight,
    xScale = d3.scaleLinear(),
    yScale = d3.scaleLinear(),
    zScale = d3.scaleOrdinal( d3.schemeCategory10 );

  var svg, g,
    points, brush,
    tooltip;

  function draw() {
    
    d3.select( '#embedding' ).html( '' );

    tooltip = d3.select( 'body' ).append( 'div' )
      .attr( 'class', 'tooltip' )
      .style( 'opacity', 0 );

    width = d3.select( '#embedding' ).node().getBoundingClientRect().width - 20,
    height = width * 2 / 3,
    iWidth = width - margin.left - margin.right,
    iHeight = height - margin.top - margin.bottom;

    svg = d3.select( '#embedding' ).append( 'svg' )
      .attr( 'width', width )
      .attr( 'height', height );

    g = svg.append( 'g' )
      .attr( 'transform', 'translate(' + margin.left + ',' + margin.top + ')');

    xScale
      .range( [ 0, iWidth ] )
      .domain( [ d3.min( embedding, d => d[ 0 ] ), d3.max( embedding, d => d[ 0 ] ) ] );

    yScale
      .range( [ iHeight, 0 ] )
      .domain( [ d3.min( embedding, d => d[ 1 ] ), d3.max( embedding, d => d[ 1 ] ) ] );   

    if( color !== undefined )
      zScale
        .domain( d3.map( data, f => f[ color ] ) );

    points = g.selectAll( '.embedding-circle' )
      .data( embedding )
      .enter()
      .append( 'circle' )
        .attr( "class", 'embedding-circle' ) //non_brushed
        .attr( 'cx', d => xScale( d[ 0 ] ) )
        .attr( 'cy', d => yScale( d[ 1 ] ) )
        .attr( 'r', 3 )
        .attr( 'fill', ( d, i ) => ( color !== undefined && data !== undefined ) ? zScale( data[ i ][ color ] ) : 'steelblue' );
        /*.on( 'mouseover', ( d, i ) => {

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

        } );*/

    brush = d3.brush()
      .on( 'brush', highlightBrushedCircles )
      .on( 'end', displayTable ); 

    svg.append( 'g' )
      .call( brush );

  }

  function highlightBrushedCircles() {
    if( d3.event.selection != null ) {
      // revert circles to initial style
      points.attr( 'class', 'non_brushed' );
      
      var brush_coords = d3.brushSelection( this );
      
      // style brushed circles
      points.filter( function(){
        var cx = d3.select( this ).attr( 'cx' ),
          cy = d3.select( this ).attr( 'cy' );
        return isBrushed( brush_coords, cx, cy );
      } ).attr( 'class', 'brushed' );
    }
  }

  function displayTable() {
    // disregard brushes w/o selections  
    // ref: http://bl.ocks.org/mbostock/6232537
    if ( !d3.event.selection ) return;

    // programmed clearing of brush after mouse-up
    // ref: https://github.com/d3/d3-brush/issues/10
    d3.select( this ).call( brush.move, null );

    var d_brushed = d3.selectAll( ".brushed" ).data();

    // populate table if one or more elements is brushed
    if( d_brushed.length > 0 ) {
        //clearTableRows();
        //d_brushed.forEach(d_row => populateTableRow(d_row));
        console.log( d_brushed.length );
    } else {
      //clearTableRows();
      console.log( 'No selection' );
    }
  }

  function isBrushed( brush_coords, cx, cy ) {
    var x0 = brush_coords[ 0 ][ 0 ],
      x1 = brush_coords[ 1 ][ 0 ],
      y0 = brush_coords[ 0 ][ 1 ],
      y1 = brush_coords[ 1 ][ 1 ];
    return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
  }

  function changeColor() {

    if( points !== undefined && color !== undefined ) {
      zScale
        .domain( d3.map( data, f => f[ color ] ) );

      points
        .attr( 'fill', ( d, i ) => zScale( data[ i ][ color ] ) );

    }

  }

  function drawTooltip( d ) {
    return Object.keys( d ).filter( f => ![ 'visible', '__seqId', '__i', '__x', '__y' ].includes( f ) ).map( f => '<b>' + f + ':</b> ' + d[ f ] ).join( "<br />" );
  }

  return {
    draw: draw,
    changeColor: changeColor,
    set data( d ) {
      data = d;
    },
    set embedding( e ) {
      embedding = e;
    },
    set color( c ) {
      color = c;
    }
  }
} )();