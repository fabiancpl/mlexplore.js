/*
 * Visual component for drawing the dimensionality reduction projection
 */

function projectionChart() {

  var margin = { top: 10, right: 10, bottom: 10, left: 10 },
    width = 500,
    height = 400,
    iWidth = width - margin.left - margin.right,
    iHeight = height - margin.top - margin.bottom;
    xValue = d => d[ 0 ],
    yValue = d => d[ 1 ],
    zValue = d => d[ 2 ],
    xScale = d3.scaleLinear(),
    yScale = d3.scaleLinear(),
    zScale = d3.scaleOrdinal( d3.schemeCategory10 );

  function chart( selection ) {
    
  	selection.each( function( data ) {

      // Select the svg element, if it exists.
      var svg = d3.select( this ).selectAll( 'svg' )
        .data( [ data ] );

      // Otherwise, create the skeletal chart
      var svgEnter = svg.enter().append( 'svg' );
      var gEnter = svgEnter.append( 'g' );

      iWidth = width - margin.left - margin.right;
      iHeight = height - margin.top - margin.bottom;

      // Update the outer dimensions.
      svg.merge( svgEnter )
        .attr( 'width', width )
        .attr( 'height', height );

      // Update the inner dimensions.
      var g = svg.merge( svgEnter ).select( 'g' )
        .attr( 'transform', 'translate(' + margin.left + ',' + margin.top + ')' );

      // Update the x scale.
      xScale
        .range( [ 0, iWidth ] )
        .domain( [ d3.min( data, xValue ), d3.max( data, xValue ) ] );

      // Update the y scale.
      yScale
        .range( [ iHeight, 0 ] )
        .domain( [ d3.min( data, yValue ), d3.max( data, yValue ) ] );   

      var points = g.selectAll( '.circle' )
        .data( function (d) { return d; } );
      
      points
        .enter()
        .append( 'circle' )
          .attr( "class", "circle" )
        .merge( points )
          .attr( 'cx', X )
          .attr( 'cy', Y )
          .attr( 'r', 3 )
          .attr( 'fill', Z );

      points.exit().remove();

  	} );

  }

  // The x-accessor for the path generator; xScale ∘ xValue.
  function X(d) {
    return xScale(xValue(d));
  }

  // The y-accessor for the path generator; yScale ∘ yValue.
  function Y(d) {
    return yScale(yValue(d));
  }

  // The y-accessor for the path generator; yScale ∘ yValue.
  function Z(d) {
    return zScale(zValue(d));
  }

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.x = function(_) {
    if (!arguments.length) return xValue;
    xValue = _;
    return chart;
  };

  chart.y = function(_) {
    if (!arguments.length) return yValue;
    yValue = _;
    return chart;
  };

  chart.z = function(_) {
    if (!arguments.length) return zValue;
    zValue = _;
    return chart;
  };

  return chart;

}