var embeddingPlot = ( function() {

  var data, embedding, color;

  var margin = { top: 10, right: 10, bottom: 10, left: 10 },
    width, height, iWidth, iHeight,
    xScale = d3.scaleLinear(),
    yScale = d3.scaleLinear(),
    zScale = d3.scaleOrdinal( d3.schemeCategory10 );

  var svg, g,
    points,
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
        .attr( "class", "embedding-circle" )
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