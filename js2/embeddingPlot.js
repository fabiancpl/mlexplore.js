var embeddingPlot = ( function() {

  var data, features, color,
    onHighlighting;

  var margin = { top: 10, right: 10, bottom: 10, left: 10 },
    width, height, iWidth, iHeight,
    xScale = d3.scaleLinear(),
    yScale = d3.scaleLinear(),
    zScale;

  var svg, g,
    points, brush,
    tooltip;

  function draw() {
    
    // Cleaning the component
    d3.select( '#embedding' ).html( '' );
    d3.selectAll( '.tooltip' ).remove();

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

    brush = d3.brush()
      .on( 'brush', highlightBrushedCircles )
      .on( 'end', displayTable ); 

    svg.append( 'g' )
      .on( 'click', cleanHighlight )
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
      zScale = features.find( f => f.name === color ).scale;
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

  function cleanHighlight() {
    points
      .classed( 'non_brushed', false )
      .classed( 'brushed', true );
  }

  function displayTable() {
    // disregard brushes w/o selections  
    // ref: http://bl.ocks.org/mbostock/6232537
    if ( !d3.event.selection ) return;

    // programmed clearing of brush after mouse-up
    // ref: https://github.com/d3/d3-brush/issues/10
    d3.select( this ).call( brush.move, null );

    var d_brushed = g.selectAll( ".brushed" ).data();

    onHighlighting( d_brushed );

    // populate table if one or more elements is brushed
    if( d_brushed.length > 0 ) {
      //clearTableRows();
      //d_brushed.forEach(d_row => populateTableRow(d_row));
      //console.log( d_brushed.length );
    } else {
      //console.log( 'No selection' );
      cleanHighlight();
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
      zScale = features.find( f => f.name === color ).scale;
      
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

  function drawTooltip( d ) {
    return Object.keys( d ).filter( f => ![ 'visible', '__seqId', '__i', '__x', '__y' ].includes( f ) ).map( f => '<b>' + f + ':</b> ' + d[ f ] ).join( "<br />" );
  }

  return {
    draw: draw,
    changeColor: changeColor,
    onItemClick: onItemClick,
    set data( d ) {
      data = d;
    },
    set features( f ) {
      features = f;//.filter( f => ![ '__seqId', '__x', '__y', '__cluster' ].includes( f.name ) );
    },
    set color( c ) {
      color = c;
    },
    set onHighlighting( f ) {
      onHighlighting = f;
    }
  }
} )();