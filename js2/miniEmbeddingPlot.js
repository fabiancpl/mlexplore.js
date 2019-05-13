var miniEmbeddingPlot = ( function() {

   var data, color;

  var margin = { top: 5, right: 5, bottom: 5, left: 5 },
    width, height, iWidth, iHeight,
    xScale = d3.scaleLinear(),
    yScale = d3.scaleLinear(),
    zScale;

  var svg, g,
    points;

  function draw() {
    
    d3.select( '#mini-embedding' ).html( '' );

    width = d3.select( '#mini-embedding' ).node().getBoundingClientRect().width - 10,
    height = width * 2 / 3,
    iWidth = width - margin.left - margin.right,
    iHeight = height - margin.top - margin.bottom;

    svg = d3.select( '#mini-embedding' ).append( 'svg' )
      .attr( 'width', width )
      .attr( 'height', height );

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

    points = g.selectAll( '.mini-embedding-circle' )
      .data( data )
      .enter()
      .append( 'circle' )
        .attr( 'id', d => d.__seqId )
        .attr( "class", "mini-embedding-circle" )
        .attr( 'cx', d => xScale( d.__x ) )
        .attr( 'cy', d => yScale( d.__y ) )
        .attr( 'r', 1 )
        .attr( 'fill', ( d, i ) => ( color !== undefined ) ? zScale( data[ i ][ color ] ) : 'steelblue' )
        //.attr( 'stroke', 'gray' );

  }

  function changeColor() {

    if( points !== undefined ) {
      if( color !== undefined ) {
        zScale = features.find( f => f.name === color ).scale;

        points
          .attr( 'fill', ( d, i ) => zScale( data[ i ][ color ] ) );

      } else {
        points
          .attr( 'fill', 'steelblue' );
      }
    }

  }

  function highlight( selection ) {

    if( points !== undefined ) {

      points
        .classed( 'brushed', false )
        .classed( 'non_brushed', true );

      selection.map( sel => {
        var point = g.select( '[id="' + sel.__seqId + '"]' );
        point.classed( 'non_brushed', false );
        point.classed( 'brushed', true );
      } );

    }

  }

  function clean() {
    if( points !== undefined ) {
      points
        .classed( 'brushed', true )
        .classed( 'non_brushed', false );    
    }
  }

  return {
    draw: draw,
    changeColor: changeColor,
    highlight: highlight,
    clean: clean,
    set data( d ) {
      data = d;
    },
    set features( f ) {
      features = f;//.filter( f => ![ '__seqId', '__x', '__y', '__cluster' ].includes( f.name ) );
    },
    set color( c ) {
      color = c;
    }
  }
} )();