
function exportProjection() {

  console.log( 'Exporting projection to PNG!' );

  var projection = d3.select( '#projection' ).select( 'svg' ).node();

  saveSvgAsPng( projection, "plot.png" );

}