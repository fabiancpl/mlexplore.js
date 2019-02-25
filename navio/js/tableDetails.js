
function updateTable() {

  d3.select( '#table-details' ).html( '' );

	var table = d3.select( '#table-details' ).append( 'table' )
    .attr('class', 'table table-striped' )
    .attr( 'data-pagination', true )
    .attr( 'data-page-list', '[5, 10, 25, 50, ALL]' )
    .attr( 'data-page-size', 5 );

  var columns = Object.keys( visibleData[ 0 ] );
 columns = _.remove( columns, n => ![ '__i', 'x', 'y', 'visible' ].includes( n ) );

  // Create the header of the table
  table.append( 'thead' ).append( 'tr' )
    .selectAll( 'th' )
    .data( columns )
    .enter()
    .append( 'th' )
      .attr( 'data-field', d => d )
      .html( d => d );

  // Create the body of the table
  table.append( 'tbody' );

  $( '#table-details table' ).bootstrapTable( {
    data: visibleData
  });

}