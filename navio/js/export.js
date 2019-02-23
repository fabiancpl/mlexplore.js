
// Show the window for exporting the configuration object
function exportConfiguration() {

  console.log( 'Exporting configuration as JSON!' );

  function download( content, fileName, contentType ) {
    var a = document.createElement( 'a' );
    var file = new Blob( [ content ], { type: contentType } );
    a.href = URL.createObjectURL( file );
    a.download = fileName;
    a.click();
  }
  
  download( JSON.stringify( config, null, 2 ), fileName + '-config.json', 'text/plain' ); 

}

// Show the window for exporting the data
// Data object includes projection and clustering models results by default
function exportData() {

  console.log( 'Exporting data as CSV!' );

}

// Show the window for exporting the projection as PNG
function exportProjection() {

  console.log( 'Exporting projection as PNG!' );

  var projection = d3.select( '#projection' ).select( 'svg' ).node();

  saveSvgAsPng( projection, "projection.png" );

}